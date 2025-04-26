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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemWidth, setItemWidth] = useState(433);

  const fetchMenuImages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/menu-images');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.images && Array.isArray(data.images)) {
        console.log('Získány obrázky:', data.images);
        setMenuImages(data.images);
      } else {
        console.warn('Neplatný formát dat z API:', data);
        setMenuImages([]);
      }
    } catch (error) {
      console.error('Chyba při načítání obrázků:', error);
      setError('Nepodařilo se načíst menu. Zkuste to prosím později.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuImages();
    const interval = setInterval(fetchMenuImages, 30000);
    return () => clearInterval(interval);
  }, []);

  // Přidám useEffect pro logování aktuálního stavu menu obrázků po jejich načtení
  useEffect(() => {
    if (menuImages.length > 0) {
      console.log('Aktuální menu obrázky:', menuImages);
    }
  }, [menuImages]);

  useEffect(() => {
    const updateMaxSlide = () => {
      if (!sliderRef.current || menuImages.length === 0) return;
      const containerWidth = sliderRef.current.offsetWidth;
      const isMobile = window.innerWidth < 768;
      const newItemWidth = isMobile ? 320 : 433;
      setItemWidth(newItemWidth);
      const totalWidth = newItemWidth * menuImages.length + 16 * (menuImages.length - 1);
      const maxPossibleSlide = Math.max(0, menuImages.length - Math.floor(containerWidth / (newItemWidth + 16)));
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

  // Případné chybové zprávy nebo načítání
  if (isLoading && menuImages.length === 0) {
    return (
      <section className="bg-black py-20">
        <h1 className="text-center text-orange text-5xl font-medium mb-16">{t('menu.title')}</h1>
        <div className="text-center text-orange">{t('menu.loading')}</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-black py-20">
        <h1 className="text-center text-orange text-5xl font-medium mb-16">{t('menu.title')}</h1>
        <div className="text-center text-red-500">{error}</div>
      </section>
    );
  }

  if (menuImages.length === 0) {
    return (
      <section className="bg-black py-20">
        <h1 className="text-center text-orange text-5xl font-medium mb-16">{t('menu.title')}</h1>
        <div className="text-center text-orange">{t('menu.notAvailable')}</div>
      </section>
    );
  }

  // Pomocná funkce na ošetření případných chyb v URL
  const getValidImageUrl = (url: string) => {
    // Pokud URL začíná na http/https, je to pravděpodobně Cloudinary URL - použijeme ho přímo
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Jinak je to pravděpodobně lokální cesta, musíme zajistit, že začíná /
    return url.startsWith('/') ? url : `/${url}`;
  };

  // Odstraňuji duplicity přímo v komponentě
  const uniqueMenuImages = [...new Set(menuImages)].map(url => url);

  return (
    <>
      <section className="bg-black py-20">
        <h1 className="text-center text-orange text-3xl md:text-5xl mb-10">{t('menu.title')}</h1>
        
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
              <div className="absolute left-0 top-0 w-12 md:w-24 h-full z-10" style={{ background: 'linear-gradient(90deg, #000 0%, rgba(0, 0, 0, 0.00) 100%)' }}></div>
            )}
            
            <div 
              className="flex gap-4 transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * (itemWidth + 16)}px)` }}
            >
              {uniqueMenuImages.map((image, index) => (
                <div 
                  key={`${image}-${index}`} 
                  className="flex-shrink-0 cursor-pointer h-[450px] md:h-[613px]"
                  style={{ width: `${itemWidth}px` }}
                  onClick={() => openGallery(index)}
                >
                  <Image
                    src={getValidImageUrl(image)}
                    alt={`Menu strana ${index + 1}`}
                    width={433}
                    height={613}
                    className="object-cover w-full h-full rounded-[5px] border border-orange hover:opacity-90 transition"
                    priority={index === 0}
                    crossOrigin="anonymous"
                    unoptimized={image.startsWith('http')} // Pro externí obrázky vypneme optimalizaci Next.js
                  />
                </div>
              ))}
            </div>

            {canSlideRight && (
              <div className="absolute right-0 top-0 w-12 md:w-24 h-full z-10" style={{ background: 'linear-gradient(270deg, #000 0%, rgba(0, 0, 0, 0.00) 100%)' }}></div>
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

          {/* Navigační šipka doleva - skrytá na mobilu */}
          <button 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-orange transition hidden md:block"
            onClick={() => setGalleryIndex((prev) => (prev - 1 + uniqueMenuImages.length) % uniqueMenuImages.length)}
          >
            <Image
              src="/arrow.svg"
              alt="Předchozí"
              width={40}
              height={40}
              className="rotate-90"
            />
          </button>

          <div className="relative max-h-[90vh] max-w-[90vw] flex flex-col items-center">
            <Image
              src={getValidImageUrl(uniqueMenuImages[galleryIndex])}
              alt={`Menu strana ${galleryIndex + 1}`}
              width={1000}
              height={1414}
              className="object-contain max-h-[90vh]"
              priority
              crossOrigin="anonymous"
              unoptimized={uniqueMenuImages[galleryIndex].startsWith('http')} // Pro externí obrázky vypneme optimalizaci Next.js
            />
            
            {/* Mobilní navigační šipky přímo pod fotkou */}
            <div className="mt-4 flex justify-center items-center space-x-8 md:hidden">
              <button 
                className="text-white hover:text-orange transition"
                onClick={() => setGalleryIndex((prev) => (prev - 1 + uniqueMenuImages.length) % uniqueMenuImages.length)}
              >
                <Image
                  src="/arrow.svg"
                  alt="Předchozí"
                  width={40}
                  height={40}
                  className="rotate-90"
                />
              </button>
              <button 
                className="text-white hover:text-orange transition"
                onClick={() => setGalleryIndex((prev) => (prev + 1) % uniqueMenuImages.length)}
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
          </div>

          {/* Navigační šipka doprava - skrytá na mobilu */}
          <button 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-orange transition hidden md:block"
            onClick={() => setGalleryIndex((prev) => (prev + 1) % uniqueMenuImages.length)}
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