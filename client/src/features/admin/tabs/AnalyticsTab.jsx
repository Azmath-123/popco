import React from 'react';
import { AlertTriangle, Package, ShoppingBag, TrendingUp } from 'lucide-react';

export function AnalyticsTab({ totalRevenue, totalOrders, pendingOrders, products, lowStockProducts, orders, onViewAllOrders }) {
  return (
<div className="space-y-6">
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-[var(--border)]/15 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs font-black uppercase text-[var(--foreground)]/70">
                  <span>Gross Revenue</span>
                  <TrendingUp size={16} className="text-emerald-700"/>
                </div>
                <h3 className="text-3xl font-black text-[var(--foreground)]">₹{totalRevenue.toLocaleString()}</h3>
                <span className="text-[10px] text-emerald-800 font-extrabold uppercase">
                  +18.4% from last week
                </span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[var(--border)]/15 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs font-black uppercase text-[var(--foreground)]/70">
                  <span>Total Orders</span>
                  <ShoppingBag size={16} className="text-[var(--secondary-foreground)]"/>
                </div>
                <h3 className="text-3xl font-black text-[var(--foreground)]">{totalOrders}</h3>
                <span className="text-[10px] text-[var(--foreground)]/60 font-bold uppercase">
                  {pendingOrders} awaiting fulfillment
                </span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[var(--border)]/15 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs font-black uppercase text-[var(--foreground)]/70">
                  <span>Catalog SKUs</span>
                  <Package size={16} className="text-[var(--foreground)]"/>
                </div>
                <h3 className="text-3xl font-black text-[var(--foreground)]">{products.length}</h3>
                <span className="text-[10px] text-[var(--foreground)]/60 font-bold uppercase">
                  100% active on storefront
                </span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[var(--border)]/15 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs font-black uppercase text-[var(--foreground)]/70">
                  <span>Low Stock Warning</span>
                  <AlertTriangle size={16} className="text-amber-600"/>
                </div>
                <h3 className="text-3xl font-black text-amber-700">{lowStockProducts.length}</h3>
                <span className="text-[10px] text-amber-800 font-bold uppercase">
                  Require restock from Meerut
                </span>
              </div>
            </div>

            {/* Recent Orders table */}
            <div className="bg-white p-6 rounded-3xl border border-[var(--border)]/15 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)]/10 pb-3">
                <h3 className="text-base font-black uppercase text-[var(--foreground)]">
                  Recent Customer Orders
                </h3>
                <button onClick={() => onViewAllOrders} className="text-xs font-bold text-[var(--secondary-foreground)] hover:text-[var(--foreground)] uppercase">
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)]/10 text-[var(--foreground)]/60 font-black uppercase tracking-wider">
                      <th className="py-2.5">Order ID</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--primary)]/5 font-semibold text-[var(--foreground)]">
                    {orders.slice(0, 5).map((o) => (<tr key={o.id} className="hover:bg-[var(--background)] transition-colors">
                        <td className="py-3 font-mono font-bold">{o.orderNumber}</td>
                        <td>{o.date}</td>
                        <td>{o.customer.name}</td>
                        <td className="font-black">₹{o.total}</td>
                        <td>
                          <span className="uppercase text-[10px] bg-[var(--background)] px-2 py-0.5 rounded border border-[var(--border)]/10">
                            {o.paymentMethod}
                          </span>
                        </td>
                        <td>
                          <span className="uppercase text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            {o.orderStatus}
                          </span>
                        </td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
  );
}
