import React, { useState } from 'react';
import { api } from '../../services/api.ts';
import { Product } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import {
  Star,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  Check,
  Share2,
  Package,
  Layers,
  ArrowRight,
  MessageSquare,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';

interface ProductDetailsProps {
  slug: string;
  onNavigateDetails: (slug: string) => void;
  onNavigateCheckout: () => void;
  onNavigateShop: () => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  slug,
  onNavigateDetails,
  onNavigateCheckout,
  onNavigateShop
}) => {
  const product = api.getProductBySlug(slug) || api.getProducts()[0];
  const { addToCart, toggleWishlist, isInWishlist, showToast } = useCart();
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    product.variants.length > 0 ? product.variants[0].id : undefined
  );
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || 'Standard');
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews' | 'delivery'>('specs');

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAuthor, setReviewAuthor] = useState(user?.name || '');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId);
  const currentPrice = (product.discountedPrice || product.regularPrice) + (selectedVariant ? selectedVariant.priceModifier : 0);
  const regularPrice = product.regularPrice + (selectedVariant ? selectedVariant.priceModifier : 0);

  const reviews = api.getReviewsByProduct(product.id);
  const relatedProducts = api.getProducts().filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);

  // Frequently bought together bundle item (e.g. Sony WH-1000XM5 or keyboard)
  const bundleItem = api.getProducts().find(p => p.id !== product.id) || api.getProducts()[1];
  const bundleTotal = currentPrice + (bundleItem ? (bundleItem.discountedPrice || bundleItem.regularPrice) : 0);
  const bundleSavings = 1500; // Bundle bonus discount

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariantId, selectedColor, selectedSize);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariantId, selectedColor, selectedSize);
    onNavigateCheckout();
  };

  const handleAddBundle = () => {
    addToCart(product, 1, selectedVariantId, selectedColor, selectedSize);
    if (bundleItem) {
      addToCart(bundleItem, 1);
    }
    showToast('Bundle added to cart with bonus discount!', 'success');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Product link copied to clipboard!', 'info');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    api.addReview({
      productId: product.id,
      userId: user?.id || 'guest-reviewer',
      userName: reviewAuthor || 'Verified Techie',
      rating: reviewRating,
      comment: reviewComment,
      verifiedPurchase: true,
    });

    setReviewSubmitted(true);
    setReviewComment('');
    showToast('Thank you! Your verified review has been published.', 'success');
  };

  return (
    <div className="bg-slate-950 text-white min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-slate-400 mb-8">
          <button onClick={onNavigateShop} className="hover:text-cyan-400 transition-colors">Shop</button>
          <span>/</span>
          <span className="text-cyan-400">{product.categoryName}</span>
          <span>/</span>
          <span className="text-slate-200 font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Product Core Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Gallery & Zoom Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-square rounded-3xl bg-slate-900 p-6 border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center group">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
              />
              {product.discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
                  -{product.discountPercent}% OFF
                </div>
              )}
              <button
                onClick={handleShare}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-950/70 hover:bg-slate-950 text-slate-300 hover:text-white backdrop-blur-md transition-colors"
                title="Share Product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail carousel */}
            {product.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 rounded-2xl bg-slate-900 border-2 p-1.5 shrink-0 transition-all ${
                      activeImage === img ? 'border-cyan-400 ring-4 ring-cyan-500/20' : 'border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-contain rounded-xl" />
                  </button>
                ))}
              </div>
            )}

            {/* Key trust checklist */}
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{product.warranty}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <RotateCcw className="w-4 h-4 text-purple-400 shrink-0" />
                <span>{product.returnPolicy}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Truck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Pathao & Steadfast Dispatch from Gaibandha Warehouse</span>
              </div>
            </div>
          </div>

          {/* Right: Product Details & Purchase Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                <span>{product.brandName}</span>
                <span>•</span>
                <span>{product.categoryName}</span>
                <span>•</span>
                <span className="text-slate-400">SKU: {product.sku}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {language === 'bn' && product.nameBn ? product.nameBn : product.name}
              </h1>

              {/* Rating and Stock */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="flex items-center space-x-1 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20 text-amber-300 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-slate-400">({product.reviewCount} customer reviews)</span>
                </div>

                <div className="flex items-center space-x-1.5 text-xs">
                  <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                  <span className={product.stock > 0 ? 'text-emerald-400 font-bold' : 'text-rose-500 font-bold'}>
                    {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Temporarily Out of Stock'}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-baseline space-x-4">
              <span className="text-3xl sm:text-4xl font-black text-cyan-400">
                ৳{currentPrice.toLocaleString()}
              </span>
              {product.discountPercent > 0 && (
                <>
                  <span className="text-base text-slate-500 line-through">
                    ৳{regularPrice.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-md">
                    Save ৳{(regularPrice - currentPrice).toLocaleString()} ({product.discountPercent}% OFF)
                  </span>
                </>
              )}
            </div>

            {/* Short Description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {product.description || product.shortDescription}
            </p>

            {/* Variations: Colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Select Color: <span className="text-cyan-400">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map(col => (
                    <button
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      className={`text-xs px-3.5 py-2 rounded-xl font-semibold border transition-all ${
                        selectedColor === col
                          ? 'bg-indigo-600 text-white border-cyan-400 shadow-md shadow-indigo-500/20'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Variations: Storage / Variant */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Edition & Storage Specification:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedVariantId === v.id
                          ? 'bg-slate-900 border-cyan-400 shadow-md ring-1 ring-cyan-400/30'
                          : 'bg-slate-950 border-slate-800 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">{v.name}</span>
                        {v.priceModifier > 0 && (
                          <span className="text-cyan-400 font-mono text-[11px]">+৳{v.priceModifier.toLocaleString()}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Stock: {v.stock} units</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div className="pt-4 border-t border-slate-800/80 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-slate-700 rounded-xl bg-slate-900 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-4 h-4 text-cyan-400" />
                  <span>{t('product.add_to_cart')}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>{t('product.buy_now')}</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3.5 rounded-xl border transition-colors ${
                    isInWishlist(product.id)
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400'
                  }`}
                  title="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              {/* Delivery Estimation Pill */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Inside Dhaka Metro</span>
                  <span className="font-semibold text-white">৳60 Delivery • 24 to 48 Hours</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Outside Dhaka (64 Districts)</span>
                  <span className="font-semibold text-white">৳120 Delivery • 48 to 72 Hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Frequently Bought Together Bundle */}
        {bundleItem && (
          <div className="mt-16 bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
              <Package className="w-4 h-4" />
              <span>Recommended Flagship Combo Deal</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-6">Frequently Bought Together</h3>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-wrap items-center gap-4">
                {/* Item 1 */}
                <div className="flex items-center space-x-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <img src={product.images[0]} alt={product.name} className="w-14 h-14 object-contain rounded-lg" />
                  <div>
                    <h5 className="text-xs font-bold text-white max-w-[160px] truncate">{product.name}</h5>
                    <span className="text-xs font-black text-cyan-400">৳{currentPrice.toLocaleString()}</span>
                  </div>
                </div>

                <span className="text-lg font-bold text-slate-500">+</span>

                {/* Item 2 */}
                <div className="flex items-center space-x-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <img src={bundleItem.images[0]} alt={bundleItem.name} className="w-14 h-14 object-contain rounded-lg" />
                  <div>
                    <h5 className="text-xs font-bold text-white max-w-[160px] truncate">{bundleItem.name}</h5>
                    <span className="text-xs font-black text-cyan-400">৳{(bundleItem.discountedPrice || bundleItem.regularPrice).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Bundle Checkout Button */}
              <div className="text-right flex flex-col sm:flex-row items-center gap-4">
                <div>
                  <div className="text-xs text-slate-400">Combo Total:</div>
                  <div className="text-xl font-black text-white">
                    ৳{(bundleTotal - bundleSavings).toLocaleString()}
                    <span className="text-xs text-slate-500 line-through ml-2">৳{bundleTotal.toLocaleString()}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">Bundle Save: ৳{bundleSavings.toLocaleString()}</span>
                </div>

                <button
                  onClick={handleAddBundle}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors whitespace-nowrap"
                >
                  Add Both to Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Tabs: Specifications, Reviews, Delivery */}
        <div className="mt-16 bg-slate-900/60 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          {/* Tabs bar */}
          <div className="flex border-b border-slate-800 bg-slate-900 px-6 pt-4 gap-6 text-sm font-bold">
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-4 transition-colors relative ${
                activeTab === 'specs' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Specifications
              {activeTab === 'specs' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 transition-colors relative flex items-center space-x-1.5 ${
                activeTab === 'reviews' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Customer Reviews</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                {reviews.length}
              </span>
              {activeTab === 'reviews' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className={`pb-4 transition-colors relative ${
                activeTab === 'delivery' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Delivery & Warranty Policy
              {activeTab === 'delivery' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* 1. Specifications Table */}
            {activeTab === 'specs' && (
              <div className="space-y-4">
                <h4 className="text-base font-bold text-white mb-4">Detailed Hardware Parameters</h4>
                <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden text-xs">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="grid grid-cols-3 p-3.5 bg-slate-950/40 hover:bg-slate-900/60 transition-colors">
                      <span className="font-semibold text-slate-400">{key}</span>
                      <span className="col-span-2 text-white font-medium">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Customer Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <h4 className="text-base font-bold text-white">Customer Feedback & Ratings</h4>
                    <p className="text-xs text-slate-400">Verified purchasers who received and tested this item.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-black text-cyan-400">{product.rating}</span>
                    <div className="text-amber-400">
                      <Star className="w-5 h-5 fill-amber-400" />
                    </div>
                    <span className="text-xs text-slate-400">out of 5 stars</span>
                  </div>
                </div>

                {/* Submit Review Form */}
                <form onSubmit={handleReviewSubmit} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider">Leave a Verified Review</h5>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">Rating:</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={reviewAuthor}
                      onChange={e => setReviewAuthor(e.target.value)}
                      placeholder="Your Name (e.g. Shakil Chowdhury)"
                      className="w-full text-xs px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 mb-3"
                    />
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      placeholder="Write your genuine experience with this gadget, battery life, performance, and delivery..."
                      className="w-full text-xs p-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Submit Review
                  </button>
                </form>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">Be the first to review this product!</p>
                  ) : (
                    reviews.map(rev => (
                      <div key={rev.id} className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-white">{rev.userName}</span>
                            {rev.verifiedPurchase && (
                              <span className="text-[10px] text-emerald-400 bg-emerald-950/50 px-1.5 py-0.2 rounded border border-emerald-800/40">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <div className="flex text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-700'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                        <span className="text-[10px] text-slate-500 block">
                          {new Date(rev.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 3. Delivery & Warranty Info */}
            {activeTab === 'delivery' && (
              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <h4 className="text-base font-bold text-white mb-2">PixelGrid Bangladesh Logistics Terms</h4>
                <p>
                  • <strong>Packaging:</strong> All packages are bubble-wrapped in tamper-proof security sleeves with unique barcode seal.
                </p>
                <p>
                  • <strong>Dispatch Schedule:</strong> Orders placed before 3:00 PM are dispatched on the same day from our Gaibandha central fulfillment center.
                </p>
                <p>
                  • <strong>Tracking:</strong> Real-time SMS and email updates are sent at every milestone (Confirmed, Packed, Shipped with Pathao/Steadfast, Out for Delivery).
                </p>
                <p>
                  • <strong>Warranty Claim:</strong> Carry your printed or digital invoice to any official Sony, Samsung, Apple, or ASUS authorized service center across Bangladesh for warranty support.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h3 className="text-xl font-bold text-white mb-6">Similar Flagship Devices</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(rel => (
                <div
                  key={rel.id}
                  onClick={() => onNavigateDetails(rel.slug)}
                  className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all group"
                >
                  <div className="aspect-square bg-slate-950 rounded-xl p-3 mb-3 border border-slate-800/80">
                    <img src={rel.images[0]} alt={rel.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{rel.name}</h4>
                  <div className="mt-1 flex items-baseline space-x-2">
                    <span className="text-sm font-bold text-cyan-400">৳{rel.discountedPrice.toLocaleString()}</span>
                    {rel.discountPercent > 0 && (
                      <span className="text-[10px] text-slate-500 line-through">৳{rel.regularPrice.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
