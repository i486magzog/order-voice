export class Emitter<EvtMap extends Record<string, any>> {
  private map = new Map<keyof EvtMap, Set<(p: any) => void>>();
  on<K extends keyof EvtMap>(k: K, fn: (p: EvtMap[K]) => void) {
    if (!this.map.has(k)) this.map.set(k, new Set());
    this.map.get(k)!.add(fn as any);
    return () => this.off(k, fn);
  }
  off<K extends keyof EvtMap>(k: K, fn: (p: EvtMap[K]) => void) {
    this.map.get(k)?.delete(fn as any);
  }
  emit<K extends keyof EvtMap>(k: K, payload: EvtMap[K]) {
    this.map.get(k)?.forEach((fn) => fn(payload));
  }
}