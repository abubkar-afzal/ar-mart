import { Router } from 'express';
import { Product, resolveModelUrl } from '../models/Product.ts';
import { asyncHandler, ApiError } from '../middleware/errors.ts';

export const productsRouter = Router();

productsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = String(req.query.q ?? '').trim();
    const category = String(req.query.category ?? '').trim();
    const department = String(req.query.department ?? '').trim();
    const onSale = String(req.query.onSale ?? '') === '1';
    const minPrice = Number(req.query.minPrice ?? '');
    const maxPrice = Number(req.query.maxPrice ?? '');
    const sort = String(req.query.sort ?? 'newest');
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 24)));

    const filter: Record<string, unknown> = { isActive: true };
    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    if (department) filter.department = department;
    if (onSale) filter.isOnSale = true;
    if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
      const range: Record<string, number> = {};
      if (Number.isFinite(minPrice)) range.$gte = minPrice;
      if (Number.isFinite(maxPrice)) range.$lte = maxPrice;
      if (Object.keys(range).length > 0) filter.price = range;
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      name_asc: { name: 1 },
    };

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort(sortMap[sort] ?? sortMap.newest)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      items: items.map((p) => ({
        _id: String(p._id),
        sku: p.sku,
        slug: p.slug,
        name: p.name,
        shortDescription: p.shortDescription,
        description: p.description,
        category: p.category,
        department: p.department,
        brand: p.brand,
        image: p.image,
        images: p.images,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        currency: p.currency,
        stock: p.stock,
        isActive: p.isActive,
        isFeatured: p.isFeatured,
        isOnSale: p.isOnSale,
        tags: p.tags,
        model3d: p.model3d ?? null,
        modelUrl: resolveModelUrl(p),
        createdAt: new Date(p.createdAt as any).toISOString(),
        updatedAt: new Date(p.updatedAt as any).toISOString(),
      })),
      total,
      page,
      limit,
    });
  }),
);

productsRouter.get(
  '/:idOrSlug',
  asyncHandler(async (req, res) => {
    const idOrSlug = req.params.idOrSlug;
    if (!idOrSlug) throw new ApiError(400, 'invalid_request', 'Missing product id or slug');
    const isObjectId = /^[0-9a-f]{24}$/i.test(idOrSlug);
    const p = await Product.findOne(isObjectId ? { _id: idOrSlug } : { slug: idOrSlug }).lean();
    if (!p) throw new ApiError(404, 'product_not_found', 'Product not found');
    res.json({
      _id: String(p._id),
      sku: p.sku,
      slug: p.slug,
      name: p.name,
      shortDescription: p.shortDescription,
      description: p.description,
      category: p.category,
      department: p.department,
      brand: p.brand,
      image: p.image,
      images: p.images,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      currency: p.currency,
      stock: p.stock,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      isOnSale: p.isOnSale,
      tags: p.tags,
      model3d: p.model3d ?? null,
      modelUrl: resolveModelUrl(p),
      createdAt: new Date(p.createdAt as any).toISOString(),
      updatedAt: new Date(p.updatedAt as any).toISOString(),
    });
  }),
);