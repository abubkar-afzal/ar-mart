'use client';

import { useEffect, useRef, useState } from 'react';
import type { Product } from '@armart/shared';
import { api } from '@/lib/api';
import { useCart } from '@/components/CartProvider';
import { formatPKR } from '@/lib/format';
import { createMartScene, type MartFloor, type MartHandle, type MartProductsByDept, type MartStage, type QualityLevel } from '@/lib/mart/scene';
import { MobileJoystick } from './MobileJoystick';
import { FloorNav } from './FloorNav';
import { LoadingOverlay } from './LoadingOverlay';

type Hint = { productId: string; name: string; price: number };

async function fetchDepartmentProducts(dept: string): Promise<Product[]> {
  const res = await api<{ items: Product[] }>(`/api/products?limit=48&department=${encodeURIComponent(dept)}`);
  return res.items;
}

export default function MartCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handleRef = useRef<MartHandle | null>(null);
  const [products, setProducts] = useState<MartProductsByDept | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [quality, setQuality] = useState<QualityLevel>('medium');
  const [stage, setStage] = useState<MartStage>('exterior');
  const [floor, setFloor] = useState<MartFloor>(0);
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const [hover, setHover] = useState<Hint | null>(null);
  const [inspectingProduct, setInspectingProduct] = useState<Product | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const { add } = useCart();

  const isMobile = typeof window !== 'undefined' && matchMedia('(pointer: coarse)').matches;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [grocery, clothing, electronics, furniture] = await Promise.all([
          fetchDepartmentProducts('grocery'), fetchDepartmentProducts('clothing'),
          fetchDepartmentProducts('electronics'), fetchDepartmentProducts('furniture'),
        ]);
        if (!cancelled) setProducts({ grocery, clothing, electronics, furniture });
      } catch (e) {
        if (!cancelled) setProductsError(e instanceof Error ? e.message : 'Failed to load products');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !products) return;
    setProgress(0);
    const handle = createMartScene(canvasRef.current, products, {
      onHoverProduct: (hint) => setHover(hint),
      onPickProduct: (productId) => {
        const all = [...products.grocery, ...products.clothing, ...products.electronics, ...products.furniture];
        const product = all.find((x) => x._id === productId) ?? null;
        setInspectingProduct(product);
        if (product) handleRef.current?.startInspection(product);
      },
      onStageChange: (s) => setStage(s),
      onFloorChange: (f) => setFloor(f),
      onProgress: (p) => setProgress(p),
    }, quality);
    handleRef.current = handle;

    const onLockChange = () => setIsLocked(document.pointerLockElement === canvasRef.current);
    document.addEventListener('pointerlockchange', onLockChange);

    return () => { handle.dispose(); handleRef.current = null; document.removeEventListener('pointerlockchange', onLockChange); };
  }, [products, quality]);

  const onEnter = () => {
    setFading(true);
    setTimeout(() => { handleRef.current?.enterBuilding(); setTimeout(() => setFading(false), 700); }, 300);
  };

  const goToFloor = (f: MartFloor) => {
    if (f === floor) return;
    setFading(true);
    setTimeout(() => { handleRef.current?.goToFloor(f); setTimeout(() => setFading(false), 250); }, 250);
  };

  const closeInspection = () => {
    handleRef.current?.stopInspection();
    setInspectingProduct(null);
  };

  const onAddToCart = async () => {
    if (!inspectingProduct) return;
    try {
      await add(inspectingProduct._id, 1);
      setBanner(`${inspectingProduct.name} added to cart`);
      setTimeout(() => setBanner(null), 1500);
      closeInspection();
    } catch (e) { setBanner(e instanceof Error ? e.message : 'Failed'); }
  };

  const [mobileMove, setMobileMove] = useState({ x: 0, z: 0 });
  useEffect(() => { handleRef.current?.setMoveVector(mobileMove.x, mobileMove.z); }, [mobileMove]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-brand-charcoal" onClick={() => { if (stage === 'inside' && !inspectingProduct) handleRef.current?.enterPointerLock(); }}>
      <canvas ref={canvasRef} className="w-full h-full block outline-none touch-none" tabIndex={0} />

      {progress < 100 && !productsError && <LoadingOverlay progress={progress} />}
      {fading && <div className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300 z-30" />}

      {productsError && (
        <div className="absolute inset-0 flex items-center justify-center bg-brand-charcoal/80 text-white p-8 text-center z-50">
          <div>
            <div className="text-lg font-bold">3D store failed to load</div>
            <div className="mt-2 text-sm text-white/70">{productsError}</div>
          </div>
        </div>
      )}

      {stage === 'exterior' && progress >= 100 && (
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 bg-gradient-to-t from-black/60 to-transparent">
          <div className="text-white text-3xl md:text-5xl font-extrabold tracking-tight mb-2">AR MART</div>
          <div className="text-white/70 mb-6">Explore. Discover. Shop.</div>
          <button onClick={onEnter} className="rounded-full bg-brand-red text-white px-8 py-3 font-semibold hover:bg-red-700">Enter the Mart</button>
        </div>
      )}

      {stage === 'inside' && (
        <>
          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-20 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            <FloorNav current={floor} onSelect={goToFloor} />
          </div>

          <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full z-20">
            {isMobile ? 'Tap products to inspect · Use joystick to walk' : isLocked ? 'W A S D move · Mouse look · E inspect · Esc release' : 'Click anywhere to lock mouse'}
          </div>

          {isMobile && <div className="absolute bottom-6 left-6 z-20 pointer-events-auto" onClick={(e) => e.stopPropagation()}><MobileJoystick onChange={(x, z) => setMobileMove({ x, z })} /></div>}

          {hover && !inspectingProduct && (
            <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow px-4 py-2 text-sm z-20">
              <span className="font-semibold">{hover.name}</span>
              <span className="ml-2 text-brand-muted">{formatPKR(hover.price)}</span>
              {!isMobile && <span className="ml-3 text-xs text-brand-red">[E] inspect</span>}
            </div>
          )}
        </>
      )}

      {/* True 3D UI Overlay (No Modal) */}
      {inspectingProduct && (
        <div className="absolute inset-0 bg-black/40 z-40 flex flex-col justify-end pb-12 items-center pointer-events-none" onClick={(e) => e.stopPropagation()}>
          <div className="pointer-events-auto bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-xs uppercase tracking-wide text-brand-muted">{inspectingProduct.category}</div>
                <h3 className="text-xl font-bold">{inspectingProduct.name}</h3>
              </div>
              <div className="text-lg font-extrabold">{formatPKR(inspectingProduct.price)}</div>
            </div>
            <p className="text-sm text-brand-charcoal/70 mb-4 line-clamp-2">{inspectingProduct.description}</p>
            <div className="flex gap-3">
              <button onClick={closeInspection} className="flex-1 rounded-full border border-brand-gray py-2 font-semibold hover:border-brand-charcoal">
                Return to Shelf
              </button>
              <button onClick={onAddToCart} className="flex-1 rounded-full bg-brand-red text-white py-2 font-semibold hover:bg-red-700">
                Add to Cart
              </button>
            </div>
            <div className="text-center mt-3 text-xs text-brand-muted">Drag with mouse to rotate 3D item · Scroll to zoom</div>
          </div>
        </div>
      )}

      {banner && <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-brand-red text-white text-sm px-4 py-2 rounded-full z-50">{banner}</div>}
    </div>
  );
}