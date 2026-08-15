'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SubscribeButtonProps {
  targetUserId: number;
  username: string;
  isSubscribed: boolean;
  onToggle?: (newState: boolean) => void;
}

export default function SubscribeButton({ targetUserId, username, isSubscribed, onToggle }: SubscribeButtonProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const isMutating = useRef(false);

  const handleToggle = async () => {
    
    if (loading || isMutating.current) {
      return;
    }
    
    if (!token) {
      alert('Вы не авторизованы');
      return;
    }
    if (!targetUserId || targetUserId <= 0) {
      alert('Не указан пользователь');
      return;
    }

    setLoading(true);
    isMutating.current = true;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/subscriptions/${targetUserId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok || response.status === 201) {
        let data: { is_subscribed?: boolean } = {};
        try {
          data = await response.json();
        } catch {
          
          data = { is_subscribed: !isSubscribed };
        }
        const newState = data.is_subscribed !== undefined ? data.is_subscribed : !isSubscribed;
        
        
        localStorage.setItem(`subscription_${username}`, String(newState));
        
        
        if (onToggle) {
          onToggle(newState);
        }
        
        
        window.dispatchEvent(new CustomEvent('subscription-changed', { detail: { username, isSubscribed: newState } }));
      } else if (response.status === 401) {
        alert('Сессия истекла. Войдите снова.');
      } else {
        let errorMsg = 'Произошла ошибка';
        try {
          const error = await response.json();
          errorMsg = error.detail || 'Произошла ошибка';
        } catch {}
        alert(errorMsg);
      }
    } catch (error) {
      console.error('SubscribeButton: исключение:', error);
      alert('Не удалось подключиться к серверу. Проверьте, что бэкенд запущен на порту 8000');
    } finally {
      setLoading(false);
      isMutating.current = false;
    }
  };

  if (!token) {
    return null;
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-6 py-3 rounded-xl transition-all font-semibold shadow-lg ${
        isSubscribed
          ? 'bg-[#faf9f6] text-[#57534e] border-2 border-[#d6d3d1] hover:bg-[#e8ded1]'
          : 'bg-gradient-to-r from-[#5C4033] to-[#7A5C50] text-white hover:from-[#3E2B22] hover:to-[#5C4033] transform hover:-translate-y-0.5'
      }`}
    >
      {loading ? (
        'Загрузка...'
      ) : isSubscribed ? (
        '✓ Вы подписаны'
      ) : (
        '+ Подписаться'
      )}
    </button>
  );
}

