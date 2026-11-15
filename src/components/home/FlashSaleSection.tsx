import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { Product } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { Zap, Clock, ShoppingBag, Eye, Heart, Star, Flame } from 'lucide-react';

interface FlashSaleSectionProps {
  onQuickView: (product: Product) => void;
  onSelectProduct: (slug: string) => void;
}

export const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({
  onQuickView,
  onSelectProduct
}) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { language, t } = useLanguage();
  const products = api.getProducts().filter(p => p.isFlashSale && p.isPublished);

  // Live countdown timer state (hours, minutes, seconds)
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 42,
    seconds: 15
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-12 bg-slate-900 border-b border-slate-800 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Countdown Timer */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-slate-800 gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-black tracking-tight text-white">
                  Limited-Time Flash Deals
                </h2>
                <span className="bg-rose-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Up to 25% Off
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Special discounted prices with limited warehouse stock. Once claimed, deals expire.
              </p>
            </div>
          </div>

          {/* Countdown Clock Display */}
          <div className="flex items-center space-x-2 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 shadow-inner">
            <Clock className="w-4 h-4 text-cyan-400 ml-1" />
            <span className="text-xs font-semibold text-slate-400 mr-1">Deals End In:</span>
            
            <div className="flex items-center space-x-1.5 font-mono">
              <div className="bg-indigo-900/60 border border-indigo-700/60 px-2.5 py-1 rounded-lg text-center">
                <span className="text-sm font-extrabold text-white">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="block text-[8px] text-slate-400 -mt-0.5">HRS</span>
              </div>
              <span className="text-cyan-400 font-bold">:</span>
              <div className="bg-indigo-900/60 border border-indigo-700/60 px-2.5 py-1 rounded-lg text-center">
                <span className="text-sm font-extrabold text-white">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="block text-[8px] text-slate-400 -mt-0.5">MIN</span>
              </div>
              <span className="text-cyan-400 font-bold">:</span>
              <div className="bg-indigo-900/60 border border-indigo-700/60 px-2.5 py-1 rounded-lg text-center">
                <span className="text-sm font-extrabold text-cyan-300">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="block text-[8px] text-slate-400 -mt-0.5">SEC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {products.map(prod => {
            const claimedPct = Math.min(85, Math.max(35, 100 - prod.stock * 4));
            return (
              <div
                key={prod.id}
                className="bg-slate-950/70 rounded-2xl border border-slate-800 p-4 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between group shadow-lg"
              >
                <div>
                  {/* Image container */}
                  <div className="relative aspect-square rounded-xl bg-slate-900/90 p-4 overflow-hidden mb-3">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      onClick={() => onSelectProduct(prod.slug)}
                      className="w-full h-full object-contain cursor-pointer group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Discount badge */}
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                      -{prod.discountPercent}% OFF
                    </div>

                    {/* Quick action buttons */}
                    <div className="absolute top-2 right-2 flex flex-col space-y-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleWishlist(prod.id)}
                        className={`p-2 rounded-xl backdrop-blur-md transition-colors ${
                          isInWishlist(prod.id)
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-900/80 text-slate-300 hover:text-rose-400'
                        }`}
                        title="Wishlist"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button
                        onClick={() => onQuickView(prod)}
                        className="p-2 rounded-xl bg-slate-900/80 text-slate-300 hover:text-cyan-400 backdrop-blur-md transition-colors"
                        title="Quick View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Brand & Category */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="text-cyan-400 font-semibold">{prod.brandName}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{prod.rating}</span>
                    </div>
                  </div>

                  <h3
                    onClick={() => onSelectProduct(prod.slug)}
                    className="text-sm font-bold text-white hover:text-cyan-400 cursor-pointer transition-colors truncate"
                  >
                    {language === 'bn' && prod.nameBn ? prod.nameBn : prod.name}
                  </h3>

                  {/* Price */}
                  <div className="mt-2 flex items-baseline space-x-2">
                    <span className="text-lg font-black text-white">
                      ৳{prod.discountedPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 line-through">
                      ৳{prod.regularPrice.toLocaleString()}
                    </span>
                  </div>

                  {/* Deal claim progress bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Stock Status</span>
                      <span className="text-rose-400 font-bold">{prod.stock} units left</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
                        style={{ width: `${claimedPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Add to Cart CTA */}
                <button
                  onClick={() => addToCart(prod, 1)}
                  className="mt-4 w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{t('product.add_to_cart')}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
