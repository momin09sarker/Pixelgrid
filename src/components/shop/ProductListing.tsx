import React, { useState, useMemo } from 'react';
import { api } from '../../services/api.ts';
import { Product } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import {
  Filter,
  Grid,
  List,
  Star,
  ShoppingBag,
  Eye,
  Heart,
  SlidersHorizontal,
  X,
  RotateCcw,
  Search,
  Check
} from 'lucide-react';

interface ProductListingProps {
  initialCategory?: string;
  initialSearch?: string;
  onQuickView: (product: Product) => void;
  onSelectProduct: (slug: string) => void;
}

export const ProductListing: React.FC<ProductListingProps> = ({
  initialCategory,
  initialSearch,
  onQuickView,
  onSelectProduct
}) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { language, t } = useLanguage();

  const allProducts = api.getProducts().filter(p => p.isPublished);
  const categories = api.getCategories();
  const brands = api.getBrands();

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<number>(400000);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [onSaleOnly, setOnSaleOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'best_seller' | 'rating'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');

  // Reset Filters
  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setPriceRange(400000);
    setMinRating(0);
    setInStockOnly(false);
    setOnSaleOnly(false);
    setSortBy('newest');
    setSearchTerm('');
  };

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter(p => {
        // Category
        if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
        // Brand
        if (selectedBrand !== 'all' && p.brandId !== selectedBrand) return false;
        // Price
        const effectivePrice = p.discountedPrice || p.regularPrice;
        if (effectivePrice > priceRange) return false;
        // Rating
        if (minRating > 0 && p.rating < minRating) return false;
        // In Stock
        if (inStockOnly && p.stock <= 0) return false;
        // On Sale
        if (onSaleOnly && p.discountPercent <= 0) return false;
        // Search Term
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const match =
            p.name.toLowerCase().includes(q) ||
            p.categoryName.toLowerCase().includes(q) ||
            p.brandName.toLowerCase().includes(q) ||
            p.tags.some(tag => tag.toLowerCase().includes(q));
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const priceA = a.discountedPrice || a.regularPrice;
        const priceB = b.discountedPrice || b.regularPrice;

        switch (sortBy) {
          case 'price_low':
            return priceA - priceB;
          case 'price_high':
            return priceB - priceA;
          case 'rating':
            return b.rating - a.rating;
          case 'best_seller':
            return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
          case 'newest':
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [allProducts, selectedCategory, selectedBrand, priceRange, minRating, inStockOnly, onSaleOnly, sortBy, searchTerm]);

  return (
    <div className="bg-slate-950 text-white min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Flagship Electronics & Gadgets
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Showing <strong className="text-cyan-400">{filteredProducts.length}</strong> official devices across Bangladesh
            </p>
          </div>

          {/* View Toggles & Mobile Filter button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center space-x-1.5 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300"
            >
              <Filter className="w-4 h-4 text-cyan-400" />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 text-xs font-semibold rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="newest">Sort: Newest Arrivals</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="best_seller">Best Selling</option>
              <option value="rating">Highest Rated</option>
            </select>

            {/* Grid / List view */}
            <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
          {/* Left Sidebar Filter (Desktop) */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                  <span>Filter Products</span>
                </span>
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-cyan-400 hover:underline flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Keyword Search */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Search Within Results</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Keyword, model, RAM..."
                    className="w-full text-xs pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Category</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === 'all'
                        ? 'bg-indigo-600/30 text-cyan-300 font-bold border border-indigo-500/40'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>All Categories</span>
                    <span className="text-[10px] text-slate-500">{allProducts.length}</span>
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                        selectedCategory === cat.id
                          ? 'bg-indigo-600/30 text-cyan-300 font-bold border border-indigo-500/40'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-[10px] text-slate-500">{cat.itemCount}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Official Brand</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  <button
                    onClick={() => setSelectedBrand('all')}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                      selectedBrand === 'all'
                        ? 'bg-indigo-600/30 text-cyan-300 font-bold border border-indigo-500/40'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    All Brands
                  </button>
                  {brands.map(b => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBrand(b.id)}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                        selectedBrand === b.id
                          ? 'bg-indigo-600/30 text-cyan-300 font-bold border border-indigo-500/40'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Slider */}
              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <label className="font-bold text-slate-300">Max Price</label>
                  <span className="font-mono font-bold text-cyan-400">
                    ৳{priceRange.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={400000}
                  step={5000}
                  value={priceRange}
                  onChange={e => setPriceRange(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>৳5,000</span>
                  <span>৳400,000</span>
                </div>
              </div>

              {/* Checkbox Options */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={e => setInStockOnly(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>In Stock Only</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onSaleOnly}
                    onChange={e => setOnSaleOnly(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Discounted / On Sale Only</span>
                </label>
              </div>

              {/* Rating Filter */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-300 mb-2">Rating</label>
                <div className="flex flex-wrap gap-1.5">
                  {[0, 4, 4.5, 4.8].map(r => (
                    <button
                      key={r}
                      onClick={() => setMinRating(r)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                        minRating === r
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {r === 0 ? 'Any' : `${r}★ & up`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Product Grid / List */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-slate-900/60 rounded-3xl p-12 text-center border border-slate-800">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4">
                  <Filter className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Products Match Your Filter</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                  Try adjusting the maximum price slider or clearing brand/category restrictions.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map(prod => (
                  <div
                    key={prod.id}
                    className="bg-slate-900/70 rounded-2xl border border-slate-800 p-4 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between group shadow-lg"
                  >
                    <div>
                      {/* Image */}
                      <div className="relative aspect-square rounded-xl bg-slate-950 p-4 overflow-hidden mb-3 border border-slate-800/80">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          onClick={() => onSelectProduct(prod.slug)}
                          className="w-full h-full object-contain cursor-pointer group-hover:scale-105 transition-transform duration-300"
                        />
                        {prod.discountPercent > 0 && (
                          <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                            -{prod.discountPercent}% OFF
                          </span>
                        )}

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

                      {/* Brand & Category */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="text-cyan-400 font-semibold">{prod.brandName}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="font-bold text-white">{prod.rating}</span>
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
            ) : (
              /* List View */
              <div className="space-y-4">
                {filteredProducts.map(prod => (
                  <div
                    key={prod.id}
                    className="bg-slate-900/70 rounded-2xl border border-slate-800 p-4 hover:border-slate-700 transition-all flex flex-col sm:flex-row gap-5 items-center group shadow-md"
                  >
                    <div className="w-full sm:w-44 aspect-square rounded-xl bg-slate-950 p-3 shrink-0 relative border border-slate-800">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        onClick={() => onSelectProduct(prod.slug)}
                        className="w-full h-full object-contain cursor-pointer group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 text-xs text-cyan-400 font-semibold mb-1">
                        <span>{prod.brandName}</span>
                        <span>•</span>
                        <span>{prod.categoryName}</span>
                      </div>

                      <h3
                        onClick={() => onSelectProduct(prod.slug)}
                        className="text-base font-bold text-white hover:text-cyan-400 cursor-pointer transition-colors"
                      >
                        {prod.name}
                      </h3>

                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {prod.description || prod.shortDescription}
                      </p>

                      <div className="flex items-center space-x-4 mt-3 text-xs text-slate-400">
                        <div className="flex items-center space-x-1 text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span className="font-bold text-white">{prod.rating}</span>
                          <span className="text-slate-500">({prod.reviewCount} reviews)</span>
                        </div>
                        <span className="text-emerald-400 font-semibold">
                          {prod.stock > 0 ? `${prod.stock} Units In Stock` : 'Out of stock'}
                        </span>
                      </div>
                    </div>

                    <div className="w-full sm:w-48 text-right shrink-0 flex flex-col justify-between sm:border-l sm:border-slate-800 sm:pl-5">
                      <div>
                        <div className="text-xl font-black text-white">
                          ৳{prod.discountedPrice.toLocaleString()}
                        </div>
                        {prod.discountPercent > 0 && (
                          <div className="text-xs text-slate-500 line-through">
                            ৳{prod.regularPrice.toLocaleString()} (-{prod.discountPercent}%)
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 mt-4">
                        <button
                          onClick={() => addToCart(prod, 1)}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center space-x-1"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                        <button
                          onClick={() => onQuickView(prod)}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors"
                        >
                          Quick View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
