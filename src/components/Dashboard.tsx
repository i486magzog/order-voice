'use client'

import { useCallback, useEffect, useState } from "react"
import { OpenedListBox, ListItem } from "./common/OpenedListBox"
import { Button } from "@headlessui/react"
import { cn } from "@/utils/cn"
import { Order, OrderGroup, OrderStatus } from "@/shared/types/global"
import { OrderManager } from "@/lib/order-manger"
import { WebSpeechTTS } from "@/lib/web-tts"

type DashboardProps = {
  orderGroup: OrderGroup | null
}

const getButtonActions = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.READY_TO_SERVE:
      return [
        { key: OrderStatus.IN_PROGRESS, label: 'In Progress' },
        { key: OrderStatus.PENDING, label: 'Pending' },
        { key: OrderStatus.CANCELLED, label: 'Cancel' },
      ]
    case OrderStatus.IN_PROGRESS:
      return [
        { key: OrderStatus.READY_TO_SERVE, label: 'Ready to serve' },
        { key: OrderStatus.PENDING, label: 'Pending' },
        { key: OrderStatus.CANCELLED, label: 'Cancel' },
      ]
    case OrderStatus.PENDING:
      return [
        { key: OrderStatus.IN_PROGRESS, label: 'In Progress' },
        { key: OrderStatus.CANCELLED, label: 'Cancel' },
      ]
    default:
      return []
  }
}

export function Dashboard({orderGroup}: DashboardProps) {
  const orderManager = OrderManager.instance;
  const tts = new WebSpeechTTS();

  const [readyToServeList, setReadyToServeList] = useState<ListItem[]>([])
  const [inProgressList, setInProgressList] = useState<ListItem[]>([])
  const [pendingList, setPendingList] = useState<ListItem[]>([])
  /**
   * The orders are changed via OrderManager.
   */
  const handleAction = useCallback(({ data:listItem, actionKey }: { data: ListItem; actionKey: string }) => {
    orderManager.changeOrderStatus(parseInt(listItem.id), listItem.data as OrderStatus, actionKey as OrderStatus)
  }, [])
  /**
   * Convert type Orders to ListItems when props.orders or order via OrderManager are changed.
   */
  const handleChangeOrderGroup = useCallback((orderGroup: OrderGroup) => {
    function convertToListItem(order: Order, status: OrderStatus) {
      return {
        id: order.orderNum.toString(),
        label: order.orderNum.toString(),
        description: order.menus?.join(' • '),
        // meta: order.speechCnt ? <span className="text-[10px]">{order.speechCnt}</span> : undefined,
        actions: getButtonActions(status),
        data: status
      }
    }

    Promise.all([
      setReadyToServeList(Object.values(orderGroup?.readyToServe ?? {}).map(o => convertToListItem(o, OrderStatus.READY_TO_SERVE))),
      setInProgressList(Object.values(orderGroup?.inProgress ?? {}).map(o => convertToListItem(o, OrderStatus.IN_PROGRESS))),
      setPendingList(Object.values(orderGroup?.pending ?? {}).map(o => convertToListItem(o, OrderStatus.PENDING)))
    ])
  }, []);
  //
  // Update ListItems when props.orders are changed.
  //
  useEffect(() => {
    if (!orderGroup) return;
    handleChangeOrderGroup(orderGroup);
  }, [orderGroup])
  //
  // Set up event listeners for OrderManager.
  //
  useEffect(() => {
    const off = orderManager.onChange(handleChangeOrderGroup);
    return () => { off(); };
  }, [orderManager]);

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

          onClick={async (e) => { await orderManager.placeOrder(); }}
        >
          Place Order
        </Button>

        <Button

          onClick={async (e) => {
            e.stopPropagation()
            await tts.speak('안녕하세요', { lang: 'ko-KR' });
          }}
        >
          Speech
        </Button>
      </div>

    </div>
  )
}