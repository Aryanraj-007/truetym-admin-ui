
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SignUpCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'Streamlined Workflows',
      description: 'Automate HR processes end-to-end',
      image: '/images/carousel-1.png',
    },
    {
       title: 'Real-time Analytics',
      description: 'Data-driven insights for better decisions',
      image: '/images/carousel-2.png',
    },
    {
      title: 'Employee Insights',
      description: 'Track performance and growth metrics',
      image: '/images/carousel-3.png',
    },
    {
      title: 'Manage Your Workforce',
      description: 'Streamline team collaboration and employee management',
      image: '/images/carousel-4.png',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            index === currentSlide
              ? 'opacity-100 translate-x-0'
              : index < currentSlide
              ? 'opacity-0 -translate-x-full'
              : 'opacity-0 translate-x-full'
          }`}
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${slide.image}')`,
            }}
          />
          
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-20/30 to-teal-400/50" />
          
          {/* Content */}
          <div className="relative h-full flex flex-col justify-end p-12 pb-24">
            <h2 className="text-4xl font-bold text-white mb-4">{slide.title}</h2>
            <p className="text-xl text-white/90">{slide.description}</p>
          </div>
        </div>
      ))}

      {/* Dot Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
