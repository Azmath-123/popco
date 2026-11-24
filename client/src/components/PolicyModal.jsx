import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { POLICY_CONTENT } from '../data/siteContent.js';
import { X, ChevronDown, FileText, HelpCircle, Shield, Sparkles } from 'lucide-react';
export const PolicyModal = () => {
    const { activePolicy, closePolicy, openPolicy } = useStore();
    const [openFaqIndex, setOpenFaqIndex] = React.useState(0);

    if (!activePolicy)
        return null;
    const toggleFaq = (idx) => {
        setOpenFaqIndex(openFaqIndex === idx ? null : idx);
    };
    return (<div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-contain">
      <div className="bg-[var(--background)] rounded-2xl shadow-2xl max-w-3xl w-full border border-[var(--border)]/20 overflow-hidden relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[var(--border)]/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activePolicy === 'about' && <Sparkles size={20} className="text-[var(--secondary-foreground)]"/>}
            {activePolicy === 'faq' && <HelpCircle size={20} className="text-[var(--foreground)]"/>}
            {activePolicy === 'privacy' && <Shield size={20} className="text-[var(--foreground)]"/>}
            {activePolicy === 'terms' && <FileText size={20} className="text-[var(--foreground)]"/>}
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-[var(--foreground)]">
              {POLICY_CONTENT[activePolicy]?.title}
            </h2>
          </div>
          <button onClick={closePolicy} className="p-1.5 rounded-full hover:bg-[var(--primary)]/10 text-[var(--foreground)] transition-colors cursor-pointer">
            <X size={20}/>
          </button>
        </div>

        {/* Policy Tab Bar */}
        <div className="flex overflow-x-auto border-b border-[var(--border)]/15 bg-[var(--background)] text-[11px] font-bold uppercase tracking-wider no-scrollbar">
          {['about', 'faq', 'privacy', 'terms'].map((key) => (<button key={key} onClick={() => openPolicy(key)} className={`px-4 py-2.5 whitespace-nowrap transition-all border-b-2 cursor-pointer ${activePolicy === key
                ? 'border-[var(--border)] text-[var(--foreground)] bg-white font-black'
                : 'border-transparent text-[var(--foreground)]/60 hover:text-[var(--foreground)]'}`}>
              {key === 'about' ? 'About POP CO' : key === 'faq' ? 'FAQs' : key.replace('-', ' ')}
            </button>))}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar text-xs sm:text-sm text-[var(--foreground)]/85 leading-relaxed font-sans">
          {activePolicy === 'about' && (<div className="space-y-5">
              <div className="p-4 bg-white rounded-xl border border-[var(--border)]/15 shadow-xs space-y-3">
                <span className="inline-block bg-[var(--secondary-foreground)] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-widest">
                  POP CO Story
                </span>
                <h3 className="text-base sm:text-lg font-black uppercase text-[var(--foreground)] tracking-tight">
                  {POLICY_CONTENT.about.tagline}
                </h3>
                <div className="space-y-2 text-xs sm:text-sm text-[var(--foreground)]/85 leading-relaxed">
                  <p>
                    POP CO is an emerging food brand built with a vision to bring quality food products, delicious flavours, and better snacking choices to everyday consumers.
                  </p>
                  <p>
                    We are beginning our journey with three carefully selected products: <strong className="text-[var(--foreground)]">Makhana</strong>, <strong className="text-[var(--foreground)]">Roasted Edamame</strong>, and <strong className="text-[var(--foreground)]">Masala Tea</strong>, with a long-term vision of establishing POP CO as a trusted name in the dry fruits, healthy snacks, tea, and food essentials industry.
                  </p>
                  <p>
                    Our makhana is carefully processed in Meerut, ensuring premium quality and building a closer connection with pure, wholesome traditional Indian snacks.
                  </p>
                </div>
              </div>

              {/* Initial Product Range */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--secondary-foreground)]"></span>
                  Our Initial Product Range
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {POLICY_CONTENT.about.initialProducts.map((p, idx) => (
                    <div key={idx} className="bg-white p-3.5 rounded-xl border border-[var(--border)]/10 shadow-xs space-y-1">
                      <h5 className="font-extrabold text-[var(--foreground)] uppercase text-xs">{p.name}</h5>
                      <p className="text-[11px] text-[var(--foreground)]/75 leading-relaxed">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vision Card */}
              <div className="p-5 bg-white rounded-xl border border-[var(--border)]/15 shadow-xs space-y-3">
                <h4 className="text-sm font-black uppercase text-[var(--foreground)] tracking-tight">
                  {POLICY_CONTENT.about.visionHeading}
                </h4>
                <p className="text-xs text-[var(--foreground)]/80">
                  {POLICY_CONTENT.about.visionIntro}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {POLICY_CONTENT.about.portfolio.map((cat, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 bg-[var(--background)] rounded-lg text-xs font-bold uppercase text-[var(--foreground)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0"></span>
                      <span>{cat}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-[var(--border)]/10 space-y-2 text-xs text-[var(--foreground)]/80">
                  <p className="font-semibold text-[var(--foreground)]">
                    {POLICY_CONTENT.about.beliefs}
                  </p>
                  <p>
                    {POLICY_CONTENT.about.growthFocus}
                  </p>
                </div>
                <div className="p-3 bg-[var(--primary)] text-white rounded-lg text-center font-black uppercase text-xs tracking-widest text-[var(--background)]">
                  {POLICY_CONTENT.about.motto}
                </div>
              </div>
            </div>)}

          {activePolicy === 'faq' && (<div className="space-y-3">
              {POLICY_CONTENT.faq.sections.map((item, idx) => (<div key={idx} className="bg-white rounded-xl border border-[var(--border)]/10 overflow-hidden transition-all shadow-xs">
                  <button onClick={() => toggleFaq(idx)} className="w-full text-left p-4 flex items-center justify-between font-bold text-[var(--foreground)] text-xs sm:text-sm uppercase tracking-wide cursor-pointer hover:bg-[var(--primary)]/5 transition-colors">
                    <span>{item.q}</span>
                    <ChevronDown size={16} className={`transition-transform duration-300 text-[var(--secondary-foreground)] ${openFaqIndex === idx ? 'rotate-180' : ''}`}/>
                  </button>
                  {openFaqIndex === idx && (<div className="px-4 pb-4 pt-1 text-xs text-[var(--foreground)]/80 border-t border-[var(--border)]/5 font-normal">
                      {item.a}
                    </div>)}
                </div>))}
            </div>)}

          {activePolicy === 'privacy' && (<div className="space-y-4">
              <p className="font-semibold text-xs text-[var(--secondary-foreground)]">{POLICY_CONTENT.privacy.intro}</p>
              {POLICY_CONTENT.privacy.sections.map((sec, idx) => (<div key={idx} className="bg-white p-4 rounded-xl border border-[var(--border)]/10 space-y-1">
                  <h4 className="font-extrabold text-[var(--foreground)] uppercase text-xs">{sec.heading}</h4>
                  <p className="text-xs text-[var(--foreground)]/75">{sec.body}</p>
                </div>))}
            </div>)}

          {activePolicy === 'terms' && (<div className="space-y-4">
              <p className="font-semibold text-xs text-[var(--secondary-foreground)]">{POLICY_CONTENT.terms.intro}</p>
              {POLICY_CONTENT.terms.sections.map((sec, idx) => (<div key={idx} className="bg-white p-4 rounded-xl border border-[var(--border)]/10 space-y-1">
                  <h4 className="font-extrabold text-[var(--foreground)] uppercase text-xs">{sec.heading}</h4>
                  <p className="text-xs text-[var(--foreground)]/75">{sec.body}</p>
                </div>))}
            </div>)}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[var(--border)]/15 text-center text-xs text-[var(--foreground)]/60 font-semibold">
          For any additional assistance, please reach out to <span className="text-[var(--foreground)] font-bold">Support@thepopcoindia.com</span>
        </div>
      </div>
    </div>);
};
