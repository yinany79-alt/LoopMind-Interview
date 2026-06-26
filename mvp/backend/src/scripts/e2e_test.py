"""端到端联调测试脚本。

启动方式:
    python -m src.scripts.e2e_test            # 真实跑 5 轮(慢,需要 LLM key)
    python -m src.scripts.e2e_test --smoke    # 只验路由通畅,不调 LLM

预期:
- 启动 SSE 后立即收到 session_started + topic_started + assistant_message_*
- 提交回答后能收到 evaluator_started/result + satisfaction_update + 下一题
"""
from __future__ import annotations

import argparse
import asyncio
import json
import sys
import time
from pathlib import Path

import httpx

BASE = "http://localhost:8000"


SAMPLE_ANSWERS = [
    # 第 1 题 — 故意答得浅
    "Agent Loop 就是 LLM + 工具的循环嘛,模型一直调工具直到完成任务。Claude Code 也是这么做的。",
    # 第 2 题 — 浅一点
    "Tool Use 就是给模型一组工具,让它选着调。MCP 是 Anthropic 的协议,把工具标准化了。",
    # 第 3 题 — 有点细节
    "我每天用 Claude Code 5 小时以上。最让我惊艳的是它会主动 ls 看上下文,而不是直接动手。Cursor 是补全式,Claude Code 是协作式,两种范式。",
    # 第 4 题 — 答得不错
    "开发者用 Agent 最痛苦是调试不透明。Claude Code 把 thinking 渲染出来 + tool call 可见,极大降低了'盲操'感。Manus 用 plan 文件让用户能 review 长任务也是同样的思路。",
    # 第 5 题 — 答到核心
    "Agent 评测难在没有标准答案。SWE-bench 是 end-to-end 的硬指标,但 daily 的'品味'还得靠人评 + retention。DeepSeek 的赌注是 post-training + Harness 工程能补足小模型的能力差,这个判断我同意。",
]


async def read_sse(client: httpx.AsyncClient, url: str, event_log: list, stop_event: asyncio.Event) -> None:
    """订阅 SSE,把事件存到 event_log,直到 stop_event 触发或 session_ended。"""
    try:
        async with client.stream("GET", url, timeout=120) as resp:
            buf = ""
            current_event = None
            async for chunk in resp.aiter_text():
                buf += chunk
                while "\n\n" in buf:
                    raw, buf = buf.split("\n\n", 1)
                    if raw.startswith(":"):  # 心跳注释
                        continue
                    name = None
                    data = None
                    for line in raw.splitlines():
                        if line.startswith("event:"):
                            name = line[6:].strip()
                        elif line.startswith("data:"):
                            data = line[5:].strip()
                    if name and data:
                        try:
                            parsed = json.loads(data)
                        except json.JSONDecodeError:
                            parsed = {"_raw": data}
                        event_log.append({"event": name, "data": parsed})
                        # 简洁打印
                        if name == "assistant_message_delta":
                            sys.stdout.write(parsed.get("delta", ""))
                            sys.stdout.flush()
                        elif name in ("assistant_message_start",):
                            print(f"\n  [面试官] (mode={parsed.get('mode')}, topic={parsed.get('topic_name')}) ", end="")
                        elif name == "assistant_message_end":
                            print()
                        elif name == "evaluator_result":
                            ev = parsed.get("evaluation", {})
                            print(f"  [Evaluator] quality={ev.get('answer_quality')}, sat={ev.get('current_satisfaction')}, gaps={ev.get('found_gaps')}")
                        elif name == "satisfaction_update":
                            print(f"  [Satisfaction] {parsed.get('previous_value')} → {parsed.get('new_value')}")
                        elif name == "topic_started":
                            print(f"  [新题] {parsed.get('topic_name')} (w={parsed.get('weight')})")
                        elif name == "topic_finished":
                            print(f"  [题目结束] reason={parsed.get('reason')}, sat={parsed.get('final_satisfaction')}")
                        elif name == "session_ended":
                            print(f"  [Session 结束] reason={parsed.get('reason')}")
                            return
                        elif name in ("min_topics_reached",):
                            print(f"  [{name}] {parsed}")
                if stop_event.is_set():
                    return
    except Exception as e:
        print(f"SSE 异常: {e}")


