import { OrderInfo } from "@/shared/types/global";

export class WebLLM {
  async makeSpeechText(orderInfo: OrderInfo): Promise<string> {
    const n = orderInfo.orderNum;
    const base = `Order number ${n}, your order is ready.`;
    return base;
  }
}