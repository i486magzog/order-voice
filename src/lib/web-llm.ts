'use client'

import { Order } from "@/shared/types/global";
// import { CreateMLCEngine } from "@mlc-ai/web-llm";

export class WebLLM {
  async makeSpeechText(order: Order): Promise<string> {
    const n = order.orderNum;
    const base = `Order number ${n}, your order is ready.`;
    return base;
  }
}

// // Callback function to update model loading progress
// const initProgressCallback = (initProgress: any) => {
//   console.log(initProgress);
// }
// const selectedModel = "Llama-3.1-8B-Instruct-q4f32_1-MLC";

// const engine = await CreateMLCEngine(
//   selectedModel,
//   { initProgressCallback: initProgressCallback }, // engineConfig
// );