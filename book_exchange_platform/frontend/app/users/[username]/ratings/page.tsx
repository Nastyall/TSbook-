'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import RatingDisplay from '@/components/RatingDisplay';
import { useAuth } from '@/contexts/AuthContext';

interface Rating {
  id: number;
  reviewer_username: string;
  reviewer_avatar: string | null;
  rating: number;
  comment: string;
  created_at: string;
  book_details?: {
    id: number;
    title: string;
    author: string;
  };
}

interface RatingInfo {
  average_rating: number | null;
  ratings_count: number;
  rating_breakdown: {
    '5': number;
    '4': number;
    '3': number;
    '2': number;
    '1': number;
  };
}

export default function UserRatingsPage() {
  const params = useParams();
  const username = params.username as string;
  const { user, token } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [ratingInfo, setRatingInfo] = useState<RatingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRateModal, setShowRateModal] = useState(false);
  const [ratingForm, setRatingForm] = useState({
    rating: 5,
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRatings();
    fetchRatingInfo();
  }, [username]);

  const fetchRatings = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/users/${username}/ratings/`);
      if (response.ok) {
        const data = await response.json();
        setRatings(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRatingInfo = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/users/${username}/rating-info/`);
      if (response.ok) {
        const data = await response.json();
        setRatingInfo(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки информации о рейтинге:', error);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(`http://localhost:8000/api/users/${username}/rate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(ratingForm),
      });

      if (response.ok) {
        setMessage('Отзыв успешно оставлен!');
        setShowRateModal(false);
        setRatingForm({ rating: 5, comment: '' });
        fetchRatings();
        fetchRatingInfo();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json();
        const nfErrors = data.non_field_errors;
        if (Array.isArray(nfErrors) && nfErrors.some((e: string) => e.includes('дубликат') || e.includes('такой отзыв'))) {
          setMessage('Вы уже оставляли отзыв этому пользователю');
        } else {
          setMessage(data.error || (Array.isArray(nfErrors) ? nfErrors[0] : 'Ошибка при оставлении отзыва'));
        }
      }
    } catch (error) {
      setMessage('Ошибка при оставлении отзыва');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? 'text-[#5C4033]' : 'text-[#d6d3d1]'}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {}
          <Link
            href={`/users/${username}`}
            className="inline-flex items-center gap-2 text-[#5C4033] hover:text-[#3E2B22] mb-6 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад к профилю
          </Link>

          {}
          <div className="bg-card rounded-2xl border-2 border-[#d6d3d1] p-6 mb-6 shadow-xl" style={{ boxShadow: '0 4px 20px rgba(92, 64, 51, 0.15)' }}>
            <h1 className="text-3xl font-bold text-[#3E2B22] mb-2">
              Отзывы о {username}
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-[#5C4033] to-[#7A5C50] rounded-full mb-4"></div>
            
            {ratingInfo && (
              <div className="mt-4">
                <RatingDisplay
                  averageRating={ratingInfo.average_rating}
                  count={ratingInfo.ratings_count}
                />
              </div>
            )}

            {user && user.username !== username && (
              <button
                onClick={() => setShowRateModal(true)}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-[#5C4033] to-[#7A5C50] text-white rounded-xl hover:from-[#3E2B22] hover:to-[#5C4033] transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Оставить отзыв
              </button>
            )}
          </div>

          {}
          {message && (
            <div className="mb-6 p-4 bg-[#faf9f6] border-l-4 border-[#5C4033] rounded-lg">
              <p className="text-[#3E2B22] text-sm font-medium">{message}</p>
            </div>
          )}

          {}
          {loading ? (
            <div className="bg-card rounded-2xl border-2 border-[#d6d3d1] p-12 text-center shadow-xl">
              <div className="animate-pulse">
                <div className="h-4 bg-[#e7e5e4] rounded w-1/3 mx-auto mb-4"></div>
                <div className="h-4 bg-[#e7e5e4] rounded w-1/4 mx-auto"></div>
              </div>
            </div>
          ) : ratings.length > 0 ? (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div
                  key={rating.id}
                  className="bg-card rounded-2xl border-2 border-[#d6d3d1] p-6 shadow-xl hover:shadow-2xl transition-shadow"
                  style={{ boxShadow: '0 4px 20px rgba(92, 64, 51, 0.1)' }}
                >
                  <div className="flex items-start gap-4">
                    {}
                    {rating.reviewer_avatar ? (
                      <img
                        src={`http://localhost:8000${rating.reviewer_avatar}`}
                        alt={rating.reviewer_username}
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#7A5C50]"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#5C4033] text-white flex items-center justify-center text-2xl font-bold border-2 border-[#7A5C50]">
                        {rating.reviewer_username.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-[#3E2B22] text-lg">
                          {rating.reviewer_username}
                        </h3>
                        <span className="text-sm text-[#a8a29e]">
                          {formatDate(rating.created_at)}
                        </span>
                      </div>

                      <div className="mb-2">
                        {renderStars(rating.rating)}
                      </div>

                      {rating.comment && (
                        <p className="text-[#57534e] mb-3 leading-relaxed">
                          {rating.comment}
                        </p>
                      )}

                      {rating.book_details && (
                        <Link
                          href={`/books/${rating.book_details.id}`}
                          className="inline-flex items-center gap-2 text-sm text-[#5C4033] hover:text-[#3E2B22] font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          {rating.book_details.title}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-2xl border-2 border-[#d6d3d1] p-12 text-center shadow-xl">
              <svg className="w-20 h-20 text-[#a8a29e] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <p className="text-[#57534e] text-lg font-medium mb-2">
                Отзывов пока нет
              </p>
              <p className="text-[#a8a29e]">
                Будьте первым, кто оставит отзыв!
              </p>
            </div>
          )}
        </div>
      </main>

      {}
      {showRateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border-2 border-[#d6d3d1] p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-[#3E2B22] mb-4">
              Оставить отзыв
            </h2>
            
            <form onSubmit={handleSubmitRating} className="space-y-4">
              {}
              <div>
                <label className="block text-sm font-medium text-[#57534e] mb-2">
                  Ваша оценка
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingForm({ ...ratingForm, rating: star })}
                      className={`text-3xl transition-transform hover:scale-110 ${
                        star <= ratingForm.rating ? 'text-[#5C4033]' : 'text-[#d6d3d1]'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-[#57534e] mb-2">
                  Комментарий (необязательно)
                </label>
                <textarea
                  value={ratingForm.comment}
                  onChange={(e) => setRatingForm({ ...ratingForm, comment: e.target.value })}
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none bg-white transition-all resize-none"
                  placeholder="Расскажите о вашем опыте взаимодействия..."
                />
                <p className="text-xs text-[#a8a29e] mt-1 text-right">
                  {ratingForm.comment.length}/500
                </p>
              </div>

              {}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRateModal(false)}
                  className="flex-1 px-4 py-3 bg-[#e7e5e4] text-[#57534e] rounded-xl hover:bg-[#d6d3d1] transition-all font-semibold"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#5C4033] to-[#7A5C50] text-white rounded-xl hover:from-[#3E2B22] hover:to-[#5C4033] transition-all font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Отправка...' : 'Отправить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}