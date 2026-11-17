import React from 'react';
import { Save } from 'lucide-react';

export function StoreSettingsTab({ settAnnouncement, setSettAnnouncement, settWhatsapp, setSettWhatsapp, settEmail, setSettEmail, settThreshold, setSettThreshold, handleSaveSettings }) {
  return (
<form onSubmit={handleSaveSettings} className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--border)]/15 shadow-sm space-y-6 max-w-2xl">
            <h2 className="text-lg font-black uppercase text-[var(--foreground)] border-b border-[var(--border)]/10 pb-4">
              Website Copy & Contact Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                  Top Announcement Ticker Text
                </label>
                <input type="text" value={settAnnouncement} onChange={(e) => setSettAnnouncement(e.target.value)} className="w-full px-3 py-2 text-xs bg-[var(--background)] border border-[var(--border)]/20 rounded-lg font-bold"/>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                    WhatsApp Support Number (without +)
                  </label>
                  <input type="text" value={settWhatsapp} onChange={(e) => setSettWhatsapp(e.target.value)} className="w-full px-3 py-2 text-xs bg-[var(--background)] border border-[var(--border)]/20 rounded-lg font-bold"/>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                    Customer Care Email
                  </label>
                  <input type="email" value={settEmail} onChange={(e) => setSettEmail(e.target.value)} className="w-full px-3 py-2 text-xs bg-[var(--background)] border border-[var(--border)]/20 rounded-lg font-bold"/>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                  Free Shipping Minimum Cart Value (INR)
                </label>
                <input type="number" value={settThreshold} onChange={(e) => setSettThreshold(e.target.value)} className="w-full px-3 py-2 text-xs bg-[var(--background)] border border-[var(--border)]/20 rounded-lg font-bold"/>
              </div>
            </div>

            <button type="submit" className="px-8 py-3 rounded-full bg-[var(--primary)] text-white text-xs font-black uppercase tracking-wider shadow-md hover:bg-[var(--primary)]/90 flex items-center gap-2">
              <Save size={15}/>
              <span>Save Configuration</span>
            </button>
          </form>
  );
}
