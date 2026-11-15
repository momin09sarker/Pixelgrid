import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { api } from '../../services/api.ts';
import { Product } from '../../types/index.ts';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Shield,
  Truck,
  Phone,
  Layers,
  ArrowRight,
  LogOut,
  SlidersHorizontal,
  Package,
  HelpCircle,
  Bell
} from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { user, isAdmin, openAuthModal, logout, switchToRole } = useAuth();
  const { itemCount, setIsCartOpen, wishlist } = useCart();
  const { language, setLanguage, t } = useLanguage();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const settings = api.getSettings();
  const categories = api.getCategories();
  const notifications = user ? api.getNotifications(user.id) : [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Scroll detection for sticky transparent-to-solid glass navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const allProducts = api.getProducts();
    const filtered = allProducts.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.brandName.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
    ).slice(0, 5);
    setSearchResults(filtered);
  }, [searchQuery]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectProduct = (slug: string) => {
    setIsSearchFocused(false);
    setSearchQuery('');
    onNavigate('product-details', slug);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchFocused(false);
    onNavigate('shop', searchQuery);
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* 1. Top Announcement Bar */}
      {settings.isAnnouncementEnabled && (
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white text-xs py-2 px-4 border-b border-indigo-900/40">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <p className="font-medium tracking-wide truncate max-w-xl text-slate-200">
                {settings.announcementText}
              </p>
            </div>

            <div className="flex items-center space-x-4 shrink-0 text-slate-300">
              <div className="hidden md:flex items-center space-x-1 hover:text-cyan-400 transition-colors">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>{settings.contactPhone}</span>
              </div>
              <div className="h-3 w-px bg-slate-700 hidden md:block" />
              
              {/* Language Switcher */}
              <div className="flex items-center space-x-1 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700">
                <button
                  onClick={() => setLanguage('en')}
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                    language === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('bn')}
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                    language === 'bn' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  বাংলা
                </button>
              </div>

              {/* Quick Role Switcher for Demo / Evaluation */}
              <div className="hidden lg:flex items-center space-x-1.5 bg-indigo-900/40 border border-indigo-500/30 px-2 py-0.5 rounded-full text-[11px]">
                <Shield className="w-3 h-3 text-cyan-400" />
                <span className="text-slate-300">Demo Mode:</span>
                <button
                  onClick={() => switchToRole('customer')}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    !isAdmin ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Customer
                </button>
                <button
                  onClick={() => switchToRole('admin')}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    isAdmin ? 'bg-purple-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Navigation Bar */}
      <nav
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-slate-900/95 backdrop-blur-md shadow-xl py-3 border-b border-slate-800'
            : 'bg-slate-900/90 backdrop-blur-sm py-4 border-b border-slate-800/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center space-x-6">
              <button
                onClick={() => onNavigate('home')}
                className="flex items-center space-x-2.5 text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-0.5">
                      <div className="w-2 h-2 rounded-xs bg-cyan-400" />
                      <div className="w-2 h-2 rounded-xs bg-indigo-500" />
                      <div className="w-2 h-2 rounded-xs bg-purple-500" />
                      <div className="w-2 h-2 rounded-xs bg-pink-500" />
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-xl font-extrabold tracking-tight text-white block">
                    PIXEL<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">GRID</span>
                  </span>
                  <span className="text-[10px] text-cyan-300 font-medium tracking-wider uppercase block -mt-1">
                    Gaibandha • BD
                  </span>
                </div>
              </button>

              {/* Categories Dropdown trigger (Desktop) */}
              <div className="relative hidden xl:block">
                <button
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700/60 transition-colors"
                >
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>{t('nav.categories')}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {categoriesOpen && (
                  <div
                    onMouseLeave={() => setCategoriesOpen(false)}
                    className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-slate-200 divide-y divide-slate-800"
                  >
                    <div className="p-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Shop By Category
                    </div>
                    <div className="pt-1">
                      {categories.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setCategoriesOpen(false);
                            onNavigate('shop', cat.id);
                          }}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs hover:bg-indigo-600/20 hover:text-cyan-300 text-left transition-colors"
                        >
                          <span className="font-medium">{language === 'bn' && cat.nameBn ? cat.nameBn : cat.name}</span>
                          <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                            {cat.itemCount}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Live Search Bar */}
            <div ref={searchRef} className="relative flex-1 max-w-xl mx-2">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder={t('search.placeholder')}
                  className="w-full bg-slate-950/80 text-slate-100 text-sm pl-11 pr-20 py-2.5 rounded-full border border-slate-700/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all placeholder:text-slate-500 shadow-inner"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-all shadow-md shadow-cyan-500/10"
                >
                  Search
                </button>
              </form>

              {/* Search Suggestions Dropdown */}
              {isSearchFocused && searchQuery.trim() && (
                <div className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="p-3 bg-slate-950/50 border-b border-slate-800 text-xs font-semibold text-slate-400 flex items-center justify-between">
                    <span>{t('search.suggestions')} for "{searchQuery}"</span>
                    <span className="text-cyan-400 text-[11px]">{searchResults.length} items found</span>
                  </div>
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-400">
                      No gadgets matching "{searchQuery}". Try "laptop", "Sony", or "drone".
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800">
                      {searchResults.map(prod => (
                        <div
                          key={prod.id}
                          onClick={() => handleSelectProduct(prod.slug)}
                          className="flex items-center p-3 hover:bg-slate-800/80 cursor-pointer transition-colors space-x-3"
                        >
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-white truncate">{prod.name}</h4>
                            <p className="text-xs text-slate-400">{prod.categoryName} • {prod.brandName}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-sm font-bold text-cyan-400">৳{prod.discountedPrice.toLocaleString()}</span>
                            {prod.discountPercent > 0 && (
                              <span className="block text-[10px] text-slate-400 line-through">
                                ৳{prod.regularPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="p-2.5 bg-slate-950/40 text-center">
                        <button
                          onClick={handleSearchSubmit}
                          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center justify-center space-x-1 mx-auto"
                        >
                          <span>View all results for "{searchQuery}"</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Action Icons & Menu */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Navigation Links (Desktop) */}
              <div className="hidden lg:flex items-center space-x-5 text-sm font-medium text-slate-300">
                <button
                  onClick={() => onNavigate('home')}
                  className={`hover:text-cyan-400 transition-colors ${currentView === 'home' ? 'text-cyan-400 font-bold' : ''}`}
                >
                  {t('nav.home')}
                </button>
                <button
                  onClick={() => onNavigate('shop')}
                  className={`hover:text-cyan-400 transition-colors ${currentView === 'shop' ? 'text-cyan-400 font-bold' : ''}`}
                >
                  {t('nav.shop')}
                </button>
                <button
                  onClick={() => onNavigate('track-order')}
                  className={`hover:text-cyan-400 transition-colors flex items-center space-x-1 ${currentView === 'track-order' ? 'text-cyan-400 font-bold' : ''}`}
                >
                  <Truck className="w-4 h-4 text-cyan-400" />
                  <span>{t('nav.track_order')}</span>
                </button>
              </div>

              {/* Wishlist */}
              <button
                onClick={() => onNavigate('dashboard', 'wishlist')}
                className="relative p-2 text-slate-300 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-slate-900">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Notifications */}
              {user && (
                <div ref={notifRef} className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-cyan-500 text-slate-950 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-slate-900">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                        <button
                          onClick={() => {
                            if (user) api.markAllNotificationsRead(user.id);
                          }}
                          className="text-[11px] text-cyan-400 hover:underline"
                        >
                          Mark all as read
                        </button>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60 mt-1">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400">No notifications yet.</div>
                        ) : (
                          notifications.map(n => (
                            <div
                              key={n.id}
                              onClick={() => {
                                api.markNotificationRead(n.id);
                                if (n.link === 'orders') onNavigate('dashboard', 'orders');
                                setNotificationsOpen(false);
                              }}
                              className={`p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                                !n.isRead ? 'bg-indigo-950/40 text-slate-200' : 'text-slate-400 hover:bg-slate-800/50'
                              }`}
                            >
                              <div className="font-semibold text-slate-200">{n.title}</div>
                              <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{n.message}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Shopping Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-3.5 py-2 rounded-xl shadow-lg shadow-indigo-600/30 transition-all font-semibold text-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">৳</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-[11px] font-bold">
                  {itemCount}
                </span>
              </button>

              {/* User Profile / Admin Menu */}
              <div ref={userMenuRef} className="relative">
                {user ? (
                  <div>
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-800 text-slate-200 transition-colors"
                    >
                      <img
                        src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500"
                      />
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                    </button>

                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-slate-200 divide-y divide-slate-800">
                        <div className="p-2.5">
                          <p className="text-xs text-slate-400">Signed in as</p>
                          <p className="text-sm font-bold text-white truncate">{user.name}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              isAdmin ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30' : 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/30'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                        </div>

                        <div className="py-1">
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setUserDropdownOpen(false);
                                onNavigate('admin');
                              }}
                              className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-purple-400 hover:bg-purple-950/40 rounded-xl transition-colors"
                            >
                              <Shield className="w-4 h-4" />
                              <span>Admin Control Panel</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onNavigate('dashboard', 'orders');
                            }}
                            className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
                          >
                            <Package className="w-4 h-4 text-indigo-400" />
                            <span>My Orders & Invoices</span>
                          </button>

                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onNavigate('dashboard', 'profile');
                            }}
                            className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
                          >
                            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                            <span>Edit Profile & Address</span>
                          </button>

                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onNavigate('dashboard', 'support');
                            }}
                            className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
                          >
                            <HelpCircle className="w-4 h-4 text-emerald-400" />
                            <span>Customer Support Tickets</span>
                          </button>
                        </div>

                        <div className="pt-1">
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>{t('nav.logout')}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => openAuthModal('login')}
                    className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-cyan-400" />
                    <span className="hidden sm:inline">{t('nav.login')}</span>
                  </button>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-950 border-b border-slate-800 p-4 space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('home');
                }}
                className="p-2.5 bg-slate-900 rounded-xl text-left text-slate-200"
              >
                {t('nav.home')}
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('shop');
                }}
                className="p-2.5 bg-slate-900 rounded-xl text-left text-slate-200"
              >
                {t('nav.shop')}
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('track-order');
                }}
                className="p-2.5 bg-slate-900 rounded-xl text-left text-slate-200"
              >
                {t('nav.track_order')}
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('dashboard', 'support');
                }}
                className="p-2.5 bg-slate-900 rounded-xl text-left text-slate-200"
              >
                Support Tickets
              </button>
            </div>

            {isAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('admin');
                }}
                className="w-full py-2.5 bg-purple-900/40 text-purple-300 font-bold text-xs rounded-xl border border-purple-700/50 flex items-center justify-center space-x-2"
              >
                <Shield className="w-4 h-4" />
                <span>Open Admin Dashboard</span>
              </button>
            )}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400">Language:</div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setLanguage('en')}
                  className={`text-xs px-2 py-1 rounded ${language === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('bn')}
                  className={`text-xs px-2 py-1 rounded ${language === 'bn' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                >
                  বাংলা
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
