'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface BookCardProps {
  book: {
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
  };
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <div className="bg-card rounded-2xl border-2 border-[#d8c8b8] overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1 group">
      <div className="relative">
        {book.cover_image_url ? (
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="w-full h-64 object-contain bg-[#faf9f6]"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = '<div class="w-full h-64 bg-[#e7e5e4] flex items-center justify-center"><svg class="w-16 h-16 text-[#5C4033]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z"/></svg></div>';
            }}
          />
        ) : (
          <div className="w-full h-64 bg-[#e7e5e4] flex items-center justify-center">
            <svg className="w-16 h-16 text-[#5C4033]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z"/>
            </svg>
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
            book.condition === 'new' ? 'bg-[#5C4033]' :
            book.condition === 'excellent' ? 'bg-[#7A5C50]' :
            book.condition === 'good' ? 'bg-[#A08070]' :
            book.condition === 'satisfactory' ? 'bg-[#B8A08F]' :
            'bg-[#8B7355]'
          }`}>
            {book.condition_display}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#d6d3d1] text-[#57534e]">
            {book.transaction_type_display}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-[#3E2B22] text-lg mb-1 group-hover:text-[#5C4033] transition-colors line-clamp-1">
          {book.title}
        </h3>
        <p className="text-[#57534e] text-sm mb-2">{book.author}</p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#a8a29e]">
            {book.city}
          </span>
        </div>
        <p className="text-[#5C4033] font-bold text-lg mb-3">
          {book.price ? `${book.price.toLocaleString('ru-RU')} ₽` : 'По договорённости'}
        </p>
        
        <div className="flex items-center gap-2 pt-3 border-t-2 border-[#d8c8b8]">
          {book.owner.profile?.avatar ? (
            <img
              src={book.owner.profile.avatar.startsWith('http')
                ? book.owner.profile.avatar
                : `http://127.0.0.1:8000${book.owner.profile.avatar}`}
              alt={book.owner.username}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-[#5C4033] text-white rounded-full flex items-center justify-center text-sm font-bold">
              {book.owner.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <p className="text-xs text-[#57534e]">
              {book.owner.first_name} {book.owner.last_name}
            </p>
            <p className="text-xs text-[#a8a29e]">{book.owner.profile?.city || '—'}</p>
          </div>
          <Link
            href={`/books/${book.id}`}
            className="px-3 py-1.5 bg-gradient-to-r from-[#5C4033] to-[#7A5C50] text-white rounded-lg hover:from-[#3E2B22] hover:to-[#5C4033] transition-all text-xs font-semibold"
          >
            Подробнее
          </Link>
        </div>
      </div>
    </div>
  );
}

