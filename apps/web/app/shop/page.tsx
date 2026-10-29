import type { Category, Product } from '@armart/shared';
import { apiPublic } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { FilterSidebar } from '@/components/shop/FilterSidebar';

type ProductsRes = { items: Product[]; total: number };
type CategoriesRes = { items: Category[] };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    department?: string;
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    onSale?: string;
  };
}) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (v) params.set(k, v);
  }
  params.set('limit', '48');

  let res: ProductsRes = { items: [], total: 0 };
  let categories: Category[] = [];
  try {
    [res, categories] = await Promise.all([
      apiPublic<ProductsRes>(`/api/products?${params.toString()}`),
      apiPublic<CategoriesRes>('/api/categories').then((r) => r.items),
    ]);
  } catch {
    /* graceful degradation below */
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid gap-8 md:grid-cols-[16rem,1fr]">
        <FilterSidebar categories={categories} />

        <div>
          <h1 className="text-2xl font-bold mb-1">Shop</h1>
          <p className="text-sm text-brand-muted mb-6">
            {res.total} product{res.total === 1 ? '' : 's'}
            {searchParams.q ? ` matching “${searchParams.q}”` : ''}
            {searchParams.department ? ` in ${searchParams.department}` : ''}
          </p>

          {res.items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-brand-gray p-10 text-center text-brand-muted">
              No products found. Try adjusting your filters.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {res.items.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}