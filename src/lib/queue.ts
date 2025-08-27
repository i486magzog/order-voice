export class Queue<T> {
  private arr: T[] = [];
  get length(): number { return this.arr.length; }
  push(value: T) { this.arr.push(value); }
  shift(): T | undefined { return this.arr.shift(); }
  dequeue(cnt: number) { return this.arr.splice(0, cnt); }
  clear() { this.arr = []; }
  toArray(): T[] { return [...this.arr]; }
}