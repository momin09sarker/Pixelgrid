import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const TRANSLATIONS: Record<string, { en: string; bn: string }> = {
  // Navigation & General
  'nav.home': { en: 'Home', bn: 'হোম' },
  'nav.shop': { en: 'All Products', bn: 'সব পণ্য' },
  'nav.categories': { en: 'Categories', bn: 'ক্যাটেগরি' },
  'nav.flash_sale': { en: 'Flash Sale', bn: 'ফ্ল্যাশ সেল' },
  'nav.track_order': { en: 'Track Order', bn: 'অর্ডার ট্র্যাক' },
  'nav.support': { en: 'Support', bn: 'সাপোর্ট' },
  'nav.admin': { en: 'Admin Panel', bn: 'অ্যাডমিন প্যানেল' },
  'nav.dashboard': { en: 'My Account', bn: 'আমার একাউন্ট' },
  'nav.login': { en: 'Sign In', bn: 'সাইন ইন' },
  'nav.logout': { en: 'Sign Out', bn: 'লগআউট' },

  // Search
  'search.placeholder': { en: 'Search smartphones, laptops, audio, gaming gear...', bn: 'স্মার্টফোন, ল্যাপটপ, গ্যাজেট খুঁজুন...' },
  'search.suggestions': { en: 'Popular Searches', bn: 'জনপ্রিয় অনুসন্ধান' },

  // Cart & Pricing
  'cart.title': { en: 'Shopping Cart', bn: 'শপিং কার্ট' },
  'cart.empty': { en: 'Your cart is empty', bn: 'আপনার কার্ট খালি' },
  'cart.subtotal': { en: 'Subtotal', bn: 'মোট মূল্য' },
  'cart.shipping': { en: 'Delivery Fee', bn: 'ডেলিভারি চার্জ' },
  'cart.discount': { en: 'Discount', bn: 'ছাড়' },
  'cart.total': { en: 'Total Amount', bn: 'সর্বমোট' },
  'cart.checkout': { en: 'Proceed to Checkout', bn: 'অর্ডার সম্পন্ন করুন' },
  'cart.continue': { en: 'Continue Shopping', bn: 'আরও শপিং করুন' },
  'cart.coupon_placeholder': { en: 'Enter coupon (e.g. PIXEL10)', bn: 'কুপন কোড দিন (যেমন PIXEL10)' },
  'cart.apply_coupon': { en: 'Apply', bn: 'প্রয়োগ' },

  // Product Actions
  'product.add_to_cart': { en: 'Add to Cart', bn: 'কার্ট-এ যোগ করুন' },
  'product.buy_now': { en: 'Buy Now', bn: 'এখনই কিনুন' },
  'product.in_stock': { en: 'In Stock', bn: 'স্টকে আছে' },
  'product.out_of_stock': { en: 'Out of Stock', bn: 'স্টক শেষ' },
  'product.reviews': { en: 'Reviews', bn: 'রিভিউ' },
  'product.specs': { en: 'Specifications', bn: 'স্পেসিফিকেশন' },
  'product.warranty': { en: 'Warranty', bn: 'ওয়ারেন্টি' },
  'product.free_delivery': { en: 'Free Delivery Available', bn: 'ফ্রি ডেলিভারি প্রযোজ্য' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('pixelgrid_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('pixelgrid_lang', lang);
  };

  const t = (key: string): string => {
    const item = TRANSLATIONS[key];
    if (!item) return key;
    return item[language] || item['en'];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
