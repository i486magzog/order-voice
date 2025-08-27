export type Order = {
  [orderNum:number]: {
    orderNum: number
    menus?: string[]
    speechCnt?: number
    createdAt: Date
  }
}

export type Orders = {
  readyToServe: Order
  inProgress: Order
  pending: Order
}

export enum OrderStatus {
  CANCELLED = 'cancelled',
  PENDING = 'pending',
  IN_PROGRESS = 'inProgress',
  READY_TO_SERVE = 'readyToServe',
  COMPLETED = 'completed'
}
  