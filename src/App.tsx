import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  ShoppingBag,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  User,
  Mail,
  FileText,
  CreditCard,
  Package,
  Star,
  MapPin,
  Menu,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
  Sparkles,
  TrendingDown,
  Smartphone,
  QrCode,
  AlertCircle,
  X,
  ShieldCheck,
  ThumbsUp,
  Truck,
  Heart,
  Store,
  RefreshCw,
  Tag,
  Terminal,
  Shield
} from 'lucide-react';
import { SpringBootDashboard } from './components/SpringBootDashboard';
import { AdminPanel } from './components/AdminPanel';
import { AMAZON_PRODUCTS } from './data/products';
import { Product, CartItem, ShippingDetails, Order, PaymentMethod } from './types';

// Standard User credentials pre-loaded from environment metadata
const CUSTOMER_EMAIL = 'akashhede360@gmail.com';
const CUSTOMER_NAME = 'Akash Hede';

export default function App() {
  // Navigation & Categorization States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [primeOnly, setPrimeOnly] = useState<boolean>(false);
  const [bestSellersOnly, setBestSellersOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [priceRange, setPriceRange] = useState<number>(1000);

  // Cart Management States
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('uvicorn_cart_v1');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);

  // Product Inspection Modal State
  const [inspectedProduct, setInspectedProduct] = useState<Product | null>(null);

  // checkout Flow Management
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [checkoutStep, setCheckoutStep] = useState<number>(1); // 1: Shipping, 2: Payment, 3: Review, 4: Placed

  // prefill shipping addresses
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    fullName: CUSTOMER_NAME,
    address: 'Flat 402, Sunset Highrise, Block C, Sector-62',
    city: 'New Delhi',
    state: 'Delhi',
    postalCode: '110001',
    phone: '+91 98765 43210'
  });

  // checkout state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [selectedUpiProvider, setSelectedUpiProvider] = useState<string>('gpay');
  const [customUpiId, setCustomUpiId] = useState<string>('akashhede306@okaxis');
  const [isUpiPaying, setIsUpiPaying] = useState<boolean>(false);
  const [upiPaymentLog, setUpiPaymentLog] = useState<string[]>([]);
  const [upiTimer, setUpiTimer] = useState<number>(300); // 5:00 minutes QR code timer
  const [upiPaidSuccess, setUpiPaidSuccess] = useState<boolean>(false);

  // Generated orders list held in localStorage to preserve history
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('uvicorn_orders_v1');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [activeTab, setActiveTab ] = useState<'store' | 'orders' | 'backend' | 'admin'>('store');

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('uvicorn_products_v1');
    return saved ? JSON.parse(saved) : AMAZON_PRODUCTS;
  });

  const [userRole, setUserRole] = useState<'CUSTOMER' | 'STORE_MANAGER' | 'SYSTEM_ADMIN'>('CUSTOMER');

  useEffect(() => {
    localStorage.setItem('uvicorn_products_v1', JSON.stringify(products));
  }, [products]);

  // Dispatch Spring Boot REST logging telemetry on filter/search updates
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      window.dispatchEvent(new CustomEvent('springboot_log', {
        detail: {
          type: 'INFO',
          logger: 'controller.ProductController',
          message: `GET /api/products?search="${searchQuery}" - SUCCESS: Filter query parsed. Loaded matches.`
        }
      }));
    }
  }, [searchQuery]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('springboot_log', {
      detail: {
        type: 'INFO',
        logger: 'controller.ProductController',
        message: `GET /api/products?category="${selectedCategory}"&bestseller=${bestSellersOnly} - Fetched active catalog entities.`
      }
    }));
  }, [selectedCategory, bestSellersOnly]);

  // Hero carousel banners
  const [activeHeroBanner, setActiveHeroBanner] = useState<number>(0);
  const heroBanners = [
    {
      title: "Great Summer Festival Sale is Live!",
      desc: "Save up to 40% on cutting-edge home accessories and laptops. FREE deliveries on Prime.",
      bg: "bg-radial from-slate-900 via-slate-950 to-emerald-950",
      accent: "Textured Premium Leather Headphones 25% Off"
    },
    {
      title: "Supercharge Your Home Lab Setup",
      desc: "Discover hand-curated mechanical keyboards, developer mugs, and high-efficiency ANC devices.",
      bg: "bg-radial from-slate-900 via-slate-950 to-indigo-950",
      accent: "Uvicorn Best Sellers starting at only $18.00"
    }
  ];

  // Auto scroll carousel banners
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHeroBanner(prev => (prev === 0 ? 1 : 0));
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Save Cart and Orders in localStorage
  useEffect(() => {
    localStorage.setItem('uvicorn_cart_v1', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('uvicorn_orders_v1', JSON.stringify(orders));
  }, [orders]);

  // UPI QR Code countdown timer
  useEffect(() => {
    let interval: any = null;
    if (isCheckoutOpen && checkoutStep === 2 && paymentMethod === 'upi' && !upiPaidSuccess) {
      interval = setInterval(() => {
        setUpiTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 300;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckoutOpen, checkoutStep, paymentMethod, upiPaidSuccess]);

  // Format timer
  const formatUpiTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Cart actions
  const addToCart = (product: Product, qty: number = 1) => {
    // Dispatch Spring Boot REST logging telemetry
    window.dispatchEvent(new CustomEvent('springboot_log', {
      detail: {
        type: 'INFO',
        logger: 'controller.ProductController',
        message: `GET /api/products/${product.id} - Hydrated details for cart item. Stock availability checked: ${product.stock}.`
      }
    }));
    window.dispatchEvent(new CustomEvent('springboot_log', {
      detail: {
        type: 'DEBUG',
        logger: 'repository.ProductRepository',
        message: `Hibernate: select p1_0.id,p1_0.title,p1_0.price,p1_0.stock from products p1_0 where p1_0.id=${product.id}`
      }
    }));

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: Math.min(product.stock, item.quantity + qty) }
            : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  };

  const updateCartQty = (productId: number, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity: Math.min(item.product.stock, qty) };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Derived calculations 
  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const originalSubtotal = cart.reduce((sum, item) => sum + item.product.originalPrice * item.quantity, 0);
    const savings = originalSubtotal - subtotal;
    const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const shipping = subtotal >= 50 ? 0 : 9.99;
    const finalTotal = subtotal + shipping;
    return { subtotal, savings, itemsCount, shipping, finalTotal };
  }, [cart]);

  // Filtering products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesPrime = !primeOnly || product.isPrime;
      const matchesBestSeller = !bestSellersOnly || product.isBestSeller;
      const matchesRating = product.rating >= minRating;
      const matchesPrice = product.price <= priceRange;

      return matchesSearch && matchesCategory && matchesPrime && matchesBestSeller && matchesRating && matchesPrice;
    });
  }, [searchQuery, selectedCategory, primeOnly, bestSellersOnly, minRating, priceRange]);

  // Handle UPI Verification Animation
  const startUpiSimulationPayment = () => {
    setIsUpiPaying(true);
    setUpiPaymentLog([]);
    setUpiPaymentLog(prev => [...prev, "🔄 Initiating secure payment gateway handshake..."]);
    
    setTimeout(() => {
      setUpiPaymentLog(prev => [...prev, `🔍 Looking up Virtual Account identifier: ${customUpiId}...`]);
    }, 1000);

    setTimeout(() => {
      setUpiPaymentLog(prev => [...prev, "📡 Fetching authorization token response from Customer Bank..."]);
    }, 2200);

    setTimeout(() => {
      setUpiPaymentLog(prev => [...prev, "🔒 Authenticating credentials against UPI safety vaults..."]);
    }, 3400);

    setTimeout(() => {
      setUpiPaymentLog(prev => [...prev, "💵 Debited amount, transfer approved by merchant portal!"]);
      setUpiPaidSuccess(true);
      setIsUpiPaying(false);
    }, 4500);
  };

  // Place actual order
  const handlePlaceOrder = () => {
    const orderId = 'ODR-' + Math.floor(1000000000 + Math.random() * 9000000000);
    const newOrder: Order = {
      id: orderId,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      items: [...cart],
      totalAmount: cartTotals.finalTotal,
      totalSavings: cartTotals.savings,
      paymentMethod,
      upiHandle: paymentMethod === 'upi' ? customUpiId : undefined,
      shippingDetails,
      status: 'placed',
      currentTrackingStep: 1 // 1: Placed, 2: Dispatched, 3: Out for Delivery, 4: Delivered
    };

    // Dispatch Spring Boot REST logging telemetry
    window.dispatchEvent(new CustomEvent('springboot_log', {
      detail: {
        type: 'INFO',
        logger: 'controller.OrderController',
        message: `POST /api/orders - Created order ${orderId}. Total: $${cartTotals.finalTotal.toFixed(2)}, Savings: $${cartTotals.savings.toFixed(2)}`
      }
    }));
    window.dispatchEvent(new CustomEvent('springboot_log', {
      detail: {
        type: 'DEBUG',
        logger: 'repository.OrderRepository',
        message: `Hibernate: insert into customer_orders (id, date, total_amount, payment_method, status, serialized_items) values ('${orderId}', '${new Date().toLocaleDateString()}', ${cartTotals.finalTotal}, '${paymentMethod}', 'placed', '${cart.map(item => item.product.id + ":" + item.quantity).join(",")}')`
      }
    }));

    setOrders(prev => [newOrder, ...prev]);
    setSelectedOrderForTracking(newOrder);
    clearCart();
    setCheckoutStep(4);
    setUpiPaidSuccess(false);
    setUpiTimer(300);
  };

  // Simulate instant courier shipping states
  const advanceTrackingState = (orderId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const nextStep = order.currentTrackingStep < 4 ? order.currentTrackingStep + 1 : 1;
        const statusMap: Record<number, Order['status']> = {
          1: 'placed',
          2: 'shipped',
          3: 'out_for_delivery',
          4: 'delivered'
        };
        const nextStatus = statusMap[nextStep];

        // Dispatch Spring Boot REST logging telemetry
        window.dispatchEvent(new CustomEvent('springboot_log', {
          detail: {
            type: 'INFO',
            logger: 'controller.OrderController',
            message: `PUT /api/orders/${orderId}/tracking?step=${nextStep}&status=${nextStatus} - Triggered courier transition milestone`
          }
        }));
        window.dispatchEvent(new CustomEvent('springboot_log', {
          detail: {
            type: 'DEBUG',
            logger: 'repository.OrderRepository',
            message: `Hibernate: update customer_orders set status='${nextStatus}', current_tracking_step=${nextStep} where id='${orderId}'`
          }
        }));

        const updated = {
          ...order,
          currentTrackingStep: nextStep,
          status: nextStatus
        };
        if (selectedOrderForTracking?.id === orderId) {
          setSelectedOrderForTracking(updated);
        }
        return updated;
      }
      return order;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col antialiased">
      
      {/* TIER 1 AMAZON MAIN HEADER NAV */}
      <header className="bg-slate-900 sticky top-0 z-40 select-none shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14 md:h-16 gap-4">
          
          {/* Logo Brand Accent */}
          <div 
            onClick={() => { setActiveTab('store'); setSelectedOrderForTracking(null); }} 
            className="flex items-center space-x-2 cursor-pointer p-2 hover:ring-1 hover:ring-slate-300 rounded"
          >
            <div className="flex flex-col">
              <span className="text-white font-black text-xl md:text-2xl tracking-tight leading-none flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-emerald-400 fill-emerald-400 animate-pulse shrink-0" />
                uvicorn<span className="text-emerald-400 font-black">.io</span>
              </span>
              <span className="text-[10px] text-slate-350 text-slate-400 font-bold tracking-wider uppercase ml-1 block leading-none">
                Express Marketplace
              </span>
            </div>
          </div>

          {/* Delivery Location Finder Pin */}
          <div className="hidden lg:flex items-center space-x-1 p-2 hover:ring-1 hover:ring-slate-300 rounded cursor-pointer max-w-[200px]">
            <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs text-white truncate">
              <span className="text-slate-400 block text-[10px]">Deliver to {CUSTOMER_NAME.split(' ')[0]}</span>
              <span className="font-bold">{shippingDetails.city}, {shippingDetails.postalCode}</span>
            </div>
          </div>

          {/* Core Interactive Amazon Search Command Bar */}
          <div className="flex-1 max-w-2xl relative flex items-center">
            {/* Category selection */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-205 bg-slate-200 border-r border-slate-300 rounded-l-md text-slate-800 text-xs px-2.5 h-10 outline-none hover:bg-slate-300 cursor-pointer text-ellipsis hidden md:block"
            >
              <option value="All">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Home & Kitchen">Home</option>
              <option value="Books">Books</option>
            </select>
            
            {/* Search Input Box */}
            <input
              type="text"
              placeholder="Search Uvicorn Express (e.g. headphones, laptop, watch, mug)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 h-10 text-xs md:text-sm text-slate-900 bg-white border-0 outline-none md:rounded-none rounded-l-md focus:ring-2 focus:ring-amber-500"
            />
            
            {/* Search Dispatch Action Button Icon */}
            <button className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-5 h-10 rounded-r-md flex items-center justify-center transition-all cursor-pointer">
              <Search className="w-4 h-4 text-slate-950 font-black shrink-0" />
            </button>
          </div>

          {/* Spring Boot JVM Console Tab Trigger */}
          <div 
            onClick={() => { setActiveTab('backend'); setSelectedOrderForTracking(null); }}
            className={`hidden md:flex flex-col items-start p-2 hover:ring-1 hover:ring-slate-300 rounded cursor-pointer text-xs text-white text-left ${activeTab === 'backend' ? 'ring-1 ring-emerald-400 bg-slate-800' : ''}`}
          >
            <span className="text-emerald-400 text-[10px] uppercase font-mono tracking-wider font-extrabold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Active :8080
            </span>
            <span className="font-bold flex items-center gap-1">
              JVM Console
            </span>
          </div>

          {/* Admin RBAC Portal Trigger */}
          <div 
            onClick={() => { setActiveTab('admin'); setSelectedOrderForTracking(null); }}
            className={`hidden md:flex flex-col items-start p-2 hover:ring-1 hover:ring-slate-300 rounded cursor-pointer text-xs text-white text-left ${activeTab === 'admin' ? 'ring-1 ring-amber-400 bg-slate-800' : ''}`}
          >
            <span className={`${userRole === 'CUSTOMER' ? 'text-slate-400' : userRole === 'STORE_MANAGER' ? 'text-amber-400 font-extrabold' : 'text-rose-455 text-rose-400 font-black'} text-[10px] uppercase font-mono tracking-wider flex items-center gap-1`}>
              <span className={`w-1.5 h-1.5 rounded-full ${userRole === 'CUSTOMER' ? 'bg-slate-500' : 'bg-amber-400 animate-pulse'}`} />
              Role: {userRole}
            </span>
            <span className="font-bold flex items-center gap-1">
              Admin Panel
            </span>
          </div>

          {/* Order Status & Log Tracking Trigger */}
          <div 
            onClick={() => { setActiveTab('orders'); setSelectedOrderForTracking(orders[0] || null); }}
            className="hidden sm:flex flex-col items-start p-2 hover:ring-1 hover:ring-slate-300 rounded cursor-pointer text-xs text-white text-left"
          >
            <span className="text-slate-400 text-[10px]">Returns</span>
            <span className="font-bold flex items-center gap-1">
              & Orders
              {orders.length > 0 && (
                <span className="bg-teal-500 text-slate-900 font-extrabold text-[9px] rounded-full px-1.5 h-3.5 flex items-center justify-center">
                  {orders.length}
                </span>
              )}
            </span>
          </div>

          {/* Basket Shopping Cart Trigger Button */}
          <div 
            onClick={() => setIsCartDrawerOpen(true)}
            className="flex items-center space-x-2 bg-slate-805 hover:bg-slate-800 border border-slate-700 md:bg-transparent md:border-none p-2 hover:ring-1 hover:ring-slate-300 rounded cursor-pointer text-white relative"
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6 text-white" />
              {cartTotals.itemsCount > 0 && (
                <span className="absolute -top-2.5 -right-2 bg-amber-400 text-slate-950 font-black text-xs rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-slate-900 animate-scale-up">
                  {cartTotals.itemsCount}
                </span>
              )}
            </div>
            <span className="hidden md:inline text-xs font-bold self-end text-slate-200">Cart</span>
          </div>

        </div>

        {/* TIER 2 SUBNAVIGATION STRIP ribbon */}
        <div className="bg-slate-800 text-slate-200 border-t border-slate-700 flex items-center h-9 px-4 overflow-x-auto text-xs whitespace-nowrap select-none scrollbar-none">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => { setSelectedCategory('All'); setActiveTab('store'); }}
                className={`flex items-center space-x-1 font-extrabold p-1.5 hover:bg-slate-750 hover:bg-slate-700 rounded transition-all cursor-pointer ${selectedCategory === 'All' && activeTab === 'store' ? 'text-amber-400 bg-slate-700' : ''}`}
              >
                <Menu className="w-3.5 h-3.5" />
                <span>All Products</span>
              </button>
              
              {/* Dynamic Quick Categorizer triggers */}
              {['Electronics', 'Fashion', 'Home & Kitchen', 'Books'].map(cat => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setActiveTab('store'); setSelectedOrderForTracking(null); }}
                  className={`py-1.5 px-2.5 hover:bg-slate-700 hover:text-white rounded transition-all cursor-pointer ${selectedCategory === cat && activeTab === 'store' ? 'text-amber-400 bg-slate-700 font-bold' : 'text-slate-300'}`}
                >
                  {cat}
                </button>
              ))}

              <div className="w-px h-4 bg-slate-700" />

              <button 
                onClick={() => { setActiveTab('backend'); setSelectedOrderForTracking(null); }}
                className={`py-1.5 px-2.5 hover:bg-slate-700 rounded flex items-center gap-1 cursor-pointer ${activeTab === 'backend' ? 'text-emerald-400 bg-slate-900 font-extrabold' : 'text-slate-300'}`}
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Spring Boot Backend</span>
              </button>

              <div className="w-px h-4 bg-slate-700" />

              <button 
                onClick={() => { setActiveTab('admin'); setSelectedOrderForTracking(null); }}
                className={`py-1.5 px-2.5 hover:bg-slate-700 rounded flex items-center gap-1 cursor-pointer ${activeTab === 'admin' ? 'text-amber-400 bg-slate-900 font-extrabold' : 'text-slate-300'}`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-450 text-amber-400" />
                <span>Admin Panel</span>
              </button>

              <div className="w-px h-4 bg-slate-700" />

              <button 
                onClick={() => { setBestSellersOnly(prev => !prev); setActiveTab('store'); }}
                className={`py-1.5 px-2.5 hover:bg-slate-700 rounded flex items-center gap-1 cursor-pointer ${bestSellersOnly ? 'text-amber-400 font-bold' : 'text-slate-300'}`}
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Best Sellers</span>
              </button>

              <button 
                onClick={() => { setPrimeOnly(prev => !prev); setActiveTab('store'); }}
                className={`py-1.5 px-2.5 hover:bg-slate-700 rounded flex items-center gap-1 cursor-pointer ${primeOnly ? 'text-sky-400 font-bold' : 'text-slate-300'}`}
              >
                <span className="text-sky-400 font-black font-serif italic text-xs">prime</span>
                <span>Deals</span>
              </button>
            </div>

            {/* Simulated Live User Account Status Indicator */}
            <div className="hidden md:flex items-center space-x-2 text-[11px] text-slate-300">
              <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="font-mono">User: <strong>{CUSTOMER_EMAIL}</strong></span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">Fast Delivery Account</span>
            </div>
          </div>
        </div>
      </header>

      {/* CORE HERO WRAPPER FOR STOREFRONT OR ORDER TRACKING */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {activeTab === 'store' ? (
          <>
            {/* DYNAMIC CAROUSEL FLASH BANNER */}
            <div className="relative rounded-2xl overflow-hidden shadow-md">
              <div className={`transition-all duration-700 ease-in-out p-6 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 relative ${heroBanners[activeHeroBanner].bg}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30 pointer-events-none" />
                
                <div className="z-10 space-y-3 max-w-xl text-left">
                  <span className="bg-emerald-400 text-slate-950 text-[10px] uppercase font-mono tracking-widest font-black px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                    <Tag className="w-3 h-3" /> Uvicorn Exclusive Deal
                  </span>
                  <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                    {heroBanners[activeHeroBanner].title}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed md:max-w-md">
                    {heroBanners[activeHeroBanner].desc}
                  </p>
                  <p className="text-[11px] text-amber-300 font-mono flex items-center gap-1 font-bold">
                    <span>⚡ Featured: {heroBanners[activeHeroBanner].accent}</span>
                  </p>
                </div>

                <div className="z-10 bg-slate-900/60 backdrop-blur border border-slate-700/50 p-4 rounded-xl text-center space-y-2 min-w-[200px] shrink-0 shadow-lg">
                  <div className="text-amber-400 font-bold text-xs uppercase tracking-wider font-mono">Today's Promotion</div>
                  <div className="text-3xl font-black text-white">UP TO 25% OFF</div>
                  <p className="text-[10px] text-slate-450 text-slate-300 max-w-[170px] mx-auto">On Uvicorn Tech Core Accessories and Fashion Apparel catalog</p>
                  <button 
                    onClick={() => { setSelectedCategory('Electronics'); setBestSellersOnly(true); }}
                    className="mt-2 text-[10px] bg-amber-400 text-slate-950 font-black py-1.5 px-3 rounded-lg hover:bg-amber-500 w-full transition-all flex items-center justify-center gap-1 uppercase"
                  >
                    <span>Inspect Deals</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Slider Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
                <button 
                  onClick={() => setActiveHeroBanner(0)} 
                  className={`w-2.5 h-2.5 rounded-full ${activeHeroBanner === 0 ? 'bg-amber-400' : 'bg-slate-600'}`} 
                />
                <button 
                  onClick={() => setActiveHeroBanner(1)} 
                  className={`w-2.5 h-2.5 rounded-full ${activeHeroBanner === 1 ? 'bg-amber-400' : 'bg-slate-600'}`} 
                />
              </div>
            </div>

            {/* DUAL DIVISION GRID: SIDEBAR FILTERS & PRODUCTS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* SIDEBAR NAVIGATION FILTERS (Left 3 columns) */}
              <aside className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-left">
                
                {/* Section header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-slate-600" />
                    Filters & Refine
                  </h3>
                  <button 
                    onClick={() => {
                      setSelectedCategory('All');
                      setPrimeOnly(false);
                      setBestSellersOnly(false);
                      setMinRating(0);
                      setPriceRange(1000);
                      setSearchQuery('');
                    }}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded"
                  >
                    Reset All
                  </button>
                </div>

                {/* Filter Block 1: Categories list */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Category</span>
                  <div className="space-y-1">
                    {['All', 'Electronics', 'Fashion', 'Home & Kitchen', 'Books'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg flex items-center justify-between transition-all ${
                          selectedCategory === cat 
                            ? 'bg-amber-50 text-amber-950 font-bold' 
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{cat === 'All' ? 'All Departments' : cat}</span>
                        {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-amber-700" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter Block 2: Quick Deals Checkbox */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Deal Eligibility</span>
                  
                  <label className="flex items-center space-x-2.5 text-xs text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={primeOnly}
                      onChange={(e) => setPrimeOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-slate-300"
                    />
                    <span className="flex items-center gap-1">
                      <span className="text-sky-505 text-sky-500 font-extrabold font-serif italic">prime</span> Free Shipping
                    </span>
                  </label>

                  <label className="flex items-center space-x-2.5 text-xs text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={bestSellersOnly}
                      onChange={(e) => setBestSellersOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-slate-300"
                    />
                    <span className="flex items-center gap-1 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      Uvicorn Best Sellers
                    </span>
                  </label>
                </div>

                {/* Filter Block 3: Max Price Slider */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Max Price</span>
                    <span className="text-xs font-black text-indigo-700 font-mono">${priceRange}</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="1000"
                    step="10"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>$15</span>
                    <span>$500</span>
                    <span>$1000+</span>
                  </div>
                </div>

                {/* Filter Block 4: Customer Ratings stars */}
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Avg. Customer Review</span>
                  <div className="space-y-1">
                    {[4, 4.5, 4.8].map(stars => (
                      <button
                        key={stars}
                        onClick={() => setMinRating(stars === minRating ? 0 : stars)}
                        className={`w-full text-left text-xs py-1.5 px-2 rounded-lg flex items-center gap-1.5 transition-all ${
                          minRating === stars ? 'bg-indigo-50 text-indigo-950 font-bold' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${i < Math.floor(stars) ? 'fill-amber-400' : 'text-slate-350 text-slate-200'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-[11px]">{stars === 4.8 ? 'Excellent (4.8+)' : stars === 4.5 ? '4.5 & Up' : '4.0 & Up'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info Block: Assured Guarantee Badge */}
                <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold block text-slate-900 leading-none">100% Secure Checkout</span>
                      <span className="text-[10px] text-slate-400">Escrow backed UPI & COD orders</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Truck className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div>
                      <span className="font-bold block text-slate-900 leading-none">Fulfilled by Uvicorn</span>
                      <span className="text-[10px] text-slate-400">Fast tracking dispatch channels</span>
                    </div>
                  </div>
                </div>

              </aside>

              {/* PRODUCTS LISTING CONTAINER (Right 9 columns) */}
              <div className="lg:col-span-9 space-y-4">
                
                {/* Result count stats banner */}
                <div className="bg-white rounded-xl px-5 py-3 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-left">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-none">
                      {searchQuery ? `Search results for "${searchQuery}"` : `Departments: ${selectedCategory === 'All' ? 'All Products' : selectedCategory}`}
                    </h3>
                    <p className="text-[11px] text-slate-405 text-slate-400 mt-1">
                      Showing <strong className="text-slate-800">{filteredProducts.length}</strong> of <strong className="text-slate-800">{products.length}</strong> available items
                    </p>
                  </div>
                  
                  {/* Category Pill summary badges */}
                  <div className="flex items-center gap-1.5">
                    {primeOnly && (
                      <span className="bg-sky-50 text-sky-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        Prime Eligible <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => setPrimeOnly(false)} />
                      </span>
                    )}
                    {bestSellersOnly && (
                      <span className="bg-amber-50 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        Best Sellers <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => setBestSellersOnly(false)} />
                      </span>
                    )}
                    {minRating > 0 && (
                      <span className="bg-indigo-50 text-indigo-700 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        ⭐ {minRating}+ <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => setMinRating(0)} />
                      </span>
                    )}
                  </div>
                </div>

                {/* Fallback Empty Search Results state */}
                {filteredProducts.length === 0 && (
                  <div className="bg-white rounded-2xl py-16 px-4 text-center border border-slate-200 text-slate-400 space-y-4 shadow-sm">
                    <div className="bg-slate-50 p-4 rounded-full border border-slate-100 inline-block">
                      <ShoppingBag className="w-10 h-10 text-slate-350" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-700 text-base">No Products Found</h4>
                      <p className="text-xs text-slate-550 text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                        We couldn't locate matching items with the current filters. Set higher price ranges or clear your search input text.
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedCategory('All');
                        setPrimeOnly(false);
                        setBestSellersOnly(false);
                        setMinRating(0);
                        setPriceRange(1000);
                        setSearchQuery('');
                      }}
                      className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-lg text-xs tracking-wider transition-all"
                    >
                      Browse All Catalog Items
                    </button>
                  </div>
                )}

                {/* THE MAIN PRODUCTS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map(product => {
                    const cartItem = cart.find(item => item.product.id === product.id);
                    const qtyInCart = cartItem ? cartItem.quantity : 0;
                    const stockAvailable = product.stock - qtyInCart;

                    return (
                      <div 
                        key={product.id}
                        className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg hover:border-amber-400/40 transition-all flex flex-col justify-between group relative text-left"
                      >
                        {/* Best seller ribbon badges */}
                        {product.isBestSeller && (
                          <span className="absolute top-2 left-2 bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow z-10">
                            Best Seller
                          </span>
                        )}

                        {product.isDealOfTheDay && (
                          <span className="absolute top-2 left-2 bg-rose-600 text-white font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow z-10">
                            Deal of the Day
                          </span>
                        )}

                        {/* Heart Wishlist Trigger */}
                        <button className="absolute top-2.5 right-2.5 bg-white/85 hover:bg-white p-1.5 rounded-full shadow-sm hover:text-rose-500 text-slate-400 z-10 transition-all">
                          <Heart className="w-3.5 h-3.5" />
                        </button>

                        {/* Product Image Panel */}
                        <div 
                          onClick={() => setInspectedProduct(product)}
                          className="bg-slate-50 aspect-4/3 overflow-hidden border-b border-slate-100 flex items-center justify-center relative cursor-pointer"
                        >
                          <img 
                            src={product.image} 
                            alt={product.title} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-104 transition-all duration-305" 
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/20 to-transparent p-2 text-[10px] text-white flex justify-between font-mono">
                            <span>Qty Left: {product.stock} units</span>
                            <span>Specs Active</span>
                          </div>
                        </div>

                        {/* Core text description segment */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-indigo-650 text-indigo-500 uppercase tracking-widest font-mono">
                              {product.category}
                            </span>
                            
                            <h4 
                              onClick={() => setInspectedProduct(product)}
                              className="font-bold text-xs md:text-sm text-slate-900 group-hover:text-indigo-600 cursor-pointer line-clamp-2 leading-tight min-h-[36px]"
                            >
                              {product.title}
                            </h4>

                            {/* Ratings Area */}
                            <div className="flex items-center space-x-1">
                              <div className="flex text-amber-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-amber-400' : 'text-slate-200'}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] text-indigo-600 hover:underline cursor-pointer font-bold font-mono">
                                {product.reviewCount.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Authentic Original vs Discount Pricing layout */}
                          <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
                            <div className="space-y-0.5">
                              {/* Saved Pricing metrics */}
                              <div className="flex items-center space-x-1.5 select-none">
                                <span className="bg-rose-100 text-rose-750 text-rose-700 font-extrabold text-[9px] px-1.5 py-0.5 rounded-md">
                                  -{product.discountPercentage}% OFF
                                </span>
                                <span className="text-slate-400 line-through text-[10px] sm:text-xs">
                                  ${product.originalPrice.toFixed(2)}
                                </span>
                              </div>
                              {/* Live display price */}
                              <div className="flex items-start">
                                <span className="text-xs font-bold font-mono mt-0.5 text-slate-800">$</span>
                                <span className="text-lg md:text-xl font-black text-slate-950 font-mono tracking-tight leading-none">
                                  {Math.floor(product.price)}
                                </span>
                                <span className="text-xs font-bold font-mono text-slate-800">
                                  {(product.price % 1).toFixed(2).substring(1)}
                                </span>
                              </div>
                            </div>

                            {/* Shipping promise */}
                            <div className="text-right text-[10px]">
                              {product.isPrime ? (
                                <div className="space-y-0.5">
                                  <span className="text-sky-505 text-sky-500 font-serif italic font-extrabold text-xs block leading-none">prime</span>
                                  <span className="text-slate-450 block font-bold text-slate-550 text-slate-500">Tomorrow, May 25</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 block">3-Day Delivery</span>
                              )}
                            </div>
                          </div>

                          {/* Cart Add action mechanisms */}
                          <div className="pt-2">
                            {qtyInCart > 0 ? (
                              <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                                <span className="text-[11px] font-bold text-slate-600 px-1 font-mono">In Cart:</span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => updateCartQty(product.id, qtyInCart - 1)}
                                    className="w-7 h-7 rounded-lg bg-white shadow-sm hover:bg-slate-50 flex items-center justify-center text-slate-700"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="text-xs font-black text-slate-900 min-w-[12px] text-center font-mono">{qtyInCart}</span>
                                  <button
                                    onClick={() => addToCart(product, 1)}
                                    disabled={stockAvailable <= 0}
                                    className="w-7 h-7 rounded-lg bg-white shadow-sm hover:bg-slate-50 flex items-center justify-center text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(product, 1)}
                                disabled={product.stock <= 0}
                                className={`w-full py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer ${
                                  product.stock <= 0 ? 'bg-slate-100 text-slate-450 border border-slate-200 cursor-not-allowed shadow-none' : ''
                                }`}
                              >
                                {product.stock <= 0 ? (
                                  <span>Out of Stock</span>
                                ) : (
                                  <>
                                    <ShoppingCart className="w-3.5 h-3.5" />
                                    <span>Add to Cart</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>
          </>
        ) : activeTab === 'backend' ? (
          <SpringBootDashboard />
        ) : activeTab === 'admin' ? (
          <AdminPanel 
            products={products}
            setProducts={setProducts}
            orders={orders}
            setOrders={setOrders}
            userRole={userRole}
            setUserRole={setUserRole}
            advanceTrackingState={advanceTrackingState}
            setActiveTab={setActiveTab}
          />
        ) : (
          
          /* VIEW 2 PAST ORDERS TRACKING TELEMETRY STAGE */
          <div className="space-y-6">
            
            {/* Page Header banner */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 text-left shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" />
                  Your Past Purchases & Delivery Telemetry
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  Inspect the live status of your Cash on Delivery and UPI payments. Trigger our speedup simulation to watch courier routing states evolve in real-time.
                </p>
              </div>

              <button
                onClick={() => { setActiveTab('store'); setSelectedOrderForTracking(null); }}
                className="px-4 py-2 bg-slate-900 text-white font-extrabold hover:bg-slate-800 text-xs rounded-xl flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Past orders grid */}
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl py-16 px-4 text-center border border-slate-200 text-slate-400 space-y-4 shadow-sm">
                <div className="bg-slate-50 p-4 rounded-full border border-slate-100 inline-block">
                  <FileText className="w-10 h-10 text-slate-350" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 text-base">No Order History Found</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    You haven't dispatched any Uvicorn orders yet. Populate items in your cart, checkout using UPI/COD options, and monitor live deliveries here!
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTab('store')}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-lg text-xs"
                >
                  Explore store Recommendations
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Orders navigation lists (Left 5 columns) */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-sm text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 text-slate-400 block font-mono border-b border-slate-100 pb-2">
                    Orders Ledger ({orders.length})
                  </span>

                  <div className="space-y-2.5 max-h-[500px] overflow-auto">
                    {orders.map(order => (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrderForTracking(order)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                          selectedOrderForTracking?.id === order.id 
                            ? 'border-amber-400 bg-amber-50/20 shadow-sm ring-1 ring-amber-400/35' 
                            : 'border-slate-150 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-405 text-slate-400 font-bold block">{order.date}</span>
                          <span className="text-slate-900 font-bold bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                            {order.id.substring(0, 11)}..
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-slate-500 text-[10px] block">Shipping Destination</span>
                            <span className="font-bold text-slate-800">{order.shippingDetails.fullName}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-500 text-[10px] block">Grand Cost</span>
                            <span className="font-bold font-mono text-indigo-700">${order.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Status bar bullet */}
                        <div className="flex items-center justify-between pt-1 font-mono text-[10px]">
                          <span className="capitalize bg-indigo-50 text-indigo-800 font-bold px-2 py-0.5 rounded">
                            Method: {order.paymentMethod.toUpperCase()}
                          </span>

                          <span className={`font-black px-2 py-0.5 rounded ${
                            order.status === 'delivered' 
                              ? 'bg-emerald-50 text-emerald-800' 
                              : order.status === 'out_for_delivery'
                                ? 'bg-amber-50 text-amber-800 animate-pulse'
                                : 'bg-slate-100 text-slate-700'
                          }`}>
                            {order.status.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live tracking timeline visualizer (Right 7 columns) */}
                <div className="lg:col-span-7 space-y-4">
                  {selectedOrderForTracking ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-6 text-left shadow-sm">
                      
                      {/* Top banner context */}
                      <div className="flex justify-between items-start border-b border-slate-100 pb-4 gap-4">
                        <div>
                          <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            Order Telemetry Console
                          </span>
                          <h3 className="font-black text-slate-900 text-base mt-2 truncate max-w-sm">
                            {selectedOrderForTracking.id}
                          </h3>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <button
                            onClick={() => advanceTrackingState(selectedOrderForTracking.id)}
                            className="bg-amber-400 hover:bg-amber-505 hover:bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider py-2 px-3 rounded-xl shadow flex items-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
                          >
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Speed up Shipping</span>
                          </button>
                          <span className="text-[10px] text-slate-400 font-mono">Simulates step-by-step courier dispatch</span>
                        </div>
                      </div>

                      {/* Timeline flow */}
                      <div>
                        <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 font-mono mb-4">
                          Live Shipping Milestones & Handshake
                        </div>

                        <div className="relative pl-8 space-y-6">
                          
                          {/* Left solid vertical connecting line */}
                          <div className="absolute top-2.5 bottom-2.5 left-3 w-0.5 bg-slate-200" />
                          
                          {/* Stage 1: Placed */}
                          <div className="relative text-left">
                            <span className={`absolute -left-[26px] top-0.5 w-[14px] h-[14px] rounded-full border-2 bg-white flex items-center justify-center ${
                              selectedOrderForTracking.currentTrackingStep >= 1 ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                            }`}>
                              {selectedOrderForTracking.currentTrackingStep >= 1 && <Check className="w-2.5 h-2.5 text-white" />}
                            </span>
                            <div>
                              <h5 className={`font-bold text-xs md:text-sm ${selectedOrderForTracking.currentTrackingStep >= 1 ? 'text-emerald-700' : 'text-slate-400'}`}>
                                Purchase Order Placed & Confirmed
                              </h5>
                              <p className="text-[10px] md:text-xs text-slate-450 text-slate-500 leading-normal">
                                Transaction logged in standard checkout server. Payment Method: <strong>{selectedOrderForTracking.paymentMethod.toUpperCase()}</strong>.
                                {selectedOrderForTracking.upiHandle && ` VPA: ${selectedOrderForTracking.upiHandle}`}
                              </p>
                            </div>
                          </div>

                          {/* Stage 2: Dispatched */}
                          <div className="relative text-left">
                            <span className={`absolute -left-[26px] top-0.5 w-[14px] h-[14px] rounded-full border-2 bg-white flex items-center justify-center ${
                              selectedOrderForTracking.currentTrackingStep >= 2 ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                            }`}>
                              {selectedOrderForTracking.currentTrackingStep >= 2 && <Check className="w-2.5 h-2.5 text-white" />}
                            </span>
                            <div>
                              <h5 className={`font-bold text-xs md:text-sm ${selectedOrderForTracking.currentTrackingStep >= 2 ? 'text-emerald-700' : 'text-slate-400'}`}>
                                Dispatched from Uvicorn Fulfillment Center
                              </h5>
                              <p className="text-[10px] md:text-xs text-slate-450 text-slate-500 leading-normal">
                                Items packed in sustainable parcels, barcoded, and handed off to delivery partner.
                              </p>
                            </div>
                          </div>

                          {/* Stage 3: Out for Delivery */}
                          <div className="relative text-left">
                            <span className={`absolute -left-[26px] top-0.5 w-[14px] h-[14px] rounded-full border-2 bg-white flex items-center justify-center ${
                              selectedOrderForTracking.currentTrackingStep >= 3 ? 'border-emerald-500 bg-emerald-500 animate-pulse' : 'border-slate-300'
                            }`}>
                              {selectedOrderForTracking.currentTrackingStep >= 3 && <Check className="w-2.5 h-2.5 text-white" />}
                            </span>
                            <div>
                              <h5 className={`font-bold text-xs md:text-sm ${selectedOrderForTracking.currentTrackingStep >= 3 ? 'text-emerald-700' : 'text-slate-400'}`}>
                                Out for Delivery
                              </h5>
                              <p className="text-[10px] md:text-xs text-slate-550 text-slate-500 leading-normal">
                                Courier agent assigned to sector route. Cash on Delivery collection ready for doorstep delivery.
                              </p>
                            </div>
                          </div>

                          {/* Stage 4: Delivered */}
                          <div className="relative text-left">
                            <span className={`absolute -left-[26px] top-0.5 w-[14px] h-[14px] rounded-full border-2 bg-white flex items-center justify-center ${
                              selectedOrderForTracking.currentTrackingStep >= 4 ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                            }`}>
                              {selectedOrderForTracking.currentTrackingStep >= 4 && <Check className="w-2.5 h-2.5 text-white" />}
                            </span>
                            <div>
                              <h5 className={`font-bold text-xs md:text-sm ${selectedOrderForTracking.currentTrackingStep >= 4 ? 'text-emerald-700 font-extrabold' : 'text-slate-400'}`}>
                                Safely Delivered (Completion Handshake)
                              </h5>
                              <p className="text-[10px] md:text-xs text-slate-450 text-slate-500 leading-normal">
                                Customer handshake approved. Receipt copy dispatched, escrow payment closed successfully.
                              </p>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Delivery addresses recaps details */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Shipping Target</span>
                          <p className="font-bold text-slate-800">{selectedOrderForTracking.shippingDetails.fullName}</p>
                          <p className="text-slate-600 mt-1">{selectedOrderForTracking.shippingDetails.address}, {selectedOrderForTracking.shippingDetails.city}, {selectedOrderForTracking.shippingDetails.state} - {selectedOrderForTracking.shippingDetails.postalCode}</p>
                          <p className="text-slate-500 mt-0.5">Phone: {selectedOrderForTracking.shippingDetails.phone}</p>
                        </div>
                        <div className="flex flex-col justify-between border-t border-slate-205 md:border-t-0 md:border-l md:pl-4 pt-3 md:pt-0">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Billing Breakdown</span>
                            <div className="flex justify-between">
                              <span className="text-slate-650 text-slate-500">Gross Total Cost:</span>
                              <span className="font-bold text-slate-800">${selectedOrderForTracking.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Savings Applied:</span>
                              <span className="font-bold text-emerald-600">-${selectedOrderForTracking.totalSavings.toFixed(2)}</span>
                            </div>
                          </div>
                          
                          <div className="bg-slate-200/55 p-1.5 rounded text-[10px] text-center font-bold text-slate-700 capitalize mt-2">
                            Secure Gateway: {selectedOrderForTracking.paymentMethod.toUpperCase()} Method
                          </div>
                        </div>
                      </div>

                      {/* Ordered Products Items table list */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-405 text-slate-400 block font-mono mb-2">
                          Purchased Items Breakdown
                        </span>
                        <div className="space-y-2">
                          {selectedOrderForTracking.items.map(item => (
                            <div key={item.product.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50">
                              <div className="flex items-center space-x-3 truncate">
                                <div className="text-xl p-1 bg-slate-50 rounded border border-slate-100 aspect-square w-8 h-8 flex items-center justify-center shrink-0">
                                  <img 
                                    src={item.product.image} 
                                    alt={item.product.title} 
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover rounded" 
                                  />
                                </div>
                                <div className="truncate text-left">
                                  <span className="font-bold text-slate-900 truncate block">{item.product.title}</span>
                                  <span className="text-[10px] text-slate-500 block">Unit: ${item.product.price} × {item.quantity} units</span>
                                </div>
                              </div>
                              <span className="font-mono font-bold text-indigo-700 shrink-0">
                                ${(item.product.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl py-12 px-4 text-center border border-slate-200 text-slate-400 min-h-[350px] flex flex-col items-center justify-center">
                      <p className="font-bold text-slate-500">No active tracking panel chosen</p>
                      <p className="text-xs text-slate-400 mt-1">Select an order entry from the left ledger to see live delivery tracking systems.</p>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

        )}

      </main>

      {/* FOOTER NAVIGATION SUMMARY */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 mt-12 border-t border-slate-800 text-center select-none font-sans leading-normal">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex flex-wrap justify-center gap-6 text-slate-300 font-bold">
            <button onClick={() => { setActiveTab('store'); setSelectedCategory('All'); }} className="hover:underline">Home Storefront</button>
            <button onClick={() => { setActiveTab('store'); setSelectedCategory('Electronics'); }} className="hover:underline">Electronics</button>
            <button onClick={() => { setActiveTab('store'); setSelectedCategory('Fashion'); }} className="hover:underline">Fashion Catalog</button>
            <button onClick={() => { setActiveTab('orders'); }} className="hover:underline">Your Orders & Shipping status</button>
          </div>
          <p className="text-[11px] text-slate-500 uppercase tracking-widest font-mono">
            Full-scale Uvicorn Express Space • Protected by Uvicorn safety guidelines • 2026 Sandbox Retail
          </p>
          <div className="text-[10px] text-slate-600 max-w-lg mx-auto">
            This checkout simulates the entire e-commerce pipeline with original vs discount pricing, dynamic baskets, standard credit cards, Cash on Delivery (COD) warnings, and real-time UPI transaction handshakes. All banking APIs are simulated locally.
          </div>
        </div>
      </footer>

      {/* MODAL 1: EXTENDED SINGLE-PRODUCT INSPECTION DRAWER */}
      {inspectedProduct && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl relative text-left">
            
            {/* Close modal */}
            <button 
              onClick={() => setInspectedProduct(null)}
              className="absolute top-3 right-3 bg-slate-100 hover:bg-slate-250 hover:bg-slate-200 text-slate-650 p-2 rounded-full cursor-pointer z-10 transition-all text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content box */}
            <div className="p-6 md:p-8 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* Large Product image */}
                <div className="bg-slate-50 rounded-xl overflow-hidden aspect-square border border-slate-200 relative">
                  <img 
                    src={inspectedProduct.image} 
                    alt={inspectedProduct.title} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                  {inspectedProduct.isBestSeller && (
                    <span className="absolute top-2 left-2 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shadow">
                      Best Seller
                    </span>
                  )}
                </div>

                {/* Right side info summary */}
                <div className="space-y-4">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono font-bold">
                    {inspectedProduct.category}
                  </span>
                  
                  <h3 className="font-extrabold text-slate-900 text-base md:text-lg leading-tight">
                    {inspectedProduct.title}
                  </h3>

                  {/* Rating parameters */}
                  <div className="flex items-center space-x-1">
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(inspectedProduct.rating) ? 'fill-amber-400' : 'text-slate-200'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-indigo-600 font-bold font-mono">
                      {inspectedProduct.rating} / 5 ({inspectedProduct.reviewCount.toLocaleString()} reviews)
                    </span>
                  </div>

                  {/* Dual price discount tagger */}
                  <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-rose-700 block font-black uppercase tracking-wider mb-1">Limited Deal Price</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl md:text-2xl font-black text-slate-950 font-mono">
                          ${inspectedProduct.price.toFixed(2)}
                        </span>
                        <span className="text-slate-400 line-through text-xs md:text-sm font-mono">
                          ${inspectedProduct.originalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="bg-rose-600 text-white font-black text-xs px-2.5 py-1 rounded">
                      -{inspectedProduct.discountPercentage}% OFF
                    </div>
                  </div>

                  {/* Quantity and Cart Addition shortcut */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <span className="text-xs text-slate-600 font-bold pl-2">Stock Available: {inspectedProduct.stock} units</span>
                      <button
                        onClick={() => { addToCart(inspectedProduct, 1); setInspectedProduct(null); setIsCartDrawerOpen(true); }}
                        disabled={inspectedProduct.stock <= 0}
                        className="py-2 px-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>

              {/* Specifications block table list */}
              <div className="space-y-3.5 pt-4 border-t border-slate-100 text-left">
                <h4 className="font-extrabold text-slate-900 text-xs md:text-sm tracking-wide uppercase font-mono">
                  Advanced Product Specifications
                </h4>
                
                <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200 divide-y divide-slate-200">
                  {Object.entries(inspectedProduct.specs).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-12 p-3 text-xs">
                      <span className="col-span-5 md:col-span-4 font-extrabold text-slate-500 font-mono truncate">{key}</span>
                      <span className="col-span-12 col-span-7 md:col-span-8 text-slate-800 break-words font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 text-left">
                <h4 className="font-extrabold text-slate-900 text-xs md:text-sm tracking-wide uppercase font-mono">
                  Product Description
                </h4>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                  {inspectedProduct.description}
                </p>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: FULLY-FEATURED CART DRAWER OVERLAY */}
      {isCartDrawerOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between relative text-left">
            
            {/* Top Close header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white select-none">
              <h3 className="font-extrabold text-sm md:text-base flex items-center gap-1.5">
                <ShoppingCart className="w-5 h-5 text-amber-400" />
                Your Shopping Cart Basket
              </h3>
              
              <button 
                onClick={() => setIsCartDrawerOpen(false)}
                className="hover:bg-slate-800 rounded p-1.5 cursor-pointer text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mid Container: cart itemizers */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              
              {/* Promo free delivery count indicator */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
                {cartTotals.subtotal >= 50 ? (
                  <span className="font-bold flex items-center gap-1 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Congratulations! Your order qualifies for <strong>FREE Delivery</strong>.
                  </span>
                ) : (
                  <span>
                    Add <strong className="font-bold text-amber-950">${(50 - cartTotals.subtotal).toFixed(2)}</strong> more of eligible items to unlock <strong className="font-bold">FREE fast shipping</strong>.
                  </span>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-4">
                  <div className="bg-slate-50 p-4 rounded-full border border-slate-100 inline-block">
                    <ShoppingBag className="w-8 h-8 text-slate-350" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-705">Your Basket is Clean</h4>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] leading-relaxed mx-auto">
                      Select items from the main shelves to compile standard cart parameters mock orders.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.product.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex gap-3 text-xs hover:border-slate-300">
                      
                      {/* Thumbnail photo */}
                      <div className="w-16 h-16 bg-white border border-slate-150 rounded overflow-hidden shrink-0">
                        <img 
                          src={item.product.image} 
                          alt={item.product.title} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      </div>

                      {/* Text adjustments info block */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-bold text-slate-900 line-clamp-1 truncate">{item.product.title}</span>
                            <button 
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <span className="text-[10px] text-slate-450 text-slate-500 block mt-0.5">
                            Original: ${item.product.originalPrice} • Saved ${ (item.product.originalPrice - item.product.price).toFixed(2) } each
                          </span>
                        </div>

                        {/* Increment / Decrement bar */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 mt-1.5">
                          <span className="font-bold text-indigo-700 font-mono">${(item.product.price * item.quantity).toFixed(2)}</span>
                          
                          <div className="flex items-center space-x-1.5 bg-white p-0.5 rounded-lg border border-slate-200">
                            <button
                              onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                              className="w-5.5 h-5.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 flex items-center justify-center cursor-pointer"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="font-black text-slate-805 min-w-[12px] text-center font-mono">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock}
                              className="w-5.5 h-5.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>

                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Bottom calculation and Checkout trigger */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-slate-200 space-y-3 shadow-lg bg-white select-none">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal Items ({cartTotals.itemsCount} select items):</span>
                    <span className="font-bold text-slate-900 font-mono">${cartTotals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Applied Code Savings:</span>
                    <span className="font-extrabold text-emerald-600 font-mono">-${cartTotals.savings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Charges:</span>
                    {cartTotals.shipping === 0 ? (
                      <span className="text-emerald-605 text-emerald-600 font-bold uppercase tracking-wider text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded">FREE</span>
                    ) : (
                      <span className="font-bold text-slate-900 font-mono">${cartTotals.shipping.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 border-t border-slate-100">
                    <span>Estimated Gross Total:</span>
                    <span className="text-indigo-700 text-base font-black font-mono">${cartTotals.finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => { setIsCartDrawerOpen(false); setIsCheckoutOpen(true); setCheckoutStep(1); }}
                    className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow cursor-pointer transition-all active:scale-[0.99]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Proceed to Uvicorn Checkout</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL 3: ROBUST SECURE CHECKOUT WIZARD */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-auto shadow-2xl relative text-left">
            
            {/* Top Wizard banner indicator */}
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center select-none rounded-t-2xl">
              <div>
                <h4 className="font-extrabold text-sm md:text-base flex items-center gap-1.5 uppercase font-mono tracking-wider">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Uvicorn Secure Checkout Port
                </h4>
                <p className="text-[10px] text-slate-400 font-mono">User authentication: {CUSTOMER_EMAIL}</p>
              </div>

              {checkoutStep < 4 && (
                <button 
                  onClick={() => setIsCheckoutOpen(false)}
                  className="hover:bg-slate-800 rounded p-1 text-slate-300 cursor-pointer hover:text-white"
                >
                  <X className="w-5.5 h-5.5" />
                </button>
              )}
            </div>

            {/* Stepper process tabs list */}
            {checkoutStep < 4 && (
              <div className="bg-slate-105 bg-slate-100 px-4 py-2 flex items-center justify-between border-b border-slate-205 border-slate-200 text-[10px] md:text-xs font-mono select-none">
                <span className={`font-bold ${checkoutStep === 1 ? 'text-indigo-650 font-black border-b-2 border-indigo-600' : 'text-slate-400'}`}>1. Delivery</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-350" />
                <span className={`font-bold ${checkoutStep === 2 ? 'text-indigo-650 font-black border-b-2 border-indigo-600' : 'text-slate-400'}`}>2. Gateway Payment</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-350" />
                <span className={`font-bold ${checkoutStep === 3 ? 'text-indigo-650 font-black border-b-2 border-indigo-600' : 'text-slate-400'}`}>3. Review Orders</span>
              </div>
            )}

            {/* Core Body Container details */}
            <div className="p-5 md:p-6 space-y-5">
              
              {/* STEP 1: SHIPPING DETAILS FORM */}
              {checkoutStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-xs md:text-sm tracking-wide uppercase font-mono border-b border-slate-100 pb-2">
                    Enter Shipping Destination Coordinates
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Full Customer Name</label>
                      <input
                        type="text"
                        value={shippingDetails.fullName}
                        onChange={(e) => setShippingDetails({ ...shippingDetails, fullName: e.target.value })}
                        className="w-full px-3 py-2 text-xs md:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-slate-900 font-bold"
                      />
                    </div>

                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Door/Flat No & Area Address</label>
                      <input
                        type="text"
                        value={shippingDetails.address}
                        onChange={(e) => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                        className="w-full px-3 py-2 text-xs md:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">City</label>
                      <input
                        type="text"
                        value={shippingDetails.city}
                        onChange={(e) => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                        className="w-full px-3 py-2 text-xs md:text-sm border border-slate-300 rounded-lg bg-white outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">State</label>
                      <input
                        type="text"
                        value={shippingDetails.state}
                        onChange={(e) => setShippingDetails({ ...shippingDetails, state: e.target.value })}
                        className="w-full px-3 py-2 text-xs md:text-sm border border-slate-300 rounded-lg bg-white outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Postal Code</label>
                      <input
                        type="text"
                        value={shippingDetails.postalCode}
                        onChange={(e) => setShippingDetails({ ...shippingDetails, postalCode: e.target.value })}
                        className="w-full px-3 py-2 text-xs md:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Mobile Number</label>
                      <input
                        type="text"
                        value={shippingDetails.phone}
                        onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                        className="w-full px-3 py-2 text-xs md:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setCheckoutStep(2)}
                    disabled={!shippingDetails.fullName || !shippingDetails.address}
                    className="w-full py-3 bg-slate-900 text-white font-extrabold hover:bg-slate-800 text-xs tracking-wider rounded-xl shadow-md transition-all uppercase cursor-pointer disabled:opacity-40"
                  >
                    Select Payment Method ➔
                  </button>
                </div>
              )}

              {/* STEP 2: PAYMENT METHOD (COD AND UPI AS MANDATED) */}
              {checkoutStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-xs md:text-sm tracking-wide uppercase font-mono border-b border-slate-100 pb-2">
                    Select Gateway Funding Mechanism
                  </h3>

                  <div className="space-y-3">
                    
                    {/* OPTION A: UPI AS REQUESTED */}
                    <div 
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'upi' ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'upi' ? 'border-amber-500' : 'border-slate-300'}`}>
                            {paymentMethod === 'upi' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 text-xs sm:text-sm block">Unified Payments Interface (UPI)</span>
                            <span className="text-[10px] text-indigo-700 font-mono font-bold uppercase">Dynamic QR Code & VPA Handle Enabled</span>
                          </div>
                        </div>
                        <Smartphone className="w-5 h-5 text-slate-500" />
                      </div>

                      {/* UPI Expanded options inside */}
                      {paymentMethod === 'upi' && (
                        <div className="mt-4 pt-3 border-t border-slate-200 space-y-3 font-mono text-xs text-left" onClick={(e) => e.stopPropagation()}>
                          
                          {/* QR Code generator mock and Timer */}
                          <div className="bg-slate-950 p-4 rounded-xl text-center space-y-2.5 text-slate-100 border border-slate-805 border-slate-800 relative overflow-hidden">
                            <span className="text-[9px] uppercase tracking-wider bg-amber-500 text-slate-950 px-1 py-0.5 rounded font-bold">
                              FAST SECURITY HANDSHAKE
                            </span>
                            <div className="flex justify-center py-2 relative">
                              {/* Custom high quality SVG QR code mock */}
                              <div className="p-2 bg-white rounded-lg inline-block relative border-2 border-amber-400">
                                <QrCode className="w-24 h-24 text-slate-900" />
                                {upiPaidSuccess && (
                                  <div className="absolute inset-0 bg-emerald-500/90 backdrop-blur-xs flex flex-col items-center justify-center text-white p-1">
                                    <CheckCircle2 className="w-10 h-10 text-white animate-bounce" />
                                    <span className="text-[9px] font-sans font-black mt-1">APPROVED</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center text-[10px] px-2">
                              <span>Scan QR using GooglePay/PhonePe</span>
                              <span className="text-amber-450 text-amber-500 font-bold flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> Expiry: {formatUpiTimer(upiTimer)}
                              </span>
                            </div>
                          </div>

                          {/* UPI Provider selections */}
                          <div className="grid grid-cols-2 gap-2">
                            {['gpay', 'phonepe', 'paytm', 'yono'].map(prov => (
                              <button
                                key={prov}
                                onClick={() => setSelectedUpiProvider(prov)}
                                className={`p-2 rounded-lg border text-[10px] md:text-xs font-bold uppercase tracking-wider text-center ${
                                  selectedUpiProvider === prov 
                                    ? 'bg-indigo-600 border-indigo-650 text-white font-extrabold' 
                                    : 'bg-white text-slate-650 hover:bg-slate-50 border-slate-200'
                                }`}
                              >
                                {prov} handle
                              </button>
                            ))}
                          </div>

                          {/* VPA address manually typing */}
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-slate-400">Virtual Payment VPA Identifier</label>
                            <input
                              type="text"
                              value={customUpiId}
                              onChange={(e) => setCustomUpiId(e.target.value)}
                              placeholder="e.g. akashhede@okicici"
                              className="w-full px-2.5 py-1.5 text-xs text-slate-950 font-bold bg-white border border-slate-300 rounded focus:ring-1 focus:ring-amber-500"
                            />
                          </div>

                          {/* Trigger UPI bank simulator logs */}
                          <div className="pt-2">
                            {isUpiPaying ? (
                              <div className="bg-slate-950 p-3 rounded border border-slate-805 text-[10px] text-sky-450 text-sky-450 text-slate-300 space-y-1">
                                {upiPaymentLog.map((log, lIdx) => (
                                  <div key={lIdx} className="leading-4 font-mono">{log}</div>
                                ))}
                              </div>
                            ) : upiPaidSuccess ? (
                              <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded font-black text-center text-[11px] flex items-center justify-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>UPI Payment Verified Success! Ready to dispatch.</span>
                              </div>
                            ) : (
                              <button
                                onClick={startUpiSimulationPayment}
                                className="w-full py-2 bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs leading-none transition-all active:scale-[0.98]"
                              >
                                Pay / Simulate UPI Approval Transaction
                              </button>
                            )}
                          </div>

                        </div>
                      )}

                    </div>

                    {/* OPTION B: CASH ON DELIVERY (COD) AS REQUESTED */}
                    <div 
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'cod' ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-amber-500' : 'border-slate-300'}`}>
                            {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 text-xs sm:text-sm block">Cash on Delivery (COD)</span>
                            <span className="text-[10px] text-amber-800 font-bold block">No extra charge. Collects at doorstep.</span>
                          </div>
                        </div>
                        <CreditCard className="w-5 h-5 text-slate-500" />
                      </div>

                      {paymentMethod === 'cod' && (
                        <div className="mt-3.5 pt-3 border-t border-slate-250 text-[11px] text-slate-600 space-y-1.5 bg-amber-100/10 p-3 rounded-lg text-left" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-start space-x-1.5">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 select-none mt-0.5" />
                            <p className="text-slate-700 leading-normal">
                              <strong>COD Safety Regulations:</strong> We support contactless UPI scanning at doorstep. Pay safely using cash or scanning the courier agent's QR during home delivery.
                            </p>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* OPTION C: CREDIT / DEBIT CARDS */}
                    <div 
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'card' ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-amber-500' : 'border-slate-300'}`}>
                            {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 text-xs sm:text-sm block">Credit or Debit Card</span>
                            <span className="text-[10px] text-slate-450 block text-slate-400">All popular international credit protocols supported</span>
                          </div>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>

                  </div>

                  {/* Move on to Step 3 */}
                  <div className="pt-2 flex gap-3">
                    <button
                      onClick={() => setCheckoutStep(1)}
                      className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setCheckoutStep(3)}
                      disabled={paymentMethod === 'upi' && !upiPaidSuccess}
                      className="w-2/3 py-3 bg-slate-900 text-white font-extrabold hover:bg-slate-800 text-xs uppercase tracking-wider rounded-xl shadow transition-all disabled:opacity-40"
                    >
                      {paymentMethod === 'upi' && !upiPaidSuccess ? 'Complete UPI verification' : 'Review Summary ➔'}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: ORDER REVIEW & RECAP */}
              {checkoutStep === 3 && (
                <div className="space-y-4 text-left font-sans">
                  <h3 className="font-extrabold text-slate-900 text-xs md:text-sm tracking-wide uppercase font-mono border-b border-slate-100 pb-2">
                    Review and Confirm Purchased Items
                  </h3>

                  {/* Summary lists specs of choices */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 border-slate-201 space-y-3.5 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block font-mono">1. Delivery Address Coordinates</span>
                      <span className="font-bold text-slate-800 block text-xs mt-1">{shippingDetails.fullName} ({shippingDetails.phone})</span>
                      <span className="text-slate-550 text-slate-500 text-[11px] block mt-0.5">{shippingDetails.address}, {shippingDetails.city}, {shippingDetails.state} - {shippingDetails.postalCode}</span>
                    </div>

                    <div className="border-t border-slate-200/60 pt-3 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block font-mono">2. Selected Payment Platform</span>
                        <span className="font-extrabold text-slate-800 block uppercase font-mono text-[11px] mt-1">
                          {paymentMethod === 'upi' ? `UPI - ${customUpiId}` : paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Credit/Debit Card'}
                        </span>
                      </div>
                      <span className="bg-emerald-50 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded">
                        Authorized ✓
                      </span>
                    </div>
                  </div>

                  {/* Itemized recaps */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-405 text-slate-400 block font-mono">
                      Items being ordered ({cart.length})
                    </span>
                    <div className="max-h-[140px] overflow-auto divide-y divide-slate-100 bg-white border border-slate-100 rounded-xl px-3 py-1">
                      {cart.map(item => (
                        <div key={item.product.id} className="py-2 flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900 truncate max-w-[200px] block">{item.product.title}</span>
                          <span className="font-mono text-slate-500">Qty {item.quantity} • ${(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Calculated bill footer */}
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-1.5 text-xs">
                    <div className="flex justify-between text-indigo-900 font-medium">
                      <span>Items Gross Price:</span>
                      <span className="font-mono">${cartTotals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-indigo-950 font-bold">
                      <span>Shipping Fees:</span>
                      <span>{cartTotals.shipping === 0 ? 'FREE' : `$${cartTotals.shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-indigo-950 font-bold pb-2 border-b border-indigo-200">
                      <span>Applied Promo Code Savings:</span>
                      <span className="text-emerald-700 font-black font-mono">-${cartTotals.savings.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-indigo-950 mt-1 font-black text-sm">
                      <span>Total Amount Payable:</span>
                      <span className="text-indigo-705 font-mono text-base font-black text-indigo-700">${cartTotals.finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCheckoutStep(2)}
                      className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-650 text-xs font-bold rounded-xl transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      className="w-2/3 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                    >
                      <ShoppingCart className="w-4 h-4 text-slate-950" />
                      <span>Place Your Order & Dispatch</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: ORDER SUCCESS CELEBRATION! */}
              {checkoutStep === 4 && (
                <div className="space-y-5 text-center py-4">
                  <div className="bg-emerald-50 p-4 rounded-full border border-emerald-100 inline-block animate-bounce">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-black text-slate-900 text-lg md:text-xl">
                      Your Uvicorn Order is Dispatched!
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      E-commerce billing transaction successful. Real-time courier dispatch mechanisms configured. Order ID logged in tracking ledger.
                    </p>
                  </div>

                  {/* Order credentials recaps */}
                  {selectedOrderForTracking && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 border-slate-200 max-w-sm mx-auto font-mono text-[11px] text-left space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-450 text-slate-400 uppercase font-bold">Transaction Code:</span>
                        <span className="bold text-slate-800 font-sans font-bold">{selectedOrderForTracking.id.substring(0, 16)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-700 font-bold">Billing Total Amount:</span>
                        <span className="bold text-slate-800 font-bold font-sans">${selectedOrderForTracking.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 uppercase font-bold">Payment Method:</span>
                        <span className="bold text-slate-900 font-black uppercase font-sans">{selectedOrderForTracking.paymentMethod.toUpperCase()}</span>
                      </div>
                    </div>
                  )}

                  {/* Redirect buttons */}
                  <div className="pt-2 space-y-2.5 max-w-sm mx-auto">
                    <button
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        setActiveTab('orders');
                      }}
                      className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Package className="w-4 h-4 text-slate-950" />
                      <span>Track Shipment Progress Flow</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsCheckoutOpen(false);
                      }}
                      className="w-full py-2.5 bg-slate-105 bg-slate-100 hover:bg-slate-200 text-slate-650 text-xs font-bold rounded-lg transition-all"
                    >
                      Complete Sandbox Inspection
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
