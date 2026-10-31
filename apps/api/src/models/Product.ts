import { Schema, model, type InferSchemaType } from 'mongoose';
import { PRODUCT_MODEL_BY_SKU } from '../lib/productModels.ts';

const productSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    shortDescription: { type: String, default: '' },
    description: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    department: { type: String, required: true, index: true },
    brand: { type: String },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null, min: 0 },
    currency: { type: String, default: 'PKR', enum: ['PKR'] },
    stock: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false },
    isOnSale: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    model3d: {
      type: {
        assetId: { type: String },
        displayObjectId: { type: String },
      },
      default: null,
      _id: false,
    },
  },
  { timestamps: true },
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ department: 1, isActive: 1 });

export type ProductDoc = InferSchemaType<typeof productSchema> & { _id: string };
export const Product = model('Product', productSchema);
/**
 * Resolve the GLB display asset for a product: explicit model3d.assetId wins,
 * otherwise the Blender-authored catalogue mapping by SKU (see lib/productModels.ts).
 */
export function resolveModelUrl(p: { sku?: string; model3d?: { assetId?: string | null } | null }): string | null {
  return p.model3d?.assetId ?? PRODUCT_MODEL_BY_SKU[p.sku ?? ''] ?? null;
}
