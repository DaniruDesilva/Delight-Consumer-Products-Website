'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface CartItem {
  product_id: number; name: string; price: number; original_price: number | null;
  image: string; category: string; quantity: number; stock: number;
  weight: number; weight_unit: string; min_order_quantity: number;
}

interface User {
  id: number; name: string; email: string; phone?: string; address?: string; city?: string;
}

interface Coupon {
  code: string;
  discount_type: string;
  discount_value: number;
  min_spend?: number;
}

interface CartContextType {
  items: CartItem[];
  count: number;
  user: User | null;
  loading: boolean;
  addToCart: (productId: number, qty?: number) => Promise<boolean>;
  updateQuantity: (productId: number, qty: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  coupon: Coupon | null;
  couponError: string;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  isAuthOpen: boolean;
  setAuthOpen: (val: boolean) => void;
  lastError: string | null;
  clearError: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [localItems, setLocalItems] = useState<CartItem[]>([]);
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isAuthOpen, setAuthOpen] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const clearError = useCallback(() => setLastError(null), []);

  useEffect(() => {
    const saved = localStorage.getItem('delight_cart');
    if (saved) {
      try { setLocalItems(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('delight_cart', JSON.stringify(localItems));
  }, [localItems]);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/user/me');
      const data = await res.json();
      setUser(data.user || null);
      return data.user;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      setItems(data.items || []);
      setCount(data.count || 0);
    } catch {
      setItems([]);
      setCount(0);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refreshUser();
      await refreshCart();
      setLoading(false);
    })();
  }, [refreshUser, refreshCart]);

  const addToCart = async (productId: number, qty: number = 1): Promise<boolean> => {
    clearError();
    if (user) {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: qty }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCount(data.count);
        await refreshCart();
        return true;
      }
      if (data.error) setLastError(data.error);
      return false;
    } else {
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        if (!data || data.error) {
          setLastError('Product not found');
          return false;
        }
        
        let success = true;
        setLocalItems(prev => {
          const existing = prev.find(i => i.product_id === productId);
          const newTotal = (existing?.quantity || 0) + qty;
          
          if (newTotal > data.stock) {
            setLastError(`Only ${data.stock} left in stock`);
            success = false;
            return prev;
          }
          
          if (existing) {
            return prev.map(i => i.product_id === productId ? { ...i, quantity: newTotal } : i);
          } else {
            return [...prev, {
              product_id: data.id, name: data.name, price: data.price, original_price: data.original_price,
              image: data.image, category: data.category, quantity: qty, stock: data.stock,
              weight: data.weight, weight_unit: data.weight_unit, min_order_quantity: data.min_order_quantity || 1
            }];
          }
        });
        return success;
      } catch {
        setLastError('Failed to add to cart');
        return false;
      }
    }
  };

  const updateQuantity = async (productId: number, qty: number) => {
    clearError();
    if (user) {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: qty }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems(data.items || []);
        setCount(data.count || 0);
      } else if (data.type === 'STOCK_EXCEEDED') {
        setLastError(data.error);
        // Reset to max available
        const updatedItems = items.map(i => i.product_id === productId ? { ...i, quantity: data.available } : i);
        setItems(updatedItems);
        // Force recalculation of count based on the new capped items
        const newCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        setCount(newCount);
      } else if (data.error) {
        setLastError(data.error);
      }
    } else {
      setLocalItems(prev => {
        const existing = prev.find(i => i.product_id === productId);
        if (existing && qty > existing.stock) {
          setLastError(`Only ${existing.stock} left in stock`);
          return prev.map(i => i.product_id === productId ? { ...i, quantity: existing.stock } : i);
        }
        return prev.map(i => i.product_id === productId ? { ...i, quantity: qty } : i);
      });
    }
  };

  const removeItem = async (productId: number) => {
    if (user) {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setCount(data.count || 0);
      }
    } else {
      setLocalItems(prev => prev.filter(i => i.product_id !== productId));
    }
  };

  const logout = async () => {
    await fetch('/api/auth/user/logout', { method: 'POST' });
    setUser(null);
    setItems([]);
    setCount(0);
    setCoupon(null);
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    setCouponError('');
    try {
      const activeItems = user ? items : localItems;
      const subtotal = activeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCoupon(data.coupon);
        return true;
      } else {
        setCouponError(data.error || 'Invalid coupon');
        return false;
      }
    } catch {
      setCouponError('Failed to apply coupon');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError('');
  };

  const displayedItems = user ? items : localItems;
  const displayedCount = user ? count : localItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      items: displayedItems, count: displayedCount, user, loading, addToCart, updateQuantity, removeItem, refreshCart, refreshUser, logout,
      coupon, couponError, applyCoupon, removeCoupon, isAuthOpen, setAuthOpen,
      lastError, clearError
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
