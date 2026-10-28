'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Cart } from '@armart/shared';
import { api } from '@/lib/api';

type CartContextValue = {
  cart: Cart | null;
  loading: boolean;
  refresh: () => Promise<void>;
  add: (productId: string, quantity?: number) => Promise<void>;
  update: (productId: string, quantity: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const c = await api<Cart>('/api/cart');
      setCart(c);
    } catch (e) {
      console.error('cart refresh failed', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const add = useCallback(
    async (productId: string, quantity = 1) => {
      const c = await api<Cart>('/api/cart/items', {
        method: 'POST',
        body: { productId, quantity },
      });
      setCart(c);
    },
    [],
  );

  const update = useCallback(async (productId: string, quantity: number) => {
    const c = await api<Cart>(`/api/cart/items/${productId}`, {
      method: 'PATCH',
      body: { quantity },
    });
    setCart(c);
  }, []);

  const remove = useCallback(async (productId: string) => {
    const c = await api<Cart>(`/api/cart/items/${productId}`, { method: 'DELETE' });
    setCart(c);
  }, []);

  const value = useMemo(() => ({ cart, loading, refresh, add, update, remove }), [cart, loading, refresh, add, update, remove]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}