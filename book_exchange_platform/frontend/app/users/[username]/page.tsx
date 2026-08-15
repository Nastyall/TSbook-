'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import RatingDisplay from '@/components/RatingDisplay';
import SubscribeButton from '@/components/SubscribeButton';
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
}

interface UserProfile {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  city: string | null;
  bio: string | null;
  avatar: string | null;
  active_books_count: number;
  completed_books_count: number;
}

interface RatingInfo {
  average_rating: number | null;
  ratings_count: number;
}

interface Rating {
  id: number;
  reviewer_username: string;
  reviewer_avatar: string | null;
  rating: number;
  comment: string;
  book: {
    id: number;
    title: string;
    author: string;
  } | null;
  created_at: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user, token, refreshToken } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeBooks, setActiveBooks] = useState<Book[]>([]);
  const [completedBooks, setCompletedBooks] = useState<Book[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [ratingInfo, setRatingInfo] = useState<RatingInfo | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewBookId, setReviewBookId] = useState<string>('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  
  useEffect(() => {
    if (typeof window !== 'undefined' && username) {
      const cached = localStorage.getItem(`subscription_${username}`);
      if (cached !== null) {
        setIsSubscribed(cached === 'true');
      }
    }
  }, [username]);

  
  useEffect(() => {
    const handler = () => {
      if (username) {
        const cached = localStorage.getItem(`subscription_${username}`);
        if (cached !== null) {
          setIsSubscribed(cached === 'true');
        }
      }
    };
    window.addEventListener('subscription-changed', handler);
    return () => window.removeEventListener('subscription-changed', handler);
  }, [username]);

  const fetchRatingInfo = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/users/${username}/rating-info/`);
      if (response.ok) {
        const data = await response.json();
        setRatingInfo({
          average_rating: data.average_rating,
          ratings_count: data.ratings_count || 0
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки рейтинга:', error);
    }
  };

  const fetchSubscribedStatus = async () => {
    if (!token || !username) return;
    try {
      const response = await fetch(`http://localhost:8000/api/subscriptions/${username}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const subscribed = data.is_subscribed || false;
        setIsSubscribed(subscribed);
        localStorage.setItem(`subscription_${username}`, String(subscribed));
        window.dispatchEvent(new CustomEvent('subscription-changed', { detail: { username, isSubscribed: subscribed } }));
      }
    } catch (error) {
      console.error('Ошибка загрузки статуса подписки:', error);
    }
  };

  const fetchRatings = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/users/${username}/ratings/`);
      if (response.ok) {
        const data = await response.json();
        setRatings(data.ratings || data);
      }
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/users/${username}/`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else if (response.status === 404) {
          setError('Пользователь не найден');
        }
      } catch {
        setError('Ошибка загрузки профиля');
      }
    };

    const fetchBooks = async () => {
      try {
        const activeResponse = await fetch(`http://localhost:8000/api/users/${username}/books/?status=active`);
        if (activeResponse.ok) {
          const data = await activeResponse.json();
          setActiveBooks(Array.isArray(data) ? data : data.results || []);
        }

        const completedResponse = await fetch(`http://localhost:8000/api/users/${username}/books/?status=completed`);
        if (completedResponse.ok) {
          const data = await completedResponse.json();
          setCompletedBooks(Array.isArray(data) ? data : data.results || []);
        }
      } catch (err) {
        console.error('Ошибка загрузки книг:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    fetchRatingInfo();
    fetchRatings();
    fetchBooks();
    fetchSubscribedStatus();
  }, [username]);

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
      case 'like_new': return 'bg-[#7A5C50] text-white';
      case 'good': return 'bg-[#A08070] text-white';
      case 'fair': return 'bg-[#B8A08F] text-white';
      case 'poor': return 'bg-[#8B7355] text-white';
      default: return 'bg-[#D6D3D1] text-white';
    }
  };

  const submitReview = async () => {
    if (!reviewComment.trim()) {
      alert('Пожалуйста, введите текст отзыва');
      return;
    }

    if (!token) {
      alert('Вы не авторизованы');
      return;
    }

    setReviewSubmitting(true);
    try {
      const payload: any = {
        rating: reviewRating,
        comment: reviewComment,
      };
      
      if (reviewBookId) {
        payload.book_id = parseInt(reviewBookId);
      }

      const response = await fetch(`http://localhost:8000/api/users/${username}/rate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok || response.status === 201) {
        alert('Отзыв успешно оставлен!');
        setShowReviewModal(false);
        setReviewComment('');
        setReviewRating(5);
        setReviewBookId('');
        fetchRatingInfo();
        fetchRatings();
      } else {
        let errorMsg = 'Ошибка при отправке отзыва';
        try {
          const error = await response.json();
         
          const nfErrors = error.non_field_errors;
          if (Array.isArray(nfErrors) && nfErrors.some((e: string) => e.includes('дубликат') || e.includes('такой отзыв'))) {
            alert('Вы уже оставляли отзыв этому пользователю');
            setShowReviewModal(false);
            return;
          }
          errorMsg = error.detail || (Array.isArray(nfErrors) ? nfErrors[0] : undefined) || JSON.stringify(error);
        } catch {}
        console.error('Отзыв ошибка:', response.status, errorMsg);
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Ошибка отправки отзыва:', error);
      alert('Не удалось отправить отзыв');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const currentBooks = activeTab === 'active' ? activeBooks : completedBooks;

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-text-secondary">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-text-primary mb-4">{error}</h1>
            <Link href="/" className="text-primary hover:text-primary-light">
              Вернуться на главную
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[url('/background.jpg')] bg-cover bg-center bg-no-repeat relative">
      <div className="absolute inset-0 bg-[#e8ded1]/45"></div>
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {}
          <div className="bg-[#E8DED1] rounded-2xl border-2 border-[#d6d3d1] p-6 mb-6 shadow-xl" style={{ boxShadow: '0 4px 20px rgba(92, 64, 51, 0.15)' }}>
            <div className="flex flex-col md:flex-row items-center gap-6">
              {}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#5C4033] to-[#7A5C50] text-white flex items-center justify-center text-3xl font-bold border-4 border-[#7A5C50]">
                {profile?.username?.charAt(0).toUpperCase() || '?'}
              </div>

              {}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-[#3E2B22] mb-1">
                  {profile?.first_name || profile?.username}
                </h1>
                <div className="h-1 w-20 bg-gradient-to-r from-[#5C4033] to-[#7A5C50] rounded-full mb-2"></div>
                <p className="text-[#57534e] mb-1">@{profile?.username}</p>
                {profile?.city && (
                  <p className="text-[#a8a29e] text-sm mb-2">
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-4 h-4 text-[#5C4033]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      {profile.city}
                    </span>
                  </p>
                )}
                {profile?.bio && (
                  <p className="text-[#57534e] text-sm mb-2">{profile.bio}</p>
                )}
                <p className="text-[#a8a29e] text-sm">
                  На сайте с {profile?.date_joined ? (() => { const d = new Date(profile.date_joined); return isNaN(d.getTime()) ? 'неизвестной даты' : d.toLocaleDateString('ru-RU'); })() : 'неизвестной даты'}
                </p>
              </div>

              {}
              <div className="flex flex-col gap-3">
                <div className="flex gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-[#5C4033]">{profile?.active_books_count || 0}</p>
                    <p className="text-xs text-[#a8a29e]">Активных</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#57534e]">{profile?.completed_books_count || 0}</p>
                    <p className="text-xs text-[#a8a29e]">Завершённых</p>
                  </div>
                </div>
                
                {}
                {user && user.username !== username && (
                  <>
                    <SubscribeButton 
                      targetUserId={profile?.id || 0} 
                      username={username}
                      isSubscribed={isSubscribed}
                      onToggle={(newState) => setIsSubscribed(newState)}
                    />
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-[#5C4033] to-[#7A5C50] text-white rounded-xl hover:from-[#3E2B22] hover:to-[#5C4033] transition-all font-semibold shadow-md hover:shadow-lg text-sm"
                    >
                      Оставить отзыв
                    </button>
                  </>
                )}
              </div>
            </div>

            
            <div className="mt-6 pt-6 border-t-2 border-[#d6d3d1]">
              {ratingInfo && ratingInfo.ratings_count > 0 ? (
                <RatingDisplay
                  averageRating={ratingInfo.average_rating}
                  count={ratingInfo.ratings_count}
                />
              ) : (
                <div className="bg-[#FAF9F6] rounded-xl p-4 border-2 border-[#d6d3d1]">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-[#a8a29e]">Нет оценок</span>
                  </div>
                  <p className="text-sm text-[#a8a29e] ml-1">0 отзывов</p>
                </div>
              )}
            </div>
          </div>

          {}
          <div className="bg-[#E8DED1] rounded-2xl border-2 border-[#d6d3d1] mb-6 shadow-xl" style={{ boxShadow: '0 4px 20px rgba(92, 64, 51, 0.15)' }}>
            <div className="flex border-b-2 border-[#d6d3d1]">
              <button
                onClick={() => setActiveTab('active')}
                className={`flex-1 px-6 py-4 font-medium transition-all font-semibold ${
                  activeTab === 'active'
                    ? 'text-[#5C4033] border-b-2 border-[#5C4033] bg-[#faf9f6]'
                    : 'text-[#a8a29e] hover:text-[#5C4033] hover:bg-[#faf9f6]'
                }`}
              >
                Активные объявления ({activeBooks.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`flex-1 px-6 py-4 font-medium transition-all font-semibold ${
                  activeTab === 'completed'
                    ? 'text-[#5C4033] border-b-2 border-[#5C4033] bg-[#faf9f6]'
                    : 'text-[#a8a29e] hover:text-[#5C4033] hover:bg-[#faf9f6]'
                }`}
              >
                Завершённые ({completedBooks.length})
              </button>
            </div>

            {}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-[#FAF9F6] rounded-2xl border-2 border-[#d6d3d1] overflow-hidden shadow-xl animate-pulse">
                  <div className="h-48 bg-[#e7e5e4]"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-[#e7e5e4] rounded w-1/2"></div>
                    <div className="h-6 bg-[#e7e5e4] rounded w-3/4"></div>
                    <div className="h-4 bg-[#e7e5e4] rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : currentBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentBooks.map((book) => (
                <Link key={book.id} href={`/books/${book.id}`}>
                  <div className="bg-[#FAF9F6] rounded-2xl border-2 border-[#d6d3d1] overflow-hidden shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer" style={{ boxShadow: '0 4px 20px rgba(92, 64, 51, 0.1)' }}>
                    {}
                    <div className="relative h-48 bg-[#e7e5e4] flex items-center justify-center">
                      {book.cover_image_url ? (
                        <img
                          src={book.cover_image_url}
                          alt={book.title}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-16 h-16 text-[#5C4033]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z"/></svg></div>';
                          }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-[#5C4033]" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z"/>
                            </svg>
                          </div>
                        )}

                      {}
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getConditionColor(book.condition)}`}>
                          {book.condition_display}
                        </span>
                      </div>
                    </div>

                    {}
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
            <div className="bg-[#E8DED1] rounded-2xl border-2 border-[#d6d3d1] p-12 text-center shadow-xl">
              <h2 className="text-xl font-semibold text-[#3E2B22] mb-2">
                {activeTab === 'active' 
                  ? 'У пользователя нет активных объявлений'
                  : 'У пользователя нет завершённых объявлений'
                }
              </h2>
            </div>
          )}
          </div>

          
          <div className="bg-[#E8DED1] rounded-2xl border-2 border-[#d8c8b8] p-6 mb-6 shadow-xl">
            <h2 className="text-2xl font-bold text-[#3E2B22] mb-6 font-['QR Comic Regular']">
              Отзывы ({ratings.length})
            </h2>
            
            {ratings.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-[#a8a29e] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="text-[#57534e] text-lg font-medium">Пока нет отзывов</p>
                <p className="text-[#a8a29e] text-sm mt-1">Будьте первым, кто оставит отзыв</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ratings.map((rating) => (
                  <div key={rating.id} className="bg-[#FAF9F6] rounded-xl p-4 border-2 border-[#d6d3d1]">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-[#5C4033] text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                        {rating.reviewer_avatar ? (
                          <img
                            src={rating.reviewer_avatar.startsWith('http')
                              ? rating.reviewer_avatar
                              : `http://localhost:8000${rating.reviewer_avatar}`}
                            alt={rating.reviewer_username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          rating.reviewer_username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-[#3E2B22]">{rating.reviewer_username}</p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-5 h-5 ${star <= rating.rating ? 'text-[#5C4033]' : 'text-[#d6d3d1]'}`}
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        {rating.book && (
                          <p className="text-sm text-[#a8a29e] mb-2">
                            Объявление: <span className="font-medium text-[#5C4033]">{rating.book.title}</span>
                          </p>
                        )}
                        <p className="text-[#57534e]">{rating.comment}</p>
                        <p className="text-xs text-[#a8a29e] mt-2">
                          {new Date(rating.created_at).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border-2 border-[#d6d3d1] max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-[#3E2B22] mb-4">
              Оставить отзыв о {profile?.username}
            </h3>
            
            {}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#57534e] mb-2">Оценка</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((book) => (
                  <button
                    key={book}
                    onClick={() => setReviewRating(book)}
                    className="transition-transform hover:scale-110"
                    title={`${book} из 5`}
                  >
                    <svg
                      className={`w-10 h-10 ${book <= reviewRating ? 'text-[#5C4033]' : 'text-[#e7e5e4]'}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </button>
                ))}
              </div>
              <p className="text-sm text-[#a8a29e] mt-2 text-center">
                {reviewRating === 1 && 'Очень плохо'}
                {reviewRating === 2 && 'Плохо'}
                {reviewRating === 3 && 'Нормально'}
                {reviewRating === 4 && 'Хорошо'}
                {reviewRating === 5 && 'Отлично'}
              </p>
            </div>

            {}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#57534e] mb-2">Комментарий</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Расскажите о своём опыте..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none resize-none"
              />
            </div>

            {}
            {completedBooks.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#57534e] mb-2">Объявление (опционально)</label>
                <select
                  value={reviewBookId}
                  onChange={(e) => setReviewBookId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none bg-white"
                >
                  <option value="">Выберите объявление</option>
                  {completedBooks.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title} — {book.author}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewComment('');
                  setReviewRating(5);
                  setReviewBookId('');
                }}
                className="flex-1 px-4 py-3 border-2 border-[#d6d3d1] text-[#57534e] rounded-xl hover:bg-[#faf9f6] transition-all font-medium"
              >
                Отмена
              </button>
              <button
                onClick={submitReview}
                disabled={reviewSubmitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#5C4033] to-[#7A5C50] text-white rounded-xl hover:from-[#3E2B22] hover:to-[#5C4033] transition-all font-semibold disabled:opacity-50"
              >
                {reviewSubmitting ? 'Отправка...' : 'Отправить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
