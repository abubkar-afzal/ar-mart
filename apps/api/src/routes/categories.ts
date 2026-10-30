import { Router } from 'express';
import { Category } from '../models/Category.ts';
import { asyncHandler } from '../middleware/errors.ts';

export const categoriesRouter = Router();

categoriesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const items = await Category.find({ isActive: true }).sort({ order: 1, name: 1 }).lean();
    res.json({
      items: items.map((c) => ({
        _id: String(c._id),
        slug: c.slug,
        name: c.name,
        department: c.department,
        order: c.order,
        isActive: c.isActive,
      })),
    });
  }),
);