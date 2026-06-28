import type { ReactNode } from 'react'
import clsx from 'clsx'

interface PageContainerProps {
  children: ReactNode
  className?: string
  /** wide: 用 1480px 最宽,适合 Home / 详情页主网格 */
  wide?: boolean
}

export default function PageContainer({
  children,
  className,
  wide = false,
}: PageContainerProps) {
  return (
    <main
      className={clsx(
        'mx-auto w-full px-8 py-10',
        wide ? 'max-w-page-wide' : 'max-w-page',
        className,
      )}
    >
      {children}
    </main>
  )
}
