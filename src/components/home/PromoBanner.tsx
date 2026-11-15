import React, { useState } from 'react';
import { api } from '../../services/api.ts';
import { useCart } from '../../context/CartContext.tsx';
import { Tag, Copy, Check, Headphones, Sparkles, ArrowRight } from 'lucide-react';

interface PromoBannerProps {
  onNavigateCategory: (categoryId: string) => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ onNavigateCategory }) => {
  const settings = api.getSettings();
  const { showToast } = useCart();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(settings.promoBannerCode || 'AUDIO2K');
    setCopied(true);
    showToast(`Coupon code ${settings.promoBannerCode || 'AUDIO2K'} copied to clipboard!`, 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="py-12 bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 border border-indigo-800/50 shadow-2xl p-8 sm:p-12">
          {/* Decorative Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-cyan-400 text-xs font-bold border border-indigo-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Special Weekend Voucher</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                {settings.promoBannerTitle}
              </h2>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                {settings.promoBannerSub}
              </p>

              {/* Coupon Copy Pill & Shop Button */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <div className="flex items-center space-x-2 bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-1.5 px-3">
                  <Tag className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-sm font-extrabold text-cyan-300 tracking-wider">
                    {settings.promoBannerCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs transition-colors flex items-center space-x-1 font-semibold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <button
                  onClick={() => onNavigateCategory('cat-audio')}
                  className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center space-x-2"
                >
                  <Headphones className="w-4 h-4 text-indigo-600" />
                  <span>Shop Audio Deals</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Visual Icon Art */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-cyan-500/20 border border-slate-700/60 flex items-center justify-center shadow-2xl">
                <Headphones className="w-24 h-24 text-cyan-400 drop-shadow-[0_10px_20px_rgba(56,189,248,0.3)] animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
