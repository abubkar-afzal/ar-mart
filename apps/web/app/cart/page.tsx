'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/CartProvider';
import { formatPKR } from '@/lib/format';

export default function CartPage() {
  const { cart, loading, update, remove } = useCart();

  if (loading && !cart) return <div className="max-w-4xl mx-auto px-4 py-10 text-brand-muted">Loading cart…</div>;
  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-brand-muted mb-6">Start shopping online, or explore the 3D mart.</p>
        <div className="flex justify-center gap-3">
          <Link href="/shop" className="rounded-full bg-brand-red text-white px-6 py-3 font-semibold hover:bg-red-700">
            Shop Online
          </Link>
          <Link href="/mart" className="rounded-full border border-brand-gray px-6 py-3 font-semibold hover:border-brand-red">
            Enter 3D Mart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Your cart</h1>
      <div className="space-y-3">
        {cart.items.map((it) => (
          <div key={it.productId} className="flex items-center gap-4 rounded-xl border border-brand-gray bg-white p-3">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-brand-gray shrink-0">
              <Image src={it.image} alt={it.name} fill sizes="80px" className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{it.name}</div>
              <div className="text-xs text-brand-muted">SKU {it.sku}</div>
              <div className="mt-1 text-sm">{formatPKR(it.unitPrice)}</div>
              {!it.isActive && <div className="text-xs text-red-600">Unavailable</div>}
              {it.quantity > it.availableStock && (
                <div className="text-xs text-red-600">Only {it.availableStock} in stock</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => update(it.productId, Math.max(1, it.quantity - 1))}
                className="w-8 h-8 rounded-full border border-brand-gray hover:border-brand-red"
                aria-label="Decrease"
              >
                −
              </button>
              <span className="w-8 text-center font-semibold">{it.quantity}</span>
              <button
                onClick={() => update(it.productId, it.quantity + 1)}
                className="w-8 h-8 rounded-full border border-brand-gray hover:border-brand-red disabled:opacity-40"
                aria-label="Increase"
                disabled={it.quantity >= it.availableStock}
              >
                +
              </button>
            </div>
            <div className="w-24 text-right font-semibold">{formatPKR(it.lineSubtotal)}</div>
            <button
              onClick={() => remove(it.productId)}
              className="text-xs text-brand-muted hover:text-brand-red"
              aria-label="Remove"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-brand-gray bg-white p-4">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatPKR(cart.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span>{formatPKR(cart.shipping)}</span>
        </div>
        <div className="flex justify-between font-bold mt-2 pt-2 border-t border-brand-gray">
          <span>Total</span>
          <span>{formatPKR(cart.grandTotal)}</span>
        </div>
        <div className="mt-4 flex justify-end">
          <Link
            href="/checkout"
            className="rounded-full bg-brand-red text-white px-6 py-3 font-semibold hover:bg-red-700"
          >
            Proceed to checkout
          </Link>
        </div>
      </div>
    </div>
  );
}