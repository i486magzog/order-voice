'use client'
/**
 *
 * Features
 * - Each item can have label and multiple action buttons.
 * - Actions are processed by the upper onAction callback.
 * - When there are actions more than maxInlineActions, they are automatically truncated into a "More" dropdown.
 *
 */
import React, { Fragment } from 'react'
import { Listbox, ListboxOption, ListboxOptions, Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { cn } from '@/utils/cn'
import { ActionButton, ActionPayload } from './ActionButton'

export type ListItemAction = {
  key: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
}

export type ListItem = {
  id: string
  label: string
  description?: string
  meta?: React.ReactNode
  actions?: ListItemAction[]
  disabled?: boolean
  /** invisible data */
  data?: unknown
}

export type OpenedListBoxProps = {
  items: ListItem[]
  className?: string
  ariaLabel?: string
  onAction?: (payload: ActionPayload<ListItem>) => void
  maxInlineActions?: number
}

export function OpenedListBox({
  items,
  className,
  ariaLabel = 'Items',
  onAction,
  maxInlineActions = 3
}: OpenedListBoxProps) {

  return (
    <Listbox value={items} by={(a: ListItem, b: ListItem) => a.id === b.id}>
      
      <ListboxOptions
        static
        className={cn(
          'w-full divide-y rounded-2xl border bg-white shadow-sm',
          'dark:bg-gray-800',
          'focus:outline-none',
          className
        )}
        aria-label={ariaLabel}
      >
        {items.map((item) => (

          <ListboxOption
            key={item.id}
            value={item}
            disabled={item.disabled}
            className={'group flex items-center justify-between gap-4 p-4 outline-none'}
          >
            <div className="flex w-full items-center justify-between gap-4">
              
              {/* Left: label & description */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={'truncate text-sm font-medium'}>{item.label}</span>
                  {item.meta && (
                    <span className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] text-gray-600">{item.meta}</span>
                  )}
                </div>
                {item.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500">{item.description}</p>
                )}
              </div>

              {/* Right: actions */}
              <div className="flex items-center gap-2">
                {(item.actions ?? []).map((a, i) => (
                  i < maxInlineActions &&
                    <ActionButton<ListItem> 
                      key={a.key} 
                      data={item} 
                      icon={a.icon}
                      label={a.label}
                      disabled={a.disabled}
                      actionKey={a.key}
                      onAction={onAction} 
                    />
                ))}

                {/* Overflow: Show more menu button. */}
                {item.actions && item.actions.length > maxInlineActions && (
                  <MoreButton
                    item={item}
                    maxInlineActions={maxInlineActions}
                    onAction={onAction}
                  />
                )}
              </div>
            </div>
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  )
}

type MoreButtonProps = {
  item: ListItem
  maxInlineActions: number
  onAction?: (payload: ActionPayload<ListItem>) => void
}

function MoreButton({
  item,
  maxInlineActions,
  onAction,
}: MoreButtonProps){
  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton
        className={cn(
          "inline-flex items-center rounded-md border px-2.5 py-1.5 text-xs",
          "hover:cursor-pointer hover:bg-gray-100",
          "dark:hover:bg-gray-700"
        )}
        onClick={(e) => e.stopPropagation()}
        aria-label="More actions"
      >
        More
      </MenuButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <MenuItems
          className={cn(
            "absolute right-0 z-10 mt-2 w-40 origin-top-right divide-y divide-gray-100 rounded-md border bg-white shadow-lg",
            "focus:outline-none",
            "dark:bg-gray-800"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-1">
            {item.actions?.slice(maxInlineActions).map((a) => (
              <MenuItem key={a.key} disabled={a.disabled}>  
                <button
                  type="button"
                  className={cn(
                    'block w-full rounded px-2 py-1.5 text-left text-sm',
                    'focus:bg-gray-50',
                    'hover:cursor-pointer hover:bg-gray-100',
                    'dark:hover:bg-gray-700 dark:active:bg-gray-600',
                    'disabled:opacity-50'
                  )}
                  onClick={(e) => onAction?.({ data: item, actionKey: a.key })}
                  disabled={a.disabled}
                >
                  {a.label}
                </button>
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  )
}