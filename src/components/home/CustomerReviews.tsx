import React from 'react';
import { api } from '../../services/api.ts';
import { Star, ShieldCheck, Quote } from 'lucide-react';

export const CustomerReviews: React.FC = () => {
  const reviews = api.getReviews().filter(r => r.status === 'approved');

  return (
    <section className="py-16 bg-slate-900 border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            Verified Bangladesh Shoppers
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white">
            Loved by 15,000+ Tech Enthusiasts
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Read authentic reviews from customers who ordered flagship gadgets across all 8 divisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map(rev => (
            <div
              key={rev.id}
              className="bg-slate-950/80 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between shadow-xl relative"
            >
              <Quote className="w-8 h-8 text-indigo-500/20 absolute top-4 right-4" />
              <div>
                {/* Rating stars */}
                <div className="flex items-center space-x-1 text-amber-400 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
                    />
                  ))}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{rev.comment}"
                </p>

                {rev.images && rev.images.length > 0 && (
                  <div className="flex space-x-2 mt-4">
                    {rev.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="Review attachment"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-800"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={rev.userName}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{rev.userName}</h4>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {rev.verifiedPurchase && (
                  <span className="flex items-center space-x-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-2 py-0.5 rounded-md">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified Buyer</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
