import React from 'react';
import { Printer } from 'lucide-react';

export function OrdersTab({ filteredOrders, orderSearch, setOrderSearch, orderStatusFilter, setOrderStatusFilter, updateOrderStatus, setSelectedOrderForInvoice }) {
  return (
<div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--border)]/15 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)]/10 pb-4">
              <h2 className="text-lg font-black uppercase text-[var(--foreground)]">
                Order Management & Dispatch Control
              </h2>

              <div className="flex flex-wrap items-center gap-2">
                <input type="text" placeholder="Search by ID or customer..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} className="px-3 py-1.5 text-xs border border-[var(--border)]/20 rounded-lg outline-none font-bold bg-[var(--background)]"/>

                <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)} className="px-3 py-1.5 text-xs border border-[var(--border)]/20 rounded-lg outline-none font-bold bg-[var(--background)] uppercase cursor-pointer">
                  <option value="all">All Statuses</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders list */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (<p className="text-xs text-center py-10 text-[var(--foreground)]/60 italic font-sans">
                  No orders match your filter criteria.
                </p>) : (filteredOrders.map((order) => (<div key={order.id} className="p-5 rounded-2xl border border-[var(--border)]/15 bg-[var(--background)] space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)]/10 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-[var(--foreground)] font-mono">
                            {order.orderNumber}
                          </span>
                          <span className="text-xs text-[var(--foreground)]/60 font-semibold">• {order.date}</span>
                        </div>
                        <p className="text-xs font-bold text-[var(--secondary-foreground)]">
                          Customer: {order.customer.name} ({order.customer.phone})
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-[var(--foreground)]">
                          ₹{order.total} ({order.paymentMethod.toUpperCase()})
                        </span>
                        <select value={order.orderStatus} onChange={(e) => updateOrderStatus(order.id, e.target.value)} className="px-3 py-1 bg-white border border-[var(--border)]/20 rounded-lg text-xs font-bold text-[var(--foreground)] uppercase cursor-pointer">
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Order details and actions */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4 text-xs font-sans">
                      <div className="space-y-1">
                        <span className="font-bold text-[var(--foreground)]">Shipping Address:</span>
                        <p className="text-xs text-[var(--foreground)]/80">
                          {order.customer.address}, {order.customer.city}, {order.customer.state} -{' '}
                          {order.customer.pincode}
                        </p>
                      </div>

                      <div className="space-y-1 text-right">
                        <span className="font-bold text-[var(--foreground)]">AWB Tracking:</span>
                        <p className="font-mono text-xs text-[var(--secondary-foreground)]">
                          {order.trackingNumber || 'No tracking assigned'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button onClick={() => setSelectedOrderForInvoice(order)} className="px-3 py-1 bg-white border border-[var(--border)]/20 hover:bg-[var(--primary)]/5 rounded-lg text-[11px] font-bold text-[var(--foreground)] flex items-center gap-1">
                        <Printer size={13}/>
                        <span>Print Invoice</span>
                      </button>
                    </div>
                  </div>)))}
            </div>
          </div>
  );
}
