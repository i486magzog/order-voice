'use client'

import { Queue } from "@/lib/queue";
import { Orders, Order, ITTS, ILLM, TTSOptions } from "@/shared/types/global";
import { Emitter } from "@/lib/emitter";
import { WebLLM } from "./web-llm";
import { NoLLM } from "./no-llm";
import { WebSpeechTTS } from "./web-tts";

type CrewEvents = {
  started: void;
  stopped: void;
  orderAssigned: Orders;
  sentenceEnqueued: string;
  spoken: string;
  error: unknown;
};

export type SpeechCrewOptions = {
  /** Check if queues are empty (5000 = 5s) */
  idleCheckMs?: number;
  /** Wait after speech (300 = 300ms) */
  postSpeechDelayMs?: number;
  /** Limit of OrderQueue */
  maxOrderQueue?: number;
  /** Skip LLM */
  noLLM?: boolean;
};

export class SpeechCrew {
  //
  // Singleton instance
  //
  static #instance: SpeechCrew;
  private constructor() {
    this.opts = {
      idleCheckMs: 2000,
      postSpeechDelayMs: 300,
      maxOrderQueue: 20,
      noLLM: false,
    };
  }
  public static get instance(): SpeechCrew {
    if (!SpeechCrew.#instance) {
      SpeechCrew.#instance = new SpeechCrew();
      
      if(process.env.NODE_ENV === 'development'){ 
        console.log('SpeechCrew.instance created'); 
      }
    }
    return SpeechCrew.#instance;
  }
  //
  // Private Properties
  //
  private llm?: ILLM;
  private tts?: ITTS;
  private opts: Required<SpeechCrewOptions>;
  private orderQueue = new Queue<Order>();
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
   * call before start() on iOS 
   * @example 
   */
  unlockAudio() { this.tts?.unlock?.(); }
  /**
   * Start the crew.
   * @returns
   */
  start({scOpts, ttsOpts}: {scOpts?: SpeechCrewOptions, ttsOpts?: TTSOptions}) {
    if (this.running) return;
    this.opts = { ...this.opts, ...scOpts };

    this.llm = this.opts.noLLM ? new NoLLM() : new WebLLM();
    this.tts = WebSpeechTTS.instance;
    this.unlockAudio();
    this.tts.start(ttsOpts ?? {});
    
    this.running = true;
    this.events.emit('started', undefined);

    this.schedule4Text(0);
    this.schedule4Speech(0);
  }
  /**
   * Assign an order to the crew in order to speak the order number.
   * @param order 
   * @returns 
   */
  assignOrder(order: Order) {
    try {
      if (this.orderQueue.length >= this.opts.maxOrderQueue) return false;
      if (!order) return false;

      this.orderQueue.push(order);
      this.events.emit('orderAssigned', order);

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
    if (this.timer4Text) clearTimeout(this.timer4Text);
    this.timer4Text = setTimeout(() => this.tick4Text(), ms);
  }
  /**
   * Schedule the next tick for speech.
   * @param ms The delay in milliseconds.
   */
  private schedule4Speech(ms: number) {
    if (!this.running) return;
    if (this.timer4Speech) clearTimeout(this.timer4Speech);
    this.timer4Speech = setTimeout(() => this.tick4Speech(), ms);
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
      while(this.orderQueue.length > 0 && await this.makeSpeechText());      
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
    if (!this.running) return;    if (!this.tts?.isActivated() || this.lock) {
      this.schedule4Speech(this.opts.idleCheckMs);
      return;
    }

    this.lock = true;
    try {
      while(this.sentenceQueue.length > 0 && await this.speechText());
      const delay = this.sentenceQueue.length > 0 ? 0 : this.opts.idleCheckMs;
      this.schedule4Speech(delay);
    } finally {
      this.lock = false;
    }
  }
  /**
   * 
   * @returns 
   */
  private async makeSpeechText() {
    try {
      if(process.env.NODE_ENV === 'development'){
        console.log('SpeechCrew.orderQueue: ', this.orderQueue.toArray());
      }

      const order = this.orderQueue.shift();
      if (!order) return false;

      const text = await this.llm?.makeSpeechText(order);
      if(text){
        this.sentenceQueue.push(text);
        this.events.emit('sentenceEnqueued', text);
      }

      return true;

    } catch (e) {
      this.events.emit('error', e);
      return false;
    }
  }
  /**
   * Speak the text.
   * @returns A promise that resolves when the TTS is finished.
   */
  private async speechText() {
    try {
      if(process.env.NODE_ENV === 'development'){
        console.log('SpeechCrew.sentenceQueue: ', this.sentenceQueue.toArray());
      }
      
      const text = this.sentenceQueue.shift();
      if (!text) return false;
      await this.tts?.speak(text);
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

}