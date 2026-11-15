import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { api } from '../../services/api.ts';
import {
  Product,
  Order,
  OrderStatus,
  User,
  Coupon,
  PaymentGatewayConfig,
  WebsiteSettings,
  SupportTicket
} from '../../types/index.ts';
import {
  Shield,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  CreditCard,
  Tag,
  Settings,
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Search,
  Eye,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface AdminDashboardProps {
  onOpenInvoice: (order: Order) => void;
  onNavigateShop: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenInvoice, onNavigateShop }) => {
  const { user, isAdmin, switchToRole } = useAuth();
  const { showToast } = useCart();

  const [activeSection, setActiveSection] = useState<
    'overview' | 'products' | 'orders' | 'customers' | 'gateways' | 'coupons' | 'cms' | 'tickets'
  >('overview');

  // Dynamic storage refresh hook
  const [dataVersion, setDataVersion] = useState(0);
  const refresh = () => setDataVersion(v => v + 1);

  const products = api.getProducts();
  const orders = api.getOrders();
  const customers = api.getUsers();
  const coupons = api.getCoupons();
  const gateways = api.getPaymentGateways();
  const settings = api.getSettings();
  const tickets = api.getTickets();

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'completed' ? o.total : 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Confirmed').length;
  const lowStockCount = products.filter(p => p.stock < 8).length;

  // PRODUCT EDIT / CREATE MODAL STATE
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState(api.getCategories()[0]?.id || 'cat-smartphones');
  const [prodBrand, setProdBrand] = useState(api.getBrands()[0]?.id || 'b-samsung');
  const [prodRegPrice, setProdRegPrice] = useState(50000);
  const [prodDiscPrice, setProdDiscPrice] = useState(45000);
  const [prodStock, setProdStock] = useState(15);
  const [prodSku, setProdSku] = useState('');
  const [prodShortDesc, setProdShortDesc] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [prodIsFlashSale, setProdIsFlashSale] = useState(false);

  // ORDER UPDATE MODAL STATE
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderStatusToUpdate, setOrderStatusToUpdate] = useState<OrderStatus>('Processing');
  const [statusNote, setStatusNote] = useState('');
  const [courierName, setCourierName] = useState<'Pathao' | 'Steadfast' | 'RedX' | 'Paperfly'>('Pathao');
  const [trackingCode, setTrackingCode] = useState('');

  // COUPON CREATE STATE
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponValue, setNewCouponValue] = useState(10);
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponMin, setNewCouponMin] = useState(2000);

  // CMS SETTINGS STATE
  const [cmsHeadline, setCmsHeadline] = useState(settings.heroHeadline);
  const [cmsTagline, setCmsTagline] = useState(settings.tagline);
  const [cmsAnnouncement, setCmsAnnouncement] = useState(settings.announcementText);
  const [cmsIsAnnouncement, setCmsIsAnnouncement] = useState(settings.isAnnouncementEnabled);
  const [cmsAddress, setCmsAddress] = useState(settings.companyAddress);
  const [cmsEmail, setCmsEmail] = useState(settings.contactEmail);
  const [cmsPhone, setCmsPhone] = useState(settings.contactPhone);
  const [cmsInsideFee, setCmsInsideFee] = useState(settings.insideDhakaShippingFee);
  const [cmsOutsideFee, setCmsOutsideFee] = useState(settings.outsideDhakaShippingFee);

  // SUPPORT TICKET REPLY STATE
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyMessage, setTicketReplyMessage] = useState('');

  // Search in Orders
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter !== 'all' && o.orderStatus !== orderStatusFilter) return false;
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.trackingNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
      );
    }
    return true;
  });

  // Guard: Admin Check with One-Click Override
  if (!isAdmin) {
    return (
      <div className="bg-slate-950 text-white min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-purple-950/60 rounded-full flex items-center justify-center text-purple-400 mb-4 border border-purple-800">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Restricted Admin Control Access</h2>
        <p className="text-xs text-slate-400 max-w-sm mb-6">
          This portal requires PixelGrid executive permissions (role: admin). Switch to the Administrator profile below to test all control features.
        </p>
        <button
          onClick={() => switchToRole('admin')}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center space-x-2"
        >
          <Shield className="w-4 h-4" />
          <span>Switch to Admin Session (Momin Sarker)</span>
        </button>
      </div>
    );
  }

  // Handle Save Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    const cat = api.getCategories().find(c => c.id === prodCategory);
    const br = api.getBrands().find(b => b.id === prodBrand);

    api.saveProduct({
      id: editingProductId || undefined,
      name: prodName,
      categoryId: prodCategory,
      categoryName: cat ? cat.name : 'Smartphones',
      brandId: prodBrand,
      brandName: br ? br.name : 'Samsung',
      regularPrice: prodRegPrice,
      discountedPrice: prodDiscPrice,
      stock: prodStock,
      sku: prodSku || `PG-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      shortDescription: prodShortDesc,
      images: prodImage ? [prodImage] : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80'],
      isFeatured: prodIsFeatured,
      isFlashSale: prodIsFlashSale,
      isPublished: true,
    });

    setIsProductModalOpen(false);
    setEditingProductId(null);
    refresh();
    showToast('Product catalog updated successfully!', 'success');
  };

  const handleEditProductClick = (prod: Product) => {
    setEditingProductId(prod.id);
    setProdName(prod.name);
    setProdCategory(prod.categoryId);
    setProdBrand(prod.brandId);
    setProdRegPrice(prod.regularPrice);
    setProdDiscPrice(prod.discountedPrice);
    setProdStock(prod.stock);
    setProdSku(prod.sku);
    setProdShortDesc(prod.shortDescription);
    setProdImage(prod.images[0] || '');
    setProdIsFeatured(prod.isFeatured);
    setProdIsFlashSale(prod.isFlashSale);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to remove this product from the PixelGrid store?')) {
      api.deleteProduct(id);
      refresh();
      showToast('Product deleted.', 'info');
    }
  };

  // Handle Order Status Update
  const handleUpdateOrderStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    api.updateOrderStatus(
      selectedOrder.id,
      orderStatusToUpdate,
      statusNote,
      user?.name || 'Admin',
      courierName,
      trackingCode || selectedOrder.courierTrackingCode
    );

    setSelectedOrder(null);
    setStatusNote('');
    refresh();
    showToast(`Order status changed to ${orderStatusToUpdate}`, 'success');
  };

  // Handle Create Coupon
  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    api.saveCoupon({
      code: newCouponCode,
      discountType: newCouponType,
      discountValue: newCouponValue,
      minOrderValue: newCouponMin,
      expiryDate: '2026-12-31',
      isActive: true,
    });

    setNewCouponCode('');
    refresh();
    showToast(`Coupon ${newCouponCode.toUpperCase()} activated!`, 'success');
  };

  const handleDeleteCoupon = (id: string) => {
    api.deleteCoupon(id);
    refresh();
    showToast('Coupon removed.', 'info');
  };

  // Handle CMS Save
  const handleSaveCms = (e: React.FormEvent) => {
    e.preventDefault();
    api.updateSettings({
      heroHeadline: cmsHeadline,
      tagline: cmsTagline,
      announcementText: cmsAnnouncement,
      isAnnouncementEnabled: cmsIsAnnouncement,
      companyAddress: cmsAddress,
      contactEmail: cmsEmail,
      contactPhone: cmsPhone,
      insideDhakaShippingFee: Number(cmsInsideFee),
      outsideDhakaShippingFee: Number(cmsOutsideFee),
    });
    refresh();
    showToast('Website CMS & Logistics fees updated in database!', 'success');
  };

  // Handle Ticket Reply
  const handleSendAdminTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !ticketReplyMessage.trim()) return;

    api.replyTicket(activeTicket.id, 'support', `${user?.name || 'Admin'} (Support Lead)`, ticketReplyMessage);
    setTicketReplyMessage('');
    setActiveTicket(null);
    refresh();
    showToast('Support reply delivered to customer dashboard!', 'success');
  };

  return (
    <div className="bg-slate-950 text-white min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl border border-purple-800/50 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-lg">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-white">PixelGrid Command Center</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-500/40 uppercase">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Gaibandha Central Hub Operations • Full Database Control & Logistics Administration
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onNavigateShop}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors"
            >
              Live Store View
            </button>
            <button
              onClick={() => switchToRole('customer')}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              Switch to Customer
            </button>
          </div>
        </div>

        {/* Admin Navigation Pills */}
        <div className="flex space-x-2 overflow-x-auto pb-2 border-b border-slate-800">
          {[
            { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: 'orders', label: `Orders (${orders.length})`, icon: <ShoppingCart className="w-4 h-4" /> },
            { id: 'products', label: `Products (${products.length})`, icon: <Package className="w-4 h-4" /> },
            { id: 'customers', label: `Customers (${customers.length})`, icon: <Users className="w-4 h-4" /> },
            { id: 'gateways', label: 'Payment Settings', icon: <CreditCard className="w-4 h-4" /> },
            { id: 'coupons', label: `Coupons (${coupons.length})`, icon: <Tag className="w-4 h-4" /> },
            { id: 'cms', label: 'Website CMS', icon: <Settings className="w-4 h-4" /> },
            { id: 'tickets', label: `Support (${tickets.length})`, icon: <HelpCircle className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                activeSection === tab.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 1. OVERVIEW SECTION */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Total Revenue</span>
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">৳{totalRevenue.toLocaleString()}</div>
                <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">Paid Orders in BDT</span>
              </div>

              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Total Orders</span>
                  <div className="p-2 bg-indigo-500/20 text-cyan-400 rounded-xl">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">{totalOrders}</div>
                <span className="text-[11px] text-cyan-400 font-semibold mt-1 block">{pendingOrders} Actionable</span>
              </div>

              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Active Products</span>
                  <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">{products.length}</div>
                <span className="text-[11px] text-purple-300 font-semibold mt-1 block">Across 6 Categories</span>
              </div>

              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Low Stock Warning</span>
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-400">{lowStockCount} Items</div>
                <span className="text-[11px] text-slate-400 font-semibold mt-1 block">Less than 8 in warehouse</span>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">Recent Orders Stream</h3>
                <button
                  onClick={() => setActiveSection('orders')}
                  className="text-xs text-cyan-400 hover:underline font-bold"
                >
                  View All Orders
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="py-2.5">Order Number</th>
                      <th className="py-2.5">Customer</th>
                      <th className="py-2.5">Total (BDT)</th>
                      <th className="py-2.5">Payment</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {orders.slice(0, 5).map(o => (
                      <tr key={o.id} className="hover:bg-slate-850/50">
                        <td className="py-3 font-mono font-bold text-cyan-400">{o.orderNumber}</td>
                        <td className="py-3">
                          <p className="font-bold text-white">{o.customerName}</p>
                          <p className="text-[10px] text-slate-400">{o.shippingAddress.district}</p>
                        </td>
                        <td className="py-3 font-bold text-white">৳{o.total.toLocaleString()}</td>
                        <td className="py-3">
                          <span className="uppercase text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800">
                            {o.paymentMethod} ({o.paymentStatus})
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                            {o.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => onOpenInvoice(o)}
                            className="p-1 text-slate-400 hover:text-white"
                            title="Invoice"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. ORDER MANAGEMENT SECTION */}
        {activeSection === 'orders' && (
          <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-800 gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Order Logistics & Courier Dispatch</h2>
                <p className="text-xs text-slate-400">Update order fulfillment status, assign Pathao/Steadfast, and manage refunds.</p>
              </div>

              {/* Order Search & Filter */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={e => setOrderSearchQuery(e.target.value)}
                    placeholder="Search by order #, phone..."
                    className="text-xs pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={e => setOrderStatusFilter(e.target.value)}
                  className="text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="py-3">Order Number</th>
                    <th className="py-3">Customer & Phone</th>
                    <th className="py-3">Delivery Destination</th>
                    <th className="py-3">Courier</th>
                    <th className="py-3">Payment</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-800/30">
                      <td className="py-3.5 font-mono font-bold text-cyan-400">
                        {order.orderNumber}
                        <span className="block text-[10px] text-slate-500 font-sans">
                          {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <p className="font-bold text-white">{order.customerName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{order.customerPhone}</p>
                      </td>
                      <td className="py-3.5">
                        <p className="text-white">{order.shippingAddress.district}, {order.shippingAddress.division}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-xs">{order.shippingAddress.address}</p>
                      </td>
                      <td className="py-3.5">
                        <span className="font-bold text-purple-300">{order.courierName || 'Unassigned'}</span>
                        <span className="block text-[10px] font-mono text-slate-400">{order.courierTrackingCode || 'No code'}</span>
                      </td>
                      <td className="py-3.5">
                        <span className="font-bold text-white">৳{order.total.toLocaleString()}</span>
                        <span className="block text-[10px] uppercase text-emerald-400">{order.paymentMethod}</span>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setOrderStatusToUpdate(order.orderStatus);
                            setCourierName(order.courierName || 'Pathao');
                            setTrackingCode(order.courierTrackingCode || '');
                          }}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[11px]"
                        >
                          Update Status
                        </button>
                        <button
                          onClick={() => onOpenInvoice(order)}
                          className="p-1 text-slate-400 hover:text-white"
                          title="Print Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. PRODUCT MANAGEMENT SECTION */}
        {activeSection === 'products' && (
          <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white">Product Catalog & Inventory</h2>
                <p className="text-xs text-slate-400">Manage hardware products, pricing, stock levels, and flash sale discounts.</p>
              </div>

              <button
                onClick={() => {
                  setEditingProductId(null);
                  setProdName('');
                  setProdSku(`PG-SKU-${Math.floor(1000 + Math.random() * 9000)}`);
                  setProdRegPrice(45000);
                  setProdDiscPrice(39900);
                  setProdStock(20);
                  setProdShortDesc('');
                  setProdImage('');
                  setIsProductModalOpen(true);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="py-3">Product</th>
                    <th className="py-3">Category</th>
                    <th className="py-3">Price</th>
                    <th className="py-3">Stock</th>
                    <th className="py-3">Tags</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {products.map(prod => (
                    <tr key={prod.id} className="hover:bg-slate-800/30">
                      <td className="py-3">
                        <div className="flex items-center space-x-3">
                          <img src={prod.images[0]} alt={prod.name} className="w-10 h-10 object-contain rounded-lg bg-slate-950 p-1" />
                          <div>
                            <p className="font-bold text-white truncate max-w-xs">{prod.name}</p>
                            <span className="text-[10px] text-slate-400 font-mono">SKU: {prod.sku} • {prod.brandName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-slate-300">{prod.categoryName}</td>
                      <td className="py-3">
                        <span className="font-bold text-white">৳{prod.discountedPrice.toLocaleString()}</span>
                        {prod.discountPercent > 0 && (
                          <span className="block text-[10px] text-slate-500 line-through">৳{prod.regularPrice.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className={`font-bold ${prod.stock < 8 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {prod.stock} units
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1">
                          {prod.isFeatured && (
                            <span className="text-[9px] bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800">
                              Featured
                            </span>
                          )}
                          {prod.isFlashSale && (
                            <span className="text-[9px] bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded border border-rose-800">
                              Flash Sale
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-right space-x-1.5">
                        <button
                          onClick={() => handleEditProductClick(prod)}
                          className="p-1 text-slate-400 hover:text-cyan-400"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1 text-slate-400 hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. CUSTOMER MANAGEMENT */}
        {activeSection === 'customers' && (
          <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
            <div className="pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Registered Customer Accounts</h2>
              <p className="text-xs text-slate-400">View customer identities, delivery locations, and account privileges.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="py-3">Customer</th>
                    <th className="py-3">Phone & Email</th>
                    <th className="py-3">Location</th>
                    <th className="py-3">Role</th>
                    <th className="py-3">Account Status</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {customers.map(c => (
                    <tr key={c.id} className="hover:bg-slate-800/30">
                      <td className="py-3.5">
                        <div className="flex items-center space-x-2.5">
                          <img src={c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80'} alt={c.name} className="w-8 h-8 rounded-full object-cover" />
                          <span className="font-bold text-white">{c.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <p className="font-mono text-slate-300">{c.phone}</p>
                        <p className="text-slate-400 text-[10px]">{c.email}</p>
                      </td>
                      <td className="py-3.5 text-slate-300">
                        {c.district ? `${c.district}, ${c.division}` : 'Gaibandha, Bangladesh'}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.role === 'admin' ? 'bg-purple-900/60 text-purple-300 border border-purple-700' : 'bg-cyan-900/60 text-cyan-300 border border-cyan-700'
                        }`}>
                          {c.role}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          c.isBlocked ? 'bg-rose-950 text-rose-400' : 'bg-emerald-950 text-emerald-400'
                        }`}>
                          {c.isBlocked ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => {
                            api.toggleBlockUser(c.id);
                            refresh();
                            showToast(c.isBlocked ? 'User unblocked' : 'User account blocked', 'info');
                          }}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                            c.isBlocked ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-rose-400'
                          }`}
                        >
                          {c.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. PAYMENT GATEWAY SETTINGS (BANGLADESH) */}
        {activeSection === 'gateways' && (
          <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
            <div className="pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Bangladesh Payment Gateway Configuration</h2>
              <p className="text-xs text-slate-400">
                Configure bKash, Nagad, Rocket, Cash on Delivery, and SSLCommerz credentials and sandbox parameters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gateways.map(gw => (
                <div key={gw.id} className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                    <h3 className="text-sm font-bold text-white">{gw.name}</h3>
                    <button
                      onClick={() => {
                        api.updatePaymentGateway(gw.id, { isEnabled: !gw.isEnabled });
                        refresh();
                        showToast(`${gw.name} ${gw.isEnabled ? 'disabled' : 'enabled'}`, 'info');
                      }}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        gw.isEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {gw.isEnabled ? 'Active' : 'Disabled'}
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Merchant / Account Number</label>
                      <input
                        type="text"
                        defaultValue={gw.merchantNumber}
                        onBlur={e => {
                          api.updatePaymentGateway(gw.id, { merchantNumber: e.target.value });
                          refresh();
                        }}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Checkout Payment Instructions</label>
                      <textarea
                        rows={2}
                        defaultValue={gw.instructions}
                        onBlur={e => {
                          api.updatePaymentGateway(gw.id, { instructions: e.target.value });
                          refresh();
                        }}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={gw.isSandbox}
                          onChange={e => {
                            api.updatePaymentGateway(gw.id, { isSandbox: e.target.checked });
                            refresh();
                          }}
                          className="rounded bg-slate-900 border-slate-700 text-purple-600"
                        />
                        <span>Sandbox Test Mode</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. COUPON MANAGEMENT */}
        {activeSection === 'coupons' && (
          <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
            <div className="pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Coupons & Promotional Vouchers</h2>
              <p className="text-xs text-slate-400">Create promotional codes for holidays, Eid discounts, and tech fest campaigns.</p>
            </div>

            {/* Create Coupon Form */}
            <form onSubmit={handleCreateCoupon} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={newCouponCode}
                  onChange={e => setNewCouponCode(e.target.value)}
                  placeholder="e.g. SUMMER20"
                  className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono uppercase"
                />
              </div>

              <div className="w-32">
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Type</label>
                <select
                  value={newCouponType}
                  onChange={e => setNewCouponType(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="percentage">Percent (%)</option>
                  <option value="fixed">Fixed BDT (৳)</option>
                </select>
              </div>

              <div className="w-28">
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Value</label>
                <input
                  type="number"
                  required
                  value={newCouponValue}
                  onChange={e => setNewCouponValue(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="w-32">
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Min Spend (৳)</label>
                <input
                  type="number"
                  value={newCouponMin}
                  onChange={e => setNewCouponMin(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-md transition-colors"
              >
                Add Voucher
              </button>
            </form>

            {/* Coupons List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {coupons.map(c => (
                <div key={c.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-black text-sm text-cyan-400">{c.code}</span>
                    <button
                      onClick={() => handleDeleteCoupon(c.id)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-white font-bold">
                    {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `৳${c.discountValue.toLocaleString()} Discount`}
                  </p>
                  <p className="text-[11px] text-slate-400">Min Order: ৳{c.minOrderValue.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500">Used: {c.usedCount} times</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. WEBSITE CMS & SETTINGS */}
        {activeSection === 'cms' && (
          <form onSubmit={handleSaveCms} className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white">Website CMS & Logistics Settings</h2>
                <p className="text-xs text-slate-400">Edit homepage hero banner, top announcement, shipping rates, and business address.</p>
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Save CMS Settings
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Hero Title</label>
                <input
                  type="text"
                  value={cmsHeadline}
                  onChange={e => setCmsHeadline(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company Tagline</label>
                <input
                  type="text"
                  value={cmsTagline}
                  onChange={e => setCmsTagline(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">Top Announcement Bar Text</label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cmsIsAnnouncement}
                      onChange={e => setCmsIsAnnouncement(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-purple-600"
                    />
                    <span className="text-[11px] text-cyan-400">Active</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={cmsAnnouncement}
                  onChange={e => setCmsAnnouncement(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contact Email</label>
                <input
                  type="email"
                  value={cmsEmail}
                  onChange={e => setCmsEmail(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Support Phone</label>
                <input
                  type="text"
                  value={cmsPhone}
                  onChange={e => setCmsPhone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Official Address</label>
                <input
                  type="text"
                  value={cmsAddress}
                  onChange={e => setCmsAddress(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Inside Dhaka Shipping Fee (BDT ৳)</label>
                <input
                  type="number"
                  value={cmsInsideFee}
                  onChange={e => setCmsInsideFee(Number(e.target.value))}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Outside Dhaka Shipping Fee (BDT ৳)</label>
                <input
                  type="number"
                  value={cmsOutsideFee}
                  onChange={e => setCmsOutsideFee(Number(e.target.value))}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
            </div>
          </form>
        )}

        {/* 8. SUPPORT TICKETS MANAGEMENT */}
        {activeSection === 'tickets' && (
          <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
            <div className="pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Customer Support Inquiries</h2>
              <p className="text-xs text-slate-400">Respond to customer inquiries, resolve disputes, and assist with warranties.</p>
            </div>

            <div className="space-y-4">
              {tickets.map(t => (
                <div key={t.id} className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-cyan-400">{t.ticketNumber}</span>
                        <span className="text-xs font-bold text-white">{t.subject}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{t.userName} ({t.userEmail}) • {t.department}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-950 text-purple-300 border border-purple-800">
                      {t.status}
                    </span>
                  </div>

                  {/* Messages */}
                  <div className="space-y-2 bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
                    {t.messages.map(m => (
                      <div key={m.id} className="p-2 rounded bg-slate-950">
                        <span className="font-bold text-slate-300">{m.senderName}: </span>
                        <span className="text-slate-400">{m.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      onClick={() => {
                        api.updateTicketStatus(t.id, 'Resolved');
                        refresh();
                        showToast('Ticket marked as Resolved.', 'success');
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => setActiveTicket(t)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg"
                    >
                      Reply to Customer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PRODUCT CREATE / EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setIsProductModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl z-10 space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingProductId ? 'Edit Product Details' : 'Add New Hardware Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={e => setProdName(e.target.value)}
                  placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={e => setProdCategory(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    {api.getCategories().map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Brand</label>
                  <select
                    value={prodBrand}
                    onChange={e => setProdBrand(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    {api.getBrands().map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Regular Price (৳)</label>
                  <input
                    type="number"
                    required
                    value={prodRegPrice}
                    onChange={e => setProdRegPrice(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Discount Price (৳)</label>
                  <input
                    type="number"
                    required
                    value={prodDiscPrice}
                    onChange={e => setProdDiscPrice(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Warehouse Stock</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={e => setProdStock(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Product Image URL</label>
                <input
                  type="url"
                  value={prodImage}
                  onChange={e => setProdImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={prodShortDesc}
                  onChange={e => setProdShortDesc(e.target.value)}
                  placeholder="Key highlight specs..."
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="flex space-x-4 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsFeatured}
                    onChange={e => setProdIsFeatured(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-purple-600"
                  />
                  <span>Featured on Home</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsFlashSale}
                    onChange={e => setProdIsFlashSale(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-rose-600"
                  />
                  <span>Flash Sale Deal</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER STATUS UPDATE MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-md bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl z-10 space-y-4">
            <h3 className="text-base font-bold text-white">
              Update Order #{selectedOrder.orderNumber}
            </h3>

            <form onSubmit={handleUpdateOrderStatus} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Order Status</label>
                <select
                  value={orderStatusToUpdate}
                  onChange={e => setOrderStatusToUpdate(e.target.value as any)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Courier Partner</label>
                <select
                  value={courierName}
                  onChange={e => setCourierName(e.target.value as any)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  <option value="Pathao">Pathao Express</option>
                  <option value="Steadfast">Steadfast Courier</option>
                  <option value="RedX">RedX Logistics</option>
                  <option value="Paperfly">Paperfly</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Courier Tracking Code</label>
                <input
                  type="text"
                  value={trackingCode}
                  onChange={e => setTrackingCode(e.target.value)}
                  placeholder="e.g. PTH-DHK-92812"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Status Note</label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={e => setStatusNote(e.target.value)}
                  placeholder="e.g. Package handed over to courier delivery hero"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg"
                >
                  Apply Status Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUPPORT TICKET REPLY MODAL */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setActiveTicket(null)} />
          <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl z-10 space-y-4">
            <h3 className="text-base font-bold text-white">
              Reply to Ticket {activeTicket.ticketNumber} ({activeTicket.userName})
            </h3>

            <form onSubmit={handleSendAdminTicketReply} className="space-y-3.5 text-xs">
              <textarea
                rows={4}
                required
                value={ticketReplyMessage}
                onChange={e => setTicketReplyMessage(e.target.value)}
                placeholder="Type your official support response here..."
                className="w-full text-xs p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
              />

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTicket(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg"
                >
                  Send Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
