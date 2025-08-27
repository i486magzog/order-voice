type TTSOptions = {
  lang?: string; 
  rate?: number; 
  pitch?: number; 
  volume?: number; 
  voiceName?: string | undefined;
};

export class WebSpeechTTS {
  private voices: SpeechSynthesisVoice[] = [];
  private ready: Promise<void>;
  private opts: TTSOptions;

  constructor(opts: TTSOptions = {}) {
    this.opts = {
      lang: opts.lang ?? 'en-US',
      rate: opts.rate ?? 1,
      pitch: opts.pitch ?? 1,
      volume: opts.volume ?? 1,
      voiceName: opts.voiceName ?? undefined,
    };
    this.ready = new Promise<void>((resolve) => {
      const load = () => {
        this.voices = speechSynthesis.getVoices();
        if (this.voices.length) resolve();
      };
      speechSynthesis.onvoiceschanged = () => { load(); resolve(); };
      load();
    });
  }

  unlock() {
    if (typeof window === 'undefined') return;
    try {
      const u = new SpeechSynthesisUtterance(' ');
      window.speechSynthesis.speak(u);
      window.speechSynthesis.cancel();
    } catch {}
  }

  async speak(text: string, opts: TTSOptions = {}) {
    await this.ready;
    this.opts = { ...this.opts, ...opts };
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.opts.lang ?? 'en-US';
    utterance.rate = this.opts.rate ?? 1;
    utterance.pitch = this.opts.pitch ?? 1;
    utterance.volume = this.opts.volume ?? 1;

    if (this.opts.voiceName) {
      const voice = this.voices.find((voice) => voice.name === this.opts.voiceName);
      if (voice) utterance.voice = voice;
    } else {
      const voice = this.voices.find((voice) => voice.lang?.startsWith(utterance.lang));
      if (voice) utterance.voice = voice;
    }

    return new Promise<void>((resolve, reject) => {
      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(e.error || e);
      speechSynthesis.speak(utterance);
    });
  }

  cancel() { speechSynthesis.cancel(); }
  isSpeaking() { return speechSynthesis.speaking; }
}