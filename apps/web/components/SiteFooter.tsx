import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-brand-gray bg-white">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <div className="text-lg font-extrabold text-brand-red">AR MART</div>
          <p className="mt-2 text-brand-charcoal/70">
            Explore. Discover. Shop. A walkable 3D supermarket and full online storefront.
          </p>
        </div>
        <div>
          <div className="font-semibold mb-2">Shop</div>
          <ul className="space-y-1 text-brand-charcoal/80">
            <li><Link href="/shop" className="hover:text-brand-red">All products</Link></li>
            <li><Link href="/categories" className="hover:text-brand-red">Departments</Link></li>
            <li><Link href="/mart" className="hover:text-brand-red">3D Mart</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Support</div>
          <ul className="space-y-1 text-brand-charcoal/80">
            <li>support@armart.example</li>
            <li>Mon–Sat, 9am–9pm PKT</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-gray py-4 text-center text-xs text-brand-muted">
        © {new Date().getFullYear()} AR Mart. Demo application — no real payments are processed.
      </div>
    </footer>
  );
}