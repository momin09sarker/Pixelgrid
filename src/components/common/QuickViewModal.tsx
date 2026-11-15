import React, { useState } from 'react';
import { Product } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { X, Star, ShieldCheck, Truck, ShoppingBag, ArrowRight, Heart, Check } from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onNavigateDetails: (slug: string) => void;
  onBuyNow: (product: Product, quantity: number, variantId?: string, color?: string, size?: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onNavigateDetails,
  onBuyNow
}) => {
  if (!product) return null;

  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { language, t } = useLanguage();

  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    product.variants.length > 0 ? product.variants[0].id : undefined
  );
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || 'Standard');
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'Standard');
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId);
  const currentPrice = (product.discountedPrice || product.regularPrice) + (selectedVariant ? selectedVariant.priceModifier : 0);
  const regularPrice = product.regularPrice + (selectedVariant ? selectedVariant.priceModifier : 0);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariantId, selectedColor, selectedSize);
    onClose();
  };

  const handleBuyNowClick = () => {
    onBuyNow(product, quantity, selectedVariantId, selectedColor, selectedSize);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 text-slate-400 hover:text-slate-800 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Column */}
          <div className="p-6 bg-slate-50 flex flex-col justify-between border-r border-slate-100">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white p-2 border border-slate-200/60 shadow-xs">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-contain object-center transition-transform duration-300 hover:scale-105"
              />
              {product.discountPercent > 0 && (
                <span className="absolute top-3 left-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-md">
                  -{product.discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 mt-4 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`w-14 h-14 rounded-xl overflow-hidden bg-white border-2 p-0.5 transition-all shrink-0 ${
                      activeImage === img ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover rounded-lg" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">
                <span>{product.brandName}</span>
                <span>•</span>
                <span>{product.categoryName}</span>
              </div>

              <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                {language === 'bn' && product.nameBn ? product.nameBn : product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="text-xs font-bold text-slate-800 ml-1">{product.rating}</span>
                </div>
                <span className="text-xs text-slate-400">({product.reviewCount} customer reviews)</span>
                <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline space-x-3 mt-4">
                <span className="text-2xl font-black text-indigo-600">
                  ৳{currentPrice.toLocaleString()}
                </span>
                {product.discountPercent > 0 && (
                  <span className="text-sm text-slate-400 line-through">
                    ৳{regularPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                {product.shortDescription || product.description}
              </p>

              {/* Color options */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Color: {selectedColor}</label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map(col => (
                      <button
                        key={col}
                        onClick={() => setSelectedColor(col)}
                        className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${
                          selectedColor === col
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="mt-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Edition / Storage:</label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map(v => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${
                          selectedVariantId === v.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:bg-white rounded-lg"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:bg-white rounded-lg"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-4 h-4 text-cyan-400" />
                  <span>{t('product.add_to_cart')}</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3 rounded-xl border transition-colors ${
                    isInWishlist(product.id)
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-500'
                  }`}
                  title="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleBuyNowClick}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  {t('product.buy_now')}
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateDetails(product.slug);
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1"
                >
                  <span>Full Specifications</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
