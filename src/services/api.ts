import {
  Product,
  Category,
  Brand,
  Order,
  OrderStatus,
  User,
  Coupon,
  PaymentGatewayConfig,
  WebsiteSettings,
  SupportTicket,
  NotificationItem,
  ProductReview,
  PaymentMethod,
  PaymentStatus,
  ShippingAddress,
  CartItem
} from '../types/index.ts';
import {
  INITIAL_CATEGORIES,
  INITIAL_BRANDS,
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_PAYMENT_GATEWAYS,
  INITIAL_WEBSITE_SETTINGS,
  INITIAL_USERS,
  INITIAL_ORDERS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REVIEWS
} from './mockData.ts';

const STORAGE_KEYS = {
  PRODUCTS: 'pixelgrid_products_v1',
  CATEGORIES: 'pixelgrid_categories_v1',
  BRANDS: 'pixelgrid_brands_v1',
  ORDERS: 'pixelgrid_orders_v1',
  USERS: 'pixelgrid_users_v1',
  COUPONS: 'pixelgrid_coupons_v1',
  PAYMENT_GATEWAYS: 'pixelgrid_gateways_v1',
  SETTINGS: 'pixelgrid_settings_v1',
  TICKETS: 'pixelgrid_tickets_v1',
  NOTIFICATIONS: 'pixelgrid_notifications_v1',
  REVIEWS: 'pixelgrid_reviews_v1',
  NEWSLETTER: 'pixelgrid_newsletter_v1',
};

