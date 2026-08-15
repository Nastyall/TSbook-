'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

interface Book {
  id: number;
  author: string;
  title: string;
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
    username: string;
  };
}

export default function HomePage() {
  const { user, token } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`http://127.0.0.1:8000/api/books/?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setBooks(data.slice(0, 8));
    } catch (error) {
      console.error('Ошибка загрузки книг:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooks();
  };

  const formatPrice = (price: number | null, transaction_type: string) => {
    if (transaction_type === 'exchange') return 'Обмен';
    if (price === null) return 'По договорённости';
    return `${price.toLocaleString('ru-RU')} ₽`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'bg-[#5C4033] text-white';
      case 'excellent': return 'bg-[#7A5C50] text-white';
      case 'good': return 'bg-[#A08070] text-white';
      case 'satisfactory': return 'bg-[#B8A08F] text-white';
      case 'poor': return 'bg-[#8B7355] text-white';
      default: return 'bg-[#D6D3D1] text-white';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[url('/background.jpg')] bg-cover bg-center bg-no-repeat bg-fixed relative">
      <div className="absolute inset-0 bg-[#e8ded1]/45"></div>
      <div className="relative z-10 flex flex-col flex-1">
        <Header />

        <main className="flex-1">
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-5xl font-bold text-[#3E2B22] mb-4 font-['QR Comic Regular']">
                Обменяйте свои книги
              </h1>
              <p className="text-lg text-[#57534e] mb-8">
                Найдите новые книги или отдайте старые в добрые руки
              </p>
              
              <form onSubmit={handleSearch} className="flex gap-4 max-w-2xl mx-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск книг, авторов..."
                  className="flex-1 px-6 py-3 rounded-lg border-2 border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none bg-[#e8ded1] transition-all"
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-[#5C4033] text-white rounded-lg hover:bg-[#3E2B22] transition-colors font-semibold"
                >
                  Найти
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="bg-[#e8ded1] rounded-2xl p-8 border-2 border-[#d6d3d1] max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#3E2B22] mb-2">
                  Хотите продать или обменять книгу?
                </h2>
                <p className="text-[#57534e]">
                  Создайте объявление за пару минут и найдите нового владельца
                </p>
              </div>
              <Link
                href={user ? "/add-book" : "/register"}
                className="px-8 py-3 bg-[#5C4033] text-white rounded-xl hover:bg-[#3E2B22] transition-colors font-semibold whitespace-nowrap"
              >
                {user ? '+ Добавить объявление' : 'Зарегистрироваться'}
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[#3E2B22] font-['QR Comic Regular']">
              Свежие объявления
            </h2>
            <Link
              href="/search"
              className="text-[#5C4033] hover:text-[#3E2B22] font-medium flex items-center gap-1"
            >
              Все объявления →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-[#E8DED1] rounded-2xl border-2 border-[#d6d3d1] overflow-hidden shadow-xl animate-pulse">
                  <div className="h-64 bg-[#e7e5e4]"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-[#e7e5e4] rounded w-1/2"></div>
                    <div className="h-6 bg-[#e7e5e4] rounded w-3/4"></div>
                    <div className="h-4 bg-[#e7e5e4] rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : books.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {books.map((book) => (
                <Link key={book.id} href={`/books/${book.id}`}>
                  <div className="bg-[#E8DED1] rounded-2xl border-2 border-[#d8c8b8] overflow-hidden shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer flex flex-col">
                    <div className="relative bg-[#e7e5e4] flex items-center justify-center min-h-[260px] px-4">
                      {book.cover_image_url ? (
                        <img
                          src={book.cover_image_url}
                          alt={book.title}
                          className="max-h-64 w-auto object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <svg className="w-16 h-16 text-[#5C4033]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z"/>
                        </svg>
                      )}

                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getConditionColor(book.condition)}`}>
                          {book.condition_display}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-[#3E2B22] mb-1 line-clamp-2 min-h-[2.5rem]">
                        {book.title}
                      </h3>
                      <p className="text-sm text-[#57534e] mb-2">{book.author}</p>
                      <p className="text-lg font-bold text-[#5C4033] mb-2">
                        {formatPrice(book.price, book.transaction_type)}
                      </p>
                      <div className="flex items-center justify-between text-sm text-[#a8a29e]">
                        <span className="inline-flex items-center gap-1">
                          <svg className="w-4 h-4 text-[#5C4033]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          {book.city}
                        </span>
                        <span>{formatDate(book.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#E8DED1] rounded-2xl border-2 border-[#D6C8B8] shadow-xl">
              <div className="w-32 h-32 bg-[#5C4033]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-16 h-16 text-[#5C4033]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-[#3E2B22] text-xl font-bold mb-2">
                Пока нет объявлений
              </p>
              <p className="text-[#57534e] text-lg">
                Будьте первым, кто добавит книгу!
              </p>
              <Link
                href={user ? "/add-book" : "/register"}
                className="inline-block mt-6 px-8 py-3 bg-[#5C4033] text-white rounded-lg hover:bg-[#3E2B22] transition-colors font-semibold"
              >
                {user ? '+ Добавить объявление' : 'Зарегистрироваться'}
              </Link>
            </div>
          )}
        </div>

        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-[#3E2B22] text-center mb-12 font-['QR Comic Regular']">
            Почему выбирают нас?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <h3 className="text-xl font-bold text-[#3E2B22] mb-3">Удобный обмен</h3>
              <p className="text-[#57534e]">
                Найдите книги, которые вас интересуют, и предложите обмен
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-[#3E2B22] mb-3">Безопасная сделка</h3>
              <p className="text-[#57534e]">
                Связывайтесь с продавцами напрямую и договаривайтесь о встрече
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-[#3E2B22] mb-3">Поиск рядом с вами</h3>
              <p className="text-[#57534e]">
                Находите книги в вашем городе и недалеко от дома
              </p>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}