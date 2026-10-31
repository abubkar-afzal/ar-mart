import { Schema, model, type InferSchemaType } from 'mongoose';

const categorySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    department: { type: String, required: true, index: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type CategoryDoc = InferSchemaType<typeof categorySchema> & { _id: string };
export const Category = model('Category', categorySchema);