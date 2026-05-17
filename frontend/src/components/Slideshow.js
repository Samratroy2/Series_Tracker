// anime-tracker\frontend\src/components/Slideshow.js
import React, { useEffect, useState } from 'react';
import './Slideshow.css';

const Slideshow = ({ slides }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 3000); // 3 seconds
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="slideshow-container">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`mySlide fade ${index === current ? 'active' : ''}`}
        >
          <img src={slide.image_url} alt={slide.title} className="slide-img" />
          <div className="text">{slide.title}</div>
        </div>
      ))}
      <div className="dot-container">
        {slides.map((_, idx) => (
          <span
            key={idx}
            className={`dot ${idx === current ? 'active' : ''}`}
            onClick={() => setCurrent(idx)}
          />
        ))}
      </div>
    </div>
  );
};

export default Slideshow;
