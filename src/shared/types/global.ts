export type Order = {
  orderNum: number
  menus?: string[]
  speechCnt?: number
  createdAt: Date
}

export type Orders = {
  [orderNum:number]: Order
}

export type OrderGroup = {
  readyToServe: Orders
  inProgress: Orders
  pending: Orders
}

export enum OrderStatus {
  CANCELLED = 'cancelled',
  PENDING = 'pending',
  IN_PROGRESS = 'inProgress',
  READY_TO_SERVE = 'readyToServe',
  COMPLETED = 'completed',
}

export const TWO_MIN = 2 * 60 * 1000;

export interface IOrderManager {
  pickupToSpeech(): Promise<Orders | null>;
}

export interface ILLM {
  makeSpeechText(order: Orders): Promise<string>;
}

export interface ITTS {
  speak(text: string): Promise<void>;
  unlock?(): void;
}