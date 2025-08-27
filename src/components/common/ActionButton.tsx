'use client'

import { cn } from '@/utils/cn'

export type ActionPayload<T> = {
  /** The data will be delivered to the onAction callback */
  data: T
  actionKey: string
}

export type ActionButtonProps<T> = {
  /** The data will be delivered to the onAction callback */
  data: T
  icon?: React.ReactNode
  label: string
  disabled?: boolean
  actionKey: string
  onAction?: (payload: ActionPayload<T>) => void
}

export function ActionButton<T>({
  data,
  icon,
  label,
  disabled,
  actionKey,
  onAction,
}: ActionButtonProps<T>) {
  
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        if (!disabled) onAction?.({ data, actionKey })
      }}
      disabled={disabled}
      className={cn(
        'rounded-md border px-2.5 py-1.5 text-xs',
        'hover:bg-gray-100 hover:cursor-pointer active:bg-gray-100',
        'dark:hover:bg-gray-700 dark:active:bg-gray-600',
        'disabled:opacity-50'
      )}
    >
      <span className="inline-flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </span>
    </button>
  )
}