'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
    username: string;
  };
}

export default function SearchPage() {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [condition, setCondition] = useState('');
  const [city, setCity] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [onlySale, setOnlySale] = useState(false);
  const [sortBy, setSortBy] = useState('new');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (transactionType) params.append('transaction_type', transactionType);
      if (condition) params.append('condition', condition);
      if (city) params.append('city', city);
      if (priceFrom) params.append('price_from', priceFrom);
      if (priceTo) params.append('price_to', priceTo);
      if (onlySale) params.append('only_sale', 'true');
      if (sortBy && sortBy !== 'new') params.append('sort_by', sortBy);

      const url = `http://127.0.0.1:8000/api/books/?${params.toString()}`;
      console.log('Search: fetching', url);
      
      const response = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (response.ok) {
        const data = await response.json();
        setBooks(data.results || data);
      }
    } catch (error) {
      console.error('Ошибка загрузки книг:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, transactionType, condition, city, priceFrom, priceTo, onlySale, sortBy, token]);

  
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      fetchBooks();
    }, 300);
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery, transactionType, condition, city, priceFrom, priceTo, onlySale, sortBy, fetchBooks]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const formatPrice = (price: number | null, transaction_type: string) => {
    if (transaction_type === 'exchange') return 'Обмен';
    if (price === null) return 'По договорённости';
    return `${price.toLocaleString('ru-RU')} ₽`;
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
    <div className="min-h-screen flex flex-col bg-[url('/background.jpg')] bg-cover bg-center bg-no-repeat relative">
      <div className="absolute inset-0 bg-[#e8ded1]/45"></div>
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <div className="flex gap-6">
          
          <div className="w-64 flex-shrink-0">
            <div className="bg-[#E8DED1] rounded-2xl shadow-md p-5 border-2 border-[#d6d3d1]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#3E2B22]">Фильтры</h2>
                <button
                  onClick={() => {
                    setTransactionType('');
                    setCondition('');
                    setCity('');
                    setPriceFrom('');
                    setPriceTo('');
                    setOnlySale(false);
                    setSortBy('new');
                  }}
                  className="text-sm text-[#5C4033] hover:text-[#3E2B22]"
                >
                  Очистить
                </button>
              </div>

              <div className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-[#57534e] mb-2">
                    Тип сделки
                  </label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-[#e0d8d0] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/10 outline-none bg-white"
                  >
                    <option value="">Все</option>
                    <option value="exchange">Обмен</option>
                    <option value="sale">Продажа</option>
                  </select>
                </div>

                
                <div>
                  <label className="block text-sm font-medium text-[#57534e] mb-2">
                    Состояние
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-[#e0d8d0] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/10 outline-none bg-white"
                  >
                    <option value="">Все</option>
                    <option value="new">Новое</option>
                    <option value="excellent">Отличное</option>
                    <option value="good">Хорошее</option>
                    <option value="satisfactory">Удовлетворительное</option>
                    <option value="poor">Плохое</option>
                  </select>
                </div>

                
                <div>
                  <div className="flex flex-col gap-2 p-4 rounded-xl border-l-4 border-[#5C4033] bg-[#FAF9F6]">
                    <label className="block text-sm font-medium text-[#57534e] mb-2">
                      Цена (₽)
                    </label>
                    <input
                      type="number"
                      placeholder="От"
                      value={priceFrom}
                      onChange={(e) => setPriceFrom(e.target.value)}
                      className="px-4 py-2 rounded-lg border border-[#e0d8d0] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/10 outline-none bg-white text-sm"
                    />
                    <input
                      type="number"
                      placeholder="До"
                      value={priceTo}
                      onChange={(e) => setPriceTo(e.target.value)}
                      className="px-4 py-2 rounded-lg border border-[#e0d8d0] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/10 outline-none bg-white text-sm"
                    />
                  </div>
                </div>

                
                <div>
                  <label className="block text-sm font-medium text-[#57534e] mb-2">
                    Город
                  </label>
                  <input
                    type="text"
                    placeholder="Введите город"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-[#e0d8d0] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/10 outline-none bg-white"
                  />
                </div>

                
                <div>
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-[#ebe5de] transition-colors">
                    <input
                      type="checkbox"
                      checked={onlySale}
                      onChange={(e) => setOnlySale(e.target.checked)}
                      className="w-4 h-4 rounded border-[#d6d3d1] text-[#5C4033] focus:ring-[#5C4033]"
                    />
                    <span className="text-sm text-[#57534e]">Только продажа</span>
                  </label>
                </div>

                
                <div>
                  <label className="block text-sm font-medium text-[#57534e] mb-2">
                    Сортировка
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-[#e0d8d0] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/10 outline-none bg-white"
                  >
                    <option value="new">Сначала новые</option>
                    <option value="old">Сначала старые</option>
                    <option value="price_low">Цена: по возрастанию</option>
                    <option value="price_high">Цена: по убыванию</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          
          <div className="flex-1">
            
            <div className="bg-[#E8DED1] rounded-xl shadow-lg p-6 mb-6 border border-[#d6d3d1]">
              <form onSubmit={handleSearch} className="flex gap-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по названию, автору, описанию..."
                  className="flex-1 px-6 py-3 rounded-lg border-2 border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none bg-white"
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-[#5C4033] text-white rounded-lg hover:bg-[#3E2B22] transition-colors font-semibold"
                >
                  Найти
                </button>
              </form>
            </div>

            
            <div className="bg-[#FAF9F6] rounded-xl shadow-md p-4 mb-6 border-l-4 border-[#5C4033]">
              <p className="text-[#57534e]">
                Найдено: <span className="font-bold text-[#5C4033]">{books.length}</span> книг
              </p>
            </div>

            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border-2 border-[#d6d3d1] overflow-hidden shadow-lg animate-pulse">
                    <div className="h-48 bg-[#e7e5e4]"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-[#e7e5e4] rounded w-1/2"></div>
                      <div className="h-6 bg-[#e7e5e4] rounded w-3/4"></div>
                      <div className="h-4 bg-[#e7e5e4] rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : books.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                        <div className="absolute top-2 left-2 flex gap-1">
                          <span className={`px-2 py-1 text-xs rounded-full font-semibold text-white ${
                            book.condition === 'new' ? 'bg-[#5C4033]' :
                            book.condition === 'excellent' ? 'bg-[#7A5C50]' :
                            book.condition === 'good' ? 'bg-[#A08070]' :
                            book.condition === 'satisfactory' ? 'bg-[#B8A08F]' :
                            'bg-[#8B7355]'
                          }`}>
                            {book.condition_display}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full font-semibold bg-[#d6d3d1] text-[#57534e]">
                            {book.transaction_type_display}
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
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-[#E8DED1] rounded-xl border border-[#d6d3d1]">
                <svg className="w-24 h-24 text-[#a8a29e] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-[#57534e] text-lg font-medium">
                  По вашему запросу ничего не найдено
                </p>
                <p className="text-[#a8a29e]">
                  Попробуйте изменить параметры поиска
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
