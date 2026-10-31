import { Router } from 'express';
import { CreateOrderSchema } from '@armart/shared';
import { asyncHandler, ApiError } from '../middleware/errors.ts';
import { createOrderFromCart, getOrder } from '../lib/orderService.ts';

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
    const id = req.params.id;
    if (!id) throw new ApiError(400, 'invalid_request', 'Missing order id');
    res.json(await getOrder(req.ownerKey, id));
  }),
);