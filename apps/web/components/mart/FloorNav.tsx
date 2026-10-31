'use client';

import type { MartFloor } from '@/lib/mart/scene';

const FLOORS: { id: MartFloor; label: string; dept: string }[] = [
  { id: 0, label: 'G', dept: 'Grocery' },
  { id: 1, label: '1', dept: 'Clothing' },
  { id: 2, label: '2', dept: 'Electronics' },
  { id: 3, label: '3', dept: 'Furniture' },
];

export function FloorNav({
  current,
  onSelect,
}: {
  current: MartFloor;
  onSelect: (f: MartFloor) => void;
}) {
  return (
    <div className="flex flex-col gap-1 bg-white/90 backdrop-blur rounded-lg shadow p-1.5">
      {FLOORS.map((f) => (
        <button
          key={f.id}
          onClick={() => onSelect(f.id)}
          className={`px-3 py-2 text-xs font-semibold rounded ${
            current === f.id ? 'bg-brand-red text-white' : 'hover:bg-brand-gray text-brand-charcoal'
          }`}
          title={f.dept}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}