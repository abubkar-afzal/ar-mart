import { Router } from 'express';
import { asyncHandler } from '../middleware/errors.ts';
import { getCart } from '../lib/cartService.ts';

export const checkoutRouter = Router();

checkoutRouter.post(
  '/validate',
  asyncHandler(async (req, res) => {
    const cart = await getCart(req.ownerKey);
    const issues: { productId: string; message: string }[] = [];
    for (const it of cart.items) {
      if (!it.isActive) issues.push({ productId: it.productId, message: 'No longer available' });
      else if (it.quantity > it.availableStock)
        issues.push({ productId: it.productId, message: `Only ${it.availableStock} in stock` });
    }
    res.json({ cart, issues, ok: issues.length === 0 });
  }),
);