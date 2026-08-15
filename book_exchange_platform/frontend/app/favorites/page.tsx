'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  condition: string;
  condition_display: string;
  transaction_type: string;
  transaction_type_display: string;
  price: number | null;
  city: string;
  cover_image_url: string | null;
  created_at: string;
  owner: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    profile: {
      city: string | null;
      avatar: string | null;
    };
    average_rating: number | null;
  };
}

interface Favorite {
  id: number;
  book: Book;
  created_at: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const { token, isLoading } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
      return;
    }
    if (!isLoading && token) {
      fetchFavorites();
    }
  }, [token, isLoading]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/favorites/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (bookId: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/favorites/${bookId}/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setFavorites(favorites.filter(fav => fav.book.id !== bookId));
      }
    } catch (error) {
      console.error('Ошибка удаления из избранного:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#5C4033] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[url('/background.jpg')] bg-cover bg-center bg-no-repeat relative">
      <div className="absolute inset-0 bg-[#e8ded1]/45"></div>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#E8DED1] rounded-2xl p-6 mb-8">
            <h1 className="text-2xl font-bold text-[#3E2B22] mb-2">
              Избранное
            </h1>
            <p className="text-[#57534e] text-sm">
              У вас {favorites.length} сохранённых объявлений
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#5C4033] border-t-transparent"></div>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12 bg-[#E8DED1] rounded-xl">
              <svg className="w-24 h-24 mx-auto mb-4 text-[#a8a29e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <p className="text-[#57534e] text-lg">У вас пока нет избранных книг</p>
              <Link
                href="/search"
                className="text-[#5C4033] hover:text-[#3E2B22] font-medium"
              >
                Перейти к каталогу
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="bg-[#E8DED1] rounded-2xl border-2 border-[#d8c8b8] overflow-hidden hover:shadow-xl transition-all flex flex-col"
                >
                  <div className="relative bg-[#e8ded1] flex items-center justify-center min-h-[260px] px-4">
                    {favorite.book.cover_image_url ? (
                      <img
                        src={favorite.book.cover_image_url}
                        alt={favorite.book.title}
                        className="max-h-64 w-auto object-contain"
                      />
                    ) : (
                      <svg className="w-16 h-16 text-[#5C4033]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z"/>
                      </svg>
                    )}
                    <span className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      favorite.book.condition === 'new' ? 'bg-[#5C4033] text-white' :
                      favorite.book.condition === 'excellent' ? 'bg-[#7A5C50] text-white' :
                      favorite.book.condition === 'good' ? 'bg-[#A08070] text-white' :
                      favorite.book.condition === 'satisfactory' ? 'bg-[#B8A08F] text-white' :
                      'bg-[#8B7355] text-white'
                    }`}>
                      {favorite.book.condition_display}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-[#3E2B22] text-base mb-1">
                      {favorite.book.title}
                    </h3>
                    <p className="text-[#57534e] text-sm mb-3">{favorite.book.author}</p>
                    <p className="text-[#5C4033] font-semibold text-base mb-3">
                      {favorite.book.price ? `${favorite.book.price.toLocaleString('ru-RU')} ₽` : 'По договорённости'}
                    </p>
                    <p className="text-xs text-[#a8a29e] mb-4 flex items-center gap-1">
                      <svg className="w-4 h-4 text-[#5C4033]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      {favorite.book.city}
                    </p>
                    <button
                      onClick={() => removeFromFavorites(favorite.book.id)}
                      className="w-full px-4 py-2 bg-[#ebe5de] text-[#57534e] rounded-lg hover:bg-[#e0d8d0] transition-colors text-sm"
                    >
                      Удалить из избранного
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

