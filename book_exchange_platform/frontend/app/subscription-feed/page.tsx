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
    } | null;
    average_rating: number | null;
  };
}

export default function SubscriptionFeedPage() {
  const router = useRouter();
  const { token, isLoading } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
      return;
    }
    if (!isLoading && token) {
      fetchFeed();
    }
  }, [token, isLoading]);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/subscription-feed/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки ленты:', error);
    } finally {
      setLoading(false);
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
              Лента подписок
            </h1>
            <p className="text-[#57534e] text-sm">
              Последние объявления пользователей, на которых вы подписаны
            </p>
            <button
              onClick={fetchFeed}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#ebe5de] transition-colors"
            >
              <svg className="w-5 h-5 text-[#5C4033]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#5C4033] border-t-transparent"></div>
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-12 bg-[#E8DED1] rounded-xl">
              <svg className="w-24 h-24 mx-auto mb-4 text-[#a8a29e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-[#57534e] text-lg mb-4">
                Пока нет новых объявлений от подписанных пользователей
              </p>
              <p className="text-[#a8a29e] text-sm mb-6">
                Подпишитесь на пользователей, чтобы видеть их новые объявления
              </p>
              <Link
                href="/search"
                className="px-6 py-3 bg-[#5C4033] text-white rounded-lg hover:bg-[#3E2B22] transition-colors"
              >
                Найти пользователей
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <Link key={book.id} href={`/books/${book.id}`}>
                  <div
                    className="bg-[#f5f0eb] rounded-2xl border-2 border-[#d8c8b8] overflow-hidden hover:shadow-xl transition-all group cursor-pointer flex flex-col"
                  >
                    <div className="relative bg-[#e8ded1] flex items-center justify-center min-h-[260px] px-4">
                      {book.cover_image_url ? (
                        <img
                          src={book.cover_image_url}
                          alt={book.title}
                          className="max-h-64 w-auto object-contain"
                        />
                      ) : (
                        <svg className="w-12 h-12 text-[#5C4033]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z"/>
                        </svg>
                      )}
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-[#7A5C50]">
                          Отличное
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#d6d3d1] text-[#57534e]">
                          {book.transaction_type_display}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-[#3E2B22] text-base mb-1 line-clamp-2 min-h-[2.5rem]">
                        {book.title}
                      </h3>
                      <p className="text-[#57534e] text-sm mb-3">{book.author}</p>
                      <p className="text-[#57534e] text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
                        {book.description}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-[#e0d8d0]">
                        <div className="flex items-center gap-1 text-xs text-[#a8a29e]">
                          <svg className="w-4 h-4 text-[#5C4033]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          {book.city}
                        </div>
                        <span className="text-xs text-[#a8a29e]">
                          {new Date(book.created_at).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          {book.owner.profile?.avatar ? (
                            <img
                              src={book.owner.profile.avatar.startsWith('http')
                                ? book.owner.profile.avatar
                                : `http://127.0.0.1:8000${book.owner.profile.avatar}`}
                              alt={book.owner.username}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-7 h-7 bg-[#5C4033] text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {book.owner.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-xs text-[#57534e]">{book.owner.username}</span>
                        </div>
                        <span className="text-sm text-[#5C4033] font-semibold">
                          Смотреть →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

