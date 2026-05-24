import React, { useState, useMemo } from 'react';
import { 
  Shield, ShieldAlert, ShieldCheck, Users, Briefcase, Settings, 
  Database, RefreshCw, AlertTriangle, Package, Check, Clipboard, 
  TrendingUp, Activity, Terminal, CheckCircle, Trash, Play, Sliders, ToggleLeft
} from 'lucide-react';
import { Product, Order } from '../types';

interface AdminPanelProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  userRole: 'CUSTOMER' | 'STORE_MANAGER' | 'SYSTEM_ADMIN';
  setUserRole: (role: 'CUSTOMER' | 'STORE_MANAGER' | 'SYSTEM_ADMIN') => void;
  advanceTrackingState: (orderId: string) => void;
  setActiveTab: (tab: 'store' | 'orders' | 'backend' | 'admin') => void;
}

export function AdminPanel({
  products,
  setProducts,
  orders,
  setOrders,
  userRole,
  setUserRole,
  advanceTrackingState,
  setActiveTab
}: AdminPanelProps) {
  
  // Tab states within the Admin panel itself
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'products' | 'system'>('orders');

  // Inline editing state for product adjustments
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editStock, setEditStock] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Feature flags
  const [featureFlags, setFeatureFlags] = useState({
    surgePricing: false,
    escrowUpi: true,
    h2Console: true,
    hibernateLazySim: false
  });

  // JVM parameters
  const [activeProfile, setActiveProfile] = useState<string>('production');
  const [maxHeap, setMaxHeap] = useState<string>('512m');

  // Trigger dispatch Spring Boot log events
  const logToSpringBoot = (type: 'INFO' | 'WARN' | 'DEBUG' | 'ERROR', logger: string, message: string) => {
    window.dispatchEvent(new CustomEvent('springboot_log', {
      detail: { type, logger, message }
    }));
  };

  // Order status changing handlers
  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const trackingSteps: Record<Order['status'], number> = {
      'pending': 1,
      'placed': 1,
      'shipped': 2,
      'out_for_delivery': 3,
      'delivered': 4
    };

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        logToSpringBoot('INFO', 'controller.OrderController', `PATCH /api/orders/${orderId}/status - Status changed to '${status}' manually by Manager.`);
        logToSpringBoot('DEBUG', 'repository.OrderRepository', `Hibernate: update customer_orders set status='${status}', current_tracking_step=${trackingSteps[status]} where id='${orderId}'`);
        
        return {
          ...o,
          status,
          currentTrackingStep: trackingSteps[status]
        };
      }
      return o;
    }));
  };

  const refundAndCancelOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        logToSpringBoot('WARN', 'controller.OrderController', `POST /api/orders/${orderId}/refund - Order Cancelled. Refunding escrow standard settlement of $${o.totalAmount.toFixed(2)}.`);
        logToSpringBoot('DEBUG', 'repository.OrderRepository', `Hibernate: delete from order_items where order_id='${orderId}'; update customer_orders set status='pending', current_tracking_step=1 where id='${orderId}'`);
        
        // Mark as pending or customizable status for mock cancellation
        return {
          ...o,
          status: 'pending', // Reverts to general or demo pending
          currentTrackingStep: 1
        };
      }
      return o;
    }));
  };

  // Product adjustment handlers
  const handleSaveProductEdit = (productId: number) => {
    const rawPrice = parseFloat(editPrice);
    const rawStock = parseInt(editStock, 10);

    if (isNaN(rawPrice) || rawPrice <= 0 || isNaN(rawStock) || rawStock < 0) {
      alert("Invalid price or stock values!");
      return;
    }

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        logToSpringBoot('INFO', 'controller.ProductController', `PATCH /api/products/${productId} - Updated price to $${rawPrice.toFixed(2)}, stock to ${rawStock}`);
        logToSpringBoot('DEBUG', 'repository.ProductRepository', `Hibernate: update products set price=${rawPrice}, stock=${rawStock} where id=${productId}`);
        
        return {
          ...p,
          price: rawPrice,
          stock: rawStock
        };
      }
      return p;
    }));

    setEditingId(null);
  };

  const triggerBulkReplenish = () => {
    setProducts(prev => prev.map(p => {
      if (p.stock <= 3) {
        logToSpringBoot('INFO', 'controller.ProductController', `POST /api/products/restock/${p.id} - Replenishing depleted shelves (+15 units reserved)`);
        return { ...p, stock: p.stock + 15 };
      }
      return p;
    }));
    logToSpringBoot('INFO', 'task.InventoryScheduledTask', 'Running Spring Boot cron task: Restocked low inventory products (stock <= 3) automatically.');
  };

  // Toggle Feature Flag
  const toggleFeatureFlag = (key: keyof typeof featureFlags) => {
    setFeatureFlags(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      logToSpringBoot('INFO', 'config.FeatureManager', `Toggled configuration parameter feature.${String(key)} to ${updated[key]}`);
      
      // If we trigger lazy exception, send direct Hibernate stack logs for co-engineering fun
      if (key === 'hibernateLazySim' && updated[key]) {
        logToSpringBoot('WARN', 'repository.ProductRepository', 'LazyInitializationException: failed to lazily initialize a collection of role: Product.specs, no session or session was closed');
        logToSpringBoot('ERROR', 'exception.GlobalExceptionHandler', 'Interpreted server handler stacktrace: org.hibernate.LazyInitializationException: nested transaction rolled back');
      }
      return updated;
    });
  };

  // Hot swap class simulated command
  const triggerHotSwap = () => {
    logToSpringBoot('INFO', 'loader.DevClassLoader', 'Spring DevTools: Reloading dynamic JVM changes. Rebuilding servlet contexts in 142ms.');
    logToSpringBoot('INFO', 'controller.ProductController', 'Hot-redeploy: Class io.uvicorn.marketplace.controller.ProductController hot-swapped successfully!');
  };

  // Derived Admin Metrics
  const adminMetrics = useMemo(() => {
    const pendingOrders = orders.filter(o => o.status !== 'delivered').length;
    const lowStockCount = products.filter(p => p.stock <= 3).length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    return { pendingOrders, lowStockCount, totalRevenue };
  }, [orders, products]);

  // Filtered product listing for inventory search
  const filteredProductsList = useMemo(() => {
    return products.filter(p => p.title.toLowerCase().includes(searchFilter.toLowerCase()) || p.category.toLowerCase().includes(searchFilter.toLowerCase()));
  }, [products, searchFilter]);

  return (
    <div id="role-admin-panel" className="space-y-6 text-left">
      
      {/* 1. ROLE CONFIGURATION STRIP HEADER */}
      <div className="bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <Shield className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                RBAC Security Portal (Admin Center)
                <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                  userRole === 'SYSTEM_ADMIN' 
                    ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                    : userRole === 'STORE_MANAGER'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  Privilege Scope: {userRole}
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
              Demonstrating full Role-Based Access Control (RBAC). In corporate cloud architectures, customers are blocked at the edge gateway. 
              Switch your profile role below to dynamically grant endpoints, load corresponding administrative dashboards, and update catalog/orders live!
            </p>
          </div>

          {/* Quick Switcher dropdown or buttons representing realistic role switches */}
          <div className="flex flex-col gap-1 items-start md:items-end shrink-0">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-450 text-slate-400">
              Active Security Role Selector
            </span>
            <div className="inline-flex bg-slate-950 p-1 border border-slate-800 rounded-xl leading-none">
              {(['CUSTOMER', 'STORE_MANAGER', 'SYSTEM_ADMIN'] as const).map(role => {
                const isActive = userRole === role;
                let colorClass = "text-slate-400 hover:text-white";
                if (isActive) {
                  if (role === 'SYSTEM_ADMIN') colorClass = "bg-red-950 text-red-400 font-extrabold";
                  else if (role === 'STORE_MANAGER') colorClass = "bg-amber-950 text-amber-400 font-extrabold";
                  else colorClass = "bg-slate-850 bg-slate-800 text-slate-200 font-extrabold";
                }

                return (
                  <button
                    key={role}
                    onClick={() => {
                      setUserRole(role);
                      logToSpringBoot('INFO', 'security.RoleMembershipManager', `User 'akashhede360@gmail.com' switched role state to: ${role}. ACL refreshed.`);
                    }}
                    className={`text-[9px] md:text-[10px] font-mono uppercase px-3 py-1.5 rounded-lg transition-all cursor-pointer ${colorClass}`}
                  >
                    {role.replace('_', ' ')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. SECURITY BLOCK: REJECTION VIEW FOR STANDARD CUSTOMER ROLE */}
      {userRole === 'CUSTOMER' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-2xl mx-auto space-y-6 shadow-sm my-6">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto ring-4 ring-red-100">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-950">HTTP 403 Forbidden - Privilege Insufficient</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Your profile currently holds the default <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-pink-600">CUSTOMER</code> role membership. 
              The server's Spring Security context blocks requests without <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">ROLE_MANAGER</code> or <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">ROLE_ADMIN</code> authorities.
            </p>
          </div>

          {/* Locked simulated endpoint log block with high aesthetics */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-[10px] sm:text-xs text-left text-slate-350 text-slate-400 space-y-1 overflow-x-auto shadow-inner">
            <div className="text-red-400 font-bold">[WARN] Security intercept triggered on ip_addr=127.0.0.1:</div>
            <div>&gt; GET /api/admin/metrics</div>
            <div className="text-red-400 font-extrabold">&gt; Response: Status 403 Forbidden | Reason: Access Denied.</div>
            <div className="text-slate-600 text-[10px]">2026-05-24 19:45:01.405 org.springframework.security.web.access.AccessDeniedHandlerImpl : Access is denied (user holds principal authority List[ROLE_CUSTOMER])</div>
          </div>

          <div className="pt-2">
            <div className="text-[11px] font-extrabold text-slate-600 block mb-2 uppercase tracking-wide">Promote account role to explore:</div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => {
                  setUserRole('STORE_MANAGER');
                  logToSpringBoot('INFO', 'security.RoleMembershipManager', "Security audit: Promoted akashhede360@gmail.com with mock authorities List[ROLE_CUSTOMER, ROLE_MANAGER]");
                }}
                className="px-4 py-2 bg-amber-600 text-white text-xs font-black rounded-xl hover:bg-amber-700 cursor-pointer shadow-sm transition-all"
              >
                Promote to Store Manager
              </button>
              <button
                onClick={() => {
                  setUserRole('SYSTEM_ADMIN');
                  logToSpringBoot('INFO', 'security.RoleMembershipManager', "Security audit: Granted superuser token authorities List[ROLE_CUSTOMER, ROLE_MANAGER, ROLE_ADMIN]");
                }}
                className="px-4 py-2 bg-red-600 text-white text-xs font-black rounded-xl hover:bg-red-700 cursor-pointer shadow-sm transition-all"
              >
                Promote to System Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. DOCK & GRIDS FOR AUTHORISED USERS (STORE_MANAGER OR SYSTEM_ADMIN) */}
      {userRole !== 'CUSTOMER' && (
        <div className="space-y-6">

          {/* System Control Panel Operational Micro-Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider">Operational Volume</span>
                <div className="text-2xl font-mono font-black text-slate-900">${adminMetrics.totalRevenue.toFixed(2)}</div>
                <div className="text-[10px] text-teal-600 font-bold">Escrow Account settlement</div>
              </div>
              <span className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider">Pending Shipping Load</span>
                <div className="text-2xl font-mono font-black text-slate-900">{adminMetrics.pendingOrders} <span className="text-xs text-slate-400 font-normal">orders</span></div>
                <div className="text-[10px] text-amber-600 font-bold">Fulfillment queue active</div>
              </div>
              <span className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Package className="w-5 h-5" />
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider">Inventory Low Stocks</span>
                <div className="text-2xl font-mono font-black text-slate-900">{adminMetrics.lowStockCount} <span className="text-xs text-slate-400 font-normal">items</span></div>
                <div className="text-[10px] text-indigo-600 font-bold">Stock levels &lt;= 3 units</div>
              </div>
              <span className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </span>
            </div>
          </div>

          {/* Admin Navigation Hub Toggles */}
          <div className="flex border-b border-slate-200 whitespace-nowrap overflow-x-auto scrollbar-none gap-2">
            <button
              onClick={() => setActiveSubTab('orders')}
              className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 px-1 cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'orders' 
                  ? 'border-amber-500 text-slate-950 font-black' 
                  : 'border-transparent text-slate-500 hover:text-slate-950'
              }`}
            >
              <Package className="w-4 h-4 text-emerald-600" />
              Orders Dispatch Desk
            </button>
            <button
              onClick={() => setActiveSubTab('products')}
              className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 px-1 cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'products' 
                  ? 'border-amber-500 text-slate-950 font-black' 
                  : 'border-transparent text-slate-500 hover:text-slate-950'
              }`}
            >
              <Database className="w-4 h-4 text-indigo-600" />
              Inventory Catalog Manager
            </button>

            {userRole === 'SYSTEM_ADMIN' && (
              <button
                onClick={() => setActiveSubTab('system')}
                className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 px-1 cursor-pointer flex items-center gap-1.5 ${
                  activeSubTab === 'system' 
                    ? 'border-red-500 text-red-650 text-slate-950 font-black' 
                    : 'border-transparent text-slate-500 hover:text-slate-950'
                }`}
              >
                <Settings className="w-4 h-4 text-red-600 animate-spin-slow" />
                JVM Server Settings Panel
              </button>
            )}
          </div>

          {/* activeSubTab 1: ORDER LOGISTICS DISPATCH CENTER */}
          {activeSubTab === 'orders' && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-55 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase font-mono">Orders Ledger Queue ({orders.length})</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Control live tracking, update courier dispatch workflows, or refund orders state</p>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Escrow H2 Table: <span className="font-bold text-slate-600">customer_orders</span></div>
              </div>

              {orders.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  <Package className="w-8 h-8 text-slate-350 mx-auto mb-2 opacity-55" />
                  No customer orders have been compiled yet. Populate items in your cart and check out in store to test.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 text-[10px] text-slate-500 font-mono uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-3">Order Code</th>
                        <th className="p-3">Buyer Address Details</th>
                        <th className="p-3">Purchased Basket</th>
                        <th className="p-3 text-right">Settlement</th>
                        <th className="p-3 text-center">Current Status</th>
                        <th className="p-3 text-right">Actions Dashboard</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 divide-slate-100">
                      {orders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-mono font-bold text-slate-900 leading-none">
                            {order.id}
                            <div className="text-[9px] text-slate-400 font-normal mt-1">{order.date}</div>
                            <div className="inline-block mt-1 bg-slate-100 font-mono text-[9px] text-slate-500 px-1 rounded-md">
                              {order.paymentMethod.toUpperCase()}
                            </div>
                          </td>
                          <td className="p-3 leading-normal max-w-[180px]">
                            <div className="font-bold text-slate-900 truncate">{order.shippingDetails?.fullName}</div>
                            <div className="text-[10px] text-slate-450 text-slate-500 truncate">{order.shippingDetails?.address}</div>
                            <div className="text-[9px] text-slate-400 font-mono">{order.shippingDetails?.phone}</div>
                          </td>
                          <td className="p-3 max-w-[180px] text-[11px]">
                            {order.items?.map(item => (
                              <div key={item.product.id} className="truncate">
                                <span className="font-mono text-slate-500">[{item.quantity}x]</span> {item.product.title}
                              </div>
                            ))}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-950">
                            ${order.totalAmount.toFixed(2)}
                            <div className="text-[9px] text-emerald-600 font-normal mt-0.5">Saves: ${order.totalSavings.toFixed(2)}</div>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-block text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              order.status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : order.status === 'out_for_delivery'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : order.status === 'shipped'
                                ? 'bg-sky-50 text-sky-700 border-sky-200'
                                : order.status === 'pending'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-1.5 flex-wrap">
                              {order.status !== 'delivered' && order.status !== 'pending' && (
                                <button
                                  onClick={() => advanceTrackingState(order.id)}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-md cursor-pointer transition-all"
                                >
                                  Advance Core 🚀
                                </button>
                              )}
                              
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                                className="bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-extrabold p-1 rounded-md"
                              >
                                <option value="placed">Fulfill: Placed</option>
                                <option value="shipped">Fulfill: Shipped</option>
                                <option value="out_for_delivery">Fulfill: Out for Delivery</option>
                                <option value="delivered">Fulfill: Delivered</option>
                              </select>

                              {order.status !== 'pending' && (
                                <button
                                  onClick={() => refundAndCancelOrder(order.id)}
                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[10px] rounded-md cursor-pointer transition-all"
                                >
                                  Refund escrow
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* activeSubTab 2: INVENTORY DISPATCH & PRICE MODIFIER */}
          {activeSubTab === 'products' && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-4 p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-150 border-slate-100">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase font-mono">Inventory Stock Control Floor</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Quick price changes, stock additions, and bestseller badge tuning</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search product list..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="text-xs px-3 py-1.5 bg-slate-55 bg-slate-100 border border-slate-250 border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-amber-500 w-48 font-mono"
                  />
                  <button
                    onClick={triggerBulkReplenish}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Restock Low items
                  </button>
                </div>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-[10px] text-slate-500 font-mono uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Thumb</th>
                      <th className="p-2.5">Name / Category</th>
                      <th className="p-2.5 text-right">Price</th>
                      <th className="p-2.5 text-center">Active Stock</th>
                      <th className="p-2.5 text-center">Best Seller badge</th>
                      <th className="p-2.5 text-right">Admin Command</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProductsList.map(product => {
                      const isEditing = editingId === product.id;
                      return (
                        <tr key={product.id} className="hover:bg-slate-50/40">
                          <td className="p-2.5">
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-8 h-8 object-contain bg-slate-50 rounded"
                            />
                          </td>
                          <td className="p-2.5 max-w-[240px]">
                            <div className="font-bold text-slate-900 truncate leading-snug">{product.title}</div>
                            <span className="text-[9px] bg-slate-100 font-mono text-slate-500 px-1 rounded inline-block mt-0.5">
                              {product.category}
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-950 font-bold">
                            {isEditing ? (
                              <div className="inline-flex items-center gap-1 justify-end">
                                <span className="text-slate-400 text-[11px]">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editPrice}
                                  onChange={(e) => setEditPrice(e.target.value)}
                                  className="w-16 px-1.5 py-1 text-xs border border-slate-300 rounded bg-white text-right outline-none font-bold"
                                />
                              </div>
                            ) : (
                              <span>${product.price ? product.price.toFixed(2) : 'N/A'}</span>
                            )}
                            {product.originalPrice > product.price && (
                              <div className="text-[9px] text-slate-400 line-through">${product.originalPrice.toFixed(2)}</div>
                            )}
                          </td>
                          <td className="p-2.5 text-center font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editStock}
                                onChange={(e) => setEditStock(e.target.value)}
                                className="w-12 px-1.5 py-1 text-xs border border-slate-300 rounded bg-white text-center outline-none font-bold"
                              />
                            ) : (
                              <span className={`font-bold inline-block px-1.5 py-0.5 rounded ${
                                product.stock === 0 
                                  ? 'bg-red-100 text-red-700' 
                                  : product.stock <= 3
                                  ? 'bg-amber-100 text-amber-700 animate-pulse'
                                  : 'text-slate-700'
                              }`}>
                                {product.stock} left
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => {
                                setProducts(prev => prev.map(p => {
                                  if (p.id === product.id) {
                                    const updatedVal = !p.isBestSeller;
                                    logToSpringBoot('INFO', 'controller.ProductController', `PATCH /api/products/${product.id} - Toggle category Best Seller flag to: ${updatedVal}`);
                                    return { ...p, isBestSeller: updatedVal };
                                  }
                                  return p;
                                }));
                              }}
                              className={`text-[9px] font-mono leading-none tracking-wider font-extrabold uppercase px-2 py-1 rounded border transition-all cursor-pointer ${
                                product.isBestSeller 
                                  ? 'bg-amber-50 border-amber-300 text-amber-700' 
                                  : 'bg-slate-50 border-slate-200 text-slate-400'
                              }`}
                            >
                              {product.isBestSeller ? 'BestSeller' : 'Standard'}
                            </button>
                          </td>
                          <td className="p-2.5 text-right">
                            {isEditing ? (
                              <div className="flex gap-1 justify-end">
                                <button
                                  onClick={() => handleSaveProductEdit(product.id)}
                                  className="px-2 py-1 bg-emerald-600 font-extrabold text-white text-[10px] rounded hover:bg-emerald-700 cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="px-2 py-1 bg-slate-200 font-extrabold text-slate-700 text-[10px] rounded hover:bg-slate-300 cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingId(product.id);
                                  setEditPrice(String(product.price));
                                  setEditStock(String(product.stock));
                                }}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 font-bold border border-slate-250 text-slate-700 text-[10px] rounded-md cursor-pointer transition-all"
                              >
                                Modify Parameters
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* activeSubTab 3: JVM SERVER SETTINGS MODULE (SYSTEM_ADMIN ONLY) */}
          {activeSubTab === 'system' && userRole === 'SYSTEM_ADMIN' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Feature Flags Module */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-left space-y-4">
                <div>
                  <h4 className="text-xs font-mono font-black uppercase text-rose-800 tracking-wider flex items-center gap-1">
                    <Sliders className="w-4 h-4" />
                    Co-Engineering Feature Flags
                  </h4>
                  <p className="text-[11px] text-slate-500">Enable edge policies or trigger artificial stack exceptions</p>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Surge Pricing Accelerator (+12%)</span>
                      <span className="text-[10px] text-slate-400">Dynamically scale checkout parameters under simulated loads</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={featureFlags.surgePricing}
                      onChange={() => toggleFeatureFlag('surgePricing')}
                      className="w-4 h-4 text-emerald-600 outline-none rounded-md"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Enforce Escrow Backed UPI (Multi-Sig UPI)</span>
                      <span className="text-[10px] text-slate-400">Secure immediate customer escrow holding on checkout</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={featureFlags.escrowUpi}
                      onChange={() => toggleFeatureFlag('escrowUpi')}
                      className="w-4 h-4 text-emerald-600 outline-none rounded-md"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Trigger Simulated 'LazyInitializationException'</span>
                      <span className="text-[10px] text-slate-400">Force H2 thread stacktrace warnings in the Spring dev console</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={featureFlags.hibernateLazySim}
                      onChange={() => toggleFeatureFlag('hibernateLazySim')}
                      className="w-4 h-4 text-emerald-600 outline-none rounded-md"
                    />
                  </div>
                </div>
              </div>

              {/* Hardware Sliders Module */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-left space-y-4">
                <div>
                  <h4 className="text-xs font-mono font-black uppercase text-rose-800 tracking-wider flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    JVM Microservice Core Tuning
                  </h4>
                  <p className="text-[11px] text-slate-500">Simulate Spring profiles, hot swaps, & class loading</p>
                </div>

                <div className="space-y-4 pt-1">
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-500 block mb-1">Active Spring Profiling Profile</label>
                    <div className="flex gap-2">
                      {['development', 'staging', 'production'].map(prof => (
                        <button
                          key={prof}
                          onClick={() => {
                            setActiveProfile(prof);
                            logToSpringBoot('WARN', 'config.ActiveProfileManager', `Spring Context recycling for profile transition: ${prof}. JDBC URL modified.`);
                          }}
                          className={`text-[10px] uppercase font-mono px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                            activeProfile === prof 
                              ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold font-black' 
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {prof}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold text-slate-500 block mb-1">JVM Max Heap -Xmx Option</label>
                    <select
                      value={maxHeap}
                      onChange={(e) => {
                        setMaxHeap(e.target.value);
                        logToSpringBoot('INFO', 'system.HeapProvisioner', `JVM parameters modified: Max heap adjusted to -Xmx${e.target.value}. Triggering Garbage Collection.`);
                      }}
                      className="text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-800 font-mono"
                    >
                      <option value="256m">-Xmx256m (Compact Server)</option>
                      <option value="512m">-Xmx512m (Moderate Server)</option>
                      <option value="1024m">-Xmx1024m (Enterprise Core)</option>
                      <option value="2048m">-Xmx2048m (Surge High Availability-HA)</option>
                    </select>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={triggerHotSwap}
                      className="bg-slate-900 text-white font-extrabold py-2 px-4 text-xs rounded-xl hover:bg-slate-850 flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                    >
                      <Terminal className="w-3.5 h-3.5 text-rose-400" />
                      Hot-Swap JVM Controllers
                    </button>
                    <button
                      onClick={() => {
                        setOrders([]);
                        logToSpringBoot('WARN', 'repository.OrderRepository', 'Hibernate: truncate table customer_orders CASCADE; Database flushed.');
                      }}
                      className="bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-extrabold py-2 px-4 text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                    >
                      <Trash className="w-3.5 h-3.5" />
                      Flush orders ledger
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
