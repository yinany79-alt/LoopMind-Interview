# 杨植麟 (Zhilin Yang) 著作、论文与思想调研

> 调研时间：2026-05-21
> 来源区分：【一手】= 本人亲自撰写/署名/演讲；【二手】= 媒体转述/报道
> 信息源黑名单已遵守：未使用知乎、微信公众号、百度百科

---

## 一、学术论文完整列表

### 1.1 第一/共同第一作者论文（按时间倒序）

#### （1）Attention Residuals: Learning Where to Focus in Deep Neural Networks
- **arXiv**: 2603.15031 (2026.03)
- **作者**: Kimi Team (Guangyu Chen, Yu Zhang, Jianlin Su, Zhilin Yang 等)
- **发表**: 技术报告，在 NVIDIA GTC 2026 首次披露
- **核心贡献**: 将残差连接从固定加法替换为可学习的 Softmax 注意力；提出 Block AttnRes 工程变体
- **效果**: 48B 模型训练效率提升 1.25x；GPQA-Diamond +7.5 分
- **来源**: https://arxiv.org/abs/2603.15031 【一手】
- **影响**: Elon Musk 称"令人印象深刻"；Andrej Karpathy 称"对 Attention is All You Need 的理解仍然不够"

#### （2）Kimi K2: Open Agentic Intelligence
- **arXiv**: 2507.20534 (2025.07)
- **作者**: Kimi Team (Zhilin Yang 等)
- **核心**: Kimi K2 万亿参数 MoE 模型技术报告；1.04T 总参数/32.6B 激活参数；384 专家
- **关键创新**: MuonClip 优化器、大规模 Agentic 数据合成流水线、联合 RL 训练
- **来源**: https://arxiv.org/abs/2507.20534 【一手】

#### （3）Kimi k1.5: Scaling Reinforcement Learning with LLMs
- **arXiv**: 2501.12599 (2025.01)
- **作者**: Kimi Team (Zhilin Yang 等)
- **核心**: 长上下文（128K）RL 训练；Long2Short 方法；REINFORCE 风格 RL
- **效果**: AIME 77.5, MATH 500 96.2, Codeforces 94th percentile；与 OpenAI o1 匹配
- **来源**: https://arxiv.org/abs/2501.12599 【一手】

#### （4）Muon is Scalable for LLM Training
- **arXiv**: 2502.16982 (2025.02)
- **作者**: Jingyuan Liu, Jianlin Su, Xingcheng Yao, Zhilin Yang 等
- **核心**: 使 Muon 优化器可大规模训练；~2x AdamW 计算效率
- **来源**: https://arxiv.org/abs/2502.16982 【一手】

#### （5）MoBA: Mixture of Block Attention for Long-Context LLMs
- **arXiv**: 2502.13189 (2025.02)
- **作者**: Enzhe Lu, Zhejun Jiang, Zhilin Yang 等（Moonshot AI）
- **核心**: 将 MoE 原理应用于注意力机制；动态选择 top-k 块计算注意力
- **效果**: 1M tokens 预填充速度提升 6.5x；已部署于 Kimi 生产
- **来源**: https://arxiv.org/abs/2502.13189 【一手】

#### （6）NLP From Scratch Without Large-Scale Pretraining: A Simple and Efficient Framework (TLM)
- **发表**: ICML 2023
- **arXiv**: 2111.04130
- **作者**: Xingcheng Yao, Yanan Zheng, Xiaocong Yang, **Zhilin Yang**
- **核心**: 消除大规模预训练需求，通过检索驱动从零训练 NLP 模型
- **效果**: 匹配 RoBERTa-Large 性能，FLOPs 降低 ~100x
- **来源**: https://arxiv.org/abs/2111.04130 【一手】

#### （7）P-Tuning v2: Prompt Tuning Can Be Comparable to Fine-tuning Universally Across Scales and Tasks
- **发表**: ACL 2022 (Short Papers)
- **arXiv**: 2110.07602
- **作者**: Xiao Liu, Kaixuan Ji, Yicheng Fu, Weng Lam Tam, Zhengxiao Du, **Zhilin Yang**, Jie Tang
- **核心**: 深度 Prompt Tuning；0.1%-3% 可调参数匹配全参数微调
- **来源**: https://arxiv.org/abs/2110.07602 【一手】

#### （8）FewNLU: Benchmarking State-of-the-Art Methods for Few-Shot Natural Language Understanding
- **发表**: ACL 2022
- **作者**: Yanan Zheng, Jing Zhou, Yujie Qian, Ming Ding, **Zhilin Yang** (通讯作者) 等
- **核心**: 少样本 NLU 标准化评估框架
- **来源**: https://aclanthology.org/2022.acl-long. 【一手】

