'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';

export default function AddBookPage() {
  const router = useRouter();
  const { token, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
    }
  }, [token, isLoading, router]);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    condition: '',
    transaction_type: 'both',
    price: '',
    city: '',
    address: '',
    publisher: '',
    year: '',
    pages: '',
    isbn: '',
    exchange_for: '',
    exchange_author: '',
    exchange_genre: '',
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFileName, setCoverFileName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      description: e.target.value,
    }));
  };

  const handleDescriptionPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverFileName(file.name);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveCover = () => {
    setCoverImage(null);
    setCoverFileName('');
    setCoverPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.author || !formData.condition || !formData.transaction_type || !formData.city) {
      setError('Заполните все обязательные поля');
      return;
    }

    if ((formData.transaction_type === 'sale' || formData.transaction_type === 'both') && !formData.price) {
      setError('Укажите цену');
      return;
    }

    if (formData.transaction_type === 'exchange' && !formData.exchange_for && !formData.exchange_author && !formData.exchange_genre) {
      setError('Укажите параметры обмена');
      return;
    }

    if (formData.transaction_type === 'both' && !formData.price && !formData.exchange_for && !formData.exchange_author && !formData.exchange_genre) {
      setError('Укажите цену и параметры обмена');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('author', formData.author);
      data.append('description', descriptionRef.current?.value || '');
      data.append('condition', formData.condition);
      data.append('transaction_type', formData.transaction_type);
      data.append('city', formData.city);
      if (formData.address) data.append('address', formData.address);

      if ((formData.transaction_type === 'sale' || formData.transaction_type === 'both') && formData.price) {
        data.append('price', formData.price);
      }

      if (formData.publisher) data.append('publisher', formData.publisher);
      if (formData.year) data.append('year', formData.year);
      if (formData.pages) data.append('pages', formData.pages);
      if (formData.isbn) data.append('isbn', formData.isbn);

      if (formData.exchange_for) data.append('exchange_for', formData.exchange_for);
      if (formData.exchange_author) data.append('exchange_author', formData.exchange_author);
      if (formData.exchange_genre) data.append('exchange_genre', formData.exchange_genre);

      if (coverImage) {
        data.append('cover_image', coverImage);
      }

      const response = await fetch('http://127.0.0.1:8000/api/books/', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: data,
      });

      if (response.ok) {
        
        router.push('/my-books');
        router.refresh();
      } else {
        const errorData = await response.json();
        let errorMessage = 'Ошибка при создании объявления';
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (typeof errorData === 'object' && errorData !== null) {
          errorMessage = Object.entries(errorData)
            .map(([key, value]) => {
              const label = key === 'transaction_type' ? 'Тип сделки' :
                           key === 'condition' ? 'Состояние' :
                           key === 'price' ? 'Цена' :
                           key === 'title' ? 'Название' :
                           key === 'author' ? 'Автор' :
                           key === 'city' ? 'Город' : key;
              return `${label}: ${Array.isArray(value) ? value.join(', ') : value}`;
            })
            .join('; ');
        }
        setError(errorMessage);
      }
    } catch (error) {
      setError('Ошибка при создании объявления');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[url('/background.jpg')] bg-cover bg-center bg-no-repeat bg-fixed">
      <div className="absolute inset-0 bg-[#e8ded1]/45"></div>
      <div className="relative z-10 flex flex-col h-full">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="bg-[#e8ded1] rounded-2xl p-8 border-2 border-[#d6d3d1]">
            <h1 className="text-3xl font-bold text-[#3E2B22] font-['QR Comic Regular']">
              Добавить объявление
            </h1>
            <div className="w-16 h-1 bg-[#5C4033] mt-2 mb-4 rounded"></div>
            <p className="text-[#57534e] mb-8">
              Заполните информацию о книге
            </p>

            {error && (
              <div className="mb-6 p-4 bg-[#e7e5e4] border border-[#d6d3d1] rounded-lg">
                <p className="text-[#3E2B22] text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="bg-[#FAF9F6] rounded-xl p-6">
                <h2 className="text-xl font-semibold text-[#3E2B22]">
                  Основная информация
                </h2>
                <div className="w-full h-0.5 bg-[#5C4033] mt-2 mb-6 rounded"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#57534e] mb-2">
                      Автор *
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      required
                      placeholder="Введите автора"
                      className="w-full px-4 py-3 rounded-lg border-2 border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#57534e] mb-2">
                      Название книги *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="Введите название"
                      className="w-full px-4 py-3 rounded-lg border-2 border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#57534e] mb-2">
                    Описание
                  </label>
                  <textarea
                    ref={descriptionRef}
                    name="description"
                    rows={4}
                    placeholder="Опишите книгу"
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none bg-white transition-all resize-none"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#57534e] mb-2">
                    Обложка книги
                  </label>
                  {coverPreview && (
                    <div className="relative mb-3 inline-block">
                      <img
                        src={coverPreview}
                        alt="Preview"
                        className="w-32 h-48 object-contain rounded-lg border border-[#d6d3d1] bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveCover}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-[#5C4033] text-white rounded-full flex items-center justify-center hover:bg-[#3E2B22] transition-colors text-sm"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border-2 border-[#d6d3d1] bg-white">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="cover-upload"
                    />
                    <label
                      htmlFor="cover-upload"
                      className="px-4 py-2 bg-[#5C4033] text-white rounded-lg text-sm font-semibold hover:bg-[#3E2B22] transition-colors cursor-pointer"
                    >
                      Выберите файл
                    </label>
                    <span className="text-sm text-[#57534e]">
                      {coverFileName || 'Файл не выбран'}
                    </span>
                  </div>
                  <p className="text-xs text-[#a8a29e] mt-2">jpg, png, gif. Максимум 5МБ</p>
                </div>
              </div>

              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#FAF9F6] rounded-xl p-6">
                  <label className="block text-sm font-medium text-[#57534e] mb-2">
                    Состояние *
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none bg-white transition-all"
                  >
                    <option value="">Выберите состояние</option>
                    <option value="new">Новое</option>
                    <option value="excellent">Отличное</option>
                    <option value="good">Хорошее</option>
                    <option value="satisfactory">Удовлетворительное</option>
                    <option value="poor">Плохое</option>
                  </select>
                </div>

                <div className="bg-[#FAF9F6] rounded-xl p-6">
                  <label className="block text-sm font-medium text-[#57534e] mb-2">
                    Тип сделки *
                  </label>
                  <select
                    name="transaction_type"
                    value={formData.transaction_type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none bg-white transition-all"
                  >
                    <option value="sale">Продажа</option>
                    <option value="exchange">Обмен</option>
                    <option value="both">И то, и другое</option>
                  </select>
                </div>
              </div>

              
              {(formData.transaction_type === 'sale' || formData.transaction_type === 'both') && (
                <div className="bg-[#FAF9F6] rounded-xl p-6 border-2 border-[#d6d3d1] border-l-4 border-l-[#5C4033]">
                  <h3 className="text-lg font-semibold text-[#3E2B22] mb-4 border-b border-[#d6d3d1] pb-2">
                    Цена
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-[#57534e] mb-2">
                      Цена (руб.)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="Укажите цену"
                      className="w-full px-4 py-3 rounded-lg border-2 border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none bg-white transition-all"
                    />
                  </div>
                </div>
              )}

              
              {(formData.transaction_type === 'exchange' || formData.transaction_type === 'both') && (
                <div className="bg-[#FAF9F6] rounded-xl p-6 border-2 border-[#d6d3d1] border-l-4 border-l-[#5C4033]">
                  <h3 className="text-lg font-semibold text-[#3E2B22] mb-4 border-b border-[#d6d3d1] pb-2">
                    Обмен
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#57534e] mb-2">
                        Жанр
                      </label>
                      <input
                        type="text"
                        name="exchange_genre"
                        value={formData.exchange_genre}
                        onChange={handleInputChange}
                        placeholder="Желаемый жанр"
                        className="w-full px-4 py-3 rounded-lg border-2 border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#57534e] mb-2">
                        Название
                      </label>
                      <input
                        type="text"
                        name="exchange_for"
                        value={formData.exchange_for}
                        onChange={handleInputChange}
                        placeholder="Желаемое название"
                        className="w-full px-4 py-3 rounded-lg border-2 border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#57534e] mb-2">
                        Автор
                      </label>
                      <input
                        type="text"
                        name="exchange_author"
                        value={formData.exchange_author}
                        onChange={handleInputChange}
                        placeholder="Желаемый автор"
                        className="w-full px-4 py-3 rounded-lg border-2 border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              
              <div className="bg-[#FAF9F6] rounded-xl p-6 border-2 border-[#d6d3d1] border-l-4 border-l-[#5C4033]">
                <h3 className="text-lg font-semibold text-[#3E2B22] mb-4 border-b border-[#d6d3d1] pb-2">
                  Дополнительная информация
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#57534e] mb-2">
                      Издательство
                    </label>
                    <input
                      type="text"
                      name="publisher"
                      value={formData.publisher}
                      onChange={handleInputChange}
                      placeholder="Название издательства"
                      className="w-full px-4 py-3 rounded-lg border-2 border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#57534e] mb-2">
                      Год издания
                    </label>
                    <input
                      type="text"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      placeholder="Год"
                      className="w-full px-4 py-3 rounded-lg border-2 border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#57534e] mb-2">
                      Количество страниц
                    </label>
                    <input
                      type="number"
                      name="pages"
                      value={formData.pages}
                      onChange={handleInputChange}
                      placeholder="Страниц"
                      className="w-full px-4 py-3 rounded-lg border-2 border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#57534e] mb-2">
                      ISBN
                    </label>
                    <input
                      type="text"
                      name="isbn"
                      value={formData.isbn}
                      onChange={handleInputChange}
                      placeholder="ISBN книги"
                      className="w-full px-4 py-3 rounded-lg border-2 border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              
              <div className="bg-[#FAF9F6] rounded-xl p-6 border-2 border-[#d6d3d1] border-l-4 border-l-[#5C4033]">
                <h3 className="text-lg font-semibold text-[#3E2B22] mb-4 border-b border-[#d6d3d1] pb-2">
                  Местоположение
                </h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#57534e] mb-2">
                    Город *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder="Ваш город"
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#57534e] mb-2">
                    Адрес (необязательно)
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Улица, дом (указывать точно не обязательно)"
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#d6d3d1] focus:border-[#5C4033] focus:ring-2 focus:ring-[#5C4033]/20 outline-none bg-white transition-all"
                  />
                </div>
              </div>

              
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-[#5C4033] text-white rounded-lg hover:bg-[#3E2B22] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Создание...' : '+ Создать объявление'}
                </button>

                <Link
                  href="/my-books"
                  className="px-8 py-4 bg-[#e7e5e4] text-[#57534e] rounded-lg hover:bg-[#d6d3d1] transition-colors font-semibold"
                >
                  Отмена
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
