import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { api } from '../../services/api.ts';
import { Order, SupportTicket } from '../../types/index.ts';
import { BD_LOCATIONS } from '../../services/mockData.ts';
import {
  User as UserIcon,
  Package,
  Heart,
  Truck,
  FileText,
  HelpCircle,
  Bell,
  Lock,
  LogOut,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  Printer,
  ShoppingBag,
  Send,
  Plus,
  Shield,
  Trash2
} from 'lucide-react';

interface CustomerDashboardProps {
  initialTab?: string;
  onOpenInvoice: (order: Order) => void;
  onTrackOrder: (orderId: string) => void;
  onNavigateShop: () => void;
  onSelectProduct: (slug: string) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  initialTab = 'orders',
  onOpenInvoice,
  onTrackOrder,
  onNavigateShop,
  onSelectProduct
}) => {
  const { user, updateProfile, logout, openAuthModal } = useAuth();
  const { wishlist, toggleWishlist, addToCart, showToast } = useCart();

  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [division, setDivision] = useState(user?.division || 'Dhaka');
  const [district, setDistrict] = useState(user?.district || 'Dhaka');
  const [upazila, setUpazila] = useState(user?.upazila || '');
  const [postalCode, setPostalCode] = useState(user?.postalCode || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(user?.gender || 'male');
  const [profileSaving, setProfileSaving] = useState(false);

  // Support Ticket Form State
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDept, setTicketDept] = useState<SupportTicket['department']>('Product Inquiry');
  const [ticketPriority, setTicketPriority] = useState<SupportTicket['priority']>('Medium');
  const [ticketMessage, setTicketMessage] = useState('');
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!user) {
    return (
      <div className="bg-slate-950 text-white min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-slate-400 mb-4 border border-slate-800">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Customer Account Access</h2>
        <p className="text-xs text-slate-400 max-w-sm mb-6">
          Sign in to view your placed orders, track real-time shipments, manage delivery addresses, and download official invoices.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const orders = api.getOrdersByCustomer(user.id);
  const tickets = api.getTicketsByUser(user.id);
  const notifications = api.getNotifications(user.id);
  const wishlistProducts = api.getProducts().filter(p => wishlist.includes(p.id));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    const success = await updateProfile({
      name,
      phone,
      address,
      division,
      district,
      upazila,
      postalCode,
      gender
    });
    setProfileSaving(false);
    if (success) {
      showToast('Profile and Bangladesh address updated successfully!', 'success');
    }
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    api.createTicket({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      subject: ticketSubject,
      department: ticketDept,
      priority: ticketPriority,
      initialMessage: ticketMessage
    });

    setIsCreatingTicket(false);
    setTicketSubject('');
    setTicketMessage('');
    showToast('Support ticket created. Our Gaibandha desk will reply shortly!', 'success');
  };

  const handleSendTicketReply = (ticketId: string) => {
    if (!replyText.trim()) return;
    api.replyTicket(ticketId, 'user', user.name, replyText);
    setReplyText('');
    showToast('Reply sent to support desk.', 'info');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password changed securely!', 'success');
  };

  return (
    <div className="bg-slate-950 text-white min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Profile Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-cyan-400 shadow-lg"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">{user.name}</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{user.email} • {user.phone}</p>
              <p className="text-[11px] text-slate-500">
                {user.address ? `${user.address}, ${user.district}` : 'Gaibandha / Dhaka Hub Member'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 text-center min-w-[100px]">
              <span className="block text-slate-400 text-[10px] uppercase font-bold">Total Orders</span>
              <span className="font-extrabold text-cyan-400 text-base">{orders.length}</span>
            </div>
            <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 text-center min-w-[100px]">
              <span className="block text-slate-400 text-[10px] uppercase font-bold">Wishlist</span>
              <span className="font-extrabold text-purple-400 text-base">{wishlist.length}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Navigation Sidebar (3 cols) */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800 space-y-1">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>My Orders ({orders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>Edit Profile & Address</span>
              </button>

              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'wishlist' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>My Wishlist ({wishlist.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('tickets')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'tickets' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Support Tickets ({tickets.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'notifications' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'security' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Security & Password</span>
              </button>

              <div className="pt-2 border-t border-slate-800 mt-2">
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Dashboard Panel (9 cols) */}
          <div className="lg:col-span-9">
            {/* TAB: ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-white">Order History & Shipments</h2>
                    <p className="text-xs text-slate-400">Track current consignments, view status logs, or print official tax invoices.</p>
                  </div>
                  <button
                    onClick={onNavigateShop}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Shop New Items
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-slate-900/60 rounded-3xl p-12 text-center border border-slate-800">
                    <Package className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-white">No Orders Placed Yet</h3>
                    <p className="text-xs text-slate-400 mt-1 mb-4">You have not placed any orders yet on PixelGrid.</p>
                    <button
                      onClick={onNavigateShop}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
                    >
                      Browse Tech
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div
                        key={order.id}
                        className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-lg space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                          <div className="flex items-center space-x-3">
                            <span className="font-mono font-bold text-sm text-cyan-400">{order.orderNumber}</span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-slate-400">
                              {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 border border-emerald-700/60 text-emerald-400">
                              {order.orderStatus}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono uppercase bg-slate-800 text-slate-300">
                              {order.paymentMethod} ({order.paymentStatus})
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-3">
                                <img src={it.product.images[0]} alt={it.product.name} className="w-10 h-10 object-contain rounded-lg bg-slate-950 p-1" />
                                <div>
                                  <p className="font-bold text-white truncate max-w-sm">{it.product.name}</p>
                                  <span className="text-[11px] text-slate-400">
                                    Qty: {it.quantity} • {it.variantName || 'Standard'}
                                  </span>
                                </div>
                              </div>
                              <span className="font-bold text-white">৳{(it.unitPrice * it.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        {/* Order Action Buttons */}
                        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="text-xs text-slate-400">
                            Total: <strong className="text-base text-cyan-400 font-black ml-1">৳{order.total.toLocaleString()}</strong>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => onTrackOrder(order.orderNumber)}
                              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Track Consignment</span>
                            </button>

                            <button
                              onClick={() => onOpenInvoice(order)}
                              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>View Invoice</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: PROFILE & ADDRESS */}
            {activeTab === 'profile' && (
              <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Customer Profile & Shipping Address</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Keep your contact phone, district, and shipping address up to date for fast checkout.</p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number (Bangladesh)</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Division</label>
                      <select
                        value={division}
                        onChange={e => {
                          const newDiv = e.target.value;
                          setDivision(newDiv);
                          const firstDist = (BD_LOCATIONS as Record<string, string[]>)[newDiv]?.[0] || 'Dhaka';
                          setDistrict(firstDist);
                        }}
                        className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      >
                        {Object.keys(BD_LOCATIONS).map(div => (
                          <option key={div} value={div}>{div} Division</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">District</label>
                      <select
                        value={district}
                        onChange={e => setDistrict(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      >
                        {((BD_LOCATIONS as Record<string, string[]>)[division] || ['Dhaka']).map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Upazila / Thana</label>
                      <input
                        type="text"
                        value={upazila}
                        onChange={e => setUpazila(e.target.value)}
                        placeholder="e.g. Gaibandha Sadar, Gulshan"
                        className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Postal Code</label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={e => setPostalCode(e.target.value)}
                        placeholder="e.g. 5700, 1212"
                        className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Street Address, House & Road</label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="e.g. College Road, Gaibandha"
                      className="w-full text-xs p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* TAB: WISHLIST */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-white">Saved Wishlist Items</h2>
                    <p className="text-xs text-slate-400">Save gadgets you love and add them to your cart when ready.</p>
                  </div>
                  <span className="text-xs text-cyan-400 font-bold">{wishlistProducts.length} saved</span>
                </div>

                {wishlistProducts.length === 0 ? (
                  <div className="bg-slate-900/60 rounded-3xl p-12 text-center border border-slate-800">
                    <Heart className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-white">Your Wishlist is Empty</h3>
                    <p className="text-xs text-slate-400 mt-1 mb-4">Click the heart icon on any product to save it here.</p>
                    <button
                      onClick={onNavigateShop}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
                    >
                      Explore Products
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {wishlistProducts.map(prod => (
                      <div
                        key={prod.id}
                        className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between group shadow-md"
                      >
                        <div>
                          <div className="aspect-square bg-slate-950 rounded-xl p-3 mb-3 relative border border-slate-800">
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              onClick={() => onSelectProduct(prod.slug)}
                              className="w-full h-full object-contain cursor-pointer group-hover:scale-105 transition-transform"
                            />
                            <button
                              onClick={() => toggleWishlist(prod.id)}
                              className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-rose-400 hover:bg-slate-900"
                              title="Remove from wishlist"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="text-[10px] text-cyan-400 font-bold uppercase">{prod.brandName}</span>
                          <h4
                            onClick={() => onSelectProduct(prod.slug)}
                            className="text-xs font-bold text-white hover:text-cyan-400 cursor-pointer truncate"
                          >
                            {prod.name}
                          </h4>
                          <span className="text-sm font-black text-white mt-1 block">
                            ৳{prod.discountedPrice.toLocaleString()}
                          </span>
                        </div>

                        <button
                          onClick={() => addToCart(prod, 1)}
                          className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Move to Cart</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: SUPPORT TICKETS */}
            {activeTab === 'tickets' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-white">Customer Support Tickets</h2>
                    <p className="text-xs text-slate-400">Direct inquiries to our Gaibandha support team for warranty, order issues, or refunds.</p>
                  </div>
                  <button
                    onClick={() => setIsCreatingTicket(!isCreatingTicket)}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Open New Ticket</span>
                  </button>
                </div>

                {/* Create ticket form */}
                {isCreatingTicket && (
                  <form onSubmit={handleCreateTicket} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-bold text-white">Create Support Inquiry</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                        <input
                          type="text"
                          required
                          value={ticketSubject}
                          onChange={e => setTicketSubject(e.target.value)}
                          placeholder="Brief summary of your query..."
                          className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                        <select
                          value={ticketDept}
                          onChange={e => setTicketDept(e.target.value as any)}
                          className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                        >
                          <option value="Product Inquiry">Product & Warranty Inquiry</option>
                          <option value="Order Issue">Order Dispatch / Courier Delay</option>
                          <option value="Payment & Refund">bKash / Nagad Payment & Refund</option>
                          <option value="Technical Support">Technical & Setup Support</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Message</label>
                      <textarea
                        rows={3}
                        required
                        value={ticketMessage}
                        onChange={e => setTicketMessage(e.target.value)}
                        placeholder="Provide order number or device serial number if applicable..."
                        className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md"
                      >
                        Submit Ticket
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreatingTicket(false)}
                        className="px-4 py-2.5 bg-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-xl"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Ticket list */}
                {tickets.length === 0 ? (
                  <div className="bg-slate-900/60 rounded-3xl p-12 text-center border border-slate-800">
                    <HelpCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-white">No Support Tickets</h3>
                    <p className="text-xs text-slate-400 mt-1">Need help with an order? Open a ticket above!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tickets.map(ticket => (
                      <div
                        key={ticket.id}
                        className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-xs font-bold text-cyan-400">{ticket.ticketNumber}</span>
                              <span className="text-xs text-slate-500">•</span>
                              <span className="text-xs font-bold text-white">{ticket.subject}</span>
                            </div>
                            <span className="text-[11px] text-slate-400">{ticket.department}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            ticket.status === 'Resolved' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>

                        {/* Thread messages */}
                        <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800/80 max-h-56 overflow-y-auto">
                          {ticket.messages.map(msg => (
                            <div
                              key={msg.id}
                              className={`text-xs p-3 rounded-xl max-w-lg ${
                                msg.sender === 'support'
                                  ? 'bg-indigo-950/70 border border-indigo-800/50 mr-auto'
                                  : 'bg-slate-800 ml-auto'
                              }`}
                            >
                              <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                                <span className="font-bold text-slate-200">{msg.senderName}</span>
                                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="text-slate-300">{msg.text}</p>
                            </div>
                          ))}
                        </div>

                        {/* Reply box */}
                        {ticket.status !== 'Closed' && (
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={activeTicketId === ticket.id ? replyText : ''}
                              onFocus={() => setActiveTicketId(ticket.id)}
                              onChange={e => {
                                setActiveTicketId(ticket.id);
                                setReplyText(e.target.value);
                              }}
                              placeholder="Write a reply message..."
                              className="flex-1 text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                            />
                            <button
                              onClick={() => handleSendTicketReply(ticket.id)}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center space-x-1"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Reply</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <h2 className="text-lg font-bold text-white">Notifications Center</h2>
                  <button
                    onClick={() => api.markAllNotificationsRead(user.id)}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    Mark All as Read
                  </button>
                </div>

                <div className="space-y-2">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-4 rounded-2xl border transition-colors flex items-start space-x-3 ${
                        !n.isRead
                          ? 'bg-slate-900 border-indigo-500/40 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Bell className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-white">{n.title}</h4>
                          <span className="text-[10px] text-slate-500">
                            {new Date(n.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <p className="text-xs mt-1 text-slate-300">{n.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: SECURITY */}
            {activeTab === 'security' && (
              <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Account Security & Credentials</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Manage your password and protected sessions.</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
