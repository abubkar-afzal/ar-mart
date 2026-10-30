import { Router } from 'express';
import { AddCartItemSchema, UpdateCartItemSchema } from '@armart/shared';
import { asyncHandler, ApiError } from '../middleware/errors.ts';
import { addItem, getCart, removeItem, updateItem } from '../lib/cartService.ts';

export const cartRouter = Router();

cartRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await getCart(req.ownerKey));
  }),
);

cartRouter.post(
  '/items',
  asyncHandler(async (req, res) => {
    const body = AddCartItemSchema.parse(req.body);
    res.status(201).json(await addItem(req.ownerKey, body.productId, body.quantity));
  }),
);

cartRouter.patch(
  '/items/:productId',
  asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    if (!productId) throw new ApiError(400, 'invalid_request', 'Missing productId');
    const body = UpdateCartItemSchema.parse(req.body);
    res.json(await updateItem(req.ownerKey, productId, body.quantity));
  }),
);

cartRouter.delete(
  '/items/:productId',
  asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    if (!productId) throw new ApiError(400, 'invalid_request', 'Missing productId');
    res.json(await removeItem(req.ownerKey, productId));
  }),
);