#### （9）GLM: General Language Model Pretraining with Autoregressive Blank Infilling
- **发表**: ACL 2022
- **作者**: Zhengxiao Du, Yujie Qian, Xiao Liu, Ming Ding, Jiezhong Qiu, **Zhilin Yang**, Jie Tang
- **核心**: 自回归空白填充的统一预训练框架；2D 位置编码
- **来源**: https://arxiv.org/abs/2103.10360 【一手】

#### （10）GPT Understands, Too (P-Tuning v1)
- **arXiv**: 2103.10385 (2021.03)
- **作者**: Xiao Liu, Yanan Zheng, Zhengxiao Du, Ming Ding, Yujie Qian, **Zhilin Yang**, Jie Tang
- **核心**: 可训练连续 Prompt 嵌入；打破"GPT 只能生成不能理解"的刻板印象
- **来源**: https://arxiv.org/abs/2103.10385 【一手】

#### （11）XLNet: Generalized Autoregressive Pretraining for Language Understanding
- **发表**: NeurIPS 2019 (oral)
- **arXiv**: 1906.08237
- **作者**: **Zhilin Yang***, Zihang Dai*, Yiming Yang, Jaime Carbonell, Ruslan Salakhutdinov, Quoc V. Le (*equal contribution)
- **引用**: >10,900 次
- **核心**: 排列语言建模实现双向上下文；结合 Transformer-XL；20 项任务超越 BERT
- **来源**: https://arxiv.org/abs/1906.08237 【一手】

#### （12）Transformer-XL: Attentive Language Models Beyond a Fixed-Length Context
- **发表**: ACL 2019
- **arXiv**: 1901.02860
- **作者**: Zihang Dai*, **Zhilin Yang***, Yiming Yang, Jaime Carbonell, Quoc V. Le, Ruslan Salakhutdinov (*equal contribution)
- **引用**: >4,200 次
- **核心**: 片段级循环机制 + 相对位置编码；依赖长度提升 80% (vs RNN) / 450% (vs Transformer)
- **来源**: https://arxiv.org/abs/1901.02860 【一手】

#### （13）HotpotQA: A Dataset for Diverse, Explainable Multi-hop Question Answering
- **发表**: EMNLP 2018
- **arXiv**: 1809.09600
- **作者**: **Zhilin Yang***, Peng Qi*, Saizheng Zhang*, Yoshua Bengio, William W. Cohen, Ruslan Salakhutdinov, Christopher D. Manning (*equal contribution)
- **核心**: 多跳问答数据集；~113K 问答对；支持可解释推理
- **来源**: https://arxiv.org/abs/1809.09600 【一手】

#### （14）Breaking the Softmax Bottleneck: A High-Rank RNN Language Model
- **发表**: ICLR 2018 (oral)
- **arXiv**: 1711.03953
- **作者**: **Zhilin Yang**, Zihang Dai, Ruslan Salakhutdinov, William W. Cohen
- **核心**: 揭示 Softmax 瓶颈（低秩约束）；提出 Mixture of Softmaxes (MoS)；当时 PTB SOTA (47.69)
- **来源**: https://arxiv.org/abs/1711.03953 【一手】

#### （15）Differentiable Learning of Logical Rules for Knowledge Base Reasoning (Neural LP)
- **发表**: NeurIPS 2017
- **作者**: Fan Yang, **Zhilin Yang**, William W. Cohen
- **核心**: 一阶逻辑规则的端到端可微学习；可解释的规则提取
- **来源**: https://papers.nips.cc/paper_files/paper/2017/hash/0e55666a4ad822e0e34299df3591d979-Abstract.html 【一手】

#### （16）Revisiting Semi-Supervised Learning with Graph Embeddings
- **发表**: ICML 2016
- **arXiv**: 1603.08861
- **作者**: **Zhilin Yang**, William W. Cohen, Ruslan Salakhutdinov
- **引用**: >1,700 次
- **核心**: 基于图嵌入的半监督学习框架；直推式和归纳式变体
- **来源**: https://arxiv.org/abs/1603.08861 【一手】
- **备注**: 杨植麟的**第一篇论文**，始于 CMU 博士第一年

### 1.2 主要共同作者论文（选择性列举）

