'use client'

import { useCallback } from "react"
import { OpenedListBox, ListItem } from "./common/OpenedListBox"
import { Button } from "@headlessui/react"
import { cn } from "@/utils/cn"

type DashboardProps = {
  readyToServeList: ListItem[]
  inProgressList: ListItem[]
  pendingList: ListItem[]
}

export function Dashboard({
  readyToServeList,
  inProgressList,
  pendingList,
}: DashboardProps) {

  const handleAction = useCallback(({ data, actionKey }: { data: ListItem; actionKey: string }) => {
    if (actionKey === 'delete') {
      return
    }
    alert(`${actionKey} → ${data.label}`)
  }, [])

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">

      <h1 className="text-xl font-semibold">Ready to serve</h1>
      <OpenedListBox
        items={readyToServeList}
        onAction={handleAction}
        maxInlineActions={3}
      />

      <h1 className="text-xl font-semibold">In Progress</h1>
      <OpenedListBox
        items={inProgressList}
        onAction={handleAction}
        maxInlineActions={3}
      />

      <h1 className="text-xl font-semibold">Pending</h1>
      <OpenedListBox
        items={pendingList}
        onAction={handleAction}
        maxInlineActions={3}
      />

      <div className="flex justify-end">
        <Button
          className={cn("rounded bg-sky-600 px-4 py-2 text-sm text-white",
            "data-active:bg-sky-700 data-hover:bg-sky-500",
            "dark:bg-sky-500 dark:data-active:bg-sky-600 dark:data-hover:bg-sky-400"
          )}

          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          Place Order
        </Button>
      </div>

    </div>
  )
}