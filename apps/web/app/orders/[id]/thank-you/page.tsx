import Link from 'next/link';
import type { Order } from '@armart/shared';
import { apiPublic } from '@/lib/api';
import { formatPKR } from '@/lib/format';

export default async function ThankYouPage({ params }: { params: { id: string } }) {
  let order: Order | null = null;
  try {
    order = await apiPublic<Order>(`/api/orders/${params.id}`);
  } catch {
    order = null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="text-sm uppercase tracking-[0.3em] text-brand-red font-semibold">AR Mart</div>
      <h1 className="mt-3 text-3xl md:text-4xl font-extrabold">Thank you for shopping at AR Mart!</h1>
      <p className="mt-2 text-brand-muted">We hope to see you again.</p>

      {order ? (
        <div className="mt-8 rounded-xl border border-brand-gray bg-white p-6 text-left">
          <div className="flex justify-between text-sm"><span>Order number</span><span className="font-mono">{order.orderNumber}</span></div>
          <div className="flex justify-between text-sm mt-2"><span>Total</span><span className="font-semibold">{formatPKR(order.grandTotal)}</span></div>
          <div className="flex justify-between text-sm mt-2"><span>Payment</span><span className="capitalize">{order.paymentStatus} (demo)</span></div>
          <div className="flex justify-between text-sm mt-2"><span>Status</span><span className="capitalize">{order.status}</span></div>
          <div className="mt-4 border-t border-brand-gray pt-3">
            {order.items.map((it) => (
              <div key={it.productId} className="flex justify-between text-sm py-1">
                <span>{it.name} × {it.quantity}</span>
                <span>{formatPKR(it.lineSubtotal)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-8 text-brand-muted">Order details unavailable.</div>
      )}

      <div className="mt-8 flex justify-center gap-3">
        <Link href="/shop" className="rounded-full bg-brand-red text-white px-6 py-3 font-semibold hover:bg-red-700">
          Shop Again
        </Link>
        <Link href="/mart" className="rounded-full border border-brand-gray px-6 py-3 font-semibold hover:border-brand-red">
          Enter 3D Mart
        </Link>
      </div>
    </div>
  );
}