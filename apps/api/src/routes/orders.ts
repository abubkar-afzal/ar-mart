import { Router } from 'express';
import { CreateOrderSchema } from '@armart/shared';
import { asyncHandler } from '../middleware/errors.js';
import { createOrderFromCart, getOrder } from '../lib/orderService.js';

export const ordersRouter = Router();

ordersRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = CreateOrderSchema.parse(req.body);
    const order = await createOrderFromCart(req.ownerKey, body);
    res.status(201).json(order);
  }),
);

ordersRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await getOrder(req.ownerKey, req.params.id));
  }),
);