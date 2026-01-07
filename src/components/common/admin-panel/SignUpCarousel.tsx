'use client';

import { useEffect, useState } from 'react';

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
    <div className="relative h-full w-full overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            index === currentSlide
              ? 'translate-x-0 opacity-100'
              : index < currentSlide
                ? '-translate-x-full opacity-0'
                : 'translate-x-full opacity-0'
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
          <div className="from-teal-20/30 absolute inset-0 bg-gradient-to-br to-teal-400/50" />

          {/* Content */}
          <div className="relative flex h-full flex-col justify-end p-12 pb-24">
            <h2 className="mb-4 text-4xl font-bold text-white">{slide.title}</h2>
            <p className="text-xl text-white/90">{slide.description}</p>
          </div>
        </div>
      ))}

      {/* Dot Indicators */}
      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 transform gap-2">
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
