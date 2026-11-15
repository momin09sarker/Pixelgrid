export type UserRole = 'admin' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  isBlocked?: boolean;
  address?: string;
  division?: string;
  district?: string;
  upazila?: string;
  postalCode?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameBn?: string;
  slug: string;
  icon: string;
  image: string;
  itemCount: number;
  description: string;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  description?: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Space Black - 256GB"
  color?: string;
  colorCode?: string;
  storage?: string;
  size?: string;
  priceModifier: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  nameBn?: string;
  slug: string;
  sku: string;
  categoryId: string;
  categoryName: string;
  brandId: string;
  brandName: string;
  shortDescription: string;
  description: string;
  regularPrice: number;
  discountedPrice: number;
  discountPercent: number;
  stock: number;
  rating: number;
  reviewCount: number;
  images: string[];
  specifications: { [key: string]: string };
  variants: ProductVariant[];
  colors: string[];
  sizes: string[];
  isFeatured: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isFlashSale: boolean;
  flashSaleEndsAt?: string;
  warranty: string;
  returnPolicy: string;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  variantId?: string;
  variantName?: string;
  selectedColor?: string;
  selectedSize?: string;
  quantity: number;
  unitPrice: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned'
  | 'Refunded';

export type PaymentMethod =
  | 'cod'
  | 'bkash'
  | 'nagad'
  | 'rocket'
  | 'sslcommerz'
  | 'card';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note: string;
  updatedBy: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  division: string;
  district: string;
  upazila: string;
  postcode: string;
  orderNotes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  trackingNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: CartItem[];
  subtotal: number;
  deliveryMethod: 'standard' | 'express';
  deliveryCharge: number;
  discountAmount: number;
  couponCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  orderStatus: OrderStatus;
  courierName?: 'Pathao' | 'Steadfast' | 'RedX' | 'Paperfly';
  courierTrackingCode?: string;
  statusHistory: OrderStatusHistoryItem[];
  estimatedDeliveryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  verifiedPurchase: boolean;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

export interface PaymentGatewayConfig {
  id: string;
  code: PaymentMethod;
  name: string;
  logo: string;
  isEnabled: boolean;
  isSandbox: boolean;
  merchantNumber: string;
  instructions: string;
  chargePercentage: number;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  department: 'Order Issue' | 'Payment & Refund' | 'Product Inquiry' | 'Technical Support';
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  messages: {
    id: string;
    sender: 'user' | 'support';
    senderName: string;
    text: string;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string; // or 'all'
  title: string;
  message: string;
  type: 'order' | 'payment' | 'promo' | 'security';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface WebsiteSettings {
  siteName: string;
  tagline: string;
  companyAddress: string;
  contactEmail: string;
  contactPhone: string;
  announcementText: string;
  isAnnouncementEnabled: boolean;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaText: string;
  promoBannerTitle: string;
  promoBannerSub: string;
  promoBannerCode: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  footerAbout: string;
  insideDhakaShippingFee: number;
  outsideDhakaShippingFee: number;
  expressShippingFee: number;
  freeShippingThreshold: number;
}
