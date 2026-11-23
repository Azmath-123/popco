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
    ctaText: 'Shop Raw Makhana',
  },
  {
    id: 'edamame-beans',
    slug: 'popco-roasted-salted-edamame-beans-150g',
    image: '/hero-edamame-beans.jpg',
    alt: 'POP CO Roasted & Salted Edamame Beans 150gm',
    tag: '46% PLANT PROTEIN • 14% FIBER • 150GM',
    title: 'POWER UP YOUR DAILY SNACKING',
    ctaText: 'Shop Roasted Edamame',
  },
];

export const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();
  const touchStartX = useRef(null);

  // Auto-advance every 3.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3500);
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
        setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
      } else {
        setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
      }
    }
    touchStartX.current = null;
  };

  return (
    <section 
      className="relative w-full bg-[#1c140d] overflow-hidden select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Featured Product Showcase Slider"
    >
      {/* Slider Frame */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[16/8] lg:aspect-[2.1/1] min-h-[380px] max-h-[580px] overflow-hidden bg-[#1c140d]">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              onClick={() => handleSlideClick(slide.slug)}
              className={`absolute inset-0 w-full h-full cursor-pointer transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Responsive Slide Image positioned backward with depth and breathing room */}
              <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-end">
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="w-full h-full object-cover object-[center_18%] sm:object-[center_14%] md:object-[center_10%] scale-100 md:scale-[0.88] lg:scale-[0.82] origin-right transition-transform duration-700 ease-out"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                />
              </div>

              {/* Gradient Overlay for Text Legibility & Visual Depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent md:bg-gradient-to-r md:from-black/90 md:via-black/55 md:via-35% md:to-transparent flex flex-col justify-end md:justify-center p-6 sm:p-10 md:p-16 lg:p-20 pointer-events-none">
                <div className="max-w-xl text-white space-y-4 sm:space-y-6 pointer-events-auto">
                  
                  {/* Category / Benefit Tag */}
                  <div>
                    <span className="inline-flex items-center gap-1.5 bg-[var(--secondary-foreground)] text-white text-[10px] sm:text-xs font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-sm">
                      <Sparkles size={12} className="text-white" />
                      {slide.tag}
                    </span>
                  </div>

                  {/* Main Headline */}
                  <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-tight text-white drop-shadow-md">
                    {slide.title}
                  </h1>

                  {/* CTA Button */}
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-white text-[var(--foreground)] text-xs sm:text-sm font-black uppercase tracking-wider shadow-xl hover:bg-[#F5EFE6] transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                      <span>{slide.ctaText}</span>
                      <ArrowRight size={15} className="text-[var(--primary)]" />
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
        <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-xs px-3.5 py-1.5 rounded-full">
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

        {/* 3.5-Second Active Progress Bar Line at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20 overflow-hidden">
          <div
            key={currentSlide}
            className={`h-full bg-[var(--secondary-foreground)] ${
              isPaused ? 'w-full' : 'animate-[hero-progress_3.5s_linear]'
            }`}
            style={{
              animation: isPaused ? 'none' : 'heroProgress 3.5s linear',
            }}
          />
        </div>
      </div>
    </section>
  );
};
