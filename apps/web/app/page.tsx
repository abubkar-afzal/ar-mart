import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@armart/shared';
import { apiPublic } from '@/lib/api';
import { formatPKR } from '@/lib/format';
import { ProductCard } from '@/components/ProductCard';

type ProductsRes = { items: Product[]; total: number };

export default async function HomePage() {
  let featured: Product[] = [];
  try {
    const res = await apiPublic<ProductsRes>('/api/products?limit=8');
    featured = res.items;
  } catch {
    featured = [];
  }

  return (
    <div>
      <section className="relative bg-brand-charcoal text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <Image
            src="https://picsum.photos/seed/armart-store/1600/900"
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28">
          <div className="text-sm uppercase tracking-[0.3em] text-brand-red font-semibold">AR Mart</div>
          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold leading-tight">
            Your Store. Your World. Your Way.
          </h1>
          <p className="mt-4 max-w-xl text-white/80">
            Shop the full catalog online, or step into our interactive 3D supermarket — walk the
            aisles, inspect products, and check out at the virtual cashier.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center rounded-full bg-brand-red text-white px-6 py-3 font-semibold hover:bg-red-700"
            >
              Shop Online
            </Link>
            <Link
              href="/mart"
              className="inline-flex items-center rounded-full bg-white text-brand-charcoal px-6 py-3 font-semibold hover:bg-brand-gray"
            >
              Enter 3D Mart
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured products</h2>
          <Link href="/shop" className="text-sm font-semibold text-brand-red hover:underline">
            Browse all →
          </Link>
        </div>
        {featured.length === 0 ? (
          <div className="rounded-lg border border-dashed border-brand-gray p-8 text-center text-brand-muted">
            Products unavailable. Run the seed script and make sure the API is running.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16 grid gap-4 md:grid-cols-3">
        {[
          { title: 'Fast delivery', body: 'Same-day dispatch across major cities.' },
          { title: 'Real inventory', body: 'Live stock shared between web and 3D store.' },
          { title: 'Secure checkout', body: 'Server-validated prices and totals.' },
        ].map((b) => (
          <div key={b.title} className="rounded-xl border border-brand-gray bg-white p-6">
            <div className="font-semibold">{b.title}</div>
            <p className="mt-2 text-sm text-brand-charcoal/70">{b.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}