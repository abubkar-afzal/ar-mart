import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './env.ts';
import { connectDb } from './db.ts';
import { sessionMiddleware } from './middleware/session.ts';
import { errorHandler, notFound } from './middleware/errors.ts';
import { productsRouter } from './routes/products.ts';
import { categoriesRouter } from './routes/categories.ts';
import { cartRouter } from './routes/cart.ts';
import { checkoutRouter } from './routes/checkout.ts';
import { ordersRouter } from './routes/orders.ts';

async function main() {
  await connectDb({ timeoutMs: 10000 });

  const app = express();
  app.use(cors({ origin: env.corsOrigins, credentials: true }));
  app.use(express.json({ limit: '256kb' }));
  app.use(cookieParser());
  app.use(sessionMiddleware);

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/products', productsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/checkout', checkoutRouter);
  app.use('/api/orders', ordersRouter);

  app.use(notFound);
  app.use(errorHandler);

  app.listen(env.port, () => {
    console.log(`[api] listening on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error('[api:fatal] could not start:', err instanceof Error ? err.message : err);
  process.exit(1);
});