'use client'

export default function Progress({ value = 0 }: { value?: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2 w-full rounded bg-gray-200"
    >
      <div className="h-full rounded bg-blue-500 transition-[width] duration-300" style={{ width: `${pct}%` }} />
    </div>
  );
}