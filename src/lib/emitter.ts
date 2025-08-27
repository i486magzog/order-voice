type Listener<T> = (...args: T[]) => void;

export class Emitter<T> {
  private map = new Map<string, Set<Listener<T>>>();
  on(evt: string, fn: Listener<T>) {
    if (!this.map.has(evt)) this.map.set(evt, new Set());
    this.map.get(evt)!.add(fn);
    return () => this.off(evt, fn);
  }
  off(evt: string, fn: Listener<T>) { this.map.get(evt)?.delete(fn); }
  emit(evt: string, ...args: T[]) { this.map.get(evt)?.forEach(fn => fn(...args)); }
}