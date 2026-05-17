// frontend/src/components/FilterSection.js

import React, { useState, useRef, useEffect } from 'react';
import './FilterSection.css';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

const FilterSection = ({ title, options, selected, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.style.maxHeight = isExpanded
        ? `${wrapperRef.current.scrollHeight}px`
        : '0px';
    }
  }, [isExpanded, options]);

  return (
    <div className="filter-card">
      <button
        className="filter-header"
        onClick={() => setIsExpanded(prev => !prev)}
      >
        <span>{title}</span>
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      <div className="filter-options-wrapper" ref={wrapperRef}>
        <div className="filter-options">
          {options.map(opt => (
            <div
              key={opt.value}
              className={`filter-pill ${selected.includes(opt.value) ? 'active' : ''}`}
              onClick={() => !selected.includes(opt.value) && onChange(opt.value)}
            >
              {opt.label}
              {selected.includes(opt.value) && (
                <X
                  size={14}
                  className="pill-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(opt.value);
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
