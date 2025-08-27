export type OrderInfo = {
  orderNum: number
  menus?: string[]
  speechCnt?: number
  createdAt: Date
}

export type Order = {
  [orderNum:number]: OrderInfo
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
  COMPLETED = 'completed',
  // READY_TO_ORDER = 'readyToOrder'
}

export const TWO_MIN = 2 * 60 * 1000;