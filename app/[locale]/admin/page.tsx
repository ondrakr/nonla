'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function AdminPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Pomocná funkce na ošetření případných chyb v URL
  const getValidImageUrl = (url: string | null) => {
    if (!url) return '';
    // Pokud URL začíná na http/https, je to pravděpodobně Cloudinary URL - použijeme ho přímo
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Jinak je to pravděpodobně lokální cesta, musíme zajistit, že začíná /
    return url.startsWith('/') ? url : `/${url}`;
  };

  const fetchCurrentImage = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/menu-images');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.images || !Array.isArray(data.images)) {
        console.warn('Neplatný formát dat z API:', data);
        setCurrentImage(null);
        return;
      }
      
      // Hledáme admin-menu obrázek (buď cloudinary URL nebo lokální cestu)
      const adminImage = data.images.find((img: string) => 
        img.includes('admin-menu') || 
        img.includes('/menu/admin-menu')
      );
      
      console.log('Nalezený admin obrázek:', adminImage);
      setCurrentImage(adminImage || null);
    } catch (error) {
      console.error('Chyba při načítání obrázku:', error);
      setCurrentImage(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentImage();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', {
        method: 'POST',
      });

      if (res.ok) {
        router.push(`/${locale}/login`);
        router.refresh();
      }
    } catch (error) {
      console.error('Chyba při odhlašování:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Nahrávání selhalo');

      const data = await response.json();
      console.log('Upload response:', data);

      setMessage('Obrázek byl úspěšně nahrán!');
      setFile(null);
      fetchCurrentImage();
    } catch (error) {
      console.error('Chyba při nahrávání:', error);
      setMessage('Chyba při nahrávání obrázku.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentImage || isDeleting) return;
    
    setIsDeleting(true);
    setMessage('');
    
    try {
      // Extrahujeme název souboru z URL
      let filename;
      if (currentImage.includes('cloudinary.com')) {
        // Pro Cloudinary URL extrahujeme pouze část názvu
        filename = 'admin-menu';
      } else {
        filename = currentImage.split('/').pop();
      }
      
      if (!filename) {
        throw new Error('Neplatný název souboru');
      }

      console.log('Mažu soubor:', filename);
      
      const response = await fetch('/api/delete-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });

      const data = await response.json();
      console.log('Odpověď po smazání:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Mazání selhalo');
      }

      setMessage('Obrázek byl úspěšně smazán!');
      setCurrentImage(null);
    } catch (error) {
      console.error('Chyba při mazání:', error);
      setMessage(error instanceof Error ? error.message : 'Chyba při mazání obrázku.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black py-8 sm:py-16 px-4 sm:px-6">
      <div className="max-w-[min(1400px,100%)] mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 sm:mb-12">
          <h1 className="text-orange text-3xl sm:text-4xl md:text-5xl font-medium">Správa denního menu</h1>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}`}
              className="px-4 sm:px-6 py-2 sm:py-3 border border-orange rounded-md text-orange text-sm sm:text-base hover:bg-orange hover:text-black transition-colors flex items-center justify-center"
            >
              Zpět na web
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 sm:px-6 py-2 sm:py-3 border border-orange rounded-md text-orange text-sm sm:text-base hover:bg-orange hover:text-black transition-colors flex items-center justify-center"
            >
              Odhlásit se
            </button>
          </div>
        </div>

        <div className="bg-black/30 border border-orange/20 rounded-lg p-4 sm:p-6 md:p-8">
          {isLoading ? (
            <div className="text-center text-orange py-8">Načítání...</div>
          ) : currentImage ? (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-orange text-xl sm:text-2xl mb-2 sm:mb-4">Aktuální denní menu:</h2>
              <div className="relative w-full max-w-sm mx-auto aspect-[3/4] mb-4 sm:mb-6">
                <Image
                  src={getValidImageUrl(currentImage)}
                  alt="Aktuální denní menu"
                  fill
                  className="object-contain rounded-lg border border-orange/40"
                  crossOrigin="anonymous"
                  unoptimized={currentImage.startsWith('http')}
                />
              </div>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full max-w-sm mx-auto flex justify-center py-2 sm:py-3 px-4 border border-red-500 rounded-md text-red-500 text-sm sm:text-base hover:bg-red-500 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Mazání...' : 'Smazat denní menu'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 max-w-sm mx-auto">
              <div className="border-2 border-dashed border-orange/40 p-4 sm:p-8 rounded-lg text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="fileInput"
                />
                <label
                  htmlFor="fileInput"
                  className="cursor-pointer text-orange hover:text-orange/80 block p-2 text-sm sm:text-base"
                >
                  {file ? file.name : 'Vyberte obrázek menu'}
                </label>
              </div>

              <button
                type="submit"
                disabled={!file || isUploading}
                className="w-full flex justify-center py-2 sm:py-3 px-4 border border-orange rounded-md text-base sm:text-lg font-medium text-black bg-orange hover:bg-orange/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Nahrávání...' : 'Nahrát denní menu'}
              </button>
            </form>
          )}

          {message && (
            <div className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg text-center text-sm sm:text-base ${
              message.includes('úspěšně') 
                ? 'bg-green-900/50 border border-green-500 text-green-200'
                : 'bg-red-900/50 border border-red-500 text-red-200'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 