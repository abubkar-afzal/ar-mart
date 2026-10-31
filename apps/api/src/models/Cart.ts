import { Schema, model, type InferSchemaType } from 'mongoose';

const cartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, max: 99 },
  },
  { _id: false },
);

const cartSchema = new Schema(
  {
    ownerKey: { type: String, required: true, unique: true, index: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true },
);

export type CartDoc = InferSchemaType<typeof cartSchema> & { _id: string };
export const Cart = model('Cart', cartSchema);