| 论文 | 发表 | 核心内容 |
|------|------|----------|
| ZeroPrompt: Scaling Prompt-Based Pretraining to 1,000 Tasks Improves Zero-Shot Generalization | EMNLP 2022 Findings | 首次扩展到 1000 个任务；任务缩放可替代模型缩放 |
| A Universal Discriminator for Zero-Shot Generalization | ACL 2023 | 判别式方法超越生成式方法的零样本泛化 |
| Learning to Plan Before Answering: Self-Teaching LLMs (LEPA) | ICLR 2025 | 自教学算法学习抽象计划；数学推理 +8.5% |
| Not All Tasks Are Born Equal: Understanding Zero-Shot Generalization | ICLR 2023 | 零样本泛化的任务差异性研究 |
| Compositional Task Representations for Large Language Models | ICLR 2023 | 组合式任务表示 |
| Kimi-VL Technical Report | arXiv 2504.07491 | MoE 视觉语言模型；MoonViT 编码器 |
| Kimi-Audio Technical Report | arXiv 2504.18425 | 开源音频基础模型；理解/生成/对话一体化 |
| Kimina-Prover Preview | arXiv 2504.11354 | 基于 RL 的定理证明器；miniF2F 80.7% SOTA |
| Mooncake: A KVCache-centric Disaggregated Architecture for LLM Serving | arXiv 2407.00079 | 解耦式 KV Cache 架构；长上下文吞吐提升 525% |

### 1.3 Google Scholar 信息
- **Scholar ID**: 7qXxyJkAAAAJ
- **总引用**: ~9,600+
- **h-index**: 估计 ~20+
- **已验证邮箱**: cs.cmu.edu
- **链接**: https://scholar.google.com.tr/citations?user=7qXxyJkAAAAJ 【一手】

---

## 二、技术博客 / 长文

### 2.1 一手技术博客

#### （1）Google AI Blog: Transformer-XL: Unleashing the Potential of Attention Models
- **作者**: Zhilin Yang, Quoc V. Le (Google AI)
- **日期**: 2019.01.29
- **核心**: Transformer-XL 的通俗技术解读；片段级循环 + 相对位置编码
- **来源**: https://research.google/blog/transformer-xl-unleashing-the-potential-of-attention-models/ 【一手】
- **备注**: 杨植麟在 Google Brain 实习期间撰写

#### （2）Moonlight 技术博客：Muon 优化器的首次大规模训练实践
- **作者**: Moonshot AI / Kimi Team
- **日期**: 2025.02
- **核心**: Muon 优化器的大规模训练技术细节
- **来源**: https://platform.moonshot.cn/blog/posts/moonlight 【一手】

#### （3）Kimi K2 技术深度解读
- **作者**: Moonshot AI / Kimi Team
- **日期**: 2025.07
- **核心**: K2 模型架构、MuonClip、Agentic 数据合成等深度解析
- **来源**: https://kimi-k2.net/posts/kimi-k2-tech-analysis 【一手】

### 2.2 未发现个人独立技术博客

杨植麟**没有**个人技术博客（如 Medium/Substack/独立域名博客）。他的一手技术表达主要通过以下渠道：
1. **Google AI Blog**（Google Brain 时期）
2. **学术论文**（arXiv）
3. **公开演讲/Keynote 演讲实录**（GTC, ZGC 论坛等）
4. **公司官方技术博客** (platform.moonshot.cn)

---

## 三、公开演讲 / Keynote / 署名发言

### 3.1 NVIDIA GTC 2026 Keynote: "How We Scaled Kimi K2.5"
- **日期**: 2026.03.18
- **地点**: 美国圣何塞
- **性质**: 唯一登台 GTC 的中国大模型创始人的主会场演讲
- **核心**: 首次系统性披露 Kimi 技术路线图的三个维度：
  1. Token Efficiency（MuonClip 优化器）
  2. Long Context（Kimi Linear 架构）
  3. Agent Swarms（智能体集群 / Orchestrator 机制）
- **来源**: https://www.sky9capital.com/news/the-only-chinese-llm-founder-on-stage-zhilin-yang-keynotes-at-nvidia-gtc/ 【一手演讲→二手报道】
- **一手来源**: 多家媒体根据现场录音整理的讲稿全文（如澎湃、21世纪经济报道等）

### 3.2 2026 中关村论坛年会全体会议演讲
- **日期**: 2026.03.25
- **主题**: 《开源AI加速探索智能上限》
- **性质**: 亲自发表的署名演讲（官方有全文实录）
- **核心**:
  - "很多普遍使用的技术标准正成为 Scaling 的瓶颈"
  - 系统梳理大模型三阶段演进：互联网数据 → 大规模 RL → AI 主导研究
  - Agent 集群类比："一个人造百亿美元公司要 100 年，100 人协作短期完成"
  - "Token 效率 x 长上下文 x Agent 集群"三大维度协同
