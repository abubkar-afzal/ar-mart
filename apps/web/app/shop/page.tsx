import type { Product } from '@armart/shared';
import { apiPublic } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';

type ProductsRes = { items: Product[]; total: number };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { q?: string; department?: string; category?: string; sort?: string };
}) {
  const params = new URLSearchParams();
  if (searchParams.q) params.set('q', searchParams.q);
  if (searchParams.department) params.set('department', searchParams.department);
  if (searchParams.category) params.set('category', searchParams.category);
  if (searchParams.sort) params.set('sort', searchParams.sort);
  params.set('limit', '48');

  let res: ProductsRes = { items: [], total: 0 };
  try {
    res = await apiPublic<ProductsRes>(`/api/products?${params.toString()}`);
  } catch {
    /* handled below */
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1">Shop</h1>
      <p className="text-sm text-brand-muted mb-6">
        {res.total} product{res.total === 1 ? '' : 's'}
        {searchParams.q ? ` matching “${searchParams.q}”` : ''}
      </p>
      {res.items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-brand-gray p-10 text-center text-brand-muted">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {res.items.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}