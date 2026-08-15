'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <header className="border-b-2 border-[#d6d3d1] shadow-lg sticky top-0 z-50 bg-[url('/header.jpg')] bg-cover bg-center bg-no-repeat relative bg-[#e8ded1]/35">
      <div className="absolute inset-0 bg-[#e8ded1]/35"></div>
      <nav className="container mx-auto px-4 py-3 relative flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/logo.svg"
              alt="TSBook Logo"
              className="w-16 h-16 rounded-full"
            />
          </Link>

       
        <div className="hidden md:flex items-center gap-3 flex-1 justify-center">
          {isAuthenticated ? (
            <>
              <Link
                href="/"
                className="px-4 py-2 bg-[#5C4033] text-white rounded-lg hover:bg-[#3E2B22] transition-colors font-semibold"
              >
                Главная
              </Link>
              <Link
                href="/search"
                className="px-4 py-2 bg-[#5C4033] text-white rounded-lg hover:bg-[#3E2B22] transition-colors font-semibold"
              >
                Поиск
              </Link>
              <Link
                href="/subscription-feed"
                className="px-4 py-2 bg-[#5C4033] text-white rounded-lg hover:bg-[#3E2B22] transition-colors font-semibold"
              >
                Лента
              </Link>
              <Link
                href="/my-books"
                className="px-4 py-2 bg-[#5C4033] text-white rounded-lg hover:bg-[#3E2B22] transition-colors font-semibold"
              >
                Мои объявления
              </Link>
              <Link
                href="/favorites"
                className="px-4 py-2 bg-[#5C4033] text-white rounded-lg hover:bg-[#3E2B22] transition-colors font-semibold"
              >
                Избранное
              </Link>
            </>
          ) : (
            <></>
          )}
        </div>

        
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/chat"
                className="p-2 text-[#5C4033] hover:text-[#3E2B22] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </Link>
              <Link
                href="/profile"
                className="w-10 h-10 bg-[#5C4033] rounded-full flex items-center justify-center hover:bg-[#3E2B22] transition-colors overflow-hidden"
              >
                {user?.profile?.avatar ? (
                  <img
                    src={user.profile.avatar.startsWith('http')
                      ? user.profile.avatar
                      : `http://localhost:8000${user.profile.avatar}`}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-[#5C4033] text-white rounded-lg hover:bg-[#3E2B22] transition-colors font-semibold"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-5 py-2 bg-[#5C4033] text-white rounded-lg hover:bg-[#3E2B22] transition-colors font-semibold"
              >
                Войти
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 bg-[#5C4033] text-white rounded-lg hover:bg-[#3E2B22] transition-colors font-semibold"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>

        
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#5C4033]"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

       
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t-2 border-[#d6d3d1] pt-4">
          <div className="flex flex-col gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/"
                  className="px-4 py-2 bg-[#5C4033] text-white rounded-lg text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Главная
                </Link>
                <Link
                  href="/search"
                  className="px-4 py-2 bg-[#5C4033] text-white rounded-lg text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Поиск
                </Link>
                <Link
                  href="/subscription-feed"
                  className="px-4 py-2 bg-[#5C4033] text-white rounded-lg text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Лента
                </Link>
                <Link
                  href="/my-books"
                  className="px-4 py-2 bg-[#5C4033] text-white rounded-lg text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Мои объявления
                </Link>
                <Link
                  href="/favorites"
                  className="px-4 py-2 bg-[#5C4033] text-white rounded-lg text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Избранное
                </Link>
                <Link
                  href="/chat"
                  className="px-4 py-2 bg-[#5C4033] text-white rounded-lg text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Чаты
                </Link>
                <Link
                  href="/profile"
                  className="px-4 py-2 bg-[#5C4033] text-white rounded-lg text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Профиль
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 bg-[#5C4033] text-white rounded-lg text-center"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2 bg-[#5C4033] text-white rounded-lg text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Войти
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 bg-[#5C4033] text-white rounded-lg text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#E7E5E4] border-t border-border py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
            <a 
              href="tel:+79991234567" 
              className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors font-['QR Comic Regular']"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>+7 (999) 123-45-67</span>
            </a>
            <a 
              href="https://vk.com"
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors font-['QR Comic Regular']"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.162 18.994c.609 0 .858-.011.858-.011 2.875-.119 4.587-1.652 5.085-3.256.162-.523.178-1.217.032-1.217h-1.278c-.505 0-.737.241-1.002.537-.264.295-.652.703-1.193.703-.827 0-1.28-.404-1.28-1.452 0-1.182.482-2.143 1.384-2.351.344-.08.578-.239.668-.845.136-.917.458-2.255.458-2.86 0-.606-.254-.914-.894-.914h-2.28c-.548 0-.78.231-1.015.487-.235.256-.46.607-1.023.607h-1.326c-.58 0-.747-.295-.747-.717 0-1.097.573-2.433 2.079-2.433.717 0 1.145.453 1.335 1.253.141.59.569 1.046 1.162 1.046h1.397c.469 0 .704-.241.704-.797 0-1.413-1.048-2.804-3.168-2.804-2.379 0-4.01 1.341-4.01 3.364 0 .594.183 1.002.629 1.298.395.262.547.387.547.862 0 .474-.192.911-.485 1.218-.344.36-.952.822-1.728.822-1.288 0-2.305-1.346-2.305-3.368 0-1.795.963-3.62 2.983-3.62.546 0 1.037.119 1.342.341.236.172.453.263.776.263.258 0 .444-.163.541-.49.275-.927.933-2.014 2.674-2.014h2.205c.647 0 .834.347.834.834 0 1.053-.433 2.848-1.092 3.969-.448.761-.626 1.22-.626 1.724 0 .771.579 1.165 1.302 1.165.754 0 1.195-.322 1.577-1.052.418-.8 1.153-2.502 1.454-3.04.24-.43.627-.79 1.217-.79h1.396c.68 0 .907.338.907.834 0 1.222-.704 2.92-1.556 4.186-.823 1.222-1.082 1.536-1.082 1.958 0 .323.225.526.756.526 1.024 0 2.057-.718 2.787-1.993 0 0 .142-.25.283-.465.234-.356.607-.987.607-1.403 0-.515-.243-.916-.898-.916h-1.278c-.454 0-.636.22-.847.53-.422.618-1.146 1.664-1.59 1.664-.41 0-.542-.179-.542-.64 0-1.145.844-2.467 1.695-3.495.28-.338.585-.641.585-1.105 0-.464-.355-.862-.954-.862-1.49 0-2.73 1.439-2.73 3.276 0 1.056.479 1.894 1.174 1.894.41 0 .694-.199.988-.611.187-.261.43-.602.69-1.163.387-.735.603-1.465.603-1.935 0-.64-.443-1.06-1.14-1.06-1.297 0-2.388 1.395-2.388 3.287 0 1.45.693 2.482 2.033 2.482z"/>
              </svg>
              <span>VKontakte</span>
            </a>
            <a 
              href="https://vk.com"
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors font-['QR Comic Regular']"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span>MAX</span>
            </a>
          </div>


        </div>
      </div>
    </footer>
  );
}
