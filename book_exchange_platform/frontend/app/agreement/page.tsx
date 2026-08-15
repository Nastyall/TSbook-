'use client';

import Link from 'next/link';
import Header from '@/components/Header';

export default function AgreementPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[url('/background.jpg')] bg-cover bg-center bg-no-repeat relative">
      <div className="absolute inset-0 bg-[#e8ded1]/45"></div>
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#F5F0EB] rounded-2xl border-2 border-[#d8c8b8] p-8 shadow-xl">
            <h1 className="text-3xl font-bold text-[#3E2B22] mb-6 text-center">
              Пользовательское соглашение
            </h1>
            
            <div className="prose prose-lg max-w-none text-[#57534e]">
              <p className="text-sm text-[#a8a29e] mb-6">
                Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
              </p>

              <section className="mb-6">
                <h2 className="text-xl font-bold text-[#5C4033] mb-3">1. Общие положения</h2>
                <p className="mb-3">
                  1.1. Настоящее Пользовательское соглашение (далее — Соглашение) регулирует отношения между пользователями платформы TSBook (далее — Платформа).
                </p>
                <p className="mb-3">
                  1.2. Регистрация на Платформе означает полное и безоговорочное принятие условий настоящего Соглашения.
                </p>
                <p className="mb-3">
                  1.3. Платформа предоставляет пользователям возможность размещать объявления о продаже и обмене книг.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-bold text-[#5C4033] mb-3">2. Права и обязанности пользователей</h2>
                <p className="mb-3">
                  2.1. Пользователь обязуется предоставлять достоверную информацию при регистрации и размещении объявлений.
                </p>
                <p className="mb-3">
                  2.2. Пользователь имеет право:
                </p>
                <ul className="list-disc list-inside mb-3 space-y-1">
                  <li>Размещать объявления о продаже и обмене книг</li>
                  <li>Связываться с другими пользователями через встроенный чат</li>
                  <li>Оставлять отзывы о сделках</li>
                  <li>Редактировать и удалять свои объявления</li>
                </ul>
                <p className="mb-3">
                  2.3. Пользователь обязуется:
                </p>
                <ul className="list-disc list-inside mb-3 space-y-1">
                  <li>Не размещать запрещённый контент</li>
                  <li>Не нарушать права других пользователей</li>
                  <li>Соблюдать нормы этикета при общении</li>
                  <li>Не использовать Платформу в коммерческих целях без согласования</li>
                </ul>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-bold text-[#5C4033] mb-3">3. Безопасность</h2>
                <p className="mb-3">
                  3.1. Пользователь несёт ответственность за сохранность своих учётных данных.
                </p>
                <p className="mb-3">
                  3.2. Платформа не несёт ответственности за убытки, возникшие в результате несанкционированного доступа к аккаунту пользователя.
                </p>
                <p className="mb-3">
                  3.3. При подозрении на взлом аккаунта пользователь должен немедленно сообщить об этом администрации.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-bold text-[#5C4033] mb-3">4. Конфиденциальность</h2>
                <p className="mb-3">
                  4.1. Платформа обязуется не передавать персональные данные пользователей третьим лицам без их согласия.
                </p>
                <p className="mb-3">
                  4.2. Некоторые данные (имя пользователя, город, отзывы) являются общедоступными.
                </p>
                <p className="mb-3">
                  4.3. Платформа использует файлы cookie для улучшения работы сервиса.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-bold text-[#5C4033] mb-3">5. Ограничение ответственности</h2>
                <p className="mb-3">
                  5.1. Платформа выступает только как посредник между покупателями и продавцами.
                </p>
                <p className="mb-3">
                  5.2. Платформа не несёт ответственности за содержание объявлений и достоверность информации.
                </p>
                <p className="mb-3">
                  5.3. Все сделки между пользователями осуществляются на их усмотрение и риск.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-bold text-[#5C4033] mb-3">6. Изменение соглашения</h2>
                <p className="mb-3">
                  6.1. Администрация Платформы оставляет за собой право вносить изменения в настоящее Соглашение.
                </p>
                <p className="mb-3">
                  6.2. Новая редакция Соглашения вступает в силу с момента её публикации на Платформе.
                </p>
                <p className="mb-3">
                  6.3. Продолжение использования Платформы после внесения изменений означает согласие пользователя с новой редакцией Соглашения.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-bold text-[#5C4033] mb-3">7. Контакты</h2>
                <p className="mb-3">
                  По всем вопросам, связанным с настоящим Соглашением, вы можете связаться с администрацией Платформы через форму обратной связи.
                </p>
              </section>
            </div>

            <div className="mt-8 pt-6 border-t-2 border-[#d8c8b8] text-center">
              <Link
                href="/register"
                className="inline-block px-8 py-3 bg-[#5C4033] text-white rounded-xl hover:bg-[#3E2B22] transition-colors font-semibold"
              >
                Зарегистрироваться
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
