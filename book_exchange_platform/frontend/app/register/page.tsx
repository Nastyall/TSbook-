'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 8) {
      setError('Пароль должен содержать не менее 8 символов');
      return;
    }

    if (!agreementAccepted) {
      setError('Необходимо принять пользовательское соглашение');
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.username,
        formData.email,
        formData.password,
        formData.confirmPassword,
        formData.city
      );
      router.push('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Ошибка регистрации');
      } else {
        setError('Ошибка регистрации');
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
        <div className="bg-[#e8ded1] rounded-2xl shadow-xl p-6 border border-[#d6d3d1]">
          <div className="flex justify-center mb-6">
            <img
              src="/logo.svg"
              alt="TSBook Logo"
              className="w-24 h-24 rounded-full"
            />
          </div>

          <h1 className="text-xl font-bold text-[#3E2B22] text-center mb-1">
            Регистрация
          </h1>
          <p className="text-[#57534e] text-center text-sm mb-4">
            Создайте новый аккаунт
          </p>

          {error && (
            <div className="mb-4 p-3 bg-[#e7e5e4] border border-[#d6d3d1] rounded-lg">
              <p className="text-[#3E2B22] text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="username" className="block text-xs font-medium text-[#57534e] mb-1">
                Имя пользователя
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none bg-[#faf9f6] transition-all"
                placeholder="Имя пользователя"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-[#57534e] mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none bg-[#faf9f6] transition-all"
                placeholder="Email"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-xs font-medium text-[#57534e] mb-1">
                Город
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none bg-[#faf9f6] transition-all"
                placeholder="Город"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-[#57534e] mb-1">
                Пароль
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none bg-[#faf9f6] transition-all"
                placeholder="Пароль"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-[#57534e] mb-1">
                Подтверждение пароля
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none bg-[#faf9f6] transition-all"
                placeholder="Повторите пароль"
              />
            </div>

            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreementAccepted}
                  onChange={(e) => setAgreementAccepted(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-[#d6d3d1] text-[#5C4033] focus:ring-[#5C4033] flex-shrink-0"
                />
                <span className="text-xs text-[#57534e] leading-tight">
                  Я принимаю{' '}
                  <Link href="/agreement" target="_blank" className="text-[#5C4033] hover:text-[#3E2B22] font-medium underline">
                    соглашение
                  </Link>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !agreementAccepted}
              className="w-full py-2.5 bg-[#5C4033] text-white rounded-lg hover:bg-[#3E2B22] transition-colors font-semibold text-sm disabled:cursor-not-allowed"
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-[#57534e] text-sm">
              Уже есть аккаунт?{' '}
              <Link href="/login" className="text-[#5C4033] hover:text-[#3E2B22] font-medium">
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}