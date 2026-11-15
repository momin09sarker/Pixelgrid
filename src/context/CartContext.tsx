import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, Coupon } from '../types/index.ts';
import { api } from '../services/api.ts';

interface ToastInfo {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryMethod: 'standard' | 'express';
  setDeliveryMethod: (method: 'standard' | 'express') => void;
  shippingDistrict: string;
  setShippingDistrict: (district: string) => void;
  shippingCharge: number;
  coupon: Coupon | null;
  discountAmount: number;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, variantId?: string, color?: string, size?: string) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  applyCouponCode: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toasts: ToastInfo[];
  removeToast: (id: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('pixelgrid_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('pixelgrid_wishlist');
      return stored ? JSON.parse(stored) : ['prod-1', 'prod-3'];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState<Coupon | null>(() => {
    try {
      const stored = localStorage.getItem('pixelgrid_active_coupon');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>('standard');
  const [shippingDistrict, setShippingDistrict] = useState<string>('Dhaka');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const settings = api.getSettings();

  useEffect(() => {
    localStorage.setItem('pixelgrid_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('pixelgrid_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem('pixelgrid_active_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('pixelgrid_active_coupon');
    }
  }, [coupon]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addToCart = (product: Product, quantity = 1, variantId?: string, color?: string, size?: string) => {
    let unitPrice = product.discountedPrice || product.regularPrice;
    let variantName = '';

    if (variantId) {
      const foundVariant = product.variants.find(v => v.id === variantId);
      if (foundVariant) {
        unitPrice += foundVariant.priceModifier;
        variantName = foundVariant.name;
      }
    }

    setItems(prev => {
      const existingIdx = prev.findIndex(item => item.productId === product.id && item.variantId === variantId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }
      return [
        ...prev,
        {
          productId: product.id,
          product,
          variantId,
          variantName,
          selectedColor: color || (product.colors && product.colors[0]),
          selectedSize: size || (product.sizes && product.sizes[0]),
          quantity,
          unitPrice,
        }
      ];
    });

    showToast(`Added "${product.name.slice(0, 30)}..." to your cart!`, 'success');
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setItems(prev => prev.filter(item => !(item.productId === productId && item.variantId === variantId)));
    showToast('Item removed from cart.', 'info');
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        if (item.productId === productId && item.variantId === variantId) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Delivery charge calculation
  let baseDeliveryFee = shippingDistrict.toLowerCase() === 'dhaka'
    ? settings.insideDhakaShippingFee
    : settings.outsideDhakaShippingFee;

  if (deliveryMethod === 'express') {
    baseDeliveryFee += settings.expressShippingFee - settings.insideDhakaShippingFee;
  }

  // Free delivery rule: if subtotal exceeds freeShippingThreshold
  const isFreeDelivery = subtotal >= settings.freeShippingThreshold && subtotal > 0;
  const shippingCharge = isFreeDelivery ? 0 : (items.length > 0 ? baseDeliveryFee : 0);

  // Discount calculation
  let discountAmount = 0;
  if (coupon) {
    if (coupon.discountType === 'percentage') {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const total = Math.max(0, subtotal - discountAmount + shippingCharge);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const applyCouponCode = (code: string) => {
    const res = api.validateCoupon(code, subtotal);
    if (res.valid && res.coupon) {
      setCoupon(res.coupon);
      showToast(res.message, 'success');
      return { success: true, message: res.message };
    } else {
      showToast(res.message, 'error');
      return { success: false, message: res.message };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    showToast('Coupon removed.', 'info');
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from Wishlist.', 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Added to your Wishlist!', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        deliveryMethod,
        setDeliveryMethod,
        shippingDistrict,
        setShippingDistrict,
        shippingCharge,
        coupon,
        discountAmount,
        total,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCouponCode,
        removeCoupon,
        wishlist,
        toggleWishlist,
        isInWishlist,
        toasts,
        removeToast,
        showToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
