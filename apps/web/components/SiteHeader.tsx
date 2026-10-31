'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';

export function SiteHeader() {
  const { cart } = useCart();
  const count = cart?.itemCount ?? 0;
  return (
    <header className="border-b border-brand-gray bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-brand-red">
          AR MART
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-brand-charcoal/80">
          <Link href="/shop" className="hover:text-brand-red">Shop</Link>
          <Link href="/categories" className="hover:text-brand-red">Departments</Link>
          <Link href="/mart" className="hover:text-brand-red font-semibold">Enter 3D Mart</Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/mart"
            className="hidden sm:inline-flex items-center rounded-full bg-brand-red text-white text-sm px-4 py-1.5 font-semibold hover:bg-red-700"
          >
            Enter 3D Store
          </Link>
          <Link
            href="/cart"
            className="relative inline-flex items-center rounded-full border border-brand-gray px-4 py-1.5 text-sm font-medium hover:border-brand-red"
          >
            Cart
            {count > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-brand-red text-white text-xs min-w-5 h-5 px-1">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}