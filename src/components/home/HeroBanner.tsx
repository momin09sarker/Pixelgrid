import React from 'react';
import { api } from '../../services/api.ts';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Truck, CheckCircle2 } from 'lucide-react';

interface HeroBannerProps {
  onNavigateShop: () => void;
  onNavigateFlashSale: () => void;
  onSelectProduct: (slug: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onNavigateShop,
  onNavigateFlashSale,
  onSelectProduct
}) => {
  const settings = api.getSettings();
  const featuredProduct = api.getProductBySlug('pixelgrid-horizon-ultra-5g') || api.getProducts()[0];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-16 lg:py-24 border-b border-slate-800">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
          backgroundSize: '36px 36px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-lg shadow-cyan-500/10">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Flagship Tech Marketplace • Bangladesh</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-slate-300 font-mono text-[11px]">BDT ৳</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Shop Smart.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">
                Live Digital.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {settings.heroSubheadline}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onNavigateShop}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>{settings.heroCtaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onNavigateFlashSale}
                className="w-full sm:w-auto px-7 py-4 bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold text-sm rounded-2xl border border-slate-700/80 transition-all flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Live Flash Sales</span>
              </button>
            </div>

            {/* Trust Badges Bar */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-3 text-left">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Genuine</span>
                </div>
                <p className="text-[11px] text-slate-400">BTRC Approved</p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                  <Truck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Fast Delivery</span>
                </div>
                <p className="text-[11px] text-slate-400">Across 64 Districts</p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Official Warranty</span>
                </div>
                <p className="text-[11px] text-slate-400">7-Day Replacement</p>
              </div>
            </div>
          </div>

          {/* Right Product Spotlight Hero Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md bg-gradient-to-b from-slate-900/90 to-slate-950/90 rounded-3xl p-6 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
              <div className="absolute -top-3 right-6 bg-gradient-to-r from-rose-500 to-purple-600 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-lg flex items-center space-x-1">
                <Zap className="w-3 h-3 fill-white" />
                <span>HOT DEAL -{featuredProduct.discountPercent}%</span>
              </div>

              <div
                className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-950/60 p-4 border border-slate-800 cursor-pointer group"
                onClick={() => onSelectProduct(featuredProduct.slug)}
              >
                <img
                  src={featuredProduct.images[0]}
                  alt={featuredProduct.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-cyan-400">{featuredProduct.brandName}</span>
                  <span>SKU: {featuredProduct.sku}</span>
                </div>

                <h3
                  onClick={() => onSelectProduct(featuredProduct.slug)}
                  className="text-base font-bold text-white hover:text-cyan-400 cursor-pointer transition-colors truncate"
                >
                  {featuredProduct.name}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {featuredProduct.shortDescription}
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-black text-cyan-400">
                      ৳{featuredProduct.discountedPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 line-through ml-2">
                      ৳{featuredProduct.regularPrice.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectProduct(featuredProduct.slug)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center space-x-1"
                  >
                    <span>View Deal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
