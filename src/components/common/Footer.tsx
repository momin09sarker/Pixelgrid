import React, { useState } from 'react';
import { api } from '../../services/api.ts';
import { useCart } from '../../context/CartContext.tsx';
import {
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Send,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const settings = api.getSettings();
  const { showToast } = useCart();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      showToast('Please provide a valid email address.', 'error');
      return;
    }
    const res = api.subscribeNewsletter(newsletterEmail);
    if (res) {
      setSubscribed(true);
      showToast('Thank you! You are now subscribed to PixelGrid Insider deals.', 'success');
    } else {
      showToast('You are already subscribed to our newsletter!', 'info');
    }
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Trust & Guarantee Banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="p-3 bg-indigo-600/10 text-cyan-400 rounded-xl">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Nationwide Express</h4>
                <p className="text-xs text-slate-400">Pathao & Steadfast across 64 districts</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="p-3 bg-indigo-600/10 text-emerald-400 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">100% Genuine Tech</h4>
                <p className="text-xs text-slate-400">Official BTRC approved with warranty</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="p-3 bg-indigo-600/10 text-purple-400 rounded-xl">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">7-Day Replacement</h4>
                <p className="text-xs text-slate-400">Hassle-free hardware return policy</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="p-3 bg-indigo-600/10 text-pink-400 rounded-xl">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Direct Tech Support</h4>
                <p className="text-xs text-slate-400">01774495356 • Mon-Sat 9AM-10PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-0.5">
                    <div className="w-1.5 h-1.5 rounded-xs bg-cyan-400" />
                    <div className="w-1.5 h-1.5 rounded-xs bg-indigo-500" />
                    <div className="w-1.5 h-1.5 rounded-xs bg-purple-500" />
                    <div className="w-1.5 h-1.5 rounded-xs bg-pink-500" />
                  </div>
                </div>
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                PIXEL<span className="text-cyan-400">GRID</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              "{settings.tagline}" — {settings.footerAbout}
            </p>

            <div className="space-y-2 pt-2 text-xs text-slate-300">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{settings.companyAddress}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-cyan-400 transition-colors">
                  {settings.contactEmail}
                </a>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <a href={`tel:${settings.contactPhone}`} className="hover:text-cyan-400 transition-colors">
                  {settings.contactPhone}
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Explore Tech
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-cyan-400 transition-colors">
                  Flagship Smartphones
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-cyan-400 transition-colors">
                  Pro Gaming Laptops
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-cyan-400 transition-colors">
                  ANC Wireless Audio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-cyan-400 transition-colors">
                  Mechanical Keyboards
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-cyan-400 transition-colors">
                  Drones & 4K Cameras
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Customer Support
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('track-order')} className="hover:text-cyan-400 transition-colors">
                  Live Order Tracking
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard', 'support')} className="hover:text-cyan-400 transition-colors">
                  Support Ticket Portal
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard', 'orders')} className="hover:text-cyan-400 transition-colors">
                  Invoices & History
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-cyan-400 transition-colors">
                  Warranty Verification
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="text-purple-400 hover:text-purple-300 transition-colors">
                  Admin Panel Login
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Newsletter Subscription
            </h3>
            <p className="text-xs text-slate-400">
              Subscribe to get exclusive voucher drops and flash sale alerts.
            </p>
            {subscribed ? (
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-medium bg-emerald-950/40 p-3 rounded-xl border border-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Subscribed! Check inbox for vouchers.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email..."
                  className="w-full text-xs px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-1.5"
                >
                  <span>Subscribe</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Payment Gateways & Logistics Badges */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Bangladesh Payment Gateways Supported
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-1 bg-pink-950/40 border border-pink-700/60 text-pink-300 font-bold text-xs rounded-lg">
                bKash
              </span>
              <span className="px-2.5 py-1 bg-orange-950/40 border border-orange-700/60 text-orange-300 font-bold text-xs rounded-lg">
                Nagad
              </span>
              <span className="px-2.5 py-1 bg-purple-950/40 border border-purple-700/60 text-purple-300 font-bold text-xs rounded-lg">
                Rocket (DBBL)
              </span>
              <span className="px-2.5 py-1 bg-emerald-950/40 border border-emerald-700/60 text-emerald-300 font-bold text-xs rounded-lg">
                Cash on Delivery (COD)
              </span>
              <span className="px-2.5 py-1 bg-blue-950/40 border border-blue-700/60 text-blue-300 font-bold text-xs rounded-lg">
                Visa / Mastercard
              </span>
            </div>
          </div>

          <div className="space-y-2 text-center md:text-right">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Official Courier Delivery Partners
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 text-xs font-semibold text-slate-300">
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg">Pathao Courier</span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg">Steadfast</span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg">RedX</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-slate-800/40 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} PixelGrid Bangladesh. All rights reserved. Built with precision for smart shoppers.</p>
          <p>College Road, Gaibandha • momin09sarker@gmail.com</p>
        </div>
      </div>
    </footer>
  );
};
