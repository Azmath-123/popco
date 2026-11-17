import React, { useState } from 'react';
import { INITIAL_BLOGS } from '../data/siteContent.js';
import { Calendar, Clock, ArrowRight, Sparkles, X, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
export const BlogsPage = () => {
    const [selectedBlog, setSelectedBlog] = useState(null);
    return (<div className="flex-1 bg-[var(--background)] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-[var(--secondary-foreground)] text-xs font-black uppercase tracking-widest">
            <Sparkles size={14}/>
            <span>Sacred Harvest & Nutrition</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase text-[var(--foreground)] tracking-tight">
            Blogs & Heritage
          </h1>
          <p className="text-xs sm:text-sm text-[var(--foreground)]/75 font-sans uppercase tracking-wider">
            Explore centuries-old Mithilanchal traditions, Ayurvedic culinary secrets, and modern superfood science.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {INITIAL_BLOGS.map((blog) => (<article key={blog.id} onClick={() => setSelectedBlog(blog)} className="bg-white rounded-3xl border border-[var(--border)]/15 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group transform hover:-translate-y-1.5">
              <div>
                <div className="h-52 w-full overflow-hidden bg-[var(--background)] relative">
                  <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {blog.tags.slice(0, 2).map((tag, i) => (<span key={i} className="bg-black/60 backdrop-blur-xs text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full">
                        {tag}
                      </span>))}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-[10px] text-[var(--foreground)]/60 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Calendar size={12}/>
                      {blog.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12}/>
                      {blog.readTime}
                    </span>
                  </div>

                  <h3 className="text-base font-black uppercase text-[var(--foreground)] group-hover:text-[var(--secondary-foreground)] transition-colors leading-snug">
                    {blog.title}
                  </h3>

                  <p className="text-xs text-[var(--foreground)]/75 font-sans line-clamp-3 leading-relaxed">
                    {blog.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-[var(--border)]/5 flex items-center justify-between text-xs font-black uppercase tracking-wider text-[var(--foreground)]">
                <span>Read Article</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform"/>
              </div>
            </article>))}
        </div>
      </div>

      {/* Article Reader Modal */}
      {selectedBlog && (<div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--background)] rounded-3xl shadow-2xl max-w-3xl w-full border border-[var(--border)]/20 overflow-hidden relative max-h-[90vh] flex flex-col">
            <div className="relative h-64 sm:h-72 w-full shrink-0">
              <img src={selectedBlog.image} alt={selectedBlog.title} className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"/>
              <button onClick={() => setSelectedBlog(null)} className="absolute top-4 right-4 bg-black/50 hover:bg-black text-white p-2 rounded-full transition-colors cursor-pointer">
                <X size={18}/>
              </button>

              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white/80 uppercase">
                  <span>{selectedBlog.author}</span>
                  <span>•</span>
                  <span>{selectedBlog.date}</span>
                  <span>•</span>
                  <span>{selectedBlog.readTime}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black uppercase leading-tight text-[var(--background)]">
                  {selectedBlog.title}
                </h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4 text-xs sm:text-sm text-[var(--foreground)]/85 leading-relaxed font-sans no-scrollbar">
              {selectedBlog.content.map((p, idx) => (<p key={idx} className="leading-relaxed">
                  {p}
                </p>))}

              <div className="mt-8 p-6 bg-white rounded-2xl border border-[var(--border)]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-black uppercase text-[var(--foreground)]">
                    Experience Bihar's 6+ Suta Makhana
                  </h4>
                  <p className="text-xs text-[var(--foreground)]/70 font-sans">
                    Freshly popped, pesticide-free, delivered nationwide in 3-5 days.
                  </p>
                </div>
                <Link to="/#shop" onClick={() => setSelectedBlog(null)} className="px-6 py-2.5 bg-[var(--primary)] text-white text-xs font-black uppercase tracking-wider rounded-full shadow-md flex items-center gap-1.5 shrink-0">
                  <ShoppingBag size={14}/>
                  <span>Shop Harvest</span>
                </Link>
              </div>
            </div>
          </div>
        </div>)}
    </div>);
};
