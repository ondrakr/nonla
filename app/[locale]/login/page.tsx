'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push(`/${locale}/admin`);
        router.refresh();
      } else {
        setError('Nesprávné přihlašovací údaje');
      }
    } catch (err) {
      setError('Došlo k chybě při přihlašování');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <div className="flex flex-col gap-4 justify-between items-center mb-12">
          <h2 className="text-orange text-5xl font-medium">Přihlášení</h2>
          <Link
            href={`/${locale}`}
            className="px-6 py-3 border border-orange rounded-md text-orange hover:bg-orange hover:text-black transition-colors"
          >
            Zpět na web
          </Link>
        </div>
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-orange text-sm font-medium mb-2">
              Uživatelské jméno
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-black border border-orange rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange focus:border-orange"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-orange text-sm font-medium mb-2">
              Heslo
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-black border border-orange rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange focus:border-orange"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-orange rounded-md text-lg font-medium text-black bg-orange hover:bg-orange/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange transition-colors"
          >
            Přihlásit
          </button>
        </form>
      </div>
    </div>
  );
} 