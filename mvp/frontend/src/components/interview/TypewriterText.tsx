interface Props {
  text: string
  done: boolean
}

/**
 * 显示文字 + 未完成时光标。打字机视效来自 SSE delta 的节流推送 +
 * store 的累积,这里不再二次重放,避免和真实流冲突。
 */
export default function TypewriterText({ text, done }: Props) {
  return (
    <span className="whitespace-pre-wrap">
      {text}
      {!done && <span className="typewriter-caret" aria-hidden />}
    </span>
  )
}
