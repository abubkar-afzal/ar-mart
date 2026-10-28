'use client';

import { useState } from 'react';
import { useCart } from '@/components/CartProvider';

export function AddToCartButton({ productId, disabled }: { productId: string; disabled?: boolean }) {
  const { add } = useCart();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const onClick = async () => {
    setBusy(true);
    setMsg(null);
    try {
      await add(productId, 1);
      setMsg('Added to cart');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        disabled={disabled || busy}
        onClick={onClick}
        className="rounded-full bg-brand-red text-white px-6 py-3 font-semibold hover:bg-red-700 disabled:opacity-50"
      >
        {disabled ? 'Out of stock' : busy ? 'Adding…' : 'Add to cart'}
      </button>
      {msg && <div className="mt-2 text-sm text-brand-muted">{msg}</div>}
    </div>
  );
}