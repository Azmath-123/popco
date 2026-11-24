import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { BarChart3, Package, ShoppingBag, Settings, ShieldCheck, Plus, Trash2, Edit3, TrendingUp, AlertTriangle, Printer, RotateCcw, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnalyticsTab } from '../features/admin/tabs/AnalyticsTab.jsx';
import { OrdersTab } from '../features/admin/tabs/OrdersTab.jsx';
import { ProductsTab } from '../features/admin/tabs/ProductsTab.jsx';
import { InventoryTab } from '../features/admin/tabs/InventoryTab.jsx';
import { StoreSettingsTab } from '../features/admin/tabs/StoreSettingsTab.jsx';
export const AdminDashboard = () => {
    const { products, addProduct, updateProduct, deleteProduct, resetProducts, orders, updateOrderStatus, currentUser, settings, updateSettings, showToast, } = useStore();
    if (!currentUser) {
        return null;
    }
    const [activeTab, setActiveTab] = useState('analytics');
    // Order Filters
    const [orderStatusFilter, setOrderStatusFilter] = useState('all');
    const [orderSearch, setOrderSearch] = useState('');
    const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
    // Product Form (Create / Edit Modal)
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [prodName, setProdName] = useState('');
    const [prodSlug, setProdSlug] = useState('');
    const [prodPrice, setProdPrice] = useState('299');
    const [prodWeight, setProdWeight] = useState('100G - Raw & Natural');
    const [prodCategory, setProdCategory] = useState('raw');
    const [prodImage, setProdImage] = useState('/product_1.webp');
    const [prodStock, setProdStock] = useState('50');
    const [prodDescription, setProdDescription] = useState('');
    // Store Settings Form
    const [settAnnouncement, setSettAnnouncement] = useState(settings.announcementText);
    const [settWhatsapp, setSettWhatsapp] = useState(settings.whatsappNumber);
    const [settEmail, setSettEmail] = useState(settings.supportEmail);
    const [settThreshold, setSettThreshold] = useState(settings.freeShippingThreshold.toString());
    // Analytics Metrics
    const totalRevenue = useMemo(() => {
        return orders.reduce((sum, o) => (o.paymentStatus === 'paid' ? sum + o.total : sum), 0);
    }, [orders]);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Confirmed').length;
    const lowStockProducts = products.filter((p) => p.stockCount < 20);
    // Filtered Orders
    const filteredOrders = useMemo(() => {
        return orders.filter((o) => {
            if (orderStatusFilter !== 'all' && o.orderStatus !== orderStatusFilter) {
                return false;
            }
            if (orderSearch.trim()) {
                const q = orderSearch.toLowerCase();
                return (o.orderNumber.toLowerCase().includes(q) ||
                    o.customer.name.toLowerCase().includes(q) ||
                    o.customer.phone.toLowerCase().includes(q));
            }
            return true;
        });
    }, [orders, orderStatusFilter, orderSearch]);
    const handleOpenNewProduct = () => {
        setEditingProduct(null);
        setProdName('');
        setProdSlug('');
        setProdPrice('299');
        setProdWeight('100G - Raw & Natural');
        setProdCategory('raw');
        setProdImage('/product_1.webp');
        setProdStock('50');
        setProdDescription('');
        setIsProductModalOpen(true);
    };
    const handleOpenEditProduct = (p) => {
        setEditingProduct(p);
        setProdName(p.name);
        setProdSlug(p.slug);
        setProdPrice(p.numericPrice.toString());
        setProdWeight(p.weight);
        setProdCategory(p.category);
        setProdImage(p.image);
        setProdStock(p.stockCount.toString());
        setProdDescription(p.description);
        setIsProductModalOpen(true);
    };
    const handleSaveProduct = (e) => {
        e.preventDefault();
        const numPrice = parseInt(prodPrice) || 299;
        const stock = parseInt(prodStock) || 0;
        const slug = prodSlug.trim() || prodName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        if (editingProduct) {
            updateProduct(editingProduct.id, {
                name: prodName,
                slug,
                numericPrice: numPrice,
                price: `₹${numPrice}`,
                originalPrice: Math.round(numPrice * 1.25),
                weight: prodWeight,
                category: prodCategory,
                image: prodImage,
                stockCount: stock,
                inStock: stock > 0,
                description: prodDescription,
            });
        }
        else {
            addProduct({
                name: prodName,
                slug,
                numericPrice: numPrice,
                price: `₹${numPrice}`,
                originalPrice: Math.round(numPrice * 1.25),
                weight: prodWeight,
                category: prodCategory,
                image: prodImage,
                images: [prodImage],
                stockCount: stock,
                inStock: stock > 0,
                description: prodDescription,
                rating: 5,
                reviewCount: 0,
                color: 'bg-[var(--secondary)]',
                metaTitle: `Buy ${prodName} | PopCo Makhana`,
                metaDescription: prodDescription.slice(0, 150),
                sku: `MMK-${Math.floor(100 + Math.random() * 900)}`,
                packs: [
                    { count: 1, label: 'Single Pack', price: numPrice },
                    { count: 2, label: 'Pack of 2', price: Math.round(numPrice * 1.85) },
                    { count: 4, label: 'Pack of 4', price: Math.round(numPrice * 3.5) },
                ],
            });
        }
        setIsProductModalOpen(false);
    };
    const handleSaveSettings = (e) => {
        e.preventDefault();
        updateSettings({
            announcementText: settAnnouncement,
            whatsappNumber: settWhatsapp,
            supportEmail: settEmail,
            freeShippingThreshold: parseInt(settThreshold) || 599,
        });
    };
    return (<div className="flex-1 bg-[var(--background)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header Bar */}
        <div className="bg-[var(--primary)] text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-2.5 py-0.5 rounded text-white flex items-center gap-1">
                <ShieldCheck size={11} className="text-[var(--secondary-foreground)]"/>
                ADMINISTRATION SUITE
              </span>
              <span className="text-[10px] font-bold text-[var(--secondary-foreground)]">
                PopCo Makhana • Meerut
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-[var(--background)]">
              Store & Operations Dashboard
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <Link to="/" className="px-3.5 sm:px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all">
              ← Storefront
            </Link>

            <button onClick={resetProducts} className="px-3.5 sm:px-4 py-2 bg-[var(--secondary-foreground)] hover:bg-[var(--secondary-foreground)]/90 text-white rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer" title="Reset catalog to authentic default items">
              <RotateCcw size={13}/>
              <span>Reset Catalog</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto bg-white rounded-2xl p-1.5 border border-[var(--border)]/15 text-xs font-black uppercase tracking-wider shadow-xs no-scrollbar">
          {[
            { id: 'analytics', label: 'Analytics & KPIs', icon: BarChart3 },
            { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
            { id: 'products', label: `Products (${products.length})`, icon: Package },
            { id: 'inventory', label: `Inventory Matrix`, icon: TrendingUp },
            { id: 'settings', label: 'Store Settings', icon: Settings },
        ].map((tab) => {
            const Icon = tab.icon;
            return (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-3 px-4 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === tab.id
                    ? 'bg-[var(--primary)] text-white shadow-md'
                    : 'text-[var(--foreground)]/70 hover:text-[var(--foreground)]'}`}>
                <Icon size={15}/>
                <span>{tab.label}</span>
              </button>);
        })}
        </div>

        {activeTab === 'analytics' && <AnalyticsTab totalRevenue={totalRevenue} totalOrders={totalOrders} pendingOrders={pendingOrders} products={products} lowStockProducts={lowStockProducts} orders={orders} onViewAllOrders={() => setActiveTab('orders')} />}
        {activeTab === 'orders' && <OrdersTab filteredOrders={filteredOrders} orderSearch={orderSearch} setOrderSearch={setOrderSearch} orderStatusFilter={orderStatusFilter} setOrderStatusFilter={setOrderStatusFilter} updateOrderStatus={updateOrderStatus} setSelectedOrderForInvoice={setSelectedOrderForInvoice} />}
        {activeTab === 'products' && <ProductsTab products={products} handleOpenNewProduct={handleOpenNewProduct} handleOpenEditProduct={handleOpenEditProduct} deleteProduct={deleteProduct} />}
        {activeTab === 'inventory' && <InventoryTab products={products} updateProduct={updateProduct} />}
        {activeTab === 'settings' && <StoreSettingsTab settAnnouncement={settAnnouncement} setSettAnnouncement={setSettAnnouncement} settWhatsapp={settWhatsapp} setSettWhatsapp={setSettWhatsapp} settEmail={settEmail} setSettEmail={setSettEmail} settThreshold={settThreshold} setSettThreshold={setSettThreshold} handleSaveSettings={handleSaveSettings} />}
      </div>

      {/* Product Edit / Create Modal */}
      {isProductModalOpen && (<div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--background)] rounded-3xl shadow-2xl max-w-lg w-full border border-[var(--border)]/20 overflow-hidden relative p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border)]/10 pb-3">
              <h3 className="text-base font-black uppercase text-[var(--foreground)]">
                {editingProduct ? 'Edit Product Details' : 'Add New Makhana Product'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-[var(--foreground)] hover:text-black p-1">
                <X size={18}/>
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                  Product Name *
                </label>
                <input type="text" required value={prodName} onChange={(e) => setProdName(e.target.value)} placeholder="e.g. Smoky Barbecue Makhana" className="w-full px-3 py-2 bg-white border border-[var(--border)]/20 rounded-lg font-bold"/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                    Selling Price (₹) *
                  </label>
                  <input type="number" required value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} className="w-full px-3 py-2 bg-white border border-[var(--border)]/20 rounded-lg font-bold"/>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                    Stock Quantity *
                  </label>
                  <input type="number" required value={prodStock} onChange={(e) => setProdStock(e.target.value)} className="w-full px-3 py-2 bg-white border border-[var(--border)]/20 rounded-lg font-bold"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                    Category *
                  </label>
                  <select value={prodCategory} onChange={(e) => setProdCategory(e.target.value)} className="w-full px-3 py-2 bg-white border border-[var(--border)]/20 rounded-lg font-bold uppercase">
                    <option value="raw">Raw & Natural (6+ Suta)</option>
                    <option value="flavoured">Flavoured Roasted</option>
                    <option value="bulk">Bulk & Wholesale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                    Weight / Subtitle
                  </label>
                  <input type="text" value={prodWeight} onChange={(e) => setProdWeight(e.target.value)} className="w-full px-3 py-2 bg-white border border-[var(--border)]/20 rounded-lg font-bold"/>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                  Product Image Asset
                </label>
                <select value={prodImage} onChange={(e) => setProdImage(e.target.value)} className="w-full px-3 py-2 bg-white border border-[var(--border)]/20 rounded-lg font-bold">
                  <option value="/product_1.webp">product_1.webp (100g Trial)</option>
                  <option value="/product_2.webp">product_2.webp (200g Family)</option>
                  <option value="/periperi_front.webp">periperi_front.webp (Peri Peri)</option>
                  <option value="/tangytomato_front.webp">tangytomato_front.webp (Tomato Tangy)</option>
                  <option value="/chaat_front.webp">chaat_front.webp (Chatpata Chaat)</option>
                  <option value="/mintypudina_front.webp">mintypudina_front.webp (Mint Pudina)</option>
                  <option value="/chilligarlic_front.webp">chilligarlic_front.webp (Chilli Garlic)</option>
                  <option value="/creamandonion_front.webp">creamandonion_front.webp (Cream & Onion)</option>
                  <option value="/loose_cover.webp">loose_cover.webp (1KG Loose)</option>
                  <option value="/bulk_cover.webp">bulk_cover.webp (Bulk Sack)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                  Description
                </label>
                <textarea rows={3} value={prodDescription} onChange={(e) => setProdDescription(e.target.value)} className="w-full px-3 py-2 bg-white border border-[var(--border)]/20 rounded-lg font-medium"/>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 bg-white border border-[var(--border)]/20 rounded-lg font-bold text-[var(--foreground)]">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-[var(--primary)] text-white font-black uppercase rounded-lg hover:bg-[var(--primary)]/90">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>)}

      {/* Invoice Printable View Modal */}
      {selectedOrderForInvoice && (<div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-8 space-y-6 text-[var(--foreground)]">
            <div className="flex justify-between items-start border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-xl font-black uppercase">TAX INVOICE</h3>
                <p className="text-xs font-mono font-bold text-[var(--secondary-foreground)]">
                  ORDER #{selectedOrderForInvoice.orderNumber}
                </p>
                <p className="text-xs text-gray-500">Date: {selectedOrderForInvoice.date}</p>
              </div>
              <div className="text-right">
                <span className="text-base font-black">POPCO MAKHANA</span>
                <p className="text-[10px] text-gray-500">O-Pocket Pallavpuram Phase-2 Modipuram Meerut 250110</p>
                <p className="text-[10px] text-gray-500">Support@thepopcoindia.com</p>
              </div>
            </div>

            <div className="text-xs space-y-1">
              <span className="font-bold">Bill To & Ship To:</span>
              <p className="font-semibold">{selectedOrderForInvoice.customer.name}</p>
              <p>{selectedOrderForInvoice.customer.address}</p>
              <p>
                {selectedOrderForInvoice.customer.city}, {selectedOrderForInvoice.customer.state} -{' '}
                {selectedOrderForInvoice.customer.pincode}
              </p>
              <p>Phone: {selectedOrderForInvoice.customer.phone}</p>
            </div>

            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-bold uppercase">
                  <th className="py-2">Item</th>
                  <th>Pack</th>
                  <th>Qty</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedOrderForInvoice.items.map((it, idx) => (<tr key={idx} className="py-2">
                    <td className="py-2 font-bold">{it.product.name}</td>
                    <td>{it.selectedPack.label}</td>
                    <td>{it.quantity}</td>
                    <td className="text-right font-bold">
                      ₹{(it.selectedPack.price || it.product.numericPrice) * it.quantity}
                    </td>
                  </tr>))}
              </tbody>
            </table>

            <div className="border-t border-gray-200 pt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{selectedOrderForInvoice.subtotal}</span>
              </div>
              {selectedOrderForInvoice.discount > 0 && (<div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span>-₹{selectedOrderForInvoice.discount}</span>
                </div>)}
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>
                  {selectedOrderForInvoice.shipping === 0 ? 'FREE' : `₹${selectedOrderForInvoice.shipping}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-black pt-2 border-t border-gray-200">
                <span>Total Paid:</span>
                <span>₹{selectedOrderForInvoice.total}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 no-print">
              <button onClick={() => setSelectedOrderForInvoice(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold">
                Close
              </button>
              <button onClick={() => window.print()} className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg text-xs font-black uppercase flex items-center gap-1.5">
                <Printer size={14}/>
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>)}
    </div>);
};
