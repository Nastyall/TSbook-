'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { user, token, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    bio: '',
    phone: '',
    city: '',
    address: '',
  });
  
  
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        bio: user.profile?.bio || '',
        phone: user.profile?.phone || '',
        city: user.profile?.city || '',
        address: user.profile?.address || '',
      });
    }
  }, [user]);
  
  
  useEffect(() => {
    console.log('ProfilePage: user =', user);
    console.log('ProfilePage: user.profile =', user?.profile);
    console.log('ProfilePage: formData =', formData);
  }, [user, formData]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Ошибка: файл должен быть меньше 5MB');
      return;
    }

    setLoading(true);
    setMessage('');

    const formDataUpload = new FormData();
    formDataUpload.append('avatar', file);

    try {
      console.log('Загрузка аватара:', file.name, file.size);
      console.log('Токен:', token ? token.substring(0, 20) + '...' : 'нет токена');
      
      const response = await fetch('http://127.0.0.1:8000/api/profile/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
         
        },
        body: formDataUpload,
      });

      console.log('Статус ответа:', response.status);
      console.log('Заголовки ответа:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('Тело ответа:', responseText);
      
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      if (response.ok) {
        const data = JSON.parse(responseText);
        console.log('Распарсенный ответ:', data);
        
        
        if (updateUser && data) {
         
          const updatedUser = user ? {
            ...user,
            profile: data.profile || data,
            avatar: data.avatar || data.profile?.avatar,
          } : data;
          
          console.log('Обновлённый пользователь:', updatedUser);
          updateUser(updatedUser);
        }
        setMessage('Аватар успешно изменён');
        
        setTimeout(() => window.location.reload(), 1500);
      } else {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: responseText };
        }
        console.error('Ошибка загрузки:', errorData);
        setMessage(`Ошибка: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Ошибка при загрузке аватара:', error);
      setMessage(`Ошибка при загрузке аватара: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить аватар?')) return;

    setLoading(true);
    setMessage('');

    try {
      console.log('Удаление аватара');
      
      const response = await fetch('http://127.0.0.1:8000/api/profile/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar: null }),
      });

      console.log('Статус ответа:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Ответ сервера:', data);
        
        
        if (updateUser && user) {
          const updatedUser = {
            ...user,
            profile: {
              id: user.profile?.id || 0,
              avatar: undefined,
              bio: user.profile?.bio || '',
              phone: user.profile?.phone || '',
              city: user.profile?.city || '',
              address: user.profile?.address || '',
            },
          };
          updateUser(updatedUser);
        }
        setMessage('Аватар успешно удалён');
        
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const errorData = await response.json();
        console.error('Ошибка удаления:', errorData);
        setMessage(`Ошибка: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Ошибка при удалении аватара:', error);
      setMessage(`Ошибка при удалении аватара: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      console.log('Отправка профиля:', formData);
      console.log('Токен:', token ? token.substring(0, 20) + '...' : 'нет токена');
      
      const response = await fetch('http://127.0.0.1:8000/api/profile/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      console.log('Статус ответа:', response.status);
      const responseText = await response.text();
      console.log('Тело ответа:', responseText);
      
      if (response.ok) {
        const data = JSON.parse(responseText);
        console.log('Распарсенный ответ:', data);
        
        
        if (updateUser && user) {
          const updatedUser = {
            ...user,
            first_name: data.user?.first_name || formData.first_name,
            last_name: data.user?.last_name || formData.last_name,
            email: data.user?.email || formData.email,
            profile: {
              ...user.profile,
              id: data.profile?.id ?? user.profile?.id,
              bio: data.profile?.bio ?? formData.bio,
              phone: data.profile?.phone ?? formData.phone,
              city: data.profile?.city ?? formData.city,
              address: data.profile?.address ?? formData.address,
              avatar: data.profile?.avatar ?? user.profile?.avatar,
            },
          };
          console.log('Обновляем пользователя:', updatedUser);
          updateUser(updatedUser);
        }
        setMessage('Профиль успешно обновлён');
      } else {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: responseText };
        }
        console.error('Ошибка обновления профиля:', errorData);
        setMessage(`Ошибка: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      setMessage(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[url('/background.jpg')] bg-cover bg-center bg-no-repeat relative">
      <div className="absolute inset-0 bg-[#e8ded1]/45"></div>
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {}
          <div className="bg-[#E8DED1] rounded-2xl border-2 border-[#d8c8b8] p-6 mb-6 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {}
              <div className="relative flex-shrink-0 group">
                
                <div className="w-32 h-32 rounded-full bg-[#5C4033] text-white flex items-center justify-center text-4xl font-bold border-4 border-[#7A5C50] shadow-lg">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>

                
                {user?.profile?.avatar && (
                  <img
                    src={user.profile.avatar.startsWith('http')
                      ? user.profile.avatar
                      : `http://127.0.0.1:8000${user.profile.avatar}`}
                    alt={user.username}
                    className="absolute inset-0 w-32 h-32 rounded-full object-cover border-4 border-[#5C4033] shadow-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                
                
                <div className="absolute bottom-0 right-0 flex gap-1 opacity-100 transition-opacity">
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="w-10 h-10 bg-[#5C4033] text-white rounded-full flex items-center justify-center hover:bg-[#3E2B22] transition-colors shadow-lg cursor-pointer disabled:opacity-50"
                    title="Изменить аватар"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={loading}
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-[#3E2B22] mb-1">
                  {user?.username}
                </h1>
                <div className="h-1 w-20 bg-gradient-to-r from-[#5C4033] to-[#7A5C50] rounded-full mb-2"></div>
                <p className="text-[#57534e] mb-1">{formData.email}</p>
                <p className="text-[#a8a29e] text-sm">
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-4 h-4 text-[#5C4033]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    {formData.city || 'Город не указан'}
                  </span>
                </p>
              </div>

              {}
              <Link
                href="/add-book"
                className="px-6 py-3 bg-[#5C4033] text-white rounded-xl hover:bg-[#3E2B22] transition-colors font-semibold whitespace-nowrap shadow-lg"
              >
                + Добавить объявление
              </Link>
            </div>
          </div>

          {}
          <div className="bg-[#E8DED1] rounded-2xl border-2 border-[#d8c8b8] p-6 shadow-xl">
            {message && (
              <div className="mb-4 p-4 bg-[#faf9f6] border-l-4 border-[#5C4033] rounded-lg">
                <p className="text-[#3E2B22] text-sm font-medium">{message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {}
                <div>
                  <label className="block text-sm font-medium text-[#57534e] mb-2">
                    Имя
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#d8c8b8] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/10 outline-none bg-white transition-all"
                  />
                </div>

                {}
                <div>
                  <label className="block text-sm font-medium text-[#57534e] mb-2">
                    Фамилия
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#d8c8b8] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/10 outline-none bg-white transition-all"
                  />
                </div>

                {}
                <div>
                  <label className="block text-sm font-medium text-[#57534e] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#d8c8b8] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/10 outline-none bg-white transition-all"
                  />
                </div>

                {}
                <div>
                  <label className="block text-sm font-medium text-[#57534e] mb-2">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#d8c8b8] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/10 outline-none bg-white transition-all"
                  />
                </div>

                {}
                <div>
                  <label className="block text-sm font-medium text-[#57534e] mb-2">
                    Город
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#d8c8b8] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/10 outline-none bg-white transition-all"
                  />
                </div>

                {}
                <div>
                  <label className="block text-sm font-medium text-[#57534e] mb-2">
                    Адрес
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#d8c8b8] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/10 outline-none bg-white transition-all"
                  />
                </div>
              </div>

              {}
              <div className="flex flex-col gap-2 p-4 rounded-xl border-l-4 border-[#5C4033] bg-[#FAF9F6]">
                <label className="block text-sm font-medium text-[#57534e] mb-2">
                  О себе
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#d8c8b8] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/10 outline-none bg-white transition-all resize-none"
                  placeholder="Расскажите о себе..."
                />
              </div>

              {}
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-[#5C4033] to-[#7A5C50] text-white rounded-xl hover:from-[#3E2B22] hover:to-[#5C4033] transition-all font-semibold disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

