import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Product } from '@armart/shared';
import { apiPublic } from '@/lib/api';
import { formatPKR } from '@/lib/format';
import { AddToCartButton } from './AddToCartButton';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  let product: Product | null = null;
  try {
    product = await apiPublic<Product>(`/api/products/${params.slug}`);
  } catch {
    product = null;
  }
  if (!product) return notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid gap-10 md:grid-cols-2">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-brand-gray">
        <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wider text-brand-muted">{product.brand}</div>
        <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
        <div className="mt-3 flex items-baseline gap-3">
          <div className="text-2xl font-extrabold">{formatPKR(product.price)}</div>
          {product.compareAtPrice && (
            <div className="text-sm line-through text-brand-muted">{formatPKR(product.compareAtPrice)}</div>
          )}
        </div>
        <p className="mt-4 text-brand-charcoal/80">{product.description}</p>
        <div className="mt-4 text-sm text-brand-muted">
          Stock: {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
        </div>
        <div className="mt-6 flex gap-3">
          <AddToCartButton productId={product._id} disabled={product.stock <= 0} />
        </div>
        <div className="mt-6 text-xs text-brand-muted">
          SKU: {product.sku} · Category: {product.category} · Department: {product.department}
        </div>
      </div>
    </div>
  );
}