import { OrderManager } from "@/lib/order-manger";
import { Queue } from "@/lib/queue";
import { Order, OrderInfo, Orders, ITTS, ILLM, IOrderManager } from "@/shared/types/global";
import { Emitter } from "@/lib/emitter";
import { WebLLM } from "./web-llm";
import { WebSpeechTTS } from "./web-tts";

type CrewEvents = {
  started: void;
  stopped: void;
  orderAssigned: Order;
  sentenceEnqueued: string;
  spoken: string;
  error: unknown;
};

type SpeechCrewOptions = {
  /** Check if queues are empty (5000 = 5s) */
  idleCheckMs?: number;
  /** Wait after speech (300 = 300ms) */
  postSpeechDelayMs?: number;
  /** Limit of OrderQueue */
  maxOrderQueue?: number;
};

type SpeechCrewArgs = {
  // orderManager: IOrderManager;
  llm?: ILLM;
  tts?: ITTS;
  options?: SpeechCrewOptions;
};


export class SpeechCrew {
  //
  // Singleton instance
  //
  static #instance: SpeechCrew;
  private constructor() {
    // this.orderMgr = args.orderManager;
    this.llm = new WebLLM();
    this.tts = new WebSpeechTTS({ lang: 'en-NZ' });
    this.opts = {
      idleCheckMs: 2000,
      postSpeechDelayMs: 300,
      maxOrderQueue: 20,
    };
  }
  public static get instance(): SpeechCrew {
    if (!SpeechCrew.#instance) {
      SpeechCrew.#instance = new SpeechCrew();
    }
    return SpeechCrew.#instance;
  }
  //
  // Private Properties
  //
  private llm: ILLM;
  private tts: ITTS;
  private opts: Required<SpeechCrewOptions>;
  private orderQueue = new Queue<OrderInfo>();
  private sentenceQueue = new Queue<string>();
  private running = false;
  private events = new Emitter<CrewEvents>();
  private lock = false;
  private timer4Text: ReturnType<typeof setTimeout> | null = null;
  private timer4Speech: ReturnType<typeof setTimeout> | null = null;
  //
  // Getters
  //
  get orderQueueSize() { return this.orderQueue.length; }
  get sentenceQueueSize() { return this.sentenceQueue.length; }
  get isRunning() { return this.running; }
  //
  // Events
  //
  on = this.events.on.bind(this.events);
  off = this.events.off.bind(this.events);
  /** 
   * Optional: call before start() on iOS 
   * @example 
   * const crew = new SpeechCrew();
   * crew.unlockAudio();
   * crew.on('spoken', (line) => console.log('TTS:', line));
   * crew.start();
   */
  unlockAudio() { this.tts.unlock?.(); }
  start() {
    if (this.running) return;
    this.running = true;
    this.events.emit('started', undefined as any);
    this.schedule4Text(0);
    this.schedule4Speech(0);
  }
  /** 
   * Stop but keep queues. 
   */
  stop() {
    this.running = false;
    if (this.timer4Text) clearTimeout(this.timer4Text);
    if (this.timer4Speech) clearTimeout(this.timer4Speech);
    this.events.emit('stopped', undefined as any);
  }
  /** 
   * Clear all queues 
   */
  clearQueues() {
    this.orderQueue.clear();
    this.sentenceQueue.clear();
  }
  /** 
   * Enqueue an order 
   */
  enqueueOrder(orderInfo: OrderInfo) {
    if (this.orderQueue.length >= this.opts.maxOrderQueue) return;
    this.orderQueue.push(orderInfo);
  }
  /**
   * Assign an order to the crew in order to speak the order number.
   * @param orderInfo 
   * @returns 
   */
  assignOrder(orderInfo: OrderInfo) {
    try {
      if (this.orderQueue.length >= this.opts.maxOrderQueue) return false;
      if (!orderInfo) return false;

      this.orderQueue.push(orderInfo);
      this.events.emit('orderAssigned', orderInfo);

      return true;
    } catch (e) {
      this.events.emit('error', e);
      return false;
    }
  }

  private async makeSpeechText() {
    try {
      const order = this.orderQueue.shift();
      if (!order) return false;

      const text = await this.llm.makeSpeechText(order);
      this.sentenceQueue.push(text);
      this.events.emit('sentenceEnqueued', text);

      return true;
    } catch (e) {
      this.events.emit('error', e);
      return false;
    }
  }

  private async speechText() {
    try {
      const text = this.sentenceQueue.shift();
      if (!text) return false;
      await this.tts.speak(text);
      //
      // Delay after speech
      //
      if (this.opts.postSpeechDelayMs > 0) {
        await new Promise((r) => setTimeout(r, this.opts.postSpeechDelayMs));
      }
      this.events.emit('spoken', text);
      return true;
    } catch (e) {
      this.events.emit('error', e);
      return false;
    }
  }
  /**
   * Schedule the next tick for generating speech text.
   * @param ms The delay in milliseconds.
   */
  private schedule4Text(ms: number) {
    if (!this.running) return;
    if (this.timer4Speech) clearTimeout(this.timer4Speech);
    this.timer4Speech = setTimeout(() => this.tick4Text(), ms);
  }
  /**
   * Schedule the next tick for speech.
   * @param ms The delay in milliseconds.
   */
  private schedule4Speech(ms: number) {
    if (!this.running) return;
    if (this.timer4Text) clearTimeout(this.timer4Text);
    this.timer4Text = setTimeout(() => this.tick4Speech(), ms);
  }
  /**
   * 
   * @returns 
   */
  private async tick4Text() {
    if (!this.running) return;
    if (this.lock) {
      this.schedule4Text(this.opts.idleCheckMs);
      return;
    }

    this.lock = true;
    try {

      // const dequeueCnt = this.orderQueue.length >= 3 ? 3 : this.orderQueue.length;
      // const orderInfoArr = this.orderQueue.dequeue(dequeueCnt);
      // await Promise.all(orderInfoArr.map((orderInfo) => this.llm.makeSpeechText(orderInfo)))
      //   .then((texts) => texts.forEach((text) => this.sentenceQueue.push(text)) )
      //   .catch((e) => {
      //     this.events.emit('error', e);
      //   });

      while(this.makeSpeechText());
      
      const delay = this.orderQueue.length > 0 ? 0 : this.opts.idleCheckMs;
      this.schedule4Text(delay);
    } finally {
      this.lock = false;
    }
  }
  /**
   * 
   * @returns 
   */
  private async tick4Speech() {
    if (!this.running) return;
    if (this.lock) {
      this.schedule4Speech(this.opts.idleCheckMs);
      return;
    }

    this.lock = true;
    try {
      while(this.speechText());
      const delay = this.sentenceQueue.length > 0 ? 0 : this.opts.idleCheckMs;
      this.schedule4Speech(delay);
    } finally {
      this.lock = false;
    }
  }
}