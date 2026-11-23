import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { Link } from 'react-router-dom';
export const AnnouncementBar = () => {
    const { settings, currentUser } = useStore();
    return (<div className="bg-[var(--primary)] text-[var(--background)] text-[11px] font-bold tracking-widest uppercase border-b border-[var(--border)]/20 z-40 select-none">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2 text-white/80">
          <Sparkles size={13} className="text-[var(--secondary-foreground)]"/>
          <span>GI Tagged Mithila Makhana</span>
        </div>

        <div className="flex-1 text-center font-extrabold text-xs sm:text-[11px] truncate px-2">
          {settings.announcementText}
        </div>

        <div className="hidden md:flex items-center gap-4 text-white/80">
          <a href={`https://wa.me/${settings.whatsappNumber}?text=Hi%20PopCo%2C%20I%20have%20an%20enquiry`} target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1.5 transition-colors">
            <FaWhatsapp size={14}/>
            <span>Support</span>
          </a>
          {currentUser && (currentUser.role === 'super_admin' || currentUser.role === 'admin') && (
            <Link to="/admin" className="bg-[var(--secondary-foreground)] hover:bg-[var(--secondary-foreground)]/90 text-white px-2.5 py-0.5 rounded text-[10px] tracking-wider transition-all flex items-center gap-1 font-semibold">
              <ShieldCheck size={11}/>
              <span>Admin</span>
            </Link>
          )}
        </div>
      </div>
    </div>);
};
