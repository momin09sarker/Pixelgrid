import React, { useState } from 'react';
import { api } from '../../services/api.ts';
import { Product } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { Star, ShoppingBag, Eye, Heart, ArrowRight, Sparkles, TrendingUp, Award, Flame } from 'lucide-react';

interface ProductGridSectionProps {
  onQuickView: (product: Product) => void;
  onSelectProduct: (slug: string) => void;
  onNavigateShop: () => void;
}

export const ProductGridSection: React.FC<ProductGridSectionProps> = ({
  onQuickView,
  onSelectProduct,
  onNavigateShop
}) => {
  const [activeTab, setActiveTab] = useState<'trending' | 'best_sellers' | 'new_arrivals'>('trending');
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { language, t } = useLanguage();

  const allProducts = api.getProducts().filter(p => p.isPublished);

  const displayedProducts = allProducts.filter(p => {
    if (activeTab === 'trending') return p.isTrending;
    if (activeTab === 'best_sellers') return p.isBestSeller;
    return p.isNewArrival;
  });

  // Fallback if filter returns less than 4
  const listToShow = displayedProducts.length >= 4 ? displayedProducts : allProducts.slice(0, 8);

  return (
    <section className="py-16 bg-slate-950 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-slate-800/80 gap-6">
          <div>
            <div className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Bangladesh Tech Selection</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white">
              Trending & Best Sellers
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'trending'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Trending</span>
            </button>

            <button
              onClick={() => setActiveTab('best_sellers')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'best_sellers'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Best Selling</span>
            </button>

            <button
              onClick={() => setActiveTab('new_arrivals')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'new_arrivals'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Arrivals</span>
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {listToShow.map(prod => (
            <div
              key={prod.id}
              className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between group shadow-lg"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-square rounded-xl bg-slate-950 p-4 overflow-hidden mb-3.5 border border-slate-800/80">
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    onClick={() => onSelectProduct(prod.slug)}
                    className="w-full h-full object-contain cursor-pointer group-hover:scale-105 transition-transform duration-300"
                  />

                  {prod.discountPercent > 0 && (
                    <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                      -{prod.discountPercent}% OFF
                    </span>
                  )}

                  {/* Actions overlay */}
                  <div className="absolute top-2.5 right-2.5 flex flex-col space-y-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
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

                {/* Details */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span className="text-cyan-400 font-semibold">{prod.brandName}</span>
                  <div className="flex items-center space-x-1 text-slate-300">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="font-bold">{prod.rating}</span>
                    <span className="text-slate-500">({prod.reviewCount})</span>
                  </div>
                </div>

                <h3
                  onClick={() => onSelectProduct(prod.slug)}
                  className="text-sm font-bold text-white hover:text-cyan-400 cursor-pointer transition-colors truncate"
                >
                  {language === 'bn' && prod.nameBn ? prod.nameBn : prod.name}
                </h3>

                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {prod.shortDescription}
                </p>

                {/* Price */}
                <div className="mt-3 flex items-baseline space-x-2">
                  <span className="text-lg font-black text-white">
                    ৳{prod.discountedPrice.toLocaleString()}
                  </span>
                  {prod.discountPercent > 0 && (
                    <span className="text-xs text-slate-500 line-through">
                      ৳{prod.regularPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Add to Cart CTA */}
              <button
                onClick={() => addToCart(prod, 1)}
                className="mt-4 w-full py-2.5 bg-slate-800 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl border border-slate-700/60 hover:border-indigo-500 transition-all flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t('product.add_to_cart')}</span>
              </button>
            </div>
          ))}
        </div>

        {/* View all button */}
        <div className="mt-12 text-center">
          <button
            onClick={onNavigateShop}
            className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl border border-slate-700 transition-all inline-flex items-center space-x-2 shadow-lg"
          >
            <span>Explore All 200+ Products</span>
            <ArrowRight className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>
    </section>
  );
};