- **来源（官方实录）**: https://www.zgcforum.com/news/forum/963055 【一手】

### 3.3 AGI-Next 前沿峰会 / 中关村论坛圆桌（2026.03.27）
- **主持**：杨植麟
- **参与**：张鹏（智谱）、夏立雪（无问芯穹）、罗福莉（小米）、黄超（港大）
- **来源（全文实录）**: https://www.thepaper.cn/newsDetail_forward_32842729 【一手演讲实录】

---

## 四、深度媒体专访（核心一手观点来源）

### 4.1 《对话月之暗面杨植麟：向延绵而未知的雪山前进》
- **媒体**: 36氪/腾讯新闻
- **作者**: 张小珺
- **日期**: 2024.03.06
- **性质**: 深度专访【二手转述，含大量直接引语】
- **核心观点**:
  - "有概率的非共识"：创业就是赌一个非共识但有一定概率成立的判断
  - "从无限的雕花中释放自己"：不要纠结于改进已有方案，要寻找新维度
  - "如果所有人都觉得你正常，你的理想是大家都能想到的，它对人类的理想总量没有增量"
  - 选择 Long Context 作为登月第一步的逻辑
- **来源**: https://36kr.com/p/2677672437708552 【二手】

### 4.2 《专访月之暗面杨植麟：Lossless Long Context is Everything》
- **媒体**: 海外独角兽 (Overseas Unicorn)
- **采访人**: 天一、penny、guangmi
- **日期**: 2024.02.08
- **性质**: 深度专访【二手转述，大量直接引语】
- **核心观点**:
  - **"Lossless long context is everything"** —— 这可能是他最重要的口头禅
  - "微调最终会不存在" —— 个性化通过上下文实现
  - "Tokenizer 最终也不是必须的"
  - "AI 本质就是一堆 scaling law"
  - AGI 三层技术架构：① scaling law + next-token-prediction；② 通用表示 + AI 自进化；③ long-context、多模态、Agent
  - 中美差异化：OpenAI 的技术理想主义 + 字节的商业化哲学 = 月之暗面
  - "如果我有 10 亿的 context length，今天看到的问题都不是问题"
  - Context length 的摩尔定律
- **来源**: https://foresightnews.pro/article/detail/53994 【二手】
- **英文版**: https://www.greaterwrong.com/posts/tXJjRjErYodnCsDQf/interviews-with-moonshot-ai-s-ceo-yang-zhilin 【二手】

### 4.3 《和杨植麟时隔一年的独家对话：站在无限的开端》
- **媒体**: 张小珺商业访谈录 (播客 + 文字)
- **日期**: 2025.07（K2 发布后）
- **性质**: 深度专访【二手转述】
- **核心观点**:
  - K2 技术突破：Muon 优化器、数据改写、Agent 泛化性
  - "缸中之脑"推理模型 → Agent（与世界交互）
  - 用 RL 方式管理组织，而非 SFT
  - 引用《The Beginning of Infinity》："问题不可避免，但问题可以解决"
  - L1-L5 分级：从基础对话到全面自主 Agent
- **来源**: Apple Podcast ID 1634356920 / 各大播客平台 【二手】

### 4.4 《对话杨植麟：聚焦生产力，做好 Kimi 这一个产品》
- **媒体**: 极客公园 (张鹏主持)
- **日期**: 2024 (具体日期不详)
- **性质**: 播客访谈【二手转述】
- **核心**: 产品定位、技术路线选择；自评 60 分
- **来源**: https://podlm.ai/zh-CN/ai-podcast/i2dr4sm3ylixbo 【二手】

### 4.5 《杨植麟的反击》
- **媒体**: 36氪 / 钛媒体 / 澎湃新闻
- **日期**: 2025.07
- **性质**: 深度报道【二手】
- **核心**: 回顾月之暗面从长文本突围到万亿参数 MoE 模型 Kimi K2 的发展历程；对"杨植麟被架空/月之暗面危机"等舆论的回应
- **来源**: https://www.36kr.com/p/3391271927322760 【二手】
- **来源**: https://www.tmtpost.com/7635479.html 【二手】

### 4.6 《对话杨植麟：开源是"绝对胜利"，Token 是"未来 GDP"》
- **媒体**: 北京日报
- **日期**: 2026
- **性质**: 专访【二手转述】
- **核心**: "生产力会变成 Agent，Agent 会产生 Token，Token 在一定程度上等价于 GDP"
- **来源**: https://xinwen.bjd.com.cn/content/s69c5ca66e4b0687a28931c66.html 【二手】

