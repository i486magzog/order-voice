'use client';

import type { Orders, OrderGroup, OrderStatus, TTSOptions } from '@/shared/types/global';
import { Emitter } from '@/lib/emitter';
import { 
  placeOrderAction, 
  getAllOrdersAction, 
  changeOrderStatusAction,
} from '@/server/actions/order';
import { SpeechCrew, SpeechCrewOptions } from '@/lib/speech-crew';

type OrderManagerEvents = {
  changed: OrderGroup;
  error: unknown;
};

type OrderManagerOptions = {
  idleCheckMs?: number;
  repeatDelayMs?: number;
};

type Options = {
  omOpts?: OrderManagerOptions;
  scOpts?: SpeechCrewOptions;
  ttsOpts?: TTSOptions;
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
  private orders4Speech?: Orders;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private lock = false;
  private idleCheckMs = 2000;
  private repeatDelayMs = 1000 * 60 * 2;
  //
  // Events
  //
  onChange(fn: (orderGroup: OrderGroup) => void) { return this.emitter.on('changed', fn); }
  private async changed(newOrderGroup?:OrderGroup) { 
    const orderGroup = newOrderGroup || await this.getAllOrders();
    this.emitter.emit('changed', orderGroup);
    this.setOrders4Speech(orderGroup);
  }
  /**
   * Get all cached orders.
   * @returns 
   */
  async getAllOrders(): Promise<OrderGroup>{ 
    const orderGroup = (await getAllOrdersAction()) ?? ({ readyToServe: {}, inProgress: {}, pending: {} } as OrderGroup)
    return orderGroup;
  }
  /**
   * Change the order status.
   * @param orderNum 
   * @param from 
   * @param to 
   * @returns 
   */
  async changeOrderStatus(orderNum: number, from: OrderStatus, to: OrderStatus) {
    return changeOrderStatusAction(orderNum, from, to)
      .then((orderGroup) => orderGroup && this.changed(orderGroup) )
      .catch((error) => {
        console.error('Error:', error);
      });
  }
  /**
   * Place an order. 
   * The order status is set to 'Pending'.
   * @param menus 
   * @returns 
   */
  async placeOrder(menus?: string[]) {
    return placeOrderAction(menus)
      .then((orderGroup) => orderGroup && this.changed(orderGroup) )
      .catch((error) => {
        console.error('Error:', error);
      });
  }
  /**
   * Start the OrderManager.
   * @param opts 
   */
  async start({omOpts, scOpts, ttsOpts}: Options){
    this.idleCheckMs = omOpts?.idleCheckMs || this.idleCheckMs;
    this.repeatDelayMs = omOpts?.repeatDelayMs || this.repeatDelayMs;
    this.lock = false;

    SpeechCrew.instance.start({
      scOpts: scOpts,
      ttsOpts: ttsOpts
    });

    const orderGroup = await this.getAllOrders();
    this.setOrders4Speech(orderGroup);
    this.schedule(this.idleCheckMs);
  }
  //
  //
  //
  private schedule(ms: number){
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.tick(), ms);
  }
  private tick(){
    if (this.lock) {
      this.schedule(this.idleCheckMs);
      return;
    }

    this.lock = true;
    try {
      this.pickup4Speech()
      this.schedule(this.idleCheckMs);
    } finally {
      this.lock = false;
    }
  }
  private pickup4Speech(){
    if(!this.orders4Speech) return;
    const orders4SpeechArr = structuredClone(Object.values(this.orders4Speech));
    orders4SpeechArr.forEach((order) => {
      //
      // 1. Check if the time is passed repeatDelayMs after assigned to SpeechCrew.
      //
      const updatedAt = new Date(order.updatedAt);
      const now = new Date(new Date().toISOString());
      const diff = now.getTime() - updatedAt.getTime();
      const repeatCnt = Math.ceil(diff / this.repeatDelayMs);
      if(repeatCnt > (order.speechCnt || 0)){
        //
        // 2. If so, assign the order to SpeechCrew.
        //
        if(this.orders4Speech?.hasOwnProperty(order.orderNum)){
          this.orders4Speech[order.orderNum].speechCnt = repeatCnt;
          SpeechCrew.instance.assignOrder(order);
        }
      }
    })
  }
  /**
   * Update the orders 'Ready to serve' to this.orders4Speech.
   * @param orderGroup 
   */
  private setOrders4Speech(orderGroup: OrderGroup){
    if(!orderGroup.readyToServe){ this.orders4Speech = undefined; }
    
    const readyToServeOrders = Object.values(orderGroup.readyToServe);
    const newOrders4Speech: Orders = {};

    readyToServeOrders.forEach((order) => { 
      newOrders4Speech[order.orderNum] = this.orders4Speech?.hasOwnProperty(order.orderNum)
        ? this.orders4Speech[order.orderNum]
        : order;
    })

    if(process.env.NODE_ENV === 'development'){ console.log('OrderManager.orders4Speech: ', newOrders4Speech); }

    this.orders4Speech = newOrders4Speech;
  }
}