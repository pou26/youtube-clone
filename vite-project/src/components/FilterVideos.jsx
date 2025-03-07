import React, { useRef, useState } from 'react';
import './FilterVideos.css';

const FilterVideos = ({ onFilterChange, isSidebar2Open }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const scrollRef = useRef(null);

  const categories = [
    'All', 'Music', 'Podcasts', 'Web series', 'Brides', 
    'Ghost stories', 'Film criticisms', 'Education', 'Makeovers', 
    'Mixes', 'Ideas', 'Webisodes', 'History', 'Kitchens',
    'Comedy', 'Gadgets', 'Asian Music', 'Presentations', 
    'Recently uploaded', 'Watched', 'New to you'
  ];

  const handleFilterClick = (category) => {
    setActiveFilter(category);
    onFilterChange(category);
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const filterContainerClass = isSidebar2Open ? "filter-container-shifted" : "filter-container";

  return (
    <div className="filter-wrapper">
      <button className="scroll-arrow scroll-left" onClick={scrollLeft}></button>
      <div className={filterContainerClass} ref={scrollRef}>
        <div className="filter-buttons-wrapper">
          {categories.map((category) => (
            <button 
              key={category}
              className={`filter-button ${activeFilter === category ? 'active' : ''}`}
              onClick={() => handleFilterClick(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      <button className="scroll-arrow scroll-right" onClick={scrollRight}></button>
    </div>
  );
};

export default FilterVideos;
