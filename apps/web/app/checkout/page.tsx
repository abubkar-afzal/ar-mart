'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import { formatPKR } from '@/lib/format';
import { api } from '@/lib/api';
import type { Order } from '@armart/shared';

function makeIdempotencyKey(): string {
  return `checkout-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function CheckoutPage() {
  const { cart, loading, refresh } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    country: 'Pakistan',
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const order = await api<Order>('/api/orders', {
        method: 'POST',
        body: { customer: form, idempotencyKey: makeIdempotencyKey() },
      });
      await refresh();
      router.push(`/orders/${order._id}/thank-you`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !cart) return <div className="max-w-3xl mx-auto px-4 py-10 text-brand-muted">Loading…</div>;
  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-brand-muted">Add items before checking out.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <form onSubmit={onSubmit} className="grid gap-6">
        <fieldset className="grid gap-3">
          <legend className="font-semibold mb-2">Delivery details</legend>
          <input required placeholder="Full name" value={form.fullName} onChange={update('fullName')} className="rounded-lg border border-brand-gray px-3 py-2" />
          <input required type="email" placeholder="Email" value={form.email} onChange={update('email')} className="rounded-lg border border-brand-gray px-3 py-2" />
          <input required placeholder="Phone" value={form.phone} onChange={update('phone')} className="rounded-lg border border-brand-gray px-3 py-2" />
          <input required placeholder="Address" value={form.address} onChange={update('address')} className="rounded-lg border border-brand-gray px-3 py-2" />
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="City" value={form.city} onChange={update('city')} className="rounded-lg border border-brand-gray px-3 py-2" />
            <input required placeholder="Region / State" value={form.region} onChange={update('region')} className="rounded-lg border border-brand-gray px-3 py-2" />
          </div>
          <input required placeholder="Country" value={form.country} onChange={update('country')} className="rounded-lg border border-brand-gray px-3 py-2" />
        </fieldset>

        <div className="rounded-xl border border-brand-gray bg-white p-4">
          <div className="font-semibold mb-2">Order summary</div>
          {cart.items.map((it) => (
            <div key={it.productId} className="flex justify-between text-sm py-1">
              <span>
                {it.name} × {it.quantity}
              </span>
              <span>{formatPKR(it.lineSubtotal)}</span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-brand-gray flex justify-between font-bold">
            <span>Total</span>
            <span>{formatPKR(cart.grandTotal)}</span>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-900 p-3 text-sm">
          Demo checkout — no real payment is captured. The order will be created with payment status <strong>pending</strong>.
        </div>

        {error && <div className="rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</div>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-brand-red text-white px-8 py-3 font-semibold hover:bg-red-700 disabled:opacity-60"
          >
            {submitting ? 'Placing order…' : 'Confirm demo order'}
          </button>
        </div>
      </form>
    </div>
  );
}