import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'

interface Props {
  title: string
  back?: boolean
  onBack?: () => void
  right?: ReactNode
  subtitle?: string
}

export default function TopBar({ title, back, onBack, right, subtitle }: Props) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-ash-700 bg-ash-900/95 px-3 py-3 backdrop-blur">
      {back && (
        <button
          onClick={() => (onBack ? onBack() : navigate(-1))}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-ash-700 text-ash-300 active:bg-ash-800"
          aria-label="Back"
        >
          ‹
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-serif text-lg font-semibold tracking-wide text-soul-400">
          {title}
        </h1>
        {subtitle && <p className="truncate text-xs text-ash-400">{subtitle}</p>}
      </div>
      {right}
    </header>
  )
}
