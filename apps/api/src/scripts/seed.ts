import mongoose from 'mongoose';
import { connectDb, explainMongoError } from '../db.ts';
import { env } from '../env.ts';
import { Product } from '../models/Product.ts';
import { Category } from '../models/Category.ts';
import type { Department } from '@armart/shared';

type Seed = {
  sku: string;
  slug: string;
  name: string;
  category: string;
  department: Department;
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
  // Grocery
  { slug: 'pantry', name: 'Pantry Staples', department: 'grocery', order: 1 },
  { slug: 'snacks', name: 'Snacks & Biscuits', department: 'grocery', order: 2 },
  { slug: 'beverages', name: 'Beverages', department: 'grocery', order: 3 },
  { slug: 'dairy', name: 'Dairy & Chilled', department: 'grocery', order: 4 },
  // Clothing
  { slug: 'tops', name: "Men's Tops", department: 'clothing', order: 1 },
  { slug: 'bottoms', name: 'Bottoms', department: 'clothing', order: 2 },
  { slug: 'outerwear', name: 'Outerwear', department: 'clothing', order: 3 },
  { slug: 'footwear', name: 'Footwear', department: 'clothing', order: 4 },
  { slug: 'bags', name: 'Bags & Accessories', department: 'clothing', order: 5 },
  // Electronics
  { slug: 'phones', name: 'Phones & Tablets', department: 'electronics', order: 1 },
  { slug: 'computers', name: 'Computers & Laptops', department: 'electronics', order: 2 },
  { slug: 'audio', name: 'Audio & Headphones', department: 'electronics', order: 3 },
  { slug: 'tv', name: 'TV & Display', department: 'electronics', order: 4 },
  { slug: 'gaming', name: 'Gaming', department: 'electronics', order: 5 },
  // Furniture
  { slug: 'living', name: 'Living Room', department: 'furniture', order: 1 },
  { slug: 'bedroom', name: 'Bedroom', department: 'furniture', order: 2 },
  { slug: 'dining', name: 'Dining', department: 'furniture', order: 3 },
  { slug: 'office', name: 'Home Office', department: 'furniture', order: 4 },
];

const GROCERY: Seed[] = [
  { sku: 'AM-GR-001', slug: 'basmati-rice-5kg', name: 'Basmati Rice 5kg', category: 'pantry', department: 'grocery', shortDescription: 'Aged long-grain basmati rice', description: 'Premium aged basmati rice, 5kg bag.', price: 1850, compareAtPrice: 2100, stock: 40, image: 'https://picsum.photos/seed/rice/600/600', isOnSale: true, isFeatured: true },
  { sku: 'AM-GR-002', slug: 'whole-wheat-flour-10kg', name: 'Whole Wheat Flour 10kg', category: 'pantry', department: 'grocery', shortDescription: 'Stone-ground atta', description: 'Chakki-fresh whole wheat flour, 10kg.', price: 1450, stock: 25, image: 'https://picsum.photos/seed/flour/600/600' },
  { sku: 'AM-GR-003', slug: 'sunflower-cooking-oil-5l', name: 'Sunflower Cooking Oil 5L', category: 'pantry', department: 'grocery', shortDescription: 'Refined sunflower oil', description: 'Light, neutral sunflower oil, 5L.', price: 2350, stock: 30, image: 'https://picsum.photos/seed/oil/600/600', isFeatured: true },
  { sku: 'AM-GR-004', slug: 'penne-pasta-500g', name: 'Penne Pasta 500g', category: 'pantry', department: 'grocery', shortDescription: 'Durum wheat penne', description: 'Bronze-cut penne rigate, 500g.', price: 320, stock: 60, image: 'https://picsum.photos/seed/pasta/600/600' },
  { sku: 'AM-GR-005', slug: 'white-sugar-1kg', name: 'Refined White Sugar 1kg', category: 'pantry', department: 'grocery', shortDescription: 'Fine-grain sugar', description: 'Refined white sugar, 1kg pack.', price: 180, stock: 100, image: 'https://picsum.photos/seed/sugar/600/600' },
  { sku: 'AM-GR-006', slug: 'potato-chips-salted-120g', name: 'Potato Chips Salted 120g', category: 'snacks', department: 'grocery', shortDescription: 'Crispy salted chips', description: 'Classic salted potato chips, 120g.', price: 150, stock: 200, image: 'https://picsum.photos/seed/chips/600/600', isFeatured: true },
  { sku: 'AM-GR-007', slug: 'chocolate-biscuits-300g', name: 'Chocolate Biscuits 300g', category: 'snacks', department: 'grocery', shortDescription: 'Chocolate cream biscuits', description: 'Crunchy biscuits with chocolate cream, 300g.', price: 240, stock: 80, image: 'https://picsum.photos/seed/biscuits/600/600' },
  { sku: 'AM-GR-008', slug: 'dark-chocolate-bar-100g', name: 'Dark Chocolate Bar 100g', category: 'snacks', department: 'grocery', shortDescription: '70% cocoa dark chocolate', description: 'Rich 70% cocoa dark chocolate bar.', price: 350, stock: 50, image: 'https://picsum.photos/seed/choco/600/600', isOnSale: true, compareAtPrice: 400 },
  { sku: 'AM-GR-009', slug: 'mineral-water-1-5l', name: 'Mineral Water 1.5L', category: 'beverages', department: 'grocery', shortDescription: 'Natural mineral water', description: 'Still natural mineral water, 1.5L.', price: 90, stock: 300, image: 'https://picsum.photos/seed/water/600/600' },
  { sku: 'AM-GR-010', slug: 'cola-1-5l', name: 'Cola 1.5L', category: 'beverages', department: 'grocery', shortDescription: 'Classic cola', description: 'Classic cola, 1.5L bottle.', price: 180, stock: 150, image: 'https://picsum.photos/seed/cola/600/600', isFeatured: true },
  { sku: 'AM-GR-011', slug: 'orange-juice-1l', name: 'Orange Juice 1L', category: 'beverages', department: 'grocery', shortDescription: '100% orange juice', description: 'Not-from-concentrate orange juice.', price: 320, stock: 40, image: 'https://picsum.photos/seed/orange/600/600' },
  { sku: 'AM-GR-012', slug: 'full-cream-milk-1l', name: 'Full Cream Milk 1L', category: 'dairy', department: 'grocery', shortDescription: 'UHT whole milk', description: 'UHT full-cream milk, 1L carton.', price: 280, stock: 60, image: 'https://picsum.photos/seed/milk/600/600' },
  { sku: 'AM-GR-013', slug: 'cheddar-cheese-block-200g', name: 'Cheddar Cheese 200g', category: 'dairy', department: 'grocery', shortDescription: 'Mature cheddar', description: 'Mature cheddar cheese block, 200g.', price: 450, stock: 25, image: 'https://picsum.photos/seed/cheese/600/600' },
  { sku: 'AM-GR-014', slug: 'plain-yogurt-500g', name: 'Plain Yogurt 500g', category: 'dairy', department: 'grocery', shortDescription: 'Natural set yogurt', description: 'Creamy natural set yogurt, 500g.', price: 220, stock: 35, image: 'https://picsum.photos/seed/yogurt/600/600' },
];

