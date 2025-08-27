'use client';

import type { Order, Orders, OrderStatus } from '@/shared/types/global';
import { Emitter } from '@/lib/emitter';
import { 
  placeOrderAction, 
  getAllOrdersAction, 
  changeOrderStatusAction,
} from '@/server/actions/order';

export class OrderManager {
  //
  // Singleton instance
  //
  static #instance: OrderManager;
  private constructor() { }
  public static get instance(): OrderManager {
    if (!OrderManager.#instance) {
      OrderManager.#instance = new OrderManager();
    }
    return OrderManager.#instance;
  }
  //
  // Private Properties
  //
  private emitter = new Emitter<Orders>();
  //
  // Events
  //
  onChange(fn: (orders: Orders) => void) { return this.emitter.on('change', fn); }
  onSpeech(fn: (o: Order) => void) { return this.emitter.on('speech', fn); }
  private async changed(orders?:Orders) { 
    const newOrders = orders || await this.getAllOrders();
    this.emitter.emit('change', newOrders); 
  }
  //
  // Communicate with server
  //
  async getAllOrders(): Promise<Orders>{ 
    return (await getAllOrdersAction()) ?? ({ readyToServe: {}, inProgress: {}, pending: {} } as Orders) 
  }
  async changeOrderStatus(orderNum: number, from: OrderStatus, to: OrderStatus) {
    return changeOrderStatusAction(orderNum, from, to)
      .then((orders) => orders && this.changed(orders) )
      .catch((error) => {
        console.error('Error:', error);
      });
  }
  async placeOrder(menus?: string[]) {
    return placeOrderAction(menus)
      .then((orders) => orders && this.changed(orders) )
      .catch((error) => {
        console.error('Error:', error);
      });
  }
}