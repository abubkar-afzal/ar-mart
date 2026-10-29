'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Category } from '@armart/shared';

export function FilterSidebar({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const params = useSearchParams();

  const [department, setDepartment] = useState(params.get('department') ?? '');
  const [category, setCategory] = useState(params.get('category') ?? '');
  const [minPrice, setMinPrice] = useState(params.get('minPrice') ?? '');
  const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') ?? '');
  const [onSale, setOnSale] = useState(params.get('onSale') === '1');
  const [sort, setSort] = useState(params.get('sort') ?? 'newest');

  const visibleCategories = department ? categories.filter((c) => c.department === department) : categories;

  const apply = () => {
    const next = new URLSearchParams();
    if (department) next.set('department', department);
    if (category) next.set('category', category);
    if (minPrice) next.set('minPrice', minPrice);
    if (maxPrice) next.set('maxPrice', maxPrice);
    if (onSale) next.set('onSale', '1');
    if (sort && sort !== 'newest') next.set('sort', sort);
    router.push(`/shop?${next.toString()}`);
  };

  const reset = () => {
    setDepartment('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setOnSale(false);
    setSort('newest');
    router.push('/shop');
  };

  return (
    <aside className="w-full md:w-64 shrink-0 space-y-5">
      <div>
        <div className="font-semibold mb-2">Department</div>
        <div className="space-y-1">
          {['', 'grocery', 'clothing', 'electronics', 'furniture'].map((d) => (
            <label key={d || 'all'} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="department"
                checked={department === d}
                onChange={() => {
                  setDepartment(d);
                  if (d) {
                    // Drop category if it's not in this department
                    const stillValid = categories.some((c) => c.slug === category && c.department === d);
                    if (!stillValid) setCategory('');
                  }
                }}
              />
              <span className="capitalize">{d || 'All departments'}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="font-semibold mb-2">Category</div>
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="radio" name="category" checked={category === ''} onChange={() => setCategory('')} />
            <span>Any category</span>
          </label>
          {visibleCategories.map((c) => (
            <label key={c.slug} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={category === c.slug}
                onChange={() => setCategory(c.slug)}
              />
              <span>{c.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="font-semibold mb-2">Price (PKR)</div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full rounded border border-brand-gray px-2 py-1 text-sm"
          />
          <span className="text-brand-muted">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full rounded border border-brand-gray px-2 py-1 text-sm"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={onSale} onChange={(e) => setOnSale(e.target.checked)} />
        <span>On sale only</span>
      </label>

      <div>
        <div className="font-semibold mb-2">Sort</div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full rounded border border-brand-gray px-2 py-1 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low → high</option>
          <option value="price_desc">Price: high → low</option>
          <option value="name_asc">Name A → Z</option>
        </select>
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={apply} className="flex-1 rounded-full bg-brand-red text-white py-2 text-sm font-semibold hover:bg-red-700">
          Apply
        </button>
        <button onClick={reset} className="flex-1 rounded-full border border-brand-gray py-2 text-sm font-medium hover:border-brand-charcoal">
          Reset
        </button>
      </div>
    </aside>
  );
}