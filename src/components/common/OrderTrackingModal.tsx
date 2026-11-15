import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { X, Search, CheckCircle2, Clock, Truck, Package, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';

interface OrderTrackingModalProps {
  initialOrderId?: string;
  onClose?: () => void;
  isStandalone?: boolean;
}

const ORDER_STEPS: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered'
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  initialOrderId,
  onClose,
  isStandalone = false
}) => {
  const [searchInput, setSearchInput] = useState(initialOrderId || '');
  const [phoneVerification, setPhoneVerification] = useState('');
  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    if (initialOrderId) {
      return api.getOrderById(initialOrderId) || null;
    }
    // Default preview with seeded order
    return api.getOrders()[0] || null;
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const query = searchInput.trim();
    if (!query) {
      setErrorMsg('Please enter an Order ID or Tracking Number.');
      return;
    }

    const order = api.getOrderById(query);
    if (!order) {
      setErrorMsg(`No order found matching "${query}". Please check your order confirmation SMS or email.`);
      return;
    }

    if (phoneVerification.trim()) {
      const normalizedPhone = phoneVerification.replace(/\D/g, '');
      const orderPhone = order.customerPhone.replace(/\D/g, '');
      if (!orderPhone.includes(normalizedPhone) && !normalizedPhone.includes(orderPhone)) {
        setErrorMsg('Phone number does not match this order for verification.');
        return;
      }
    }

    setActiveOrder(order);
  };

  const getStepStatus = (step: OrderStatus, currentStatus: OrderStatus): 'completed' | 'current' | 'upcoming' => {
    const stepIdx = ORDER_STEPS.indexOf(step);
    const currIdx = ORDER_STEPS.indexOf(currentStatus);

    if (currentStatus === 'Cancelled' || currentStatus === 'Returned' || currentStatus === 'Refunded') {
      return stepIdx === 0 ? 'completed' : 'upcoming';
    }

    if (stepIdx < currIdx) return 'completed';
    if (stepIdx === currIdx) return 'current';
    return 'upcoming';
  };

  const content = (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-w-3xl w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 p-6 text-white relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Truck className="w-4 h-4" />
          <span>Live Consignment Tracking</span>
        </div>
        <h3 className="text-xl font-bold">Track Your PixelGrid Delivery</h3>
        <p className="text-xs text-slate-300 mt-1">
          Real-time courier telematics via Pathao, Steadfast & RedX logistics network.
        </p>

        {/* Search input form */}
        <form onSubmit={handleSearch} className="mt-4 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Enter Order # (e.g. PG-2026-8941) or Tracking #"
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 font-mono"
            />
          </div>
          <input
            type="text"
            value={phoneVerification}
            onChange={e => setPhoneVerification(e.target.value)}
            placeholder="Phone (optional verification)"
            className="w-full sm:w-44 text-xs px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 font-mono"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-md"
          >
            Track Status
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="m-6 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Active Order Tracking Result */}
      {activeOrder && (
        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Order Number</span>
              <span className="font-bold font-mono text-slate-900 text-sm">{activeOrder.orderNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Courier Partner</span>
              <span className="font-bold text-indigo-600 text-sm">
                {activeOrder.courierName || 'Pathao Courier'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Estimated Arrival</span>
              <span className="font-bold text-slate-900 text-sm">{activeOrder.estimatedDeliveryDate}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Current Status</span>
              <span className="inline-block px-2 py-0.5 rounded font-bold text-xs bg-emerald-100 text-emerald-800">
                {activeOrder.orderStatus}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
              Dispatch & Delivery Milestones
            </h4>
            <div className="relative">
              <div className="flex flex-col sm:flex-row justify-between relative z-10 gap-4 sm:gap-0">
                {ORDER_STEPS.map((step, idx) => {
                  const status = getStepStatus(step, activeOrder.orderStatus);
                  return (
                    <div key={step} className="flex sm:flex-col items-center sm:text-center space-x-3 sm:space-x-0 group">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors shrink-0 ${
                          status === 'completed'
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                            : status === 'current'
                            ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        {status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                      <div className="sm:mt-2 text-left sm:text-center">
                        <span
                          className={`text-xs block font-bold ${
                            status === 'completed'
                              ? 'text-emerald-700'
                              : status === 'current'
                              ? 'text-indigo-600 font-extrabold'
                              : 'text-slate-400'
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed Status Logs */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Telemetry Event History
            </h4>
            <div className="space-y-3">
              {activeOrder.statusHistory.map((hist, i) => (
                <div key={i} className="flex items-start space-x-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{hist.status}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-[11px] text-slate-500">
                        {new Date(hist.timestamp).toLocaleString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded text-slate-600">
                        {hist.updatedBy}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{hist.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address & Package Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-3.5 bg-white rounded-xl border border-slate-200">
              <h5 className="font-bold text-slate-900 mb-1 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span>Shipping Destination</span>
              </h5>
              <p className="font-semibold text-slate-800">{activeOrder.shippingAddress.fullName}</p>
              <p className="text-slate-600">{activeOrder.shippingAddress.address}</p>
              <p className="text-slate-600">
                {activeOrder.shippingAddress.district}, {activeOrder.shippingAddress.division}
              </p>
              <p className="text-slate-600 font-mono mt-0.5">{activeOrder.shippingAddress.phone}</p>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200">
              <h5 className="font-bold text-slate-900 mb-1 flex items-center space-x-1">
                <Package className="w-3.5 h-3.5 text-indigo-600" />
                <span>Package Items ({activeOrder.items.length})</span>
              </h5>
              <div className="space-y-1">
                {activeOrder.items.map((item, idx) => (
                  <p key={idx} className="text-slate-700 truncate">
                    • {item.quantity}x {item.product.name} ({item.variantName || 'Standard'})
                  </p>
                ))}
              </div>
              <p className="font-bold text-slate-900 mt-2">Total Amount: ৳{activeOrder.total.toLocaleString()} ({activeOrder.paymentStatus})</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isStandalone) {
    return <div className="max-w-4xl mx-auto py-8 px-4">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10">{content}</div>
    </div>
  );
};
