'use client'

import { TTSOptions } from "@/shared/types/global";

export class WebSpeechTTS {
  //
  // Singleton instance
  //
  static #instance: WebSpeechTTS;
  private constructor() { }
  public static get instance(): WebSpeechTTS {
    if (!WebSpeechTTS.#instance) {
      WebSpeechTTS.#instance = new WebSpeechTTS();

      if(process.env.NODE_ENV === 'development'){
        console.log('WebSpeechTTS.instance created');
      }
    }
    return WebSpeechTTS.#instance;
  }
  //
  // Private Properties
  //
  private voices: SpeechSynthesisVoice[] = [];
  private ready: Promise<void> | undefined = Promise.resolve();
  private opts: TTSOptions | undefined;
  private activated = false;
  private activationPromise: Promise<void> | null = null;
  /**
   * Initialize the TTS.
   */
  start(opts: TTSOptions = {}) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) { return; }
    
    this.opts = {
      lang: opts.lang ?? 'en-US',
      rate: opts.rate ?? 1,
      pitch: opts.pitch ?? 1,
      volume: opts.volume ?? 1,
      voiceName: opts.voiceName ?? undefined,
    };

    this.ready = new Promise<void>((resolve) => {
      const synth = window.speechSynthesis;
      const load = () => {
        const voices = synth.getVoices();
        if (voices && voices.length) {
          this.voices = voices;
          resolve();
        }
      };
      synth.onvoiceschanged = () => { load(); };
      load();
      // fallback: try again shortly for browsers that delay voices
      setTimeout(load, 200);
    });
  }
  /**
   * Activate the TTS on the first gesture.
   * This is required on iOS.
   * Chrome requires a user gesture to start the TTS after the page is loaded.
   */
  activateOnFirstGesture() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) { return; }
    if (this.activated) return;

    const enable = () => {
      try {

        const u = new SpeechSynthesisUtterance(' ');
        window.speechSynthesis.speak(u);
        window.speechSynthesis.cancel();
        this.activated = true;

        if(process.env.NODE_ENV === 'development'){ 
          console.log('WebSpeechTTS.activated');
        }

      } catch {}

      window.removeEventListener('pointerdown', enable);
      window.removeEventListener('keydown', enable);
      window.removeEventListener('touchstart', enable);
    };

    window.addEventListener('pointerdown', enable, { once: true });
    window.addEventListener('keydown', enable, { once: true });
    window.addEventListener('touchstart', enable, { once: true });

    if (!this.activationPromise) {
      this.activationPromise = new Promise<void>((resolve) => {
        const check = () => {
          if(process.env.NODE_ENV === 'development'){ 
            console.log('WebSpeechTTS.activationPromise', this.activated);
          }

          if (this.activated) resolve();
          else {
            enable();
            setTimeout(check, 50);
          }
        };
        check();
      });
    }
  }
  /**
   * Unlock the TTS.
   */
  unlock() { this.activateOnFirstGesture(); }
  /**
   * Check if the TTS is activated.
   */
  isActivated() { return this.activated; }
  /**
   * Speak the text.
   * @param text The text to speak.
   * @param opts The options for the TTS.
   * @returns A promise that resolves when the TTS is finished.
   */
  async speak(text: string, opts: TTSOptions = {}) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      throw new Error('Web Speech API is not available in this environment');
    }

    await this.ready;
    //
    // If activation is pending, wait for it
    //
    if (this.activationPromise && !this.activated) {
      await this.activationPromise; // will resolve after user gesture
    }
    //
    // Set options
    //
    this.opts = { ...this.opts, ...opts };
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.opts.lang ?? 'en-US';
    utterance.rate = this.opts.rate ?? 1;
    utterance.pitch = this.opts.pitch ?? 1;
    utterance.volume = this.opts.volume ?? 1;

    if (this.opts.voiceName) {
      const voice = this.voices.find((voice) => voice.name === this.opts?.voiceName);
      if (voice) utterance.voice = voice;
    } else {
      const voice = this.voices.find((voice) => voice.lang?.startsWith(utterance.lang));
      if (voice) utterance.voice = voice;
    }
    //
    // Speak the text
    //
    const synth = window.speechSynthesis;
    return new Promise<void>((resolve, reject) => {
      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject((e as any).error || e);
      try {
        synth.speak(utterance);
      } catch (err) {
        reject(err);
      }
    });
  }
}