const CLOTHING: Seed[] = [
  { sku: 'AM-CL-001', slug: 'mens-white-tshirt', name: "Men's White T-Shirt", category: 'tops', department: 'clothing', shortDescription: '100% cotton crew neck', description: 'Classic white crew neck t-shirt, 100% cotton.', price: 1200, stock: 40, image: 'https://picsum.photos/seed/tshirt/600/600', isFeatured: true },
  { sku: 'AM-CL-002', slug: 'mens-blue-jeans', name: "Men's Blue Jeans", category: 'bottoms', department: 'clothing', shortDescription: 'Slim-fit denim', description: 'Slim-fit blue denim jeans.', price: 3200, stock: 25, image: 'https://picsum.photos/seed/jeans/600/600' },
  { sku: 'AM-CL-003', slug: 'black-leather-jacket', name: 'Black Leather Jacket', category: 'outerwear', department: 'clothing', shortDescription: 'Genuine leather biker jacket', description: 'Genuine leather biker jacket with quilted lining.', price: 12500, compareAtPrice: 15000, stock: 8, image: 'https://picsum.photos/seed/jacket/600/600', isOnSale: true, isFeatured: true },
  { sku: 'AM-CL-004', slug: 'formal-white-shirt', name: 'Formal White Shirt', category: 'tops', department: 'clothing', shortDescription: 'Business formal', description: 'Business formal white shirt, non-iron finish.', price: 2500, stock: 30, image: 'https://picsum.photos/seed/formalshirt/600/600' },
  { sku: 'AM-CL-005', slug: 'traditional-kurta', name: 'Traditional Kurta', category: 'tops', department: 'clothing', shortDescription: 'Cotton kurta', description: 'Cotton kurta with subtle embroidery.', price: 3800, stock: 15, image: 'https://picsum.photos/seed/kurta/600/600' },
  { sku: 'AM-CL-006', slug: 'summer-floral-dress', name: 'Summer Floral Dress', category: 'tops', department: 'clothing', shortDescription: 'Lightweight A-line dress', description: 'Lightweight A-line summer dress with floral print.', price: 4500, stock: 20, image: 'https://picsum.photos/seed/dress/600/600', isFeatured: true },
  { sku: 'AM-CL-007', slug: 'pleated-midi-skirt', name: 'Pleated Midi Skirt', category: 'bottoms', department: 'clothing', shortDescription: 'Elegant pleated skirt', description: 'Elegant mid-length pleated skirt.', price: 2800, stock: 18, image: 'https://picsum.photos/seed/skirt/600/600' },
  { sku: 'AM-CL-008', slug: 'white-sneakers', name: 'White Sneakers', category: 'footwear', department: 'clothing', shortDescription: 'Casual leather sneakers', description: 'Classic white leather sneakers.', price: 6500, stock: 22, image: 'https://picsum.photos/seed/sneakers/600/600', isFeatured: true },
  { sku: 'AM-CL-009', slug: 'leather-handbag', name: 'Leather Handbag', category: 'bags', department: 'clothing', shortDescription: 'Structured leather tote', description: 'Structured leather tote with gold hardware.', price: 8900, stock: 12, image: 'https://picsum.photos/seed/handbag/600/600' },
  { sku: 'AM-CL-010', slug: 'cashmere-scarf', name: 'Cashmere Scarf', category: 'bags', department: 'clothing', shortDescription: 'Soft cashmere', description: 'Soft cashmere scarf in warm tones.', price: 4200, stock: 25, image: 'https://picsum.photos/seed/scarf/600/600' },
];

