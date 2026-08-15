'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  exchange_wanted: string;
  exchange_genre: string;
  exchange_title: string;
  exchange_author: string;
  publisher: string;
  year: number;
  pages: number;
  isbn: string;
  cover_image_url: string;
  images: string;
  city: string;
  address: string;
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
  owner_id: number;
  created_at: string;
}

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated, user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const fetchBook = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/books/${params.id}/`);
      if (response.ok) {
        const data = await response.json();
        setBook(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки книги:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  const checkFavorite = useCallback(async (bookId: number) => {
    if (!isAuthenticated || !token) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/favorites/check/${bookId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.is_favorite);
      }
    } catch (error) {
      setIsFavorite(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (book && isAuthenticated && user) {
      checkFavorite(book.id);
      setIsOwner(user?.username === book.owner.username);
    }
  }, [book, isAuthenticated, user, checkFavorite, fetchBook]);

  const toggleFavorite = async () => {
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/favorites/${params.id}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok || response.status === 201) {
        const data = await response.json();
        setIsFavorite(data.is_favorite);
        setMessage(data.is_favorite ? 'Добавлено в избранное' : 'Удалено из избранного');
        setTimeout(() => setMessage(''), 3000);
      } else {
        let errorMsg = 'Ошибка при работе с избранным';
        try {
          const error = await response.json();
          errorMsg = error.detail || 'Ошибка при работе с избранным';
        } catch {}
        console.error('Избранное ошибка:', response.status, errorMsg);
        if (response.status === 401) {
          router.push('/login');
        } else {
          alert(errorMsg);
        }
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось подключиться к серверу');
    }
  };

  const handleComplete = async () => {
    if (!confirm('Завершить объявление? Оно станет неактивным.')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/books/${params.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: false }),
      });

      if (response.ok) {
        setMessage('Объявление завершено');
        setTimeout(() => setMessage(''), 3000);
        fetchBook();
      } else {
        let errorMsg = 'Ошибка завершения объявления';
        try {
          const error = await response.json();
          errorMsg = error.detail || errorMsg;
        } catch {}
        if (response.status === 401) {
          router.push('/login');
        } else {
          alert(errorMsg);
        }
      }
    } catch {
      alert('Ошибка завершения объявления');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить объявление безвозвратно?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/books/${params.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        router.push('/my-books');
      } else {
        let errorMsg = 'Ошибка удаления объявления';
        try {
          const error = await response.json();
          errorMsg = error.detail || errorMsg;
        } catch {}
        if (response.status === 401) {
          router.push('/login');
        } else {
          alert(errorMsg);
        }
      }
    } catch {
      alert('Ошибка удаления объявления');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse bg-card rounded-xl border border-border p-8">
            <div className="h-8 bg-secondary-light rounded w-1/3 mb-4"></div>
            <div className="h-6 bg-secondary-light rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-96 bg-secondary-light rounded"></div>
              <div className="space-y-4">
                <div className="h-6 bg-secondary-light rounded w-3/4"></div>
                <div className="h-4 bg-secondary-light rounded"></div>
                <div className="h-4 bg-secondary-light rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-text-muted text-lg mb-4">Книга не найдена</p>
            <Link href="/" className="text-primary hover:text-primary-light">
              Вернуться на главную
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const formatPrice = (price: number | null, transaction_type: string, exchange_genre: string, exchange_title: string, exchange_author: string) => {
    
    if (transaction_type === 'exchange') {
      return 'Обмен';
    }
    
    if ((transaction_type === 'both') && (exchange_genre || exchange_title || exchange_author)) {
      const parts = [];
      if (exchange_genre) parts.push(`Жанр: ${exchange_genre}`);
      if (exchange_title) parts.push(`Название: ${exchange_title}`);
      if (exchange_author) parts.push(`Автор: ${exchange_author}`);
      return parts.join(' | ');
    }
    
    if (price === null) return 'Цена по договорённости';
    return `${price.toLocaleString('ru-RU')} ₽`;
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'bg-[#5C4033] text-white';
      case 'like_new': return 'bg-[#7A5C50] text-white';
      case 'good': return 'bg-[#A08070] text-white';
      case 'fair': return 'bg-[#B8A08F] text-white';
      case 'poor': return 'bg-[#8B7355] text-white';
      default: return 'bg-[#D6D3D1] text-white';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[url('/background.jpg')] bg-cover bg-center bg-no-repeat relative">
      <div className="absolute inset-0 bg-[#e8ded1]/45"></div>
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        {message && (
          <div className="mb-6 p-4 bg-[#F5F0EB] border border-[#B8A08F] rounded-lg">
            <p className="text-[#5C4033]">{message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {}
          <div className="lg:col-span-1">
            <div className="bg-[#E8DED1] rounded-xl border border-[#D6C8B8] overflow-hidden">
              {book.cover_image_url ? (
                <img
                  src={book.cover_image_url}
                  alt={book.title}
                  className="w-full h-64 object-contain bg-[#e7e5e4]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '<div class="w-full h-64 bg-[#e7e5e4] flex items-center justify-center"><svg class="w-32 h-32 text-[#5C4033]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z"/></svg></div>';
                  }}
                />
              ) : (
                <div className="w-full h-64 bg-[#e7e5e4] flex items-center justify-center">
                  <svg className="w-32 h-32 text-[#5C4033]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z"/>
                  </svg>
                </div>
              )}
            </div>

            {}
            <div className="bg-[#E8DED1] rounded-xl border border-[#D6C8B8] p-6 mt-6">
              <h3 className="font-semibold text-[#3E2B22] mb-4">Продавец</h3>
              <Link
                href={`/users/${book.owner.username}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-12 h-12 rounded-full bg-[#5C4033] text-white flex items-center justify-center font-semibold">
                  {book.owner.profile?.avatar ? (
                    <img
                      src={book.owner.profile.avatar.startsWith('http')
                        ? book.owner.profile.avatar
                        : `http://127.0.0.1:8000${book.owner.profile.avatar}`}
                      alt={book.owner.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    book.owner.username.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-medium text-[#3E2B22] hover:text-[#5C4033] transition-colors">
                    {book.owner.username}
                  </p>
                  {book.owner.profile?.city && (
                    <p className="text-sm text-[#57534e] flex items-center gap-1">
                      <svg className="w-4 h-4 text-[#5C4033]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      {book.owner.profile.city}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          </div>

          {}
          <div className="lg:col-span-2">
            <div className="bg-[#E8DED1] rounded-xl border border-[#D6C8B8] p-8">
              {}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 text-sm rounded-full text-white ${
                  book.condition === 'new' ? 'bg-[#5C4033]' :
                  book.condition === 'excellent' ? 'bg-[#7A5C50]' :
                  book.condition === 'good' ? 'bg-[#A08070]' :
                  book.condition === 'satisfactory' ? 'bg-[#B8A08F]' :
                  'bg-[#8B7355]'
                }`}>
                  {book.condition_display}
                </span>
                <span className="px-3 py-1 text-sm rounded-full bg-[#d6d3d1] text-[#57534e]">
                  {book.transaction_type_display}
                </span>
              </div>

              {}
              <h1 className="text-3xl font-bold text-[#3E2B22] mb-2">
                {book.title}
              </h1>
              <p className="text-xl text-[#57534e] mb-6">
                {book.author}
              </p>

              {}
              <div className="mb-8">
                <p className="text-3xl font-bold text-[#5C4033]">
                  {formatPrice(book.price, book.transaction_type, book.exchange_genre, book.exchange_title, book.exchange_author)}
                </p>
              </div>

              {}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[#3E2B22] mb-4">Описание</h2>
                <p className="text-[#57534e] whitespace-pre-line">
                  {book.description}
                </p>
              </div>

              {}
              {(book.transaction_type === 'exchange' || book.transaction_type === 'both') && (book.exchange_genre || book.exchange_title || book.exchange_author) && (
                <div className="mb-8 p-6 bg-[#FAF9F6] rounded-xl border-l-4 border-[#7A5C50]">
                  <h3 className="font-semibold text-[#3E2B22] mb-4 text-lg">
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#5C4033]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                      </svg>
                      На что обмен
                    </span>
                  </h3>
                  
                  <div className="space-y-3">
                    {book.exchange_genre && (
                      <div>
                        <p className="text-sm text-[#a8a29e] mb-1">Жанр:</p>
                        <p className="font-medium text-[#3E2B22]">{book.exchange_genre}</p>
                      </div>
                    )}
                    {book.exchange_title && (
                      <div>
                        <p className="text-sm text-[#a8a29e] mb-1">Название:</p>
                        <p className="font-medium text-[#3E2B22]">{book.exchange_title}</p>
                      </div>
                    )}
                    {book.exchange_author && (
                      <div>
                        <p className="text-sm text-[#a8a29e] mb-1">Автор:</p>
                        <p className="font-medium text-[#3E2B22]">{book.exchange_author}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {book.publisher && (
                  <div>
                    <p className="text-sm text-[#A89585]">Издательство</p>
                    <p className="font-medium text-[#3E2B22]">{book.publisher}</p>
                  </div>
                )}
                {book.year && (
                  <div>
                    <p className="text-sm text-[#A89585]">Год издания</p>
                    <p className="font-medium text-[#3E2B22]">{book.year}</p>
                  </div>
                )}
                {book.pages && (
                  <div>
                    <p className="text-sm text-[#A89585]">Страниц</p>
                    <p className="font-medium text-[#3E2B22]">{book.pages}</p>
                  </div>
                )}
                {book.isbn && (
                  <div>
                    <p className="text-sm text-[#A89585]">ISBN</p>
                    <p className="font-medium text-[#3E2B22]">{book.isbn}</p>
                  </div>
                )}
              </div>

              
              <div className="mb-8">
                <p className="text-sm text-[#A89585]">Местоположение</p>
                <p className="font-medium text-[#3E2B22]">
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-4 h-4 text-[#5C4033]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    {book.city}
                    {book.address && `, ${book.address}`}
                  </span>
                </p>
              </div>

              {}
              <div className="flex flex-col gap-3">
                {isOwner ? (
                  
                  <>
                    <div className="flex gap-4">
                      <Link
                        href={`/edit-book/${book.id}`}
                        className="flex-1 px-6 py-3 bg-[#5C4033] text-white rounded-lg hover:bg-[#3E2B22] transition-colors font-semibold text-center font-['QR Comic Regular']"
                      >
                        <span className="inline-flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                          Редактировать
                        </span>
                      </Link>
                      <button
                        onClick={handleDelete}
                        className="flex-1 px-6 py-3 border border-[#3E2B22] text-[#3E2B22] rounded-lg hover:bg-[#F0EAE6] transition-colors font-semibold font-['QR Comic Regular']"
                      >
                        <span className="inline-flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                          Удалить
                        </span>
                      </button>
                    </div>
                  </>
                ) : (
                  
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        if (!token || !isAuthenticated) {
                          router.push('/login');
                          return;
                        }
                        const bookTitle = encodeURIComponent(book.title);
                        const bookAuthor = encodeURIComponent(book.author);
                        const bookImage = book.cover_image_url ? encodeURIComponent(book.cover_image_url) : '';
                        if (book.owner.id) {
                          router.push(`/chat?owner_id=${book.owner.id}&book=${book.id}&bookTitle=${bookTitle}&bookAuthor=${bookAuthor}&bookImage=${bookImage}`);
                        } else {
                          alert('Ошибка: не удалось получить ID владельца книги.');
                        }
                      }}
                      className="flex-1 px-6 py-3 bg-[#5C4033] text-white rounded-lg hover:bg-[#3E2B22] transition-colors font-semibold font-['QR Comic Regular']"
                    >
                      <span className="inline-flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                        Связаться
                      </span>
                    </button>
                    <button
                      onClick={toggleFavorite}
                      className={`px-6 py-3 rounded-lg border font-semibold transition-colors font-['QR Comic Regular'] ${
                        isFavorite
                          ? 'bg-[#F5F0EB] border-[#B8A08F] text-[#5C4033] hover:bg-[#F0EAE6]'
                          : 'border-[#D6C8B8] text-[#3E2B22] hover:bg-[#E8DED1]'
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                        Избранное
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {}
              <div className="mt-8 pt-8 border-t border-[#D6C8B8] text-sm text-[#A89585]">
                <div className="flex gap-6">
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-4 h-4 text-[#5C4033]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    {new Date(book.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}