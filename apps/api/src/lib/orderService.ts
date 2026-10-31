import mongoose from 'mongoose';
import type { CreateOrderInput, Order as OrderDTO } from '@armart/shared';
import { Product } from '../models/Product.ts';
import { Cart } from '../models/Cart.ts';
import { Order } from '../models/Order.ts';
import { nextOrderSeq } from '../models/Counter.ts';
import { ApiError } from '../middleware/errors.ts';

function toDTO(o: any): OrderDTO {
  return {
    _id: String(o._id),
    orderNumber: o.orderNumber,
    customer: o.customer,
    items: o.items.map((it: any) => ({
      productId: String(it.productId),
      sku: it.sku,
      slug: it.slug,
      name: it.name,
      image: it.image,
      unitPrice: it.unitPrice,
      quantity: it.quantity,
      lineSubtotal: it.lineSubtotal,
    })),
    subtotal: o.subtotal,
    discount: o.discount,
    shipping: o.shipping,
    grandTotal: o.grandTotal,
    currency: o.currency,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    status: o.status,
    createdAt: new Date(o.createdAt).toISOString(),
    updatedAt: new Date(o.updatedAt).toISOString(),
  };
}

export async function createOrderFromCart(
  ownerKey: string,
  input: CreateOrderInput,
): Promise<OrderDTO> {
  // 1) Idempotency
  const existing = await Order.findOne({ idempotencyKey: input.idempotencyKey }).lean();
  if (existing) return toDTO(existing);

  // 2) Load cart
  const cart = await Cart.findOne({ ownerKey });
  if (!cart || cart.items.length === 0) throw new ApiError(400, 'empty_cart', 'Cart is empty');

  // 3) Pre-validate products
  const productIds = cart.items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));
  for (const it of cart.items) {
    const p = byId.get(String(it.productId));
    if (!p || !p.isActive) throw new ApiError(409, 'product_unavailable', 'Product is no longer available');
    if (p.stock < it.quantity) {
      throw new ApiError(409, 'insufficient_stock', `Insufficient stock for ${p.name}`, {
        productId: String(p._id),
        available: p.stock,
        requested: it.quantity,
      });
    }
  }

  // 4) Snapshot + totals
  const orderItems = cart.items.map((it) => {
    const p = byId.get(String(it.productId))!;
    return {
      productId: p._id,
      sku: p.sku,
      slug: p.slug,
      name: p.name,
      image: p.image,
      unitPrice: p.price,
      quantity: it.quantity,
      lineSubtotal: p.price * it.quantity,
    };
  });
  const subtotal = orderItems.reduce((s, i) => s + i.lineSubtotal, 0);
  const discount = 0;
  const shipping = 0;
  const grandTotal = subtotal - discount + shipping;
  const orderNumber = await makeOrderNumber();

  // 5) Decrement stock + create order + clear cart
  const tryTx = async () => {
    const session = await mongoose.startSession();
    try {
      let created: any;
      await session.withTransaction(async () => {
        for (const it of orderItems) {
          const updated = await Product.findOneAndUpdate(
            { _id: it.productId, isActive: true, stock: { $gte: it.quantity } },
            { $inc: { stock: -it.quantity } },
            { new: true, session },
          );
          if (!updated) throw new ApiError(409, 'insufficient_stock', `Insufficient stock for ${it.name}`);
        }
        const [order] = await Order.create(
          [
            {
              orderNumber,
              idempotencyKey: input.idempotencyKey,
              ownerKey,
              customer: input.customer,
              items: orderItems,
              subtotal,
              discount,
              shipping,
              grandTotal,
              currency: 'PKR',
              paymentMethod: 'demo',
              paymentStatus: 'pending',
              status: 'confirmed',
            },
          ],
          { session },
        );
        created = order;
        // Clear the Mongoose DocumentArray in place (see cartService for rationale).
        cart.items.splice(0, cart.items.length);
        await cart.save({ session });
      });
      return created;
    } finally {
      await session.endSession();
    }
  };

  const tryNoTx = async () => {
    const decremented: { productId: string; quantity: number }[] = [];
    try {
      for (const it of orderItems) {
        const updated = await Product.findOneAndUpdate(
          { _id: it.productId, isActive: true, stock: { $gte: it.quantity } },
          { $inc: { stock: -it.quantity } },
          { new: true },
        );
        if (!updated) throw new ApiError(409, 'insufficient_stock', `Insufficient stock for ${it.name}`);
        decremented.push({ productId: String(it.productId), quantity: it.quantity });
      }
      const order = await Order.create({
        orderNumber,
        idempotencyKey: input.idempotencyKey,
        ownerKey,
        customer: input.customer,
        items: orderItems,
        subtotal,
        discount,
        shipping,
        grandTotal,
        currency: 'PKR',
        paymentMethod: 'demo',
        paymentStatus: 'pending',
        status: 'confirmed',
      });
      cart.items.splice(0, cart.items.length);
      await cart.save();
      return order;
    } catch (err) {
      for (const d of decremented) {
        await Product.updateOne({ _id: d.productId }, { $inc: { stock: d.quantity } }).catch(() => {});
      }
      throw err;
    }
  };

  const supportsTx = (() => {
    const client = mongoose.connection.getClient() as unknown as {
      topology?: { description?: { type?: string } };
    };
    return client?.topology?.description?.type === 'ReplicaSetWithPrimary';
  })();

  let created;
  try {
    created = supportsTx ? await tryTx() : await tryNoTx();
  } catch (err: unknown) {
    // Duplicate idempotency key race: return existing order
    if ((err as { code?: number })?.code === 11000) {
      const dup = await Order.findOne({ idempotencyKey: input.idempotencyKey }).lean();
      if (dup) return toDTO(dup);
    }
    throw err;
  }

  return toDTO(created);
}

async function makeOrderNumber(): Promise<string> {
  const seq = await nextOrderSeq();
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `AM-${ymd}-${String(seq).padStart(6, '0')}`;
}

export async function getOrder(ownerKey: string, id: string): Promise<OrderDTO> {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, 'invalid_id', 'Invalid order id');
  const o = await Order.findOne({ _id: id, ownerKey }).lean();
  if (!o) throw new ApiError(404, 'order_not_found', 'Order not found');
  return toDTO(o);
}