const ELECTRONICS: Seed[] = [
  { sku: 'AM-EL-001', slug: 'flagship-smartphone-256g', name: 'Flagship Smartphone 256GB', category: 'phones', department: 'electronics', shortDescription: '6.7" OLED smartphone', description: '6.7-inch OLED display, triple camera, 256GB storage.', price: 145000, compareAtPrice: 165000, stock: 15, image: 'https://picsum.photos/seed/phone/600/600', isOnSale: true, isFeatured: true },
  { sku: 'AM-EL-002', slug: 'ultrabook-laptop-16gb', name: 'Ultrabook Laptop 16GB', category: 'computers', department: 'electronics', shortDescription: '14" thin-and-light laptop', description: '14-inch ultrabook, 16GB RAM, 512GB SSD.', price: 235000, stock: 10, image: 'https://picsum.photos/seed/laptop/600/600', isFeatured: true },
  { sku: 'AM-EL-003', slug: 'wireless-noise-cancelling-headphones', name: 'Wireless Noise-Cancelling Headphones', category: 'audio', department: 'electronics', shortDescription: 'Over-ear ANC headphones', description: 'Premium over-ear noise-cancelling headphones.', price: 45000, stock: 20, image: 'https://picsum.photos/seed/headphones/600/600' },
  { sku: 'AM-EL-004', slug: '55-inch-4k-smart-tv', name: '55" 4K Smart TV', category: 'tv', department: 'electronics', shortDescription: '4K HDR LED smart TV', description: '55-inch 4K HDR LED smart television.', price: 185000, compareAtPrice: 210000, stock: 8, image: 'https://picsum.photos/seed/tv/600/600', isOnSale: true, isFeatured: true },
  { sku: 'AM-EL-005', slug: 'gaming-console-next-gen', name: 'Next-Gen Gaming Console', category: 'gaming', department: 'electronics', shortDescription: '4K gaming console', description: '4K gaming console with 1TB SSD.', price: 165000, stock: 12, image: 'https://picsum.photos/seed/console/600/600' },
  { sku: 'AM-EL-006', slug: 'smartwatch-gps', name: 'Smartwatch with GPS', category: 'phones', department: 'electronics', shortDescription: 'Fitness smartwatch', description: 'GPS fitness smartwatch with heart-rate monitoring.', price: 48000, stock: 25, image: 'https://picsum.photos/seed/watch/600/600' },
  { sku: 'AM-EL-007', slug: 'bluetooth-speaker-portable', name: 'Portable Bluetooth Speaker', category: 'audio', department: 'electronics', shortDescription: 'Waterproof BT speaker', description: 'Portable waterproof bluetooth speaker.', price: 12000, stock: 40, image: 'https://picsum.photos/seed/speaker/600/600' },
  { sku: 'AM-EL-008', slug: 'mirrorless-camera', name: 'Mirrorless Camera', category: 'gaming', department: 'electronics', shortDescription: '24MP mirrorless camera', description: '24MP mirrorless camera with 4K video.', price: 320000, stock: 5, image: 'https://picsum.photos/seed/camera/600/600' },
  { sku: 'AM-EL-009', slug: '10-inch-tablet', name: '10" Tablet', category: 'phones', department: 'electronics', shortDescription: '10-inch tablet', description: '10-inch tablet with 128GB storage.', price: 78000, stock: 18, image: 'https://picsum.photos/seed/tablet/600/600' },
  { sku: 'AM-EL-010', slug: 'mechanical-keyboard', name: 'Mechanical Keyboard', category: 'computers', department: 'electronics', shortDescription: 'RGB mechanical keyboard', description: 'Full-size RGB mechanical keyboard.', price: 15000, stock: 30, image: 'https://picsum.photos/seed/keyboard/600/600' },
];

