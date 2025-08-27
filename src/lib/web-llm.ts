import { Order } from "@/shared/types/global";

export class WebLLM {
  async makeSpeechText(order: Order): Promise<string> {
    const n = order.orderNum;
    const base = `Order number ${n}, your order is ready.`;
    return base;
  }
}