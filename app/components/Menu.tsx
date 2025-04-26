'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

const Menu = () => {
  const t = useTranslations();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [maxSlide, setMaxSlide] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [menuImages, setMenuImages] = useState<string[]>([]);

  const fetchMenuImages = async () => {
    try {
      const response = await fetch('/api/menu-images');
      const data = await response.json();
      setMenuImages(data.images);
    } catch (error) {
      console.error('Chyba při načítání obrázků:', error);
    }
  };

  useEffect(() => {
    fetchMenuImages();
    const interval = setInterval(fetchMenuImages, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateMaxSlide = () => {
      if (!sliderRef.current) return;
      const containerWidth = sliderRef.current.offsetWidth;
      const totalWidth = 433 * menuImages.length + 16 * (menuImages.length - 1);
      const maxPossibleSlide = Math.max(0, menuImages.length - Math.floor(containerWidth / (433 + 16)));
      setMaxSlide(maxPossibleSlide);
      setCurrentSlide(prev => Math.min(prev, maxPossibleSlide));
    };

    updateMaxSlide();
    window.addEventListener('resize', updateMaxSlide);
    return () => window.removeEventListener('resize', updateMaxSlide);
  }, [menuImages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isGalleryOpen) return;
      
      if (e.key === 'ArrowRight') {
        setGalleryIndex(prev => (prev + 1) % menuImages.length);
      } else if (e.key === 'ArrowLeft') {
        setGalleryIndex(prev => (prev - 1 + menuImages.length) % menuImages.length);
      } else if (e.key === 'Escape') {
        setIsGalleryOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGalleryOpen, menuImages.length]);

  const nextSlide = () => {
    setCurrentSlide(prev => Math.min(prev + 1, maxSlide));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  const openGallery = (index: number) => {
    setGalleryIndex(index);
    setIsGalleryOpen(true);
  };

  const canSlideLeft = currentSlide > 0;
  const canSlideRight = currentSlide < maxSlide;

  return (
    <>
      <section className="bg-black py-20">
        <h1 className="text-center text-orange text-5xl font-medium mb-16">{t('menu.title')}</h1>
        
        <div className="relative w-[min(1400px,100%)] mx-auto px-12">
          {canSlideLeft && (
            <button 
              onClick={prevSlide}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 hover:scale-110 transition"
            >
              <Image
                src="/arrow.svg"
                alt="Předchozí"
                width={40}
                height={40}
                className="rotate-90"
              />
            </button>
          )}

          <div ref={sliderRef} className="overflow-hidden relative">
            {canSlideLeft && (
              <div className="absolute left-0 top-0 w-24 h-full z-10" style={{ background: 'linear-gradient(90deg, #000 0%, rgba(0, 0, 0, 0.00) 100%)' }}></div>
            )}
            
            <div 
              className="flex gap-4 transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * (433 + 16)}px)` }}
            >
              {menuImages.map((image, index) => (
                <div 
                  key={index} 
                  className="flex-shrink-0 cursor-pointer h-[613px]"
                  style={{ width: '433px' }}
                  onClick={() => openGallery(index)}
                >
                  <Image
                    src={image}
                    alt={`Menu strana ${index + 1}`}
                    width={433}
                    height={613}
                    className="object-cover w-full h-full rounded-[5px] border border-orange hover:opacity-90 transition"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>

            {canSlideRight && (
              <div className="absolute right-0 top-0 w-24 h-full z-10" style={{ background: 'linear-gradient(270deg, #000 0%, rgba(0, 0, 0, 0.00) 100%)' }}></div>
            )}
          </div>

          {canSlideRight && (
            <button 
              onClick={nextSlide}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 hover:scale-110 transition"
            >
              <Image
                src="/arrow.svg"
                alt="Další"
                width={40}
                height={40}
                className="-rotate-90"
              />
            </button>
          )}
        </div>
      </section>

      {/* Galerie přes celou obrazovku */}
      {isGalleryOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsGalleryOpen(false);
          }}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-orange transition"
            onClick={() => setIsGalleryOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-orange transition"
            onClick={() => setGalleryIndex((prev) => (prev - 1 + menuImages.length) % menuImages.length)}
          >
            <Image
              src="/arrow.svg"
              alt="Předchozí"
              width={40}
              height={40}
              className="rotate-90"
            />
          </button>

          <div className="relative max-h-[90vh] max-w-[90vw]">
            <Image
              src={menuImages[galleryIndex]}
              alt={`Menu strana ${galleryIndex + 1}`}
              width={1000}
              height={1414}
              className="object-contain max-h-[90vh]"
              priority
            />
          </div>

          <button 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-orange transition"
            onClick={() => setGalleryIndex((prev) => (prev + 1) % menuImages.length)}
          >
            <Image
              src="/arrow.svg"
              alt="Další"
              width={40}
              height={40}
              className="-rotate-90"
            />
          </button>
        </div>
      )}
    </>
  );
};

export default Menu; 