### 4.7 四杰论剑：唐杰、杨植麟、林俊旸、姚顺雨
- **活动**: AGI 路径讨论
- **日期**: 2026
- **性质**: 圆桌讨论实录【一手发言→二手记录】
- **核心**: 杨植麟阐述"语言模型是唯一重要问题"
- **来源**: https://hub.baai.ac.cn/view/51845 【二手实录】

---

## 五、反复出现的核心论点（出现 >=3 次，即真信念）

### 5.1 "Lossless Long Context is Everything" / 无损长上下文是核心瓶颈
- **出现时间线**:
  - 2023.10: Kimi 首版发布（20万字上下文）
  - 2024.02: Foresight News 专访明确提出
  - 2024.03: 36氪专访重申
  - 2026.03: GTC Keynote 作为三大维度之一
  - 贯穿始终: Kimi 产品持续扩展上下文（20万→200万字）
- **核心逻辑**: 历史上每一代模型演进本质都是提升有效 context length（word2vec→RNN→LSTM→Transformer→超长上下文）。10亿上下文可解决几乎所有问题。不需要微调——个性化通过上下文实现。
- **来源**: 4.1, 4.2, 3.1

### 5.2 "Token Efficiency = 智能上限" / Token 效率比算力堆砌更重要
- **出现时间线**:
  - 2024.02: 海外独角兽专访
  - 2025.02: Muon 论文发布
  - 2026.03: GTC Keynote 强调
  - 2026.03: 中关村论坛演讲
- **核心逻辑**: 互联网数据是有限常量。问题不是用多少 Token，而是每个 Token 换来多少智能。Muon/MuonClip 实现 2x 效率提升。Token Efficiency × Long Context 的乘积效应。
- **来源**: 4.1, 4.2, 3.1, 3.2

### 5.3 "很多沿用多年的技术标准现在都可以被挑战"
- **出现时间线**:
  - 2026.03: GTC Keynote
  - 2026.03: 中关村论坛演讲
  - 2026.03: 多家媒体报道
- **具体列举**: Adam 优化器（~10年）、全注意力机制（~9年）、残差连接（~10年）
- **Kimi 的替代方案**: MuonClip、Kimi Linear、Attention Residuals
- **来源**: 3.1, 3.2

### 5.4 "语言模型是唯一重要的问题"
- **出现时间线**:
  - 2017: 研究方向从图模型/多模态收敛到语言模型
  - 2019: CMU 实验室写下这句话
  - 2024: 多次采访中重申
  - 2026: AGI 圆桌中再次强调
- **核心**: 多模态等可以通过语言模型能力提升自然涌现，不需要分散精力
- **来源**: 4.1, 4.2, 4.7

### 5.5 "AI 本质就是一堆 Scaling Law"
- **出现时间线**:
  - 2024.02: 海外独角兽专访
  - 多轮访谈中反复提及
  - 隐含在 Kimi 所有技术路线决策中
- **核心**: 统计概率模型（Transformer）通往 AGI 没有问题；next token prediction 足够好时可平衡创造性和事实性
- **来源**: 4.2

### 5.6 "微调最终会不存在"
- **出现时间线**: 海外独角兽专访、36氪专访
- **核心**: 模型越强，个性化只需放内存（通过 instruction following + in-context 实现）；训练/推理一体化
- **来源**: 4.2, 4.1

### 5.7 "Open Source is the Absolute Victory" / 开源是绝对胜利
- **出现时间线**:
  - 2026: 中关村论坛
  - 2026: 北京日报专访
  - 贯穿 Kimi K1.5/K2/K2.5 全系列开源
- **核心**: 开源模型通过生态合作，Token 总量会远超闭源
- **来源**: 3.2, 4.6

### 5.8 三阶段 AI 研发范式演进
- **第一阶段**: 互联网天然数据 + 少量人工标注（~2023）
- **第二阶段**: 大规模 RL，人筛选高质量任务（~2025）
- **第三阶段**: AI 主导研究——AI 自动合成任务、定义奖励函数、探索网络架构（2026+）
- **出现时间线**: 2026.03 GTC 和中关村论坛
- **来源**: 3.1, 3.2

---

## 六、自创术语和概念

### 6.1 技术概念

