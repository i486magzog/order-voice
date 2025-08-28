export class Emitter<EvtMap extends Record<string, unknown>> {
  private map = new Map<keyof EvtMap, Set<(p: unknown) => void>>();
  on<K extends keyof EvtMap>(k: K, fn: (p: EvtMap[K]) => void) {
    if (!this.map.has(k)) this.map.set(k, new Set());
    this.map.get(k)!.add(fn as (p: unknown) => void);
    return () => this.off(k, fn);
  }
  off<K extends keyof EvtMap>(k: K, fn: (p: EvtMap[K]) => void) {
    this.map.get(k)?.delete(fn as (p: unknown) => void);
  }
  emit<K extends keyof EvtMap>(k: K, payload: EvtMap[K]) {
    this.map.get(k)?.forEach((fn) => fn(payload));
  }
}