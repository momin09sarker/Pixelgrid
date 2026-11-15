import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Smartphone, CreditCard, Award } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-cyan-400" />,
      title: '100% Genuine & BTRC Approved',
      description: 'Every smartphone and tablet comes with verified IMEI registration and official national brand warranty.'
    },
    {
      icon: <Truck className="w-6 h-6 text-indigo-400" />,
      title: 'Same-Day & 48H Nationwide Delivery',
      description: 'Same-day delivery within Dhaka metro and 24 to 48 hours delivery across all 64 districts via Pathao and Steadfast.'
    },
    {
      icon: <CreditCard className="w-6 h-6 text-purple-400" />,
      title: 'Bangladesh Gateway Payments',
      description: 'Pay securely using bKash, Nagad, Rocket, Visa, Mastercard, or opt for Cash on Delivery upon inspection.'
    },
    {
      icon: <RotateCcw className="w-6 h-6 text-pink-400" />,
      title: '7-Day Replacement Guarantee',
      description: 'Zero hassle replacement if any manufacturing or hardware defect is discovered within 7 days of unboxing.'
    },
    {
      icon: <Smartphone className="w-6 h-6 text-emerald-400" />,
      title: 'Gaibandha Dispatch Hub',
      description: 'Strategically located fulfillment center on College Road, Gaibandha ensuring rapid dispatch to North and South Bengal.'
    },
    {
      icon: <Award className="w-6 h-6 text-amber-400" />,
      title: 'Official Brand Partnerships',
      description: 'Direct procurement from Samsung, Apple, Sony, ASUS ROG, and Logitech authorized distributors.'
    }
  ];

  return (
    <section className="py-16 bg-slate-950 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            The PixelGrid Distinction
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white">
            Why Tech Savvy Shoppers Choose Us
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            We eliminate grey-market risks by guaranteeing authentic serial numbers, official invoices, and nationwide support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-300 shadow-md group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {feat.icon}
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
