import Link from 'next/link';
import type { Category } from '@armart/shared';
import { apiPublic } from '@/lib/api';

type CatRes = { items: Category[] };

export default async function CategoriesPage() {
  let items: Category[] = [];
  try {
    items = (await apiPublic<CatRes>('/api/categories')).items;
  } catch {
    items = [];
  }
  const byDept = items.reduce<Record<string, Category[]>>((acc, c) => {
    (acc[c.department] ??= []).push(c);
    return acc;
  }, {});
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Departments</h1>
      {Object.entries(byDept).map(([dept, cats]) => (
        <section key={dept} className="mb-8">
          <h2 className="text-lg font-semibold capitalize mb-3">{dept}</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {cats.map((c) => (
              <Link
                key={c._id}
                href={`/shop?category=${encodeURIComponent(c.slug)}`}
                className="rounded-xl border border-brand-gray bg-white p-5 hover:border-brand-red"
              >
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-brand-muted capitalize">{c.department}</div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}