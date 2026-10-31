import { Schema, model, type InferSchemaType } from 'mongoose';

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, required: true },
    sku: { type: String, required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineSubtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    idempotencyKey: { type: String, required: true, unique: true, sparse: true },
    ownerKey: { type: String, required: true, index: true },
    customer: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      region: { type: String, required: true },
      country: { type: String, required: true },
    },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, required: true, min: 0, default: 0 },
    shipping: { type: Number, required: true, min: 0, default: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'PKR' },
    paymentMethod: { type: String, required: true, enum: ['demo'] },
    paymentStatus: { type: String, required: true, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    status: { type: String, required: true, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' },
  },
  { timestamps: true },
);

export type OrderDoc = InferSchemaType<typeof orderSchema> & { _id: string };
export const Order = model('Order', orderSchema);