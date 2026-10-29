'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Product } from '@armart/shared';
import { formatPKR } from '@/lib/format';

export function ProductInspect({
  product,
  onClose,
  onAdd,
}: {
  product: Product;
  onClose: () => void;
  onAdd: () => Promise<void>;
}) {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-40">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col">
        {/* 3D-ish Rotation View */}
        <div className="relative h-64 bg-brand-gray flex items-center justify-center overflow-hidden">
          <div
            className="relative w-48 h-48 transition-transform duration-75"
            style={{ transform: `scale(${zoom}) rotateY(${rotation}deg)`, transformStyle: 'preserve-3d' }}
          >
            <Image src={product.image} alt={product.name} fill className="object-contain drop-shadow-2xl" />
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <input
              type="range" min="-180" max="180" value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-32 accent-brand-red"
            />
            <input
              type="range" min="0.8" max="1.5" step="0.1" value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-32 accent-brand-red"
            />
          </div>
        </div>

        <div className="p-6">
          <div className="text-xs uppercase tracking-wide text-brand-muted">{product.category}</div>
          <h3 className="text-2xl font-bold mt-1">{product.name}</h3>
          <p className="text-sm text-brand-charcoal/70 mt-2 line-clamp-2">{product.description}</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-xl font-extrabold">{formatPKR(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-sm line-through text-brand-muted">{formatPKR(product.compareAtPrice)}</span>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-full border border-brand-gray py-3 font-semibold hover:border-brand-charcoal transition-colors">
            Return to Shelf
          </button>
          <button
            onClick={async () => { setIsAdding(true); await onAdd(); setIsAdding(false); }}
            disabled={isAdding || product.stock <= 0}
            className="flex-1 rounded-full bg-brand-red text-white py-3 font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isAdding ? 'Adding…' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}