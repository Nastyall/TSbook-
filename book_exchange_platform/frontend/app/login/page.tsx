'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.username, formData.password);
      router.push('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Ошибка входа');
      } else {
        setError('Ошибка входа');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/background.jpg')] bg-cover bg-center bg-no-repeat bg-fixed relative">
      <div className="absolute inset-0 bg-[#e8ded1]/45"></div>
      <div className="w-full max-w-md px-4 relative z-10">
        <div className="bg-[#e8ded1] rounded-2xl shadow-xl p-8 border border-[#d6d3d1]">
          
          <div className="flex justify-center mb-6">
            <img
              src="/logo.svg"
              alt="TSBook Logo"
              className="w-24 h-24 rounded-full"
            />
          </div>

          <h1 className="text-2xl font-bold text-[#3E2B22] text-center mb-2">
            Вход
          </h1>
          <p className="text-[#57534e] text-center mb-8">
            Войдите в свой аккаунт
          </p>

          {error && (
            <div className="mb-6 p-4 bg-[#e7e5e4] border border-[#d6d3d1] rounded-lg">
              <p className="text-[#3E2B22] text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#57534e] mb-2">
                Имя пользователя
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none bg-[#faf9f6] transition-all"
                placeholder="Введите имя пользователя"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#57534e] mb-2">
                Пароль
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none bg-[#faf9f6] transition-all"
                placeholder="Введите пароль"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#5C4033] text-white rounded-lg hover:bg-[#3E2B22] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#57534e]">
              Нет аккаунта?{' '}
              <Link href="/register" className="text-[#5C4033] hover:text-[#3E2B22] font-medium">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}