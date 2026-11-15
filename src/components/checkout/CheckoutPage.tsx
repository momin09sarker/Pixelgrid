import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { api } from '../../services/api.ts';
import { BD_LOCATIONS } from '../../services/mockData.ts';
import { Order, PaymentMethod, ShippingAddress } from '../../types/index.ts';
import {
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  MapPin,
  Lock,
  Tag,
  Phone,
  AlertCircle,
  Clock,
  Printer
} from 'lucide-react';

interface CheckoutPageProps {
  onOrderSuccess: (order: Order) => void;
  onNavigateShop: () => void;
  onNavigateTrack: (orderId: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onOrderSuccess,
  onNavigateShop,
  onNavigateTrack
}) => {
  const {
    items,
    subtotal,
    deliveryMethod,
    setDeliveryMethod,
    shippingDistrict,
    setShippingDistrict,
    shippingCharge,
    coupon,
    discountAmount,
    total,
    clearCart,
    showToast
  } = useCart();

  const { user } = useAuth();
  const { t } = useLanguage();
  const gateways = api.getPaymentGateways().filter(g => g.isEnabled);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Customer & Address State
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');
  const [division, setDivision] = useState(user?.division || 'Dhaka');
  const [district, setDistrict] = useState(user?.district || 'Dhaka');
  const [upazila, setUpazila] = useState(user?.upazila || 'Gulshan');
  const [postcode, setPostcode] = useState(user?.postalCode || '1212');
  const [orderNotes, setOrderNotes] = useState('');

  // Step 3: Payment State
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('bkash');
  const [bkashNumber, setBkashNumber] = useState(phone || '01774495356');
  const [paymentOtp, setPaymentOtp] = useState('123456');
  const [paymentPin, setPaymentPin] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Sync shipping district with cart context for accurate shipping calculation
  useEffect(() => {
    setShippingDistrict(district);
  }, [district, setShippingDistrict]);

  // District options based on Division
  const districtOptions = (BD_LOCATIONS as Record<string, string[]>)[division] || ['Dhaka'];

  // Handle Step 1 Validation
  const handleValidateStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim() || !address.trim()) {
      showToast('Please fill out all required shipping fields.', 'error');
      return;
    }
    setStep(2);
  };

  // Place Final Order
  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    // Simulate payment gateway verification handshake
    await new Promise(r => setTimeout(r, 1200));

    const shippingAddress: ShippingAddress = {
      fullName,
      phone,
      email,
      address,
      division,
      district,
      upazila,
      postcode,
      orderNotes
    };

    const newOrder = api.createOrder({
      customerId: user?.id || `guest-${Date.now()}`,
      customerName: fullName,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress,
      items,
      subtotal,
      deliveryMethod,
      deliveryCharge: shippingCharge,
      discountAmount,
      couponCode: coupon?.code,
      total,
      paymentMethod: selectedPayment,
      transactionId: selectedPayment !== 'cod' ? `TRX-${selectedPayment.toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}` : undefined
    });

    setIsProcessing(false);
    setCompletedOrder(newOrder);
    clearCart();

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignored
    }

    onOrderSuccess(newOrder);
  };

  // Empty cart guard (if not already completed)
  if (items.length === 0 && !completedOrder) {
    return (
      <div className="bg-slate-950 text-white min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-slate-400 mb-4 border border-slate-800">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-slate-400 max-w-sm mb-6">
          Add some flagship smartphones, mechanical gear, or wireless headsets before checking out.
        </p>
        <button
          onClick={onNavigateShop}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg transition-colors"
        >
          Explore Tech Catalog
        </button>
      </div>
    );
  }

  // ORDER SUCCESS SCREEN
  if (completedOrder) {
    return (
      <div className="bg-slate-950 text-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-slate-900/90 rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Order Confirmed & Paid
            </span>
            <h1 className="text-3xl font-black text-white mt-1">Thank You For Your Order!</h1>
            <p className="text-xs text-slate-300 mt-2">
              We have dispatched a confirmation SMS to <strong>{completedOrder.customerPhone}</strong> and email to <strong>{completedOrder.customerEmail}</strong>.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 grid grid-cols-2 gap-4 text-xs text-left">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Order Number</span>
              <span className="font-mono font-bold text-white text-sm">{completedOrder.orderNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Consignment Tracking ID</span>
              <span className="font-mono font-bold text-cyan-400 text-sm">{completedOrder.trackingNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Assigned Courier</span>
              <span className="font-bold text-white">{completedOrder.courierName || 'Pathao Express'}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Estimated Arrival</span>
              <span className="font-bold text-white">{completedOrder.estimatedDeliveryDate}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => onNavigateTrack(completedOrder.orderNumber)}
              className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <Truck className="w-4 h-4" />
              <span>Track Live Delivery Status</span>
            </button>

            <button
              onClick={onNavigateShop}
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-white min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Checkout Stepper Bar */}
        <div className="mb-10 max-w-3xl mx-auto">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-cyan-400' : 'text-slate-500'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                1
              </div>
              <span className="hidden sm:inline">Address</span>
            </div>
            <div className={`h-0.5 flex-1 mx-3 ${step >= 2 ? 'bg-cyan-400' : 'bg-slate-800'}`} />

            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-cyan-400' : 'text-slate-500'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                2
              </div>
              <span className="hidden sm:inline">Shipping</span>
            </div>
            <div className={`h-0.5 flex-1 mx-3 ${step >= 3 ? 'bg-cyan-400' : 'bg-slate-800'}`} />

            <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-cyan-400' : 'text-slate-500'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                3
              </div>
              <span className="hidden sm:inline">Payment</span>
            </div>
            <div className={`h-0.5 flex-1 mx-3 ${step >= 4 ? 'bg-cyan-400' : 'bg-slate-800'}`} />

            <div className={`flex items-center space-x-2 ${step >= 4 ? 'text-cyan-400' : 'text-slate-500'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                4
              </div>
              <span className="hidden sm:inline">Review</span>
            </div>
          </div>
        </div>

        {/* 2-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Form (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
            {/* STEP 1: Address & Customer Details */}
            {step === 1 && (
              <form onSubmit={handleValidateStep1} className="space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-800 mb-4">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">Step 1: Customer & Delivery Address</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Tanvir Ahmed"
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number (Bangladesh) *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="017xxxxxxxx"
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address (For Invoices) *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@pixelgrid.com"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                {/* Division & District */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Division *</label>
                    <select
                      value={division}
                      onChange={e => {
                        const newDiv = e.target.value;
                        setDivision(newDiv);
                        const firstDist = (BD_LOCATIONS as Record<string, string[]>)[newDiv]?.[0] || 'Dhaka';
                        setDistrict(firstDist);
                      }}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    >
                      {Object.keys(BD_LOCATIONS).map(div => (
                        <option key={div} value={div}>{div} Division</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">District *</label>
                    <select
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    >
                      {districtOptions.map(dist => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Upazila / Thana & Postcode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Upazila / Thana *</label>
                    <input
                      type="text"
                      required
                      value={upazila}
                      onChange={e => setUpazila(e.target.value)}
                      placeholder="e.g. Gaibandha Sadar, Gulshan, Dhanmondi"
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Postal Code *</label>
                    <input
                      type="text"
                      required
                      value={postcode}
                      onChange={e => setPostcode(e.target.value)}
                      placeholder="e.g. 5700, 1212"
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Street Address, House & Road No. *</label>
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="e.g. College Road, Gaibandha or House 42, Road 11, Banani"
                    className="w-full text-xs p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Order Notes (Optional)</label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={e => setOrderNotes(e.target.value)}
                    placeholder="Any specific instructions for courier hero..."
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 mt-4"
                >
                  <span>Continue to Delivery Options</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* STEP 2: Delivery Method */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-800 mb-4">
                  <Truck className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">Step 2: Choose Delivery Speed</h3>
                </div>

                <div className="space-y-3">
                  <div
                    onClick={() => setDeliveryMethod('standard')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      deliveryMethod === 'standard'
                        ? 'bg-slate-950 border-cyan-400 ring-2 ring-cyan-500/20'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        deliveryMethod === 'standard' ? 'border-cyan-400 bg-cyan-400 text-slate-950' : 'border-slate-600'
                      }`}>
                        {deliveryMethod === 'standard' && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Standard Delivery (Pathao / Steadfast)</h4>
                        <p className="text-[11px] text-slate-400">
                          {district.toLowerCase() === 'dhaka' ? '24 - 48 Hours within Dhaka metro' : '48 - 72 Hours nationwide across 64 districts'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-cyan-400">
                      {shippingCharge === 0 ? 'FREE' : `৳${district.toLowerCase() === 'dhaka' ? 60 : 120}`}
                    </span>
                  </div>

                  <div
                    onClick={() => setDeliveryMethod('express')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      deliveryMethod === 'express'
                        ? 'bg-slate-950 border-cyan-400 ring-2 ring-cyan-500/20'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        deliveryMethod === 'express' ? 'border-cyan-400 bg-cyan-400 text-slate-950' : 'border-slate-600'
                      }`}>
                        {deliveryMethod === 'express' && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <span>Express Same-Day Priority Delivery</span>
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-mono">PRIORITY</span>
                        </h4>
                        <p className="text-[11px] text-slate-400">Delivered within 12 - 24 hours with dedicated dispatch</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-cyan-400">
                      ৳180
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Payment Method */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-800 mb-2">
                  <CreditCard className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">Step 3: Bangladesh Payment Gateway</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {gateways.map(gw => (
                    <div
                      key={gw.id}
                      onClick={() => setSelectedPayment(gw.code)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedPayment === gw.code
                          ? 'bg-slate-950 border-cyan-400 ring-2 ring-cyan-500/20'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white">{gw.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{gw.instructions}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border shrink-0 ml-2 flex items-center justify-center ${
                        selectedPayment === gw.code ? 'border-cyan-400 bg-cyan-400 text-slate-950' : 'border-slate-600'
                      }`}>
                        {selectedPayment === gw.code && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Interactive Gateway Sandbox Preview */}
                {selectedPayment === 'bkash' && (
                  <div className="p-4 bg-pink-950/30 border border-pink-700/50 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-pink-300">
                      <span>bKash Payment Gateway (Official Sandbox)</span>
                      <span className="font-mono text-[10px] bg-pink-900/60 px-2 py-0.5 rounded">01774495356</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[11px] text-slate-400 mb-1 block">bKash Account Number</label>
                        <input
                          type="text"
                          value={bkashNumber}
                          onChange={e => setBkashNumber(e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 mb-1 block">One-Time Pin (OTP)</label>
                        <input
                          type="text"
                          value={paymentOtp}
                          onChange={e => setPaymentOtp(e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedPayment === 'nagad' && (
                  <div className="p-4 bg-orange-950/30 border border-orange-700/50 rounded-2xl space-y-2 text-xs">
                    <div className="text-orange-300 font-bold">Nagad Digital Payment</div>
                    <p className="text-slate-400 text-[11px]">
                      Enter your registered Nagad number to proceed. A verification push notification will be sent to your Nagad app.
                    </p>
                  </div>
                )}

                {selectedPayment === 'cod' && (
                  <div className="p-4 bg-emerald-950/30 border border-emerald-700/50 rounded-2xl space-y-1.5 text-xs text-emerald-300">
                    <p className="font-bold">Cash on Delivery (COD) Selected</p>
                    <p className="text-[11px] text-slate-400">
                      Pay ৳{total.toLocaleString()} in cash to the Pathao/Steadfast delivery hero upon package unboxing & verification.
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Review Order Summary</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Order Review & Confirmation */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-800 mb-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">Step 4: Final Review & Confirmation</h3>
                </div>

                {/* Delivery & Payment Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Delivery Address</span>
                    <p className="font-bold text-white">{fullName} ({phone})</p>
                    <p className="text-slate-400">{address}, {upazila}, {district} - {postcode}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Payment Method</span>
                    <p className="font-bold text-cyan-400 uppercase">{selectedPayment}</p>
                    <p className="text-slate-400">Method: {deliveryMethod === 'express' ? 'Express Priority' : 'Standard Delivery'}</p>
                  </div>
                </div>

                {/* Item List Summary */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Purchased Items ({items.length})</h4>
                  <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 text-xs">
                    {items.map((item, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img src={item.product.images[0]} alt={item.product.name} className="w-10 h-10 object-contain rounded-lg" />
                          <div>
                            <p className="font-bold text-white truncate max-w-xs">{item.product.name}</p>
                            <span className="text-[10px] text-slate-400">Qty: {item.quantity} • {item.variantName || 'Standard'}</span>
                          </div>
                        </div>
                        <span className="font-bold text-white">৳{(item.unitPrice * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Consent & CTA */}
                <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-800/40 text-[11px] text-indigo-300 flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>By placing this order, you agree to PixelGrid’s Terms of Sale, 7-Day Replacement Policy, and BTRC IMEI Warranty Terms.</span>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => setStep(3)}
                    disabled={isProcessing}
                    className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="flex-1 py-4 bg-gradient-to-r from-emerald-500 via-indigo-600 to-purple-600 hover:from-emerald-400 hover:to-purple-500 text-white font-black text-sm rounded-xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>{isProcessing ? 'Verifying Gateway & Confirming Order...' : `Place Order (৳${total.toLocaleString()})`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Summary Sidebar (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs text-cyan-400 font-normal">{items.length} items</span>
              </h3>

              {/* Items summary */}
              <div className="max-h-56 overflow-y-auto space-y-3 pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 truncate">
                      <span className="text-cyan-400 font-bold">{item.quantity}x</span>
                      <span className="text-slate-300 truncate">{item.product.name}</span>
                    </div>
                    <span className="font-semibold text-white ml-2 shrink-0">
                      ৳{(item.unitPrice * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="border-t border-slate-800 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">৳{subtotal.toLocaleString()}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Discount ({coupon?.code})</span>
                    <span>-৳{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400">
                  <span>Delivery ({district})</span>
                  <span className="font-semibold text-white">
                    {shippingCharge === 0 ? <strong className="text-emerald-400">FREE</strong> : `৳${shippingCharge.toLocaleString()}`}
                  </span>
                </div>

                <div className="flex justify-between text-slate-100 font-black text-lg pt-3 border-t border-slate-800">
                  <span>Total Payable:</span>
                  <span className="text-cyan-400">৳{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Helpline Callout */}
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="flex items-center space-x-2 text-white font-bold">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Need Phone Order Assistance?</span>
              </div>
              <p>Call our Gaibandha support desk at <strong>01774495356</strong> (9 AM to 10 PM daily).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
