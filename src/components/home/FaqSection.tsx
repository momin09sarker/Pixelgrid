import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How do I pay using bKash or Nagad on PixelGrid?',
    answer: 'During checkout, simply select bKash or Nagad. You will be presented with our official merchant gateway where you can authorize the payment securely with your wallet PIN and OTP. Alternatively, for USSD, send payment to our merchant number 01774495356 referencing your Order ID.'
  },
  {
    question: 'Are all smartphones and devices official and BTRC approved?',
    answer: 'Yes, 100%. All devices sold by PixelGrid are legally imported through authorized distributors with genuine IMEI numbers registered in the BTRC database. You can verify your IMEI via official government SMS verification.'
  },
  {
    question: 'What are the delivery charges and shipping times across Bangladesh?',
    answer: 'Inside Dhaka metro: Standard delivery is ৳60 (24 to 48 hours), and Express same-day delivery is ৳180. Outside Dhaka (across all 64 districts): Delivery is ৳120 (48 to 72 hours). Orders above ৳10,000 enjoy 100% FREE delivery nationwide!'
  },
  {
    question: 'Can I inspect the parcel before paying with Cash on Delivery (COD)?',
    answer: 'Absolutely. We provide Open-Box delivery verification with our courier partners (Pathao & Steadfast). You can inspect the seal, outer condition, and matching invoice before handing over the cash to the delivery hero.'
  },
  {
    question: 'What is PixelGrid’s 7-Day Replacement Policy?',
    answer: 'If you discover any technical fault, screen defect, or hardware malfunction within 7 days of delivery, simply open a support ticket or call 01774495356. We will arrange a free courier pickup and issue a brand-new replacement or full refund.'
  },
  {
    question: 'Where is PixelGrid physically located?',
    answer: 'Our main office and regional fulfillment hub is located on College Road, Gaibandha, Bangladesh. You are always welcome to contact our founder Momin Sarker directly at momin09sarker@gmail.com.'
  }
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-16 bg-slate-900 border-b border-slate-800 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-1.5 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Everything you need to know about payments, warranty, delivery, and orders.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between space-x-4 hover:bg-slate-800/40 transition-colors"
              >
                <span className="text-sm font-bold text-slate-100">{item.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-cyan-400 shrink-0 transition-transform duration-200 ${
                    openIndex === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openIndex === idx && (
                <div className="px-4 pb-5 sm:px-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