| 术语 | 英文 | 释义 | 首次出现 |
|------|------|------|----------|
| 注意力残差 | Attention Residuals (AttnRes) | 将注意力机制"旋转 90 度"应用于深度轴替代固定残差连接 | 2026.03 GTC |
| Kimi Linear | Kimi Linear | 基于 KDA 架构的混合线性注意力机制 | 2026.03 GTC |
| Kimi Delta Attention | KDA | 新型线性注意力机制，Kimi Linear 的核心组件 | 2026.03 GTC |
| MuonClip | MuonClip | Muon 优化器 + QK-Clip 机制解决 Logit 爆炸 | 2025.02 Moonlight |
| 无损长上下文 | Lossless Long Context | 不通过滑动窗口/降采样等捷径的真正长上下文 | 2024.02 海外独角兽 |
| Token 效率 | Token Efficiency | 单位 Token 能转化的有效智能量 | 2024.02 海外独角兽 |
| 智能体集群 | Agent Swarms | 多 Agent 并行协作而非单 Agent 串行执行 | 2026.03 GTC |
| Orchestrator 机制 | Orchestrator | Agent Swarm 中拆解长任务并分发给子 Agent 的调度器 | 2026.03 GTC |
| 缩放阶梯 | Scaling Ladder | 从不同规模实验验证想法的能力（替代"算力限制"） | 2026.03 媒体 |
| Block AttnRes | Block AttnRes | Attention Residuals 的高效工程变体 | 2026.03 GTC |
| KVCache 中心化解耦架构 | KVCache-centric Disaggregated Architecture | Mooncake 的核心架构理念 | 2024.06 arXiv |
| 联合强化学习 | Joint RL | 可验证奖励 + 自评判 Rubric 奖励的联合训练 | 2025.07 K2 |

### 6.2 思维/战略概念

| 术语 | 英文 | 释义 | 首次出现 |
|------|------|------|----------|
| 有概率的非共识 | Probabilistic Non-consensus | 创业要赌一个非共识但有一定概率成立的判断 | 2024.03 36氪 |
| 从无限的雕花中释放自己 | Release from Infinite Sculpting | 不要纠结已有方案的细节改进，要找新维度 | 2024.03 36氪 |
| 缸中之脑 | Brain in a Vat | 仅有推理能力而无交互的模型（类比纯推理模型） | 2025.07 张小珺播客 |
| 场景摩尔定律 | Scenario Moore's Law | 应用场景复杂度指数增长 | 2024 BAAI |
| RL 管理组织 | RL Management | 用强化学习而非监督微调的方式管理团队 | 2025.07 张小珺播客 |

---

## 七、对关键技术问题的系统观点

### 7.1 为什么押注长上下文？

杨植麟的推理链条如下：

1. **第一性原理**：语言模型是唯一重要的问题，而语言模型的核心表征能力受限于上下文长度
2. **历史规律**：每一代技术进步本质是 context length 的扩展（word2vec 5词 → 现今几十万词），存在"上下文摩尔定律"
3. **终局思维**："10亿上下文长度可解决几乎所有问题"——微调消失、Tokenizer 消失，个性化完全通过上下文实现
4. **竞争差异化**：2023年行业追参数规模、通用榜单时，Kimi 选择长上下文作为"有概率的非共识"
5. **技术实现**：自研 Kimi Linear（混合线性注意力）+ MoBA（块注意力）+ 无损压缩，而非 RAG/滑动窗口等折衷方案

**关键引语**：
> "如果你有 10 亿的 context length，今天看到的问题都不是问题。" —— 2024.02 海外独角兽

### 7.2 对 AGI 路径的独特看法

杨植麟的 AGI 路径可概括为**单一主线、两层效率、三维共振**：

**单一主线**：
- 语言模型是唯一重要的问题（而非多模态、AGENT 等）
- AGI 的核心是 scaling law + next token prediction

**两层效率**：
- Token Efficiency：每个 Token 产生的智能量（通过 MuonClip 等优化）
- Context Efficiency：可同时处理的 Token 量（通过 Kimi Linear/MoBA 优化）
- 两者的乘积决定模型能力的上限

**三维共振（2026年正式表述）**：
1. Token Efficiency（MuonClip）
2. Long Context（Kimi Linear）
3. Agent Swarms（Orchestrator）
- 三个维度的技术增益可**相乘**而非简单叠加

**组织层面的 AGI 方法论**：
- 用 RL 管理组织（而非 SFT）：给团队自主探索空间，用结果信号训练
- "归零能力"比经验更重要：好人才需要 unlearn
- Tech Vision 是一号位最核心的能力：做出独特判断 + 拍板执行

### 7.3 对 Transformer 架构演变的观点

杨植麟认为 **Transformer 的三大底层组件都已到重构临界点**：

