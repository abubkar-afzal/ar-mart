import { Types } from 'mongoose';
import type { Cart as CartDTO, CartItem } from '@armart/shared';
import { Cart } from '../models/Cart.ts';
import { Product } from '../models/Product.ts';
import { ApiError } from '../middleware/errors.ts';

export async function getCart(ownerKey: string): Promise<CartDTO> {
  const cart = await Cart.findOne({ ownerKey }).lean();
  if (!cart || cart.items.length === 0) {
    return {
      ownerKey,
      items: [],
      itemCount: 0,
      subtotal: 0,
      discount: 0,
      shipping: 0,
      grandTotal: 0,
      currency: 'PKR',
    };
  }

  const productIds = cart.items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const items: CartItem[] = [];
  for (const it of cart.items) {
    const p = byId.get(String(it.productId));
    if (!p) continue; // product removed — drop silently from view
    const unitPrice = p.price;
    const lineSubtotal = unitPrice * it.quantity;
    items.push({
      productId: String(p._id),
      sku: p.sku,
      slug: p.slug,
      name: p.name,
      image: p.image,
      unitPrice,
      compareAtPrice: p.compareAtPrice ?? null,
      quantity: it.quantity,
      lineSubtotal,
      availableStock: p.stock,
      isActive: p.isActive,
      currency: 'PKR',
    });
  }

  const subtotal = items.reduce((s, i) => s + i.lineSubtotal, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  return {
    ownerKey,
    items,
    itemCount,
    subtotal,
    discount: 0,
    shipping: 0,
    grandTotal: subtotal,
    currency: 'PKR',
  };
}

export async function addItem(ownerKey: string, productId: string, quantity: number): Promise<CartDTO> {
  if (!Types.ObjectId.isValid(productId)) throw new ApiError(400, 'invalid_product', 'Invalid productId');
  const product = await Product.findById(productId).lean();
  if (!product || !product.isActive) throw new ApiError(404, 'product_not_found', 'Product not found');
  if (product.stock < quantity) throw new ApiError(409, 'insufficient_stock', 'Not enough stock');

  const cart = (await Cart.findOne({ ownerKey })) ?? new Cart({ ownerKey, items: [] });
  const existing = cart.items.find((i) => String(i.productId) === productId);
  if (existing) {
    const desired = existing.quantity + quantity;
    if (desired > product.stock) throw new ApiError(409, 'insufficient_stock', 'Not enough stock');
    if (desired > 99) throw new ApiError(400, 'quantity_limit', 'Maximum quantity exceeded');
    existing.quantity = desired;
  } else {
    cart.items.push({ productId: new Types.ObjectId(productId), quantity });
  }
  await cart.save();
  return getCart(ownerKey);
}

export async function updateItem(ownerKey: string, productId: string, quantity: number): Promise<CartDTO> {
  const cart = await Cart.findOne({ ownerKey });
  if (!cart) throw new ApiError(404, 'cart_not_found', 'Cart not found');
  const idx = cart.items.findIndex((i) => String(i.productId) === productId);
  if (idx === -1) throw new ApiError(404, 'item_not_found', 'Item not in cart');

  if (quantity === 0) {
    cart.items.splice(idx, 1);
  } else {
    const product = await Product.findById(productId).lean();
    if (!product) throw new ApiError(404, 'product_not_found', 'Product not found');
    if (quantity > product.stock) throw new ApiError(409, 'insufficient_stock', 'Not enough stock');
    cart.items[idx]!.quantity = quantity;
  }
  await cart.save();
  return getCart(ownerKey);
}

export async function removeItem(ownerKey: string, productId: string): Promise<CartDTO> {
  const cart = await Cart.findOne({ ownerKey });
  if (!cart) return getCart(ownerKey);

  // Mutate the Mongoose DocumentArray in place — reassigning a plain array
  // would break DocumentArray typing (and Mongoose's internal tracking).
  for (let i = cart.items.length - 1; i >= 0; i--) {
    if (String(cart.items[i]!.productId) === productId) cart.items.splice(i, 1);
  }
  await cart.save();
  return getCart(ownerKey);
}