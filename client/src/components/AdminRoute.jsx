import React, { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export const AdminRoute = ({ children }) => {
  const { currentUser, isBootstrapping, showToast, setIsAuthModalOpen } = useStore();
  const hasNotified = useRef(false);

  const isAdmin = currentUser && (currentUser.role === 'super_admin' || currentUser.role === 'admin');

  useEffect(() => {
    if (!isBootstrapping && !isAdmin && !hasNotified.current) {
      hasNotified.current = true;
      if (!currentUser) {
        showToast('Please sign in with administrator credentials.', 'info');
        setIsAuthModalOpen(true);
      } else {
        showToast('Access Restricted: Administrator privileges required.', 'error');
      }
    }
  }, [isBootstrapping, isAdmin, currentUser, showToast, setIsAuthModalOpen]);

  if (isBootstrapping && !currentUser) {
    return (
      <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-10 h-10 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
          Verifying administrative authorization...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};
