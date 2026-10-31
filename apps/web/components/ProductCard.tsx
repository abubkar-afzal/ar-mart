'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@armart/shared';
import { formatPKR } from '@/lib/format';
import { useCart } from './CartProvider';
import { useState } from 'react';

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const onAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await add(product._id, 1);
      setMsg('Added');
      setTimeout(() => setMsg(null), 1200);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="group rounded-xl bg-white border border-brand-gray overflow-hidden flex flex-col">
      <Link href={`/shop/${product.slug}`} className="block aspect-square relative bg-brand-gray">
        <Image src={product.image} alt={product.name} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover" />
      </Link>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <div className="text-xs text-brand-muted uppercase tracking-wide">{product.category}</div>
        <Link href={`/shop/${product.slug}`} className="font-semibold text-sm hover:text-brand-red line-clamp-2">
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-brand-charcoal">{formatPKR(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-xs line-through text-brand-muted">{formatPKR(product.compareAtPrice)}</span>
            )}
          </div>
          <button
            type="button"
            onClick={onAdd}
            disabled={busy || product.stock <= 0}
            className="text-xs font-semibold rounded-full bg-brand-red text-white px-3 py-1.5 hover:bg-red-700 disabled:opacity-50"
          >
            {product.stock <= 0 ? 'Out of stock' : busy ? 'Adding…' : 'Add'}
          </button>
        </div>
        {msg && <div className="text-[11px] text-brand-muted">{msg}</div>}
      </div>
    </div>
  );
}