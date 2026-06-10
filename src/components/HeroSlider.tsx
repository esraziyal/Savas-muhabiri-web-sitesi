import { useEffect, useState } from 'react';
import { useRouter } from '../hooks/useRouter';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { HeroSlide } from '../types/database';

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [slides]);

  if (slides.length === 0) return null;

  const goToPrevious = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const handleClick = (slide: HeroSlide) => {
    if (slide.interview_slug) {
      router.navigate(`/interview/${slide.interview_slug}`);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          onClick={() => handleClick(slide)}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            slide.interview_slug ? 'cursor-pointer' : ''
          } ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <img
            src={slide.image_url}
            alt={slide.title || slide.caption || ''}
            className={`w-full h-full object-cover object-center transition-transform duration-[6000ms] ${
              index === current ? 'scale-105' : 'scale-100'
            }`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWYxZjFmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+R8O2cnNlbCB5w7xrbGVuZW1lZGk8L3RleHQ+PC9zdmc+';
            }}
          />

          <div className="absolute inset-0 bg-black/60" />

          <div className="absolute bottom-16 left-8 max-w-2xl">
            {slide.title && (
              <h2 className="text-white text-3xl md:text-5xl font-bold mb-4 leading-tight">
                {slide.title}
              </h2>
            )}
            {slide.subtitle && (
              <p className="text-gray-200 text-lg md:text-xl">
                {slide.subtitle}
              </p>
            )}
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === current ? 'bg-red-600 w-8' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
