import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CustomComboBuilder } from './components/CustomComboBuilder';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { PolicyModal } from './components/PolicyModal';
import { ToastContainer } from './components/ToastContainer';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { ProfilePage } from './pages/ProfilePage';
import { BlogsPage } from './pages/BlogsPage';
import { AdminDashboard } from './pages/AdminDashboard';
// Scroll to top helper & policy route synchronizer
const RouteWatcher = () => {
    const location = useLocation();
    const { openPolicy, setIsBulkOrderOpen } = useStore();
    useEffect(() => {
        window.scrollTo(0, 0);
        // Sync policy & modal URL paths
        const path = location.pathname;
        if (path === '/combo' || path === '/bulk-order' || path === '/custom-combo') {
            setIsBulkOrderOpen(true);
        }
        else if (path === '/product/faq-and-support') {
            openPolicy('faq');
        }
        else if (path === '/product/privacy-policy') {
            openPolicy('privacy');
        }
        else if (path === '/product/terms-of-service') {
            openPolicy('terms');
        }
        else if (path === '/product/cancellation-policy') {
            openPolicy('cancellation');
        }
        else if (path === '/product/sitemap') {
            openPolicy('sitemap');
        }
    }, [location.pathname]);
    return null;
};
const AppContent = () => {
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');
    return (<div className="min-h-screen flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)]">
      <RouteWatcher />

      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Main Sticky Navbar (Hidden on admin if requested, but nice header on both) */}
      <Navbar />

      {/* Main Content Pages */}
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<HomePage onOpenCheckout={() => setIsCheckoutOpen(true)}/>}/>
          <Route path="/product/:slug" element={<ProductDetailPage onOpenCheckout={() => setIsCheckoutOpen(true)}/>}/>
          <Route path="/cart" element={<CartPage onOpenCheckout={() => setIsCheckoutOpen(true)}/>}/>
          <Route path="/combo" element={<HomePage onOpenCheckout={() => setIsCheckoutOpen(true)}/>}/>
          <Route path="/bulk-order" element={<HomePage onOpenCheckout={() => setIsCheckoutOpen(true)}/>}/>
          <Route path="/custom-combo" element={<HomePage onOpenCheckout={() => setIsCheckoutOpen(true)}/>}/>
          <Route path="/profile" element={<ProfilePage />}/>
          <Route path="/login" element={<ProfilePage />}/>
          <Route path="/signup" element={<ProfilePage />}/>
          <Route path="/blogs" element={<BlogsPage />}/>
          <Route path="/admin" element={<AdminDashboard />}/>

          {/* Reference Site Policy Routes */}
          <Route path="/product/faq-and-support" element={<HomePage onOpenCheckout={() => setIsCheckoutOpen(true)}/>}/>
          <Route path="/product/privacy-policy" element={<HomePage onOpenCheckout={() => setIsCheckoutOpen(true)}/>}/>
          <Route path="/product/terms-of-service" element={<HomePage onOpenCheckout={() => setIsCheckoutOpen(true)}/>}/>
          <Route path="/product/cancellation-policy" element={<HomePage onOpenCheckout={() => setIsCheckoutOpen(true)}/>}/>
          <Route path="/product/sitemap" element={<HomePage onOpenCheckout={() => setIsCheckoutOpen(true)}/>}/>

          {/* Catch-all fallback to HomePage */}
          <Route path="*" element={<HomePage onOpenCheckout={() => setIsCheckoutOpen(true)}/>}/>
        </Routes>
      </main>

      {/* Footer */}
      {!isAdmin && <Footer />}

      {/* Overlays, Drawers & Modals */}
      <CustomComboBuilder />
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)}/>
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)}/>
      <AuthModal />
      <PolicyModal />
      <ToastContainer />
    </div>);
};
export default function App() {
    return (<BrowserRouter>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </BrowserRouter>);
}