const FURNITURE: Seed[] = [
  { sku: 'AM-FU-001', slug: 'three-seater-sofa', name: '3-Seater Fabric Sofa', category: 'living', department: 'furniture', shortDescription: 'Linen-fabric sofa', description: 'Comfortable 3-seater sofa in linen fabric.', price: 85000, stock: 6, image: 'https://picsum.photos/seed/sofa/600/600', isFeatured: true },
  { sku: 'AM-FU-002', slug: 'walnut-coffee-table', name: 'Walnut Coffee Table', category: 'living', department: 'furniture', shortDescription: 'Solid walnut top', description: 'Coffee table with solid walnut top and steel legs.', price: 32000, stock: 10, image: 'https://picsum.photos/seed/coffeetable/600/600' },
  { sku: 'AM-FU-003', slug: 'queen-platform-bed', name: 'Queen Platform Bed', category: 'bedroom', department: 'furniture', shortDescription: 'Wooden platform bed', description: 'Queen-size wooden platform bed with headboard.', price: 95000, compareAtPrice: 115000, stock: 4, image: 'https://picsum.photos/seed/bed/600/600', isOnSale: true, isFeatured: true },
  { sku: 'AM-FU-004', slug: 'three-door-wardrobe', name: '3-Door Wardrobe', category: 'bedroom', department: 'furniture', shortDescription: 'Spacious wardrobe', description: '3-door wardrobe with hanging space and shelves.', price: 72000, stock: 5, image: 'https://picsum.photos/seed/wardrobe/600/600' },
  { sku: 'AM-FU-005', slug: 'extendable-dining-table', name: 'Extendable Dining Table', category: 'dining', department: 'furniture', shortDescription: '6-8 seat dining table', description: 'Extendable dining table seating 6-8.', price: 58000, stock: 7, image: 'https://picsum.photos/seed/dining/600/600' },
  { sku: 'AM-FU-006', slug: 'upholstered-dining-chair', name: 'Upholstered Dining Chair', category: 'dining', department: 'furniture', shortDescription: 'Fabric dining chair', description: 'Upholstered dining chair with wooden legs.', price: 8500, stock: 30, image: 'https://picsum.photos/seed/diningchair/600/600' },
  { sku: 'AM-FU-007', slug: 'brass-desk-lamp', name: 'Brass Desk Lamp', category: 'office', department: 'furniture', shortDescription: 'Adjustable brass lamp', description: 'Adjustable brass desk lamp with fabric shade.', price: 6500, stock: 25, image: 'https://picsum.photos/seed/lamp/600/600' },
  { sku: 'AM-FU-008', slug: 'tall-bookshelf', name: 'Tall Bookshelf', category: 'office', department: 'furniture', shortDescription: '5-shelf bookshelf', description: 'Tall 5-shelf bookshelf in oak finish.', price: 22000, stock: 9, image: 'https://picsum.photos/seed/bookshelf/600/600' },
  { sku: 'AM-FU-009', slug: 'ergonomic-office-chair', name: 'Ergonomic Office Chair', category: 'office', department: 'furniture', shortDescription: 'Mesh-back office chair', description: 'Ergonomic mesh-back office chair with lumbar support.', price: 45000, stock: 12, image: 'https://picsum.photos/seed/officechair/600/600', isFeatured: true },
  { sku: 'AM-FU-010', slug: 'wool-area-rug', name: 'Wool Area Rug', category: 'living', department: 'furniture', shortDescription: 'Hand-tufted wool rug', description: 'Hand-tufted wool area rug, 5×8 ft.', price: 38000, stock: 8, image: 'https://picsum.photos/seed/rug/600/600' },
];

async function run() {
  console.log('[seed] starting');
  await connectDb({ timeoutMs: 10000 });

  await Category.deleteMany({});
  await Category.insertMany(CATEGORIES);
  console.log(`[seed] categories inserted: ${CATEGORIES.length}`);

  const allProducts = [...GROCERY, ...CLOTHING, ...ELECTRONICS, ...FURNITURE];
  for (const p of allProducts) {
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
          department: p.department,
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
  console.log(`[seed] products upserted: ${allProducts.length}`);

  await mongoose.disconnect();
  console.log('[seed] done');
}

run().catch((err) => {
  console.error('[seed:fatal]', explainMongoError(err, env.mongoUri));
  process.exit(1);
});