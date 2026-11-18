import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { apiRequest } from '../lib/api';

const StoreContext = createContext(undefined);

const DEFAULT_SETTINGS = {
  storeName: 'POP CO',
  announcementText: 'POP CO – BRINGING QUALITY, TASTE & GOODNESS TO EVERYDAY LIVING | FREE SHIPPING ABOVE ₹599 🌿',
  whatsappNumber: '918080808447',
  supportEmail: 'Support@thepopcoindia.com',
  freeShippingThreshold: 599,
  standardShippingFee: 60,
};

export const StoreProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBulkOrderOpen, setIsBulkOrderOpen] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [orders, setOrders] = useState([]);
  const [activePolicy, setActivePolicy] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [pendingGuestPhone, setPendingGuestPhone] = useState('');
  const idempotencyAttempt = useRef(null);

  const showToast = (message, type = 'success') => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((previous) => [...previous, { id, message, type }]);
    window.setTimeout(() => setToasts((previous) => previous.filter((toast) => toast.id !== id)), 3500);
  };

  const refreshStore = async () => {
    const [bootstrap, cartResponse] = await Promise.all([
      apiRequest('/store/bootstrap'),
      apiRequest('/cart'),
    ]);
    setProducts(bootstrap.products || []);
    setCoupons(bootstrap.coupons || []);
    setReviews(bootstrap.reviews || []);
    setSettings({ ...DEFAULT_SETTINGS, ...(bootstrap.settings || {}) });
    setCurrentUser(bootstrap.user || null);
    setOrders(bootstrap.orders || []);
    setCart(cartResponse.items || []);
  };

  useEffect(() => {
    let active = true;
    Promise.all([apiRequest('/store/bootstrap'), apiRequest('/cart')])
      .then(([bootstrap, cartResponse]) => {
        if (!active) return;
        setProducts(bootstrap.products || []);
        setCoupons(bootstrap.coupons || []);
        setReviews(bootstrap.reviews || []);
        setSettings({ ...DEFAULT_SETTINGS, ...(bootstrap.settings || {}) });
        setCurrentUser(bootstrap.user || null);
        setOrders(bootstrap.orders || []);
        setCart(cartResponse.items || []);
      })
      .catch((error) => {
        if (active) showToast(error.message || 'Could not connect to the store API.', 'error');
      })
      .finally(() => { if (active) setIsBootstrapping(false); });
    return () => { active = false; };
  }, []);

  const cartCount = useMemo(() => cart.reduce((total, item) => total + Number(item.quantity), 0), [cart]);
  const cartGrossSubtotal = useMemo(() => cart.reduce((total, item) => {
    const price = Number(item.selectedPack?.price || item.product?.numericPrice || 0);
    return total + price * Number(item.quantity);
  }, 0), [cart]);
  const comboEligibleCount = useMemo(() => cart.reduce((count, item) => {
    const eligible = Number(item.selectedPack?.count) === 1;
    return count + (eligible ? Number(item.quantity) : 0);
  }, 0), [cart]);

  const comboDiscount = useMemo(() => {
    const unitPrices = [];
    for (const item of cart) {
      if (Number(item.selectedPack?.count) === 1) {
        const price = Number(item.selectedPack?.price || item.product?.numericPrice || 0);
        const qty = Number(item.quantity || 0);
        for (let i = 0; i < qty; i++) {
          unitPrices.push(price);
        }
      }
    }
    const numCombos = Math.floor(unitPrices.length / 10);
    if (numCombos === 0) return 0;
    unitPrices.sort((a, b) => b - a);
    let discount = 0;
    for (let c = 0; c < numCombos; c++) {
      const comboUnits = unitPrices.slice(c * 10, (c + 1) * 10);
      const gross = comboUnits.reduce((sum, p) => sum + p, 0);
      discount += Math.max(0, gross - 1799);
    }
    return discount;
  }, [cart]);

  const cartSubtotal = Math.max(0, cartGrossSubtotal - comboDiscount);
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon || cartSubtotal < Number(appliedCoupon.minOrder || 0)) return 0;
    const amount = appliedCoupon.discountType === 'percentage'
      ? Math.round((cartSubtotal * Number(appliedCoupon.discountValue)) / 100)
      : Number(appliedCoupon.discountValue);
    return Math.min(cartSubtotal, appliedCoupon.maxDiscount ? Math.min(amount, appliedCoupon.maxDiscount) : amount);
  }, [appliedCoupon, cartSubtotal]);
  const shippingFee = cartSubtotal === 0 || cartSubtotal >= Number(settings.freeShippingThreshold || 0)
    ? 0
    : Number(settings.standardShippingFee || 0);
  const cartTotal = Math.max(0, cartSubtotal - couponDiscount + shippingFee);

  const applyCart = (result) => {
    setCart(result.items || []);
    if (appliedCoupon && (result.subtotal || 0) < Number(appliedCoupon.minOrder || 0)) setAppliedCoupon(null);
  };

  const addToCart = async (product, pack, quantity = 1) => {
    const selectedPack = pack || product.packs?.[0] || { count: 1, label: 'Single Pack', price: product.numericPrice };
    try {
      const result = await apiRequest('/cart/items', { method: 'POST', body: { productId: product.id, packCount: selectedPack.count, packLabel: selectedPack.label, quantity } });
      applyCart(result);
      idempotencyAttempt.current = null;
      showToast(`Added ${quantity}x ${product.name} (${selectedPack.label}) to cart!`, 'success');
      return true;
    } catch (error) {
      showToast(error.message, 'error');
      return false;
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      applyCart(await apiRequest(`/cart/items/${cartItemId}`, { method: 'DELETE' }));
      idempotencyAttempt.current = null;
      showToast('Item removed from cart', 'info');
    } catch (error) { showToast(error.message, 'error'); }
  };

  const updateQuantity = async (cartItemId, newQty) => {
    if (newQty <= 0) return removeFromCart(cartItemId);
    try {
      applyCart(await apiRequest(`/cart/items/${cartItemId}`, { method: 'PATCH', body: { quantity: newQty } }));
      idempotencyAttempt.current = null;
    } catch (error) { showToast(error.message, 'error'); }
  };

  const clearCart = async () => {
    try {
      await apiRequest('/cart', { method: 'DELETE' });
      setCart([]);
      idempotencyAttempt.current = null;
      setAppliedCoupon(null);
    } catch (error) { showToast(error.message, 'error'); }
  };

  const applyCoupon = (code) => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find((coupon) => coupon.code === cleanCode && coupon.active);
    if (!found) return { success: false, message: 'Invalid or expired coupon code.' };
    if (cartSubtotal < found.minOrder) return { success: false, message: `This coupon requires a minimum cart value of ₹${found.minOrder}.` };
    setAppliedCoupon(found);
    showToast(`Coupon ${found.code} applied successfully!`, 'success');
    return { success: true, message: `Coupon ${found.code} applied!` };
  };

  const removeCoupon = () => { setAppliedCoupon(null); showToast('Coupon removed.', 'info'); };

  const createOrder = async ({ customer, paymentMethod, notes, gstin }) => {
    setPendingGuestPhone(customer.phone);
    const orderBody = {
      customer,
      items: cart.map((item) => ({ productId: item.productId, selectedPack: { count: item.selectedPack.count, label: item.selectedPack.label }, quantity: item.quantity })),
      paymentMethod,
      couponCode: appliedCoupon?.code || null,
      notes,
      gstin,
    };
    const requestSignature = JSON.stringify(orderBody);
    if (idempotencyAttempt.current?.signature !== requestSignature) idempotencyAttempt.current = { signature: requestSignature, key: crypto.randomUUID() };
    const orderResult = await apiRequest('/orders', {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyAttempt.current.key },
      body: orderBody,
    });
    const order = orderResult.order;
    setOrders((previous) => [order, ...previous.filter((item) => item.id !== order.id)]);
    if (paymentMethod === 'cod') {
      await clearCart();
      await refreshStore();
      return { order };
    }
    let paymentSession;
    try {
      paymentSession = await apiRequest(`/orders/${order.id}/payment-session`, {
        method: 'POST',
        headers: { 'X-Guest-Phone': customer.phone },
        body: {},
      });
    } catch (error) {
      if (error.code === 'RESERVATION_EXPIRED') idempotencyAttempt.current = null;
      throw error;
    }
    return { order, paymentSession };
  };

  const completePayment = async (orderId, paymentResponse) => {
    const order = await apiRequest('/payments/razorpay/verify', {
      method: 'POST',
      headers: { 'X-Guest-Phone': pendingGuestPhone },
      body: {
        orderId,
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      },
    });
    setOrders((previous) => [order, ...previous.filter((item) => item.id !== order.id)]);
    await clearCart();
    await refreshStore();
    return order;
  };

  const updateOrderStatus = async (orderId, status, trackingNumber) => {
    try {
      const order = status === 'Cancelled'
        ? await apiRequest(`/admin/orders/${orderId}/cancel`, { method: 'POST', body: { reason: 'Admin cancellation' } })
        : await apiRequest(`/admin/orders/${orderId}/status`, { method: 'PATCH', body: { status, trackingNumber } });
      setOrders((previous) => previous.map((item) => item.id === orderId ? order : item));
      showToast(`Order status updated to ${status}`, 'success');
    } catch (error) { showToast(error.message, 'error'); }
  };

  const addProduct = async (product) => {
    try {
      const saved = await apiRequest('/admin/products', { method: 'POST', body: product });
      setProducts((previous) => [saved, ...previous]);
      showToast(`Product "${saved.name}" created!`, 'success');
    } catch (error) { showToast(error.message, 'error'); }
  };
  const updateProduct = async (id, updates) => {
    try {
      const saved = await apiRequest(`/admin/products/${id}`, { method: 'PATCH', body: updates });
      setProducts((previous) => previous.map((product) => product.id === id ? saved : product));
      showToast('Product updated successfully!', 'success');
    } catch (error) { showToast(error.message, 'error'); }
  };
  const deleteProduct = async (id) => {
    try {
      await apiRequest(`/admin/products/${id}`, { method: 'DELETE' });
      setProducts((previous) => previous.filter((product) => product.id !== id));
      showToast('Product removed.', 'info');
    } catch (error) { showToast(error.message, 'error'); }
  };
  const resetProducts = async () => {
    try {
      setProducts(await apiRequest('/admin/products/reset', { method: 'POST', body: {} }));
      showToast('Product catalog reset to defaults.', 'info');
    } catch (error) { showToast(error.message, 'error'); }
  };

  const addCoupon = async (coupon) => {
    try {
      const saved = await apiRequest('/admin/coupons', { method: 'POST', body: coupon });
      setCoupons((previous) => [saved, ...previous.filter((item) => item.code !== saved.code)]);
      showToast(`Coupon ${saved.code} created!`, 'success');
    } catch (error) { showToast(error.message, 'error'); }
  };
  const deleteCoupon = async (code) => {
    try {
      await apiRequest(`/admin/coupons/${encodeURIComponent(code)}`, { method: 'DELETE' });
      setCoupons((previous) => previous.filter((coupon) => coupon.code !== code));
      if (appliedCoupon?.code === code) setAppliedCoupon(null);
      showToast(`Coupon ${code} removed.`, 'info');
    } catch (error) { showToast(error.message, 'error'); }
  };

  const addReview = async (review) => {
    try {
      const saved = await apiRequest('/reviews', { method: 'POST', body: review });
      setReviews((previous) => [saved, ...previous]);
      showToast('Thank you! Your review has been posted.', 'success');
    } catch (error) { showToast(error.message, 'error'); }
  };

  const login = async (email, password) => {
    try {
      await apiRequest('/auth/login', { method: 'POST', body: { email, password } });
      setIsAuthModalOpen(false);
      await refreshStore();
      showToast('Welcome back!', 'success');
    } catch (error) { showToast(error.message, 'error'); }
  };
  const signup = async (name, email, phone, password) => {
    try {
      await apiRequest('/auth/register', { method: 'POST', body: { name, email, phone, password } });
      setIsAuthModalOpen(false);
      await refreshStore();
      showToast(`Welcome to PopCo, ${name}!`, 'success');
    } catch (error) { showToast(error.message, 'error'); }
  };
  const logout = async () => {
    try { await apiRequest('/auth/logout', { method: 'POST' }); }
    catch (error) { showToast(error.message, 'error'); }
    setCurrentUser(null);
    setOrders([]);
    showToast('Logged out successfully.', 'info');
  };

  const addAddress = async (address) => {
    try {
      const saved = await apiRequest('/me/addresses', { method: 'POST', body: address });
      setCurrentUser((user) => user ? { ...user, addresses: [...user.addresses.filter((item) => !saved.isDefault || !item.isDefault), saved] } : user);
      showToast('New delivery address saved!', 'success');
    } catch (error) { showToast(error.message, 'error'); }
  };
  const deleteAddress = async (id) => {
    try {
      await apiRequest(`/me/addresses/${id}`, { method: 'DELETE' });
      setCurrentUser((user) => user ? { ...user, addresses: user.addresses.filter((address) => address.id !== id) } : user);
      showToast('Address deleted.', 'info');
    } catch (error) { showToast(error.message, 'error'); }
  };
  const setDefaultAddress = async (id) => {
    try {
      const saved = await apiRequest(`/me/addresses/${id}`, { method: 'PATCH', body: { isDefault: true } });
      setCurrentUser((user) => user ? { ...user, addresses: user.addresses.map((address) => ({ ...address, isDefault: address.id === saved.id })) } : user);
      showToast('Default address updated!', 'success');
    } catch (error) { showToast(error.message, 'error'); }
  };

  const openPolicy = (policy) => setActivePolicy(policy);
  const closePolicy = () => setActivePolicy(null);
  const updateSettings = async (newSettings) => {
    try {
      const saved = await apiRequest('/admin/settings', { method: 'PATCH', body: newSettings });
      setSettings({ ...DEFAULT_SETTINGS, ...saved });
      showToast('Store settings updated!', 'success');
    } catch (error) { showToast(error.message, 'error'); }
  };
  const dismissToast = (id) => setToasts((previous) => previous.filter((toast) => toast.id !== id));

  return (
    <StoreContext.Provider value={{
      products, addProduct, updateProduct, deleteProduct, resetProducts,
      selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, sortBy, setSortBy,
      cart, addToCart, removeFromCart, updateQuantity, clearCart, isCartOpen, setIsCartOpen,
      isBulkOrderOpen, setIsBulkOrderOpen,
      cartCount, cartSubtotal, cartGrossSubtotal, comboDiscount, couponDiscount, shippingFee, cartTotal,
      coupons, appliedCoupon, applyCoupon, removeCoupon, addCoupon, deleteCoupon,
      orders, createOrder, completePayment, updateOrderStatus, reviews, addReview,
      currentUser, login, signup, logout, addAddress, deleteAddress, setDefaultAddress,
      isAuthModalOpen, setIsAuthModalOpen, authModalMode, setAuthModalMode,
      activePolicy, openPolicy, closePolicy, toasts, showToast, dismissToast,
      settings, updateSettings, isBootstrapping,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
