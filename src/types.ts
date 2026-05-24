export interface Product {
  id: number;
  title: string;
  category: string;
  description: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  reviewCount: number;
  image: string;
  isBestSeller?: boolean;
  isPrime?: boolean;
  isDealOfTheDay?: boolean;
  stock: number;
  specs: Record<string, string>;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingDetails {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
}

export type PaymentMethod = 'cod' | 'upi' | 'card';

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  totalAmount: number;
  totalSavings: number;
  paymentMethod: PaymentMethod;
  upiHandle?: string;
  shippingDetails: ShippingDetails;
  status: 'pending' | 'placed' | 'shipped' | 'out_for_delivery' | 'delivered';
  currentTrackingStep: number;
}
