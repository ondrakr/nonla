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

  const fetchCurrentImage = async () => {
    try {
      const response = await fetch('/api/menu-images');
      const data = await response.json();
      const adminImage = data.images.find((img: string) => img.includes('admin-menu'));
      setCurrentImage(adminImage || null);
    } catch (error) {
      console.error('Chyba při načítání obrázku:', error);
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

      setMessage('Obrázek byl úspěšně nahrán!');
      setFile(null);
      fetchCurrentImage();
    } catch (error) {
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
      const filename = currentImage.split('/').pop();
      if (!filename) {
        throw new Error('Neplatný název souboru');
      }

      const response = await fetch('/api/delete-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });

      const data = await response.json();

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
    <div className="min-h-screen bg-black py-20">
      <div className="max-w-[min(1400px,100%)] mx-auto px-12">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-orange text-5xl font-medium">Správa denního menu</h1>
          <div className="flex gap-4">
            <Link
              href={`/${locale}`}
              className="px-6 py-3 border border-orange rounded-md text-orange hover:bg-orange hover:text-black transition-colors"
            >
              Zpět na web
            </Link>
            <button
              onClick={handleLogout}
              className="px-6 py-3 border border-orange rounded-md text-orange hover:bg-orange hover:text-black transition-colors"
            >
              Odhlásit se
            </button>
          </div>
        </div>

        <div className="bg-black/30 border border-orange/20 rounded-lg p-8">
          {currentImage ? (
            <div className="space-y-6">
              <h2 className="text-orange text-2xl mb-4">Aktuální denní menu:</h2>
              <div className="relative aspect-[3/4] max-w-md mx-auto mb-6">
                <Image
                  src={currentImage}
                  alt="Aktuální denní menu"
                  fill
                  className="object-contain rounded-lg border border-orange/40"
                />
              </div>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full max-w-md mx-auto flex justify-center py-3 px-4 border border-red-500 rounded-md text-red-500 hover:bg-red-500 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Mazání...' : 'Smazat denní menu'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
              <div className="border-2 border-dashed border-orange/40 p-8 rounded-lg text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="fileInput"
                />
                <label
                  htmlFor="fileInput"
                  className="cursor-pointer text-orange hover:text-orange/80 block"
                >
                  {file ? file.name : 'Vyberte obrázek denního menu'}
                </label>
              </div>

              <button
                type="submit"
                disabled={!file || isUploading}
                className="w-full flex justify-center py-3 px-4 border border-orange rounded-md text-lg font-medium text-black bg-orange hover:bg-orange/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Nahrávání...' : 'Nahrát denní menu'}
              </button>
            </form>
          )}

          {message && (
            <div className={`mt-6 p-4 rounded-lg text-center ${
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