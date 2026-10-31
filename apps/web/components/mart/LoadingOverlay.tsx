export function LoadingOverlay({ progress }: { progress: number }) {
  return (
    <div className="absolute inset-0 bg-brand-charcoal text-white flex flex-col items-center justify-center z-20">
      <div className="text-3xl font-extrabold tracking-tight text-brand-red">AR MART</div>
      <div className="mt-2 text-sm text-white/70">Explore. Discover. Shop.</div>
      <div className="mt-8 w-64 h-1.5 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-red transition-all"
          style={{ width: `${Math.max(5, Math.min(100, progress))}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-white/60">Building the 3D store…</div>
    </div>
  );
}