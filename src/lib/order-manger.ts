'use client';

import type { Order, OrderInfo, Orders, OrderStatus } from '@/shared/types/global';
import { Emitter } from '@/lib/emitter';
import { 
  placeOrderAction, 
  getAllOrdersAction, 
  changeOrderStatusAction,
} from '@/server/actions/order';

type OrderManagerEvents = {
  changed: Orders;
  error: unknown;
};

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
  private emitter = new Emitter<OrderManagerEvents>();
  private orders4Speech?: Order;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private idleCheckMs = 2000;
  private lock = false;
  //
  // Events
  //
  onChange(fn: (orders: Orders) => void) { return this.emitter.on('changed', fn); }
  private async changed(newOrders?:Orders) { 
    const orders = newOrders || await this.getAllOrders();
    this.emitter.emit('changed', orders); 
  }
  //
  // Communicate with server
  //
  async getAllOrders(): Promise<Orders>{ 
    const orders = (await getAllOrdersAction()) ?? ({ readyToServe: {}, inProgress: {}, pending: {} } as Orders)     
    return orders;
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
  //
  //
  //
  private schedule(ms: number){
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.tick(), this.idleCheckMs);
  }

  private tick(){
    if (this.lock) {
      this.schedule(this.idleCheckMs);
      return;
    }

    this.lock = true;
    try {
      // TODO: Assign orders for speech to SpeechCrew
    } finally {
      this.lock = false;
    }
  }

  // TODO: implement
  private pickup4Speech(){

  }

  // TODO: Check and modify.
  private setOrders4Speech(orders: Orders){
    if(!orders.readyToServe){ this.orders4Speech = undefined; }
    const readyToServeOrders = Object.values(orders.readyToServe);

    readyToServeOrders.forEach((order) => { 
      if(!this.orders4Speech?.hasOwnProperty(order.orderNum)) {
        if(!this.orders4Speech){ this.orders4Speech = {} as Order; }
        this.orders4Speech[order.orderNum] = order;
      }
    })
  }
}