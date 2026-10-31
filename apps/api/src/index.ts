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

  const server = app.listen(env.port, () => {
    console.log(`[api] listening on http://localhost:${env.port}`);
    if (env.nodeEnv !== 'development') return;
    // Friendly CORS hint: verify the Express CORS middleware actually emits
    // Access-Control-Allow-Origin for the configured web origins.
    const port = (server.address() as { port: number } | null)?.port ?? env.port;
    const origin = env.corsOrigins[0] ?? 'http://localhost:3000';
    fetch(`http://localhost:${port}/api/health`, { headers: { Origin: origin } })
      .then((r) => r.headers.get('access-control-allow-origin'))
      .then((allow) => {
        console.log(
          `[api] CORS check: origin "${origin}" -> ` +
            (allow ? `allowed (${allow})` : 'BLOCKED by CORS_ORIGINS'),
        );
        if (!allow) {
          console.log(
            '[api] fix: add your web origin to CORS_ORIGINS in the root .env ' +
              '(comma-separated), then restart the API.',
          );
        }
      })
      .catch(() => undefined);

    // Warn if the database has no products yet (the web storefront will show
    // "Products unavailable" until you run npm run seed).
    import('./models/Product.ts')
      .then(({ Product }) => Product.estimatedDocumentCount())
      .then((count: number) => {
        if (count === 0) {
          console.log('[api] WARNING: 0 products in this database. Run: npm run seed');
        } else {
          console.log(`[api] products in database: ${count}`);
        }
      })
      .catch(() => undefined);
  });
}

main().catch((err) => {
  console.error('[api:fatal] could not start:', err instanceof Error ? err.message : err);
  process.exit(1);
});