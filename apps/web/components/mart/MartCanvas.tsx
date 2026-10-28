'use client';

import { useEffect, useRef, useState } from 'react';
import type { Product } from '@armart/shared';
import { api } from '@/lib/api';
import { useCart } from '@/components/CartProvider';
import { formatPKR } from '@/lib/format';
import { createMartScene, type MartHandle } from '@/lib/mart/scene';

type Hint = { productId: string; name: string; price: number };

export default function MartCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handleRef = useRef<MartHandle | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [hover, setHover] = useState<Hint | null>(null);
  const [active, setActive] = useState<Product | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const { add } = useCart();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api<{ items: Product[] }>('/api/products?limit=48&department=grocery');
        if (!cancelled) setProducts(res.items);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || products.length === 0) return;
    const handle = createMartScene(canvasRef.current, products, {
      onHoverProduct: (hint) => setHover(hint),
      onPickProduct: (productId) => {
        const p = products.find((x) => x._id === productId) ?? null;
        setActive(p);
        handleRef.current?.setPaused(true);
      },
    });
    handleRef.current = handle;
    return () => {
      handle.dispose();
      handleRef.current = null;
    };
  }, [products]);

  const closeOverlay = () => {
    setActive(null);
    handleRef.current?.setPaused(false);
  };

  const onAdd = async () => {
    if (!active) return;
    try {
      await add(active._id, 1);
      setBanner(`${active.name} added to cart`);
      setTimeout(() => setBanner(null), 1500);
      closeOverlay();
    } catch (e) {
      setBanner(e instanceof Error ? e.message : 'Failed');
    }
  };

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full block outline-none" tabIndex={0} />

      <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
        Click to look · <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> move · <kbd>E</kbd> inspect · <kbd>Esc</kbd> release
      </div>

      {hover && !active && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow px-4 py-2 text-sm">
          <span className="font-semibold">{hover.name}</span>
          <span className="ml-2 text-brand-muted">{formatPKR(hover.price)}</span>
          <span className="ml-3 text-xs text-brand-red">[E] inspect</span>
        </div>
      )}

      {banner && (
        <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 bg-brand-red text-white text-sm px-4 py-2 rounded-full">
          {banner}
        </div>
      )}

      {active && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl overflow-hidden">
            <div className="p-5">
              <div className="text-xs uppercase tracking-wide text-brand-muted">{active.category}</div>
              <h3 className="text-xl font-bold mt-1">{active.name}</h3>
              <p className="text-sm text-brand-charcoal/70 mt-2 line-clamp-3">{active.description}</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-lg font-bold">{formatPKR(active.price)}</span>
                {active.compareAtPrice && (
                  <span className="text-xs line-through text-brand-muted">{formatPKR(active.compareAtPrice)}</span>
                )}
              </div>
              <div className="text-xs text-brand-muted mt-1">
                {active.stock > 0 ? `${active.stock} in stock` : 'Out of stock'}
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-2">
              <button
                onClick={closeOverlay}
                className="flex-1 rounded-full border border-brand-gray py-2 font-medium hover:border-brand-charcoal"
              >
                Close
              </button>
              <button
                onClick={onAdd}
                disabled={active.stock <= 0}
                className="flex-1 rounded-full bg-brand-red text-white py-2 font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}