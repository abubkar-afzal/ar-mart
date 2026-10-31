import { z } from 'zod';

export const DEPARTMENTS = ['grocery', 'clothing', 'electronics', 'furniture'] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const DepartmentSchema = z.enum(DEPARTMENTS);

// ---- Money ----
export type Currency = 'PKR';
export const CURRENCY: Currency = 'PKR';

export interface ProductImage {
  url: string;
  alt?: string;
}

export interface Product {
  _id: string;
  sku: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: string;      // category slug
  department: Department;
  brand?: string;
  image: string;         // primary image
  images: string[];
  price: number;         // integer PKR
  compareAtPrice: number | null;
  currency: Currency;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  tags: string[];
  model3d: { assetId?: string; displayObjectId?: string } | null;
  /** Resolved GLB path (relative to web root) from explicit assetId or SKU mapping. */
  modelUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  slug: string;
  name: string;
  department: Department;
  order: number;
  isActive: boolean;
}

export interface CartItem {
  productId: string;
  sku: string;
  slug: string;
  name: string;
  image: string;
  unitPrice: number;
  compareAtPrice: number | null;
  quantity: number;
  lineSubtotal: number;
  availableStock: number;
  isActive: boolean;
  currency: Currency;
}

export interface Cart {
  ownerKey: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  grandTotal: number;
  currency: Currency;
}

export interface OrderItem {
  productId: string;
  sku: string;
  slug: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  lineSubtotal: number;
}

export interface OrderCustomer {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  country: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  grandTotal: number;
  currency: Currency;
  paymentMethod: 'demo';
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// ---- Zod request schemas ----
export const AddCartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().min(0).max(99),
});

export const CustomerSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(4).max(40),
  address: z.string().min(4).max(300),
  city: z.string().min(1).max(120),
  region: z.string().min(1).max(120),
  country: z.string().min(1).max(120),
});

export const CreateOrderSchema = z.object({
  customer: CustomerSchema,
  idempotencyKey: z.string().min(8).max(120),
});

export type AddCartItemInput = z.infer<typeof AddCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export interface ApiError {
  error: { code: string; message: string; details?: unknown };
}