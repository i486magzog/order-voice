'use client'

import { Order } from "@/shared/types/global";

/**
 * Make speech text without LLM.
 * The sentence is fixed.
 */
export class NoLLM {
  constructor() {
    if(process.env.NODE_ENV === 'development') {
      console.log('NoLLM.instance created');
    }
  }
  async makeSpeechText(order: Order): Promise<string> {
    const n = order.orderNum;
    const base = `${n}! ${n}! Your order is ready.`;
    return base;
  }
}