| 组件 | 原提出时间 | 问题 | Kimi 替代方案 |
|------|-----------|------|-------------|
| 残差连接 (ResNet) | ~2015 | 固定加法导致 PreNorm dilution；深层贡献被稀释 | Attention Residuals（Softmax 注意力替代固定加法） |
| 全注意力 (Transformer) | 2017 | O(n²) 计算在超长上下文中不可持续 | Kimi Linear (混合线性注意力) + MoBA (块稀疏注意力) |
| Adam 优化器 | ~2014 | 在万亿参数规模训练中效率不足 | MuonClip (2x 计算效率，稳定训练) |

**核心判断**：
- "这些技术是 8-11 年前的产品，在算力爆发的今天都可以被挑战"
- 挑战的方向不是颠覆性替代，而是**在原有的基础上做架构级改进**
- 挑战的可行性来自"缩放阶梯"（Scaling Ladder）——拥有足够的资源做不同规模的验证实验

### 7.4 对 Tokenizer 和微调的未来判断（最反共识的观点）

- **Tokenizer 最终可能消失**：当上下文足够长时，模型可直接处理任意 token/pixel/byte
- **微调最终会消失**：模型足够强时，"个性化 = 指令跟随 + in-context"，不需要改变模型权重
- 这两个判断与行业主流（微调是必需品，Tokenizer 是永久组件）形成鲜明对比

### 7.5 对 Scaling Law 的看法

- 杨植麟是 **Scaling Law 的坚定信徒**（"AI 本质就是一堆 scaling law"）
- 但他认为当下的 Scaling 不是堆算力，而是**效率竞赛**——用更少的能源/Token 换更多的智能
- "规模化不是暴力堆砌，而是效率的极致竞赛"
- 如果无法提升 Token 效率，模型智能上限会被"数据墙"锁死

---

## 八、信息来源总表

### 一手来源（本人撰写/演讲/署名）

| # | 类型 | 名称 | URL |
|---|------|------|-----|
| 1 | 学术论文 | Google Scholar Profile | https://scholar.google.com.tr/citations?user=7qXxyJkAAAAJ |
| 2 | 学术论文 | Personal Website (CMU) | https://kimiyoung.github.io/ |
| 3 | 学术论文 | XLNet (NeurIPS 2019) | https://arxiv.org/abs/1906.08237 |
| 4 | 学术论文 | Transformer-XL (ACL 2019) | https://arxiv.org/abs/1901.02860 |
| 5 | 学术论文 | Breaking the Softmax Bottleneck (ICLR 2018) | https://arxiv.org/abs/1711.03953 |
| 6 | 学术论文 | HotpotQA (EMNLP 2018) | https://arxiv.org/abs/1809.09600 |
| 7 | 学术论文 | GLM (ACL 2022) | https://arxiv.org/abs/2103.10360 |
| 8 | 学术论文 | P-Tuning (GPT Understands, Too) | https://arxiv.org/abs/2103.10385 |
| 9 | 学术论文 | P-Tuning v2 | https://arxiv.org/abs/2110.07602 |
| 10 | 学术论文 | FewNLU (ACL 2022) | ACL Anthology |
| 11 | 学术论文 | ZeroPrompt (EMNLP 2022 Findings) | ACL Anthology |
| 12 | 学术论文 | NLP From Scratch (ICML 2023) | https://arxiv.org/abs/2111.04130 |
| 13 | 学术论文 | Universal Discriminator (ACL 2023) | https://arxiv.org/abs/2211.08099 |
| 14 | 学术论文 | Kimi k1.5 (2025) | https://arxiv.org/abs/2501.12599 |
| 15 | 学术论文 | Muon is Scalable (2025) | https://arxiv.org/abs/2502.16982 |
| 16 | 学术论文 | MoBA (2025) | https://arxiv.org/abs/2502.13189 |
| 17 | 学术论文 | Kimi K2 (2025) | https://arxiv.org/abs/2507.20534 |
| 18 | 学术论文 | Attention Residuals (2026) | https://arxiv.org/abs/2603.15031 |
| 19 | 学术论文 | Mooncake (2024) | https://arxiv.org/abs/2407.00079 |
| 20 | 学术论文 | Kimi-VL (2025) | https://arxiv.org/abs/2504.07491 |
| 21 | 学术论文 | Kimi-Audio (2025) | https://arxiv.org/abs/2504.18425 |
| 22 | 学术论文 | Kimina-Prover (2025) | https://arxiv.org/abs/2504.11354 |
| 23 | 学术论文 | LEPA (ICLR 2025) | https://arxiv.org/abs/2505.00031 |
| 24 | 学术论文 | Neural LP (NeurIPS 2017) | NeurIPS Proceedings |
| 25 | 学术论文 | Graph Embeddings SSL (ICML 2016) | https://arxiv.org/abs/1603.08861 |
| 26 | 技术博客 | Google AI Blog: Transformer-XL | https://research.google/blog/transformer-xl-unleashing-the-potential-of-attention-models/ |
| 27 | 技术博客 | Moonlight 技术博客 | https://platform.moonshot.cn/blog/posts/moonlight |
| 28 | 演讲实录 | GTC 2026 Keynote | 多家媒体整理（澎湃/21世纪/新京报等） |
| 29 | 演讲实录 | 2026中关村论坛：开源AI加速探索智能上限 | https://www.zgcforum.com/news/forum/963055 |
| 30 | 演讲实录 | 2026中关村论坛圆桌对话实录 | https://www.thepaper.cn/newsDetail_forward_32842729 |

