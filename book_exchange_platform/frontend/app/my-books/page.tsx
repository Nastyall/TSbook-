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
  is_active: boolean;
}

export default function MyBooksPage() {
  const router = useRouter();
  const { token, user, isLoading } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [activeBooks, setActiveBooks] = useState<Book[]>([]);
  const [completedBooks, setCompletedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
      return;
    }
    if (!isLoading && token) {
      fetchBooks();
    }
  }, [token, isLoading]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/books/my_books/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
        setActiveBooks(data.filter((book: Book) => book.is_active));
        setCompletedBooks(data.filter((book: Book) => !book.is_active));
      }
    } catch (error) {
      console.error('Ошибка загрузки книг:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (bookId: number) => {
    if (!confirm('Завершить объявление? Оно станет неактивным.')) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/books/${bookId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: false }),
      });

      if (response.ok) {
        fetchBooks();
      }
    } catch (error) {
      console.error('Ошибка при завершении объявления:', error);
    }
  };

  const handleDelete = async (bookId: number) => {
    if (!confirm('Удалить объявление?')) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/books/${bookId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchBooks();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.detail || 'Ошибка при удалении объявления');
      }
    } catch (error) {
      console.error('Ошибка при удалении объявления:', error);
      alert('Ошибка при удалении объявления');
    }
  };

  const formatPrice = (price: number | null, transaction_type: string) => {
    if (transaction_type === 'exchange') return 'Обмен';
    if (price === null) return 'По договорённости';
    return `${price.toLocaleString('ru-RU')} ₽`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
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

  const displayedBooks = activeTab === 'active' ? activeBooks : completedBooks;

  return (
    <div className="min-h-screen flex flex-col bg-[url('/background.jpg')] bg-cover bg-center bg-no-repeat relative">
      <div className="absolute inset-0 bg-[#e8ded1]/45"></div>
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#3E2B22] font-['QR Comic Regular']">
                Мои объявления
              </h1>
              <p className="text-[#57534e] mt-1">
                Активных: <span className="font-semibold">{activeBooks.length}</span> - Завершённых: <span className="font-semibold">{completedBooks.length}</span>
              </p>
            </div>
            <Link
              href="/add-book"
              className="px-6 py-3 bg-[#5C4033] text-white rounded-lg hover:bg-[#3E2B22] transition-colors font-semibold"
            >
              + Добавить объявление
            </Link>
          </div>

          
          <div className="flex gap-6 mb-8 border-b-2 border-[#d6d3d1]">
            <button
              onClick={() => setActiveTab('active')}
              className={`pb-2 font-semibold transition-colors ${
                activeTab === 'active'
                  ? 'text-[#5C4033] border-b-2 border-[#5C4033] pb-1'
                  : 'text-[#a8a29e] hover:text-[#5C4033]'
              }`}
            >
              Активные ({activeBooks.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`pb-2 font-semibold transition-colors ${
                activeTab === 'completed'
                  ? 'text-[#5C4033] border-b-2 border-[#5C4033] pb-1'
                  : 'text-[#a8a29e] hover:text-[#5C4033]'
              }`}
            >
              Завершённые ({completedBooks.length})
            </button>
          </div>

          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-[#E8DED1] rounded-2xl border-2 border-[#d8c8b8] overflow-hidden shadow-xl animate-pulse">
                  <div className="h-64 bg-[#e7e5e4]"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-[#e7e5e4] rounded w-3/4"></div>
                    <div className="h-4 bg-[#e7e5e4] rounded w-1/2"></div>
                    <div className="h-4 bg-[#e7e5e4] rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayedBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedBooks.map((book) => (
                <div key={book.id} className="bg-[#E8DED1] rounded-2xl border-2 border-[#d8c8b8] overflow-hidden shadow-xl flex flex-col">
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
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getConditionColor(book.condition)}`}>
                        {book.condition_display}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-[#3E2B22] mb-1 text-lg">
                      {book.title}
                    </h3>
                    <p className="text-sm text-[#57534e] mb-2">{book.author}</p>
                    <p className="text-lg font-bold text-[#5C4033] mb-2">
                      {formatPrice(book.price, book.transaction_type)}
                    </p>
                    <p className="text-xs text-[#a8a29e] mb-4">{formatDate(book.created_at)}</p>

                    <div className="space-y-2">
                      {activeTab === 'active' ? (
                        <>
                          <div className="flex gap-2">
                            <Link
                              href={`/books/${book.id}`}
                              className="flex-1 px-4 py-2 bg-[#e7e5e4] text-[#57534e] rounded-lg hover:bg-[#d6d3d1] transition-colors text-sm text-center"
                            >
                              Просмотр
                            </Link>
                            <Link
                              href={`/edit-book/${book.id}`}
                              className="flex-1 px-4 py-2 bg-[#5C4033] text-white rounded-lg hover:bg-[#3E2B22] transition-colors text-sm text-center"
                            >
                              Редактировать
                            </Link>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleComplete(book.id)}
                              className="flex-1 px-4 py-2 bg-[#e7e5e4] text-[#57534e] rounded-lg hover:bg-[#d6d3d1] transition-colors text-sm"
                            >
                              ✓ Завершить
                            </button>
                            <button
                              onClick={() => handleDelete(book.id)}
                              className="flex-1 px-4 py-2 bg-[#e7e5e4] text-[#57534e] rounded-lg hover:bg-[#d6d3d1] transition-colors text-sm"
                            >
                              ✕ Удалить
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <Link
                            href={`/books/${book.id}`}
                            className="block w-full px-4 py-2 bg-[#e7e5e4] text-[#57534e] rounded-lg hover:bg-[#d6d3d1] transition-colors text-sm text-center"
                          >
                            Просмотр
                          </Link>
                          <button
                            onClick={() => handleDelete(book.id)}
                            className="w-full px-4 py-2 bg-[#e7e5e4] text-[#57534e] rounded-lg hover:bg-[#d6d3d1] transition-colors text-sm"
                          >
                            ✕ Удалить
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#e8ded1] rounded-xl border-2 border-[#d6d3d1]">
              <svg className="w-24 h-24 text-[#a8a29e] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-[#57534e] text-lg font-medium">
                {activeTab === 'active'
                  ? 'У вас пока нет активных объявлений'
                  : 'У вас пока нет завершённых объявлений'}
              </p>
              {activeTab === 'active' && (
                <Link
                  href="/add-book"
                  className="inline-block mt-4 px-6 py-3 bg-[#5C4033] text-white rounded-lg hover:bg-[#3E2B22] transition-colors"
                >
                  Создать первое объявление
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
