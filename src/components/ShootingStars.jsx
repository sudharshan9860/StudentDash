import React, { useState, useEffect } from 'react';
import '../styles/ShootingStars.css';

const ShootingStars = ({ starCount = 20, sparkleCount = 10 }) => {
  const [stars, setStars] = useState([]);
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    // Generate shooting stars
    const generatedStars = Array.from({ length: starCount }, (_, index) => ({
      id: `star-${index}`,
      top: Math.random() * window.innerHeight,
      left: Math.random() * window.innerWidth,
      animationDelay: `${Math.random() * 5}s`,
      duration: `${2 + Math.random() * 3}s`
    }));

    // Generate sparkles
    const generatedSparkles = Array.from({ length: sparkleCount }, (_, index) => ({
      id: `sparkle-${index}`,
      top: Math.random() * window.innerHeight,
      left: Math.random() * window.innerWidth,
      animationDelay: `${Math.random() * 5}s`,
      scale: 0.5 + Math.random() * 1.5
    }));

    setStars(generatedStars);
    setSparkles(generatedSparkles);
  }, [starCount, sparkleCount]);

  return (
    <div className="shooting-stars-container">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            top: `${star.top}px`,
            left: `${star.left}px`,
            animationDelay: star.animationDelay,
            animationDuration: star.duration
          }}
        />
      ))}
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="sparkle"
          style={{
            top: `${sparkle.top}px`,
            left: `${sparkle.left}px`,
            animationDelay: sparkle.animationDelay,
            transform: `scale(${sparkle.scale})`
          }}
        />
      ))}
    </div>
  );
};

export default ShootingStars;