import React from 'react';
import { Order } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { X, Printer, Download, CheckCircle2, QrCode, ShieldCheck } from 'lucide-react';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;
  const settings = api.getSettings();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm print:hidden" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 print:m-0 print:p-0 print:border-none print:shadow-none animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Controls (Hidden in print) */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-bold">Official PixelGrid Tax Invoice</span>
            <span className="text-xs bg-indigo-600 px-2 py-0.5 rounded-full font-mono">{order.orderNumber}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 sm:p-10 text-slate-800 bg-white" id="invoice-sheet">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-8 border-b border-slate-200 gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-2xl font-black text-slate-950 tracking-tight">
                  PIXEL<span className="text-indigo-600">GRID</span>
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                Official E-Commerce Marketplace
              </p>
              <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                <p>{settings.companyAddress}</p>
                <p>Hotline: {settings.contactPhone}</p>
                <p>Email: {settings.contactEmail}</p>
                <p>Govt. Trade License: TRAD/GBD/2026/91823</p>
              </div>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="inline-block px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs rounded-lg uppercase tracking-wider">
                INVOICE #{order.orderNumber}
              </span>
              <p className="text-xs text-slate-500">
                Date: {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-xs text-slate-500">
                Tracking ID: <strong className="font-mono text-slate-700">{order.trackingNumber}</strong>
              </p>
              <p className="text-xs text-slate-500">
                Payment: <strong className="uppercase text-emerald-600">{order.paymentMethod} ({order.paymentStatus})</strong>
              </p>
            </div>
          </div>

          {/* Billing & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-200 text-xs">
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2 text-[11px] text-indigo-600">
                Customer & Delivery Address
              </h4>
              <p className="font-bold text-sm text-slate-900">{order.shippingAddress.fullName}</p>
              <p className="text-slate-600 mt-1">{order.shippingAddress.address}</p>
              <p className="text-slate-600">
                {order.shippingAddress.upazila}, {order.shippingAddress.district} - {order.shippingAddress.postcode}
              </p>
              <p className="text-slate-600">{order.shippingAddress.division} Division, Bangladesh</p>
              <p className="text-slate-800 font-semibold mt-1">Phone: {order.shippingAddress.phone}</p>
              <p className="text-slate-600">Email: {order.shippingAddress.email}</p>
            </div>

            <div className="sm:text-right">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2 text-[11px] text-indigo-600">
                Logistics & Dispatch Information
              </h4>
              <p className="text-slate-700 font-semibold">Courier: {order.courierName || 'Pathao Express'}</p>
              <p className="text-slate-600">Consignment: {order.courierTrackingCode || 'PTH-92831'}</p>
              <p className="text-slate-600">Dispatch Hub: Central Gaibandha Warehouse</p>
              <p className="text-slate-600">Delivery SLA: {order.deliveryMethod === 'express' ? '24 Hours (Express)' : '48-72 Hours (Standard)'}</p>
              <div className="mt-2 inline-flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Status: {order.orderStatus}</span>
              </div>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="py-6">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-300 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5">Item Description</th>
                  <th className="py-2.5 text-center">Unit Price</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Total (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="py-2">
                    <td className="py-3 pr-2">
                      <p className="font-bold text-slate-900">{item.product.name}</p>
                      <p className="text-[11px] text-slate-500">
                        SKU: {item.product.sku} {item.variantName ? `• ${item.variantName}` : ''} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                      </p>
                    </td>
                    <td className="py-3 text-center text-slate-700">৳{item.unitPrice.toLocaleString()}</td>
                    <td className="py-3 text-center font-bold text-slate-900">{item.quantity}</td>
                    <td className="py-3 text-right font-bold text-slate-900">
                      ৳{(item.unitPrice * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="max-w-xs space-y-1 text-slate-500 text-[11px]">
              <p className="font-bold text-slate-700">Warranty & Support Guarantee:</p>
              <p>Official warranty is tracked via this invoice serial number. Retain a digital copy for warranty claims at authorized service centers.</p>
              <div className="pt-2 flex items-center space-x-2 text-slate-400">
                <QrCode className="w-8 h-8 text-slate-700" />
                <span className="font-mono text-[9px]">SECURE-DIGITAL-SIGNATURE: {order.id.slice(-8).toUpperCase()}</span>
              </div>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">৳{order.subtotal.toLocaleString()}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({order.couponCode || 'Promo'}):</span>
                  <span>-৳{order.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge:</span>
                <span className="font-semibold text-slate-900">
                  {order.deliveryCharge === 0 ? 'FREE' : `৳${order.deliveryCharge.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-900 font-black text-base pt-2 border-t border-slate-300">
                <span>Final Total:</span>
                <span className="text-indigo-600">৳{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center text-[11px] text-slate-400">
            Thank you for choosing PixelGrid — Bangladesh’s Trusted Flagship Electronics Marketplace.
          </div>
        </div>
      </div>
    </div>
  );
};