// Helper for localStorage get with default
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const val = localStorage.getItem(key);
    if (!val) return defaultValue;
    return JSON.parse(val);
  } catch (e) {
    console.error(`Error loading ${key}`, e);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key}`, e);
  }
}

// Initialize storage if empty
export function initializeDatabase(): void {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    setStored(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    setStored(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.BRANDS)) {
    setStored(STORAGE_KEYS.BRANDS, INITIAL_BRANDS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.COUPONS)) {
    setStored(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAYMENT_GATEWAYS)) {
    setStored(STORAGE_KEYS.PAYMENT_GATEWAYS, INITIAL_PAYMENT_GATEWAYS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    setStored(STORAGE_KEYS.SETTINGS, INITIAL_WEBSITE_SETTINGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    setStored(STORAGE_KEYS.USERS, INITIAL_USERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    setStored(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
    setStored(STORAGE_KEYS.TICKETS, INITIAL_SUPPORT_TICKETS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    setStored(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    setStored(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  }
}

// Call on module load
initializeDatabase();

export const api = {
  // Website Settings
  getSettings(): WebsiteSettings {
    return getStored<WebsiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_WEBSITE_SETTINGS);
  },
  updateSettings(settings: Partial<WebsiteSettings>): WebsiteSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    setStored(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  // Products
  getProducts(): Product[] {
    return getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },
  getProductById(id: string): Product | undefined {
    return this.getProducts().find(p => p.id === id);
  },
  getProductBySlug(slug: string): Product | undefined {
    return this.getProducts().find(p => p.slug === slug);
  },
  saveProduct(product: Partial<Product> & { name: string }): Product {
    const products = this.getProducts();
    const slug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existingIndex = products.findIndex(p => p.id === product.id);

    let finalProduct: Product;

    if (existingIndex >= 0) {
      finalProduct = {
        ...products[existingIndex],
        ...product,
        slug,
      } as Product;
      products[existingIndex] = finalProduct;
    } else {
      finalProduct = {
        id: `prod-${Date.now()}`,
        name: product.name,
        nameBn: product.nameBn || '',
        slug,
        sku: product.sku || `PG-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        categoryId: product.categoryId || 'cat-smartphones',
        categoryName: product.categoryName || 'Smartphones & Tablets',
        brandId: product.brandId || 'b-samsung',
        brandName: product.brandName || 'Samsung',
        shortDescription: product.shortDescription || '',
        description: product.description || '',
        regularPrice: Number(product.regularPrice) || 0,
        discountedPrice: Number(product.discountedPrice) || Number(product.regularPrice) || 0,
        discountPercent: product.regularPrice && product.discountedPrice
          ? Math.round(((product.regularPrice - product.discountedPrice) / product.regularPrice) * 100)
          : 0,
        stock: Number(product.stock) || 10,
        rating: 5.0,
        reviewCount: 0,
        images: product.images && product.images.length ? product.images : [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80'
        ],
        specifications: product.specifications || {},
        variants: product.variants || [],
        colors: product.colors || ['Black'],
        sizes: product.sizes || ['Standard'],
        isFeatured: Boolean(product.isFeatured),
        isTrending: Boolean(product.isTrending),
        isBestSeller: Boolean(product.isBestSeller),
        isNewArrival: true,
        isFlashSale: Boolean(product.isFlashSale),
        flashSaleEndsAt: product.flashSaleEndsAt,
        warranty: product.warranty || '1 Year Official Warranty',
        returnPolicy: product.returnPolicy || '7 Days Replacement Policy',
        tags: product.tags || ['Gadget'],
        isPublished: product.isPublished !== undefined ? product.isPublished : true,
        createdAt: new Date().toISOString(),
      };
      products.unshift(finalProduct);
    }

    setStored(STORAGE_KEYS.PRODUCTS, products);
    return finalProduct;
  },
  deleteProduct(id: string): void {
    const products = this.getProducts().filter(p => p.id !== id);
    setStored(STORAGE_KEYS.PRODUCTS, products);
  },

  // Categories & Brands
  getCategories(): Category[] {
    return getStored<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },
  saveCategory(category: Category): void {
    const list = this.getCategories();
    const idx = list.findIndex(c => c.id === category.id);
    if (idx >= 0) list[idx] = category;
    else list.push(category);
    setStored(STORAGE_KEYS.CATEGORIES, list);
  },
  getBrands(): Brand[] {
    return getStored<Brand[]>(STORAGE_KEYS.BRANDS, INITIAL_BRANDS);
  },

  // Orders
  getOrders(): Order[] {
    return getStored<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  },
  getOrderById(id: string): Order | undefined {
    return this.getOrders().find(o => o.id === id || o.orderNumber === id || o.trackingNumber === id);
  },
  getOrdersByCustomer(customerId: string): Order[] {
    return this.getOrders().filter(o => o.customerId === customerId);
  },
  createOrder(data: {
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
    transactionId?: string;
  }): Order {
    const orders = this.getOrders();
    const orderNum = `PG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingNum = `TRK-BD-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      trackingNumber: trackingNum,
      customerId: data.customerId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      shippingAddress: data.shippingAddress,
      items: data.items,
      subtotal: data.subtotal,
      deliveryMethod: data.deliveryMethod,
      deliveryCharge: data.deliveryCharge,
      discountAmount: data.discountAmount,
      couponCode: data.couponCode,
      total: data.total,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === 'cod' ? 'pending' : 'completed',
      transactionId: data.transactionId || (data.paymentMethod !== 'cod' ? `TXN-${Date.now()}` : undefined),
      orderStatus: 'Confirmed',
      courierName: data.shippingAddress.district.toLowerCase() === 'dhaka' ? 'Pathao' : 'Steadfast',
      courierTrackingCode: `${data.shippingAddress.district.toLowerCase() === 'dhaka' ? 'PTH' : 'STF'}-${Math.floor(10000 + Math.random() * 90000)}`,
      statusHistory: [
        {
          status: 'Pending',
          timestamp: new Date().toISOString(),
          note: 'Order placed through PixelGrid checkout',
          updatedBy: 'System'
        },
        {
          status: 'Confirmed',
          timestamp: new Date().toISOString(),
          note: data.paymentMethod === 'cod' ? 'Order confirmed (Cash on Delivery)' : 'Digital payment verified',
          updatedBy: 'System'
        }
      ],
      estimatedDeliveryDate: new Date(Date.now() + 86400000 * (data.deliveryMethod === 'express' ? 1 : 3)).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    orders.unshift(newOrder);
    setStored(STORAGE_KEYS.ORDERS, orders);

    // Deduct stock
    const products = this.getProducts();
    for (const item of data.items) {
      const pIdx = products.findIndex(p => p.id === item.productId);
      if (pIdx >= 0) {
        products[pIdx].stock = Math.max(0, products[pIdx].stock - item.quantity);
      }
    }
    setStored(STORAGE_KEYS.PRODUCTS, products);

    // Add user notification
    this.addNotification({
      userId: data.customerId,
      title: 'Order Placed Successfully!',
      message: `Your order #${orderNum} has been confirmed. You can track it live anytime.`,
      type: 'order',
      link: 'orders',
    });

    return newOrder;
  },
  updateOrderStatus(orderId: string, status: OrderStatus, note?: string, updatedBy = 'Admin', courierName?: Order['courierName'], trackingCode?: string): Order | undefined {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return undefined;

    const currentOrder = orders[idx];
    const newHistory = [
      ...currentOrder.statusHistory,
      {
        status,
        timestamp: new Date().toISOString(),
        note: note || `Order status updated to ${status}`,
        updatedBy
      }
    ];

    orders[idx] = {
      ...currentOrder,
      orderStatus: status,
      courierName: courierName || currentOrder.courierName,
      courierTrackingCode: trackingCode || currentOrder.courierTrackingCode,
      statusHistory: newHistory,
      updatedAt: new Date().toISOString()
    };

    setStored(STORAGE_KEYS.ORDERS, orders);

    // Notify customer
    this.addNotification({
      userId: currentOrder.customerId,
      title: `Order #${currentOrder.orderNumber} Status: ${status}`,
      message: note || `Your order status has changed to ${status}.`,
      type: 'order',
      link: 'orders',
    });

    return orders[idx];
  },
  updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Order | undefined {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return undefined;

    orders[idx] = {
      ...orders[idx],
      paymentStatus,
      updatedAt: new Date().toISOString()
    };
    setStored(STORAGE_KEYS.ORDERS, orders);
    return orders[idx];
  },

  // Coupons
  getCoupons(): Coupon[] {
    return getStored<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
  },
  validateCoupon(code: string, cartTotal: number): { valid: boolean; coupon?: Coupon; discount: number; message: string } {
    const coupons = this.getCoupons();
    const coupon = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive);

    if (!coupon) {
      return { valid: false, discount: 0, message: 'Invalid or expired coupon code.' };
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return { valid: false, discount: 0, message: 'This coupon code has expired.' };
    }

    if (cartTotal < coupon.minOrderValue) {
      return { valid: false, discount: 0, message: `Minimum order of ৳${coupon.minOrderValue.toLocaleString()} required for this coupon.` };
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    return {
      valid: true,
      coupon,
      discount: Math.round(discount),
      message: `Coupon ${coupon.code} applied! Saved ৳${Math.round(discount).toLocaleString()}.`
    };
  },
  saveCoupon(coupon: Partial<Coupon> & { code: string; discountValue: number }): Coupon {
    const coupons = this.getCoupons();
    const existingIdx = coupons.findIndex(c => c.id === coupon.id || c.code.toUpperCase() === coupon.code.toUpperCase());

    const newCoupon: Coupon = {
      id: coupon.id || `coup-${Date.now()}`,
      code: coupon.code.toUpperCase(),
      discountType: coupon.discountType || 'percentage',
      discountValue: Number(coupon.discountValue),
      minOrderValue: Number(coupon.minOrderValue) || 1000,
      maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : undefined,
      expiryDate: coupon.expiryDate || '2026-12-31',
      usageLimit: Number(coupon.usageLimit) || 1000,
      usedCount: coupon.usedCount || 0,
      isActive: coupon.isActive !== undefined ? coupon.isActive : true,
    };

    if (existingIdx >= 0) {
      coupons[existingIdx] = newCoupon;
    } else {
      coupons.unshift(newCoupon);
    }
    setStored(STORAGE_KEYS.COUPONS, coupons);
    return newCoupon;
  },
  deleteCoupon(id: string): void {
    const list = this.getCoupons().filter(c => c.id !== id);
    setStored(STORAGE_KEYS.COUPONS, list);
  },

  // Payment Gateways
  getPaymentGateways(): PaymentGatewayConfig[] {
    return getStored<PaymentGatewayConfig[]>(STORAGE_KEYS.PAYMENT_GATEWAYS, INITIAL_PAYMENT_GATEWAYS);
  },
  updatePaymentGateway(id: string, updates: Partial<PaymentGatewayConfig>): void {
    const gateways = this.getPaymentGateways();
    const idx = gateways.findIndex(g => g.id === id);
    if (idx >= 0) {
      gateways[idx] = { ...gateways[idx], ...updates };
      setStored(STORAGE_KEYS.PAYMENT_GATEWAYS, gateways);
    }
  },

  // Users
  getUsers(): User[] {
    return getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },
  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  },
  updateUser(id: string, updates: Partial<User>): User | undefined {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;

    users[idx] = { ...users[idx], ...updates };
    setStored(STORAGE_KEYS.USERS, users);
    return users[idx];
  },
  toggleBlockUser(id: string): User | undefined {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    users[idx].isBlocked = !users[idx].isBlocked;
    setStored(STORAGE_KEYS.USERS, users);
    return users[idx];
  },

  // Reviews
  getReviews(): ProductReview[] {
    return getStored<ProductReview[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  },
  getReviewsByProduct(productId: string): ProductReview[] {
    return this.getReviews().filter(r => r.productId === productId && r.status === 'approved');
  },
  addReview(review: Omit<ProductReview, 'id' | 'createdAt' | 'status'>): ProductReview {
    const reviews = this.getReviews();
    const newRev: ProductReview = {
      ...review,
      id: `rev-${Date.now()}`,
      status: 'approved',
      createdAt: new Date().toISOString()
    };
    reviews.unshift(newRev);
    setStored(STORAGE_KEYS.REVIEWS, reviews);

    // Update product rating and reviewCount
    const products = this.getProducts();
    const pIdx = products.findIndex(p => p.id === review.productId);
    if (pIdx >= 0) {
      const prodRevs = reviews.filter(r => r.productId === review.productId && r.status === 'approved');
      const avg = prodRevs.reduce((sum, r) => sum + r.rating, 0) / prodRevs.length;
      products[pIdx].rating = Number(avg.toFixed(1));
      products[pIdx].reviewCount = prodRevs.length;
      setStored(STORAGE_KEYS.PRODUCTS, products);
    }

    return newRev;
  },
  updateReviewStatus(id: string, status: 'approved' | 'rejected'): void {
    const reviews = this.getReviews();
    const idx = reviews.findIndex(r => r.id === id);
    if (idx >= 0) {
      reviews[idx].status = status;
      setStored(STORAGE_KEYS.REVIEWS, reviews);
    }
  },
  deleteReview(id: string): void {
    const reviews = this.getReviews().filter(r => r.id !== id);
    setStored(STORAGE_KEYS.REVIEWS, reviews);
  },

  // Support Tickets
  getTickets(): SupportTicket[] {
    return getStored<SupportTicket[]>(STORAGE_KEYS.TICKETS, INITIAL_SUPPORT_TICKETS);
  },
  getTicketsByUser(userId: string): SupportTicket[] {
    return this.getTickets().filter(t => t.userId === userId);
  },
  createTicket(data: {
    userId: string;
    userName: string;
    userEmail: string;
    subject: string;
    department: SupportTicket['department'];
    priority: SupportTicket['priority'];
    initialMessage: string;
  }): SupportTicket {
    const tickets = this.getTickets();
    const num = `TKT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newTkt: SupportTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: num,
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      subject: data.subject,
      department: data.department,
      priority: data.priority,
      status: 'Open',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'user',
          senderName: data.userName,
          text: data.initialMessage,
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    tickets.unshift(newTkt);
    setStored(STORAGE_KEYS.TICKETS, tickets);
    return newTkt;
  },
  replyTicket(ticketId: string, sender: 'user' | 'support', senderName: string, text: string): SupportTicket | undefined {
    const tickets = this.getTickets();
    const idx = tickets.findIndex(t => t.id === ticketId);
    if (idx === -1) return undefined;

    tickets[idx].messages.push({
      id: `msg-${Date.now()}`,
      sender,
      senderName,
      text,
      timestamp: new Date().toISOString()
    });
    tickets[idx].status = sender === 'support' ? 'In Progress' : 'Open';
    tickets[idx].updatedAt = new Date().toISOString();
    setStored(STORAGE_KEYS.TICKETS, tickets);
    return tickets[idx];
  },
  updateTicketStatus(ticketId: string, status: SupportTicket['status']): void {
    const tickets = this.getTickets();
    const idx = tickets.findIndex(t => t.id === ticketId);
    if (idx >= 0) {
      tickets[idx].status = status;
      tickets[idx].updatedAt = new Date().toISOString();
      setStored(STORAGE_KEYS.TICKETS, tickets);
    }
  },

  // Notifications
  getNotifications(userId: string): NotificationItem[] {
    const all = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return all.filter(n => n.userId === 'all' || n.userId === userId);
  },
  addNotification(item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>): void {
    const all = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    all.unshift({
      ...item,
      id: `notif-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString()
    });
    setStored(STORAGE_KEYS.NOTIFICATIONS, all);
  },
  markNotificationRead(id: string): void {
    const all = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const idx = all.findIndex(n => n.id === id);
    if (idx >= 0) {
      all[idx].isRead = true;
      setStored(STORAGE_KEYS.NOTIFICATIONS, all);
    }
  },
  markAllNotificationsRead(userId: string): void {
    const all = getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    all.forEach(n => {
      if (n.userId === 'all' || n.userId === userId) {
        n.isRead = true;
      }
    });
    setStored(STORAGE_KEYS.NOTIFICATIONS, all);
  },

  // Newsletter
  subscribeNewsletter(email: string): boolean {
    const list = getStored<string[]>(STORAGE_KEYS.NEWSLETTER, ['momin09sarker@gmail.com']);
    if (list.includes(email.toLowerCase())) return false;
    list.push(email.toLowerCase());
    setStored(STORAGE_KEYS.NEWSLETTER, list);
    return true;
  }
};