async def main(smoke: bool = False) -> int:
    jd_path = Path(__file__).resolve().parent.parent / "jd_samples" / "deepseek_agent_harness_pm.txt"
    jd_text = jd_path.read_text(encoding="utf-8")

    async with httpx.AsyncClient() as client:
        # 1. healthz
        r = await client.get(f"{BASE}/healthz", timeout=10)
        print("healthz:", r.json())

        # 2. personas
        r = await client.get(f"{BASE}/api/personas", timeout=10)
        personas = r.json()["personas"]
        print(f"personas: {len(personas)} 张")

        # 3. 创建 session
        print("\n→ 创建 session(解析 JD)...")
        t0 = time.time()
        r = await client.post(f"{BASE}/api/sessions", json={"jd_text": jd_text}, timeout=120)
        if r.status_code != 200:
            print("FAILED:", r.status_code, r.text)
            return 1
        sess = r.json()
        sid = sess["session_id"]
        print(f"  session_id={sid}, 耗时={time.time() - t0:.1f}s")
        print(f"  jd_summary={sess['jd_summary']}")
        nodes = sess["skill_tree"]["nodes"]
        print(f"  skill_tree: {len(nodes)} 个节点")
        for n in nodes:
            print(f"    - {n['id']} ({n['topic']}) w={n['weight']} {n['depth_level']}")

        # 4. start
        print("\n→ 启动面试(persona=cold_techlead)...")
        r = await client.post(
            f"{BASE}/api/sessions/{sid}/start",
            json={
                "persona": {
                    "card_id": "cold_techlead",
                    "dimensions": {"warmth": 20, "depth_preference": 85, "pace": 75, "vision": 45},
                }
            },
            timeout=10,
        )
        if r.status_code != 200:
            print("FAILED:", r.status_code, r.text)
            return 1
        print("  status=ready")

        if smoke:
            print("\n[smoke] 跳过 SSE / answer 测试。")
            return 0

        # 5. 订阅 SSE,等第一题出来
        event_log: list = []
        stop_event = asyncio.Event()
        sse_task = asyncio.create_task(
            read_sse(client, f"{BASE}/api/sessions/{sid}/stream", event_log, stop_event)
        )

        # 等首条 assistant_message_end
        async def wait_event_name(name: str, timeout_s: float = 120) -> dict | None:
            t_start = time.time()
            seen_idx = 0
            while time.time() - t_start < timeout_s:
                while seen_idx < len(event_log):
                    e = event_log[seen_idx]
                    seen_idx += 1
                    if e["event"] == name:
                        return e
                await asyncio.sleep(0.1)
            return None

        print("\n→ 等第一题...")
        e = await wait_event_name("assistant_message_end", timeout_s=120)
        if not e:
            print("超时,没收到第一题")
            stop_event.set()
            sse_task.cancel()
            return 1

        # 6. 提交 5 轮回答
        for i, ans in enumerate(SAMPLE_ANSWERS):
            print(f"\n→ 提交第 {i + 1} 个回答(长度 {len(ans)} 字)...")
            print(f"  [候选人] {ans[:80]}{'...' if len(ans) > 80 else ''}")
            seen_before = len(event_log)
            r = await client.post(
                f"{BASE}/api/sessions/{sid}/answer",
                json={"content": ans},
                timeout=10,
            )
            if r.status_code != 200:
                print("answer FAILED:", r.status_code, r.text)
                break
            # 等下一条 assistant_message_end(意味着面试官又问完了)
            t_start = time.time()
            seen_idx = seen_before
            got_next = False
            while time.time() - t_start < 120:
                while seen_idx < len(event_log):
                    e = event_log[seen_idx]
                    seen_idx += 1
                    if e["event"] == "assistant_message_end":
                        got_next = True
                        break
                    if e["event"] == "session_ended":
                        got_next = True
                        break
                if got_next:
                    break
                await asyncio.sleep(0.1)

        # 7. /end
        print("\n→ 用户主动结束面试...")
        r = await client.post(
            f"{BASE}/api/sessions/{sid}/end",
            json={"reason": "user_initiated"},
            timeout=10,
        )
        print("  /end:", r.json())

        stop_event.set()
        try:
            await asyncio.wait_for(sse_task, timeout=5)
        except asyncio.TimeoutError:
            sse_task.cancel()

        # 8. 等报告
        print("\n→ 轮询报告...")
        for i in range(20):
            r = await client.get(f"{BASE}/api/sessions/{sid}/report", timeout=10)
            data = r.json()
            if data.get("status") == "ready":
                print("  报告 ready!")
                print(f"  verdict: {data.get('verdict')}")
                print(f"  dimension_scores: {data.get('dimension_scores')}")
                print(f"  comments:")
                for c in data.get("comments", []):
                    print(f"    [{c['type']}] {c['text']}")
                return 0
            if data.get("status") == "failed":
                print(f"  报告失败: {data.get('error')}")
                return 1
            print(f"  报告状态: {data.get('status')}, 等 3s...")
            await asyncio.sleep(3)

        print("  报告超时未生成")
        return 1


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--smoke", action="store_true", help="只验路由通畅,不走 SSE")
    args = parser.parse_args()
    sys.exit(asyncio.run(main(smoke=args.smoke)))
