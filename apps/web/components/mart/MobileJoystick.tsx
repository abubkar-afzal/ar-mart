'use client';

import { useEffect, useRef } from 'react';

export function MobileJoystick({ onChange }: { onChange: (x: number, z: number) => void }) {
  const baseRef = useRef<HTMLDivElement | null>(null);
  const knobRef = useRef<HTMLDivElement | null>(null);
  const pointerId = useRef<number | null>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const base = baseRef.current;
    const knob = knobRef.current;
    if (!base || !knob) return;

    const maxRadius = 44;

    const onDown = (e: PointerEvent) => {
      pointerId.current = e.pointerId;
      base.setPointerCapture(e.pointerId);
      const rect = base.getBoundingClientRect();
      origin.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      update(e.clientX, e.clientY);
    };
    const onMove = (e: PointerEvent) => {
      if (pointerId.current !== e.pointerId) return;
      update(e.clientX, e.clientY);
    };
    const onUp = (e: PointerEvent) => {
      if (pointerId.current !== e.pointerId) return;
      pointerId.current = null;
      origin.current = null;
      knob.style.transform = 'translate(-50%, -50%)';
      onChange(0, 0);
    };
    const update = (clientX: number, clientY: number) => {
      if (!origin.current) return;
      let dx = clientX - origin.current.x;
      let dy = clientY - origin.current.y;
      const len = Math.hypot(dx, dy);
      if (len > maxRadius) {
        dx = (dx / len) * maxRadius;
        dy = (dy / len) * maxRadius;
      }
      knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      // Normalize to [-1, 1]; z is forward (negative up)
      onChange(dx / maxRadius, -dy / maxRadius);
    };

    base.addEventListener('pointerdown', onDown);
    base.addEventListener('pointermove', onMove);
    base.addEventListener('pointerup', onUp);
    base.addEventListener('pointercancel', onUp);
    return () => {
      base.removeEventListener('pointerdown', onDown);
      base.removeEventListener('pointermove', onMove);
      base.removeEventListener('pointerup', onUp);
      base.removeEventListener('pointercancel', onUp);
    };
  }, [onChange]);

  return (
    <div
      ref={baseRef}
      className="w-32 h-32 rounded-full bg-black/30 backdrop-blur-sm touch-none select-none"
      aria-label="Movement joystick"
    >
      <div
        ref={knobRef}
        className="w-14 h-14 rounded-full bg-white/70 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      />
    </div>
  );
}