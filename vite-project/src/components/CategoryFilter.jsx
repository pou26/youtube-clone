import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CategoryFilter = ({ activeFilter, setActiveFilter }) => {
  const categories = [
    'All', 'Music', 'Podcasts', 'Web series', 'Brides',
    'Ghost stories', 'Film criticisms', 'Education', 'Makeovers',
    'Mixes', 'Ideas', 'Webisodes', 'History', 'Kitchens',
    'Comedy', 'Gadgets', 'Asian Music', 'Presentations', 
    'Recently uploaded', 'Watched', 'New to you'
  ];

  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Check if arrows should be visible based on scroll position
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollPosition);
      // Check initially
      checkScrollPosition();
      
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollPosition);
      };
    }
  }, []);

  return (
    <div className="relative flex items-center mb-4">
              {/* Left gradient overlay */}
      {showLeftArrow && (
        <div className="absolute left-0 z-10 h-full w-16 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)'
          }}
        />
      )}
      {/* Left arrow button */}
      {showLeftArrow && (
        <button 
          onClick={scrollLeft}
          className="absolute left-0 z-10 bg-transparent bg-opacity-70 hover:bg-gray-700 rounded-full p-1"
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
      )}
      
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-3 py-2 px-2 no-scrollbar scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveFilter(category)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === category
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

            {/* Right gradient overlay */}
            {showRightArrow && (
        <div className="absolute right-0 z-10 h-full w-16 pointer-events-none"
          style={{
            background: 'linear-gradient(to left, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)'
          }}
        />
      )}

      {/* Right arrow button */}
      
      {showRightArrow && (
        <button 
          onClick={scrollRight}
          className="absolute right-0 z-10 bg-transparent bg-opacity-70 hover:bg-gray-700 rounded-full p-1"
          aria-label="Scroll right"
        >
          <ChevronRight size={24} className="text-white" />
        </button>
      )}
    </div>
  );
};

export default CategoryFilter;