### 二手来源（深度报道/媒体转述）

| # | 媒体 | 标题 | URL |
|---|------|------|-----|
| 31 | 36氪/张小珺 | 对话月之暗面杨植麟：向延绵而未知的雪山前进 | https://36kr.com/p/2677672437708552 |
| 32 | 海外独角兽 | 专访月之暗面杨植麟：lossless long context is everything | https://foresightnews.pro/article/detail/53994 |
| 33 | LessWrong | Interviews with Moonshot AI's CEO, Yang Zhilin (英文版) | https://www.greaterwrong.com/posts/tXJjRjErYodnCsDQf/interviews-with-moonshot-ai-s-ceo-yang-zhilin |
| 34 | 张小珺播客 | 和杨植麟时隔一年的独家对话："站在无限的开端" | Apple Podcast ID 1634356920 |
| 35 | 极客公园 | 对话杨植麟：聚焦生产力，做好Kimi这一个产品 | https://podlm.ai/zh-CN/ai-podcast/i2dr4sm3ylixbo |
| 36 | 36氪/钛媒体/澎湃 | 杨植麟的反击 | https://www.36kr.com/p/3391271927322760 |
| 37 | 北京日报 | 对话杨植麟：开源是"绝对胜利"，Token是"未来GDP" | https://xinwen.bjd.com.cn/content/s69c5ca66e4b0687a28931c66.html |
| 38 | BAAI | 四杰论剑AGI：唐杰、杨植麟、林俊旸、姚顺雨 | https://hub.baai.ac.cn/view/51845 |
| 39 | Sky9 Capital | The Only Chinese LLM Founder on Stage | https://www.sky9capital.com/news/the-only-chinese-llm-founder-on-stage-zhilin-yang-keynotes-at-nvidia-gtc/ |
| 40 | Pandaily | Moonshot AI's Yang Zhilin Details Kimi K2.5 at ZGC Forum | https://pandaily.com/moonshot-ai-s-yang-zhilin-details-kimi-k2-5-at-zgc-forum |
| 41 | TMTPOST | Moonshot Founder Reveals Kimi's Technical Roadmap | https://en.tmtpost.com/news/7919010 |
| 42 | 36Kr EN | Yang Zhilin: Forging Ahead with DeepSeek (英文) | https://eu.36kr.com/en/p/3385374882397957 |

---

## 九、总结

杨植麟是一个**技术理想主义驱动的 AGI 创业者**，其思想体系具有高度的内在一致性：

1. **学术基础**：从 CMU 开始的语言模型研究，核心贡献横跨预训练（XLNet, Transformer-XL）、少样本学习（P-Tuning, FewNLU）、模型推理（Kimi k1.5, LEPA）三大领域

2. **创业信念**：从"语言模型是唯一重要问题"出发，推导出"无损长上下文"作为核心差异点，进而演化出"Token Efficiency × Long Context × Agent Swarms"的三维技术路线

3. **核心判断（真信念）**：
   - Scaling Law 仍然成立，但瓶颈从算力转为效率
   - 底层技术标准（优化器、注意力、残差连接）需要系统性重构
   - 微调和 Tokenizer 最终消失（最反共识）
   - 开源是绝对胜利

4. **独特的方法论**：
   - "有概率的非共识"——寻找主流忽视但理论上成立的方向
   - "从无限的雕花中释放自己"——不要局部优化，要有新维度
   - RL 管理组织——给团队自主权，用结果信号反馈
   - "归零能力"比经验更重要

5. **沟通风格**：技术细节驱动、第一性原理式论证、善于类比（雪山、缸中之脑、缩放阶梯），中英文均可深度表达技术观点。
