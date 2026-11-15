import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { Header } from './components/common/Header.tsx';
import { Footer } from './components/common/Footer.tsx';
import { CartDrawer } from './components/cart/CartDrawer.tsx';
import { ToastContainer } from './components/common/ToastContainer.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { QuickViewModal } from './components/common/QuickViewModal.tsx';
import { InvoiceModal } from './components/common/InvoiceModal.tsx';
import { OrderTrackingModal } from './components/common/OrderTrackingModal.tsx';
import { HeroBanner } from './components/home/HeroBanner.tsx';
import { FlashSaleSection } from './components/home/FlashSaleSection.tsx';
import { CategorySection } from './components/home/CategorySection.tsx';
import { ProductGridSection } from './components/home/ProductGridSection.tsx';
import { PromoBanner } from './components/home/PromoBanner.tsx';
import { CustomerReviews } from './components/home/CustomerReviews.tsx';
import { WhyChooseUs } from './components/home/WhyChooseUs.tsx';
import { FaqSection } from './components/home/FaqSection.tsx';
import { ProductListing } from './components/shop/ProductListing.tsx';
import { ProductDetails } from './components/shop/ProductDetails.tsx';
import { CheckoutPage } from './components/checkout/CheckoutPage.tsx';
import { CustomerDashboard } from './components/customer/CustomerDashboard.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { Product, Order } from './types/index.ts';

function PixelGridApp() {
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'product-details' | 'checkout' | 'dashboard' | 'admin' | 'track-order'>('home');
  const [selectedProductSlug, setSelectedProductSlug] = useState<string>('pixelgrid-horizon-ultra-5g');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchParam, setSearchParam] = useState<string>('');
  const [dashboardTab, setDashboardTab] = useState<string>('orders');
  const [trackOrderNumber, setTrackOrderNumber] = useState<string>('');

  // Modals
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<Order | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedProductSlug]);

  const handleNavigate = (view: string, param?: string) => {
    if (view === 'product-details' && param) {
      setSelectedProductSlug(param);
      setCurrentView('product-details');
    } else if (view === 'shop') {
      if (param && param.startsWith('cat-')) {
        setSelectedCategory(param);
        setSearchParam('');
      } else if (param) {
        setSearchParam(param);
      } else {
        setSelectedCategory('all');
        setSearchParam('');
      }
      setCurrentView('shop');
    } else if (view === 'dashboard') {
      if (param) setDashboardTab(param);
      setCurrentView('dashboard');
    } else if (view === 'track-order') {
      if (param) setTrackOrderNumber(param);
      setCurrentView('track-order');
    } else {
      setCurrentView(view as any);
    }
  };

  const handleSelectProduct = (slug: string) => {
    setSelectedProductSlug(slug);
    setCurrentView('product-details');
  };

  const handleBuyNowFromQuickView = (product: Product, quantity: number, variantId?: string, color?: string, size?: string) => {
    setCurrentView('checkout');
  };

  const handleOpenTracking = (orderId: string) => {
    setTrackOrderNumber(orderId);
    setIsTrackingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Global Header */}
      <Header currentView={currentView} onNavigate={handleNavigate} />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <HeroBanner
              onNavigateShop={() => handleNavigate('shop')}
              onNavigateFlashSale={() => {
                const el = document.getElementById('flash-sale-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onSelectProduct={handleSelectProduct}
            />

            <div id="flash-sale-section">
              <FlashSaleSection
                onQuickView={prod => setQuickViewProduct(prod)}
                onSelectProduct={handleSelectProduct}
              />
            </div>

            <CategorySection
              onSelectCategory={catId => handleNavigate('shop', catId)}
            />

            <ProductGridSection
              onQuickView={prod => setQuickViewProduct(prod)}
              onSelectProduct={handleSelectProduct}
              onNavigateShop={() => handleNavigate('shop')}
            />

            <PromoBanner
              onNavigateCategory={catId => handleNavigate('shop', catId)}
            />

            <WhyChooseUs />

            <CustomerReviews />

            <FaqSection />
          </>
        )}

        {currentView === 'shop' && (
          <ProductListing
            initialCategory={selectedCategory}
            initialSearch={searchParam}
            onQuickView={prod => setQuickViewProduct(prod)}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'product-details' && (
          <ProductDetails
            slug={selectedProductSlug}
            onNavigateDetails={handleSelectProduct}
            onNavigateCheckout={() => setCurrentView('checkout')}
            onNavigateShop={() => handleNavigate('shop')}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            onOrderSuccess={order => {
              // Order completed
            }}
            onNavigateShop={() => handleNavigate('shop')}
            onNavigateTrack={orderNum => handleNavigate('track-order', orderNum)}
          />
        )}

        {currentView === 'dashboard' && (
          <CustomerDashboard
            initialTab={dashboardTab}
            onOpenInvoice={order => setActiveInvoiceOrder(order)}
            onTrackOrder={handleOpenTracking}
            onNavigateShop={() => handleNavigate('shop')}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            onOpenInvoice={order => setActiveInvoiceOrder(order)}
            onNavigateShop={() => handleNavigate('shop')}
          />
        )}

        {currentView === 'track-order' && (
          <div className="py-12 bg-slate-950">
            <OrderTrackingModal
              initialOrderId={trackOrderNumber}
              isStandalone={true}
            />
          </div>
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Cart Drawer Slide-over */}
      <CartDrawer
        onNavigateCheckout={() => setCurrentView('checkout')}
        onNavigateShop={() => handleNavigate('shop')}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onNavigateDetails={handleSelectProduct}
        onBuyNow={handleBuyNowFromQuickView}
      />

      {/* Official Tax Invoice Modal */}
      <InvoiceModal
        order={activeInvoiceOrder}
        onClose={() => setActiveInvoiceOrder(null)}
      />

      {/* Order Tracking Modal */}
      {isTrackingModalOpen && (
        <OrderTrackingModal
          initialOrderId={trackOrderNumber}
          onClose={() => setIsTrackingModalOpen(false)}
        />
      )}

      {/* Auth Modal (Login / Register / Google / Demo Switcher) */}
      <AuthModal />

      {/* Floating Toast Notification Stack */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <PixelGridApp />
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
