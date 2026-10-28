import mongoose from 'mongoose';
import { env } from '../env.js';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';

type Seed = {
  sku: string;
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  image: string;
  tags?: string[];
  isFeatured?: boolean;
  isOnSale?: boolean;
};

const CATEGORIES = [
  { slug: 'pantry', name: 'Pantry Staples', department: 'grocery', order: 1 },
  { slug: 'snacks', name: 'Snacks & Biscuits', department: 'grocery', order: 2 },
  { slug: 'beverages', name: 'Beverages', department: 'grocery', order: 3 },
  { slug: 'dairy', name: 'Dairy & Chilled', department: 'grocery', order: 4 },
];

const PRODUCTS: Seed[] = [
  { sku: 'AM-GR-001', slug: 'basmati-rice-5kg', name: 'Basmati Rice 5kg', category: 'pantry', shortDescription: 'Aged long-grain basmati rice', description: 'Premium aged basmati rice, 5kg bag. Perfect for biryani and pilaf.', price: 1850, compareAtPrice: 2100, stock: 40, image: 'https://picsum.photos/seed/rice/600/600', isOnSale: true, isFeatured: true },
  { sku: 'AM-GR-002', slug: 'whole-wheat-flour-10kg', name: 'Whole Wheat Flour 10kg', category: 'pantry', shortDescription: 'Stone-ground atta', description: 'Chakki-fresh whole wheat flour, 10kg.', price: 1450, stock: 25, image: 'https://picsum.photos/seed/flour/600/600' },
  { sku: 'AM-GR-003', slug: 'sunflower-cooking-oil-5l', name: 'Sunflower Cooking Oil 5L', category: 'pantry', shortDescription: 'Refined sunflower oil', description: 'Light, neutral sunflower oil. 5 litre bottle.', price: 2350, stock: 30, image: 'https://picsum.photos/seed/oil/600/600', isFeatured: true },
  { sku: 'AM-GR-004', slug: 'penne-pasta-500g', name: 'Penne Pasta 500g', category: 'pantry', shortDescription: 'Durum wheat penne', description: 'Bronze-cut penne rigate, 500g.', price: 320, stock: 60, image: 'https://picsum.photos/seed/pasta/600/600' },
  { sku: 'AM-GR-005', slug: 'white-sugar-1kg', name: 'Refined White Sugar 1kg', category: 'pantry', shortDescription: 'Fine-grain sugar', description: 'Refined white sugar, 1kg pack.', price: 180, stock: 100, image: 'https://picsum.photos/seed/sugar/600/600' },
  { sku: 'AM-GR-006', slug: 'potato-chips-salted-120g', name: 'Potato Chips Salted 120g', category: 'snacks', shortDescription: 'Crispy salted chips', description: 'Classic salted potato chips, 120g.', price: 150, stock: 200, image: 'https://picsum.photos/seed/chips/600/600', isFeatured: true },
  { sku: 'AM-GR-007', slug: 'chocolate-biscuits-300g', name: 'Chocolate Biscuits 300g', category: 'snacks', shortDescription: 'Chocolate cream biscuits', description: 'Crunchy biscuits with chocolate cream, 300g family pack.', price: 240, stock: 80, image: 'https://picsum.photos/seed/biscuits/600/600' },
  { sku: 'AM-GR-008', slug: 'dark-chocolate-bar-100g', name: 'Dark Chocolate Bar 100g', category: 'snacks', shortDescription: '70% cocoa dark chocolate', description: 'Rich 70% cocoa dark chocolate bar.', price: 350, stock: 50, image: 'https://picsum.photos/seed/choco/600/600', isOnSale: true, compareAtPrice: 400 },
  { sku: 'AM-GR-009', slug: 'mineral-water-1-5l', name: 'Mineral Water 1.5L', category: 'beverages', shortDescription: 'Natural mineral water', description: 'Still natural mineral water, 1.5 litre bottle.', price: 90, stock: 300, image: 'https://picsum.photos/seed/water/600/600' },
  { sku: 'AM-GR-010', slug: 'cola-1-5l', name: 'Cola 1.5L', category: 'beverages', shortDescription: 'Classic cola', description: 'Classic cola, 1.5 litre bottle.', price: 180, stock: 150, image: 'https://picsum.photos/seed/cola/600/600', isFeatured: true },
  { sku: 'AM-GR-011', slug: 'orange-juice-1l', name: 'Orange Juice 1L', category: 'beverages', shortDescription: '100% orange juice', description: 'Not-from-concentrate orange juice, 1 litre.', price: 320, stock: 40, image: 'https://picsum.photos/seed/orange/600/600' },
  { sku: 'AM-GR-012', slug: 'full-cream-milk-1l', name: 'Full Cream Milk 1L', category: 'dairy', shortDescription: 'UHT whole milk', description: 'UHT full-cream milk, 1 litre carton.', price: 280, stock: 60, image: 'https://picsum.photos/seed/milk/600/600' },
  { sku: 'AM-GR-013', slug: 'cheddar-cheese-block-200g', name: 'Cheddar Cheese 200g', category: 'dairy', shortDescription: 'Mature cheddar', description: 'Mature cheddar cheese block, 200g.', price: 450, stock: 25, image: 'https://picsum.photos/seed/cheese/600/600' },
  { sku: 'AM-GR-014', slug: 'plain-yogurt-500g', name: 'Plain Yogurt 500g', category: 'dairy', shortDescription: 'Natural set yogurt', description: 'Creamy natural set yogurt, 500g tub.', price: 220, stock: 35, image: 'https://picsum.photos/seed/yogurt/600/600' },
];

async function run() {
  await mongoose.connect(env.mongoUri);
  // eslint-disable-next-line no-console
  console.log(`[seed] connected: ${mongoose.connection.name}`);

  await Category.deleteMany({});
  await Category.insertMany(CATEGORIES);
  // eslint-disable-next-line no-console
  console.log(`[seed] categories inserted: ${CATEGORIES.length}`);

  for (const p of PRODUCTS) {
    await Product.updateOne(
      { sku: p.sku },
      {
        $set: {
          sku: p.sku,
          slug: p.slug,
          name: p.name,
          shortDescription: p.shortDescription,
          description: p.description,
          category: p.category,
          department: 'grocery',
          brand: 'AR Mart',
          image: p.image,
          images: [p.image],
          price: p.price,
          compareAtPrice: p.compareAtPrice ?? null,
          currency: 'PKR',
          stock: p.stock,
          isActive: true,
          isFeatured: p.isFeatured ?? false,
          isOnSale: p.isOnSale ?? false,
          tags: p.tags ?? [],
          model3d: null,
        },
      },
      { upsert: true },
    );
  }
  // eslint-disable-next-line no-console
  console.log(`[seed] products upserted: ${PRODUCTS.length}`);

  await mongoose.disconnect();
  // eslint-disable-next-line no-console
  console.log('[seed] done');
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[seed:fatal]', err);
  process.exit(1);
});