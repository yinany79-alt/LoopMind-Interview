import type { ReactNode } from 'react'
import clsx from 'clsx'

interface PageContainerProps {
  children: ReactNode
  className?: string
  full?: boolean
}

export default function PageContainer({
  children,
  className,
  full = false,
}: PageContainerProps) {
  return (
    <main
      className={clsx(
        'mx-auto w-full px-6 py-10',
        full ? 'max-w-page' : 'max-w-page',
        className,
      )}
    >
      {children}
    </main>
  )
}
