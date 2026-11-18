import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';

const HERO_SLIDES = [
  {
    id: 'raw-makhana',
    slug: 'mukeja-makhana-200g',
    image: '/hero-raw-makhana.jpg',
    alt: 'POP CO Premium Raw Makhana 200gm',
    tag: '100% RAW & NATURAL • 200GM',
    title: "NATURE'S CRUNCHIEST SUPERFOOD",
    subtitle: 'Direct from Bihar. Sun-dried, traditionally popped Jumbo 6+ Suta makhana, rich in protein, antioxidants, and pure goodness.',
    priceBadge: '₹399 (200gm)',
    ctaText: 'Shop Raw Makhana',
  },
  {
    id: 'edamame-beans',
    slug: 'popco-roasted-salted-edamame-beans-150g',
    image: '/hero-edamame-beans.jpg',
    alt: 'POP CO Roasted & Salted Edamame Beans 150gm',
    tag: '46% PLANT PROTEIN • 14% FIBER • 150GM',
    title: 'POWER UP YOUR DAILY SNACKING',
    subtitle: 'Slow hot-air roasted with pure sea salt. Non-GMO, gluten-free, zero palm oil, and high natural fibre for everyday energy.',
    priceBadge: '₹299 (150gm)',
    ctaText: 'Shop Roasted Edamame',
  },
];

export const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();
  const touchStartX = useRef(null);

  // Auto-advance every 3 seconds (3000ms)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isPaused, currentSlide]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handleSlideClick = (slug) => {
    navigate(`/product/${slug}`);
  };

  // Mobile Touch Swipe Handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swiped left -> next slide
        setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
      } else {
        // Swiped right -> prev slide
        setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
      }
    }
    touchStartX.current = null;
  };

  return (
    <section 
      className="relative w-full bg-[var(--background)] overflow-hidden select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Featured Product Showcase Slider"
    >
      {/* Slider Frame with aspect ratio matching images (1024x571 = 1.79:1) */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[16/9] md:aspect-[16/9] max-h-[640px] overflow-hidden bg-black/5">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              onClick={() => handleSlideClick(slide.slug)}
              className={`absolute inset-0 w-full h-full cursor-pointer transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
              title={`Click to view ${slide.alt}`}
            >
              {/* Responsive Slide Image */}
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-101"
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
              />

              {/* Gradient Overlay for Text Legibility & Visual Depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/15 md:bg-gradient-to-r md:from-black/80 md:via-black/35 md:to-transparent flex flex-col justify-end md:justify-center p-4 sm:p-8 md:p-12 lg:p-16">
                <div className="max-w-xl text-white space-y-2 sm:space-y-3.5">
                  
                  {/* Category / Weight Tag */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-[var(--secondary-foreground)] text-white text-[9px] sm:text-[11px] font-black uppercase px-2.5 py-0.5 sm:py-1 rounded-full tracking-wider shadow-sm">
                      <Sparkles size={11} className="text-white" />
                      {slide.tag}
                    </span>
                    <span className="bg-white/20 backdrop-blur-xs text-white text-[9px] sm:text-[11px] font-black px-2 py-0.5 sm:py-1 rounded-full shadow-xs">
                      {slide.priceBadge}
                    </span>
                  </div>

                  {/* Main Headline */}
                  <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-tight text-[var(--background)] drop-shadow-md">
                    {slide.title}
                  </h1>

                  {/* Description (Truncated neatly on mobile) */}
                  <p className="text-[11px] sm:text-xs md:text-sm text-white/90 font-sans font-medium line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow-sm max-w-lg">
                    {slide.subtitle}
                  </p>

                  {/* CTA Buttons */}
                  <div className="pt-1 sm:pt-2 flex items-center gap-2 sm:gap-3">
                    <span className="inline-flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-[var(--background)] text-[var(--foreground)] text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg hover:bg-white transition-all transform active:scale-95">
                      <span>{slide.ctaText}</span>
                      <ArrowRight size={13} className="text-[var(--primary)]" />
                    </span>
                    <span className="text-[10px] sm:text-xs text-white/80 font-bold uppercase tracking-wider underline underline-offset-4 hidden sm:inline-block">
                      Click Image to View Details →
                    </span>
                  </div>

                </div>
              </div>
            </div>
          );
        })}

        {/* Previous Slide Arrow Button */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs flex items-center justify-center transition-all opacity-80 hover:opacity-100 cursor-pointer shadow-md"
        >
          <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
        </button>

        {/* Next Slide Arrow Button */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs flex items-center justify-center transition-all opacity-80 hover:opacity-100 cursor-pointer shadow-md"
        >
          <ChevronRight size={20} className="sm:w-6 sm:h-6" />
        </button>

        {/* Bottom Pagination Dots & Progress Indicator */}
        <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/30 backdrop-blur-xs px-3 py-1 rounded-full">
          {HERO_SLIDES.map((slide, index) => {
            const isActive = index === currentSlide;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(index);
                }}
                aria-label={`Go to slide ${index + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isActive
                    ? 'w-6 h-2 bg-[var(--secondary-foreground)]'
                    : 'w-2 h-2 bg-white/60 hover:bg-white'
                }`}
              />
            );
          })}
        </div>

        {/* 3-Second Active Progress Bar Line at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20 overflow-hidden">
          <div
            key={currentSlide}
            className={`h-full bg-[var(--secondary-foreground)] ${
              isPaused ? 'w-full' : 'animate-[hero-progress_3s_linear]'
            }`}
            style={{
              animation: isPaused ? 'none' : 'heroProgress 3s linear',
            }}
          />
        </div>
      </div>
    </section>
  );
};

