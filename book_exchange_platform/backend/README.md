# Book Exchange Platform - Backend

Django REST Framework backend для платформы обмена книг.

## 📋 Требования

- Python 3.9+
- Django 4.2

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
pip install -r requirements.txt
```

### 2. Настройка переменных окружения

```bash
cp .env.example .env
# Отредактируйте .env
```

### 3. Миграции

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Создание суперпользователя

```bash
python manage.py createsuperuser
```

### 5. Запуск сервера

```bash
python manage.py runserver
```

## 📁 Структура проекта

```
backend/
├── backend/
│   ├── settings.py    # Настройки Django
│   ├── urls.py        # Корневые URL
│   ├── wsgi.py
│   └── asgi.py
├── books/
│   ├── models.py      # Модели данных
│   ├── serializers.py # DRF сериализаторы
│   ├── views.py       # API Views
│   ├── urls.py        # URL приложения
│   ├── admin.py       # Admin панель
│   └── tests.py
├── manage.py
├── requirements.txt
└── .env.example
```

## 🔑 API Endpoints

### Аутентификация (JWT)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/auth/register/` | Регистрация |
| POST | `/api/auth/login/` | Вход |
| POST | `/api/auth/token/refresh/` | Обновление токена |
| GET | `/api/auth/check/` | Проверка аутентификации |

### Пользователи

| Метод | Endpoint | Описание | Доступ |
|-------|----------|----------|--------|
| GET | `/api/users/<int:user_id>/` | Профиль по ID | Все |
| GET | `/api/users/<str:username>/` | Профиль по username | Все |
| GET | `/api/users/<str:username>/books/` | Книги пользователя | Все |

### Профиль

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/profile/` | Получить профиль |
| PATCH | `/api/profile/` | Обновить профиль |

### Книги

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/books/` | Список книг |
| POST | `/api/books/` | Создать книгу |
| GET | `/api/books/<id>/` | Детали книги |
| PATCH | `/api/books/<id>/` | Обновить книгу |
| DELETE | `/api/books/<id>/` | Деактивировать книгу |
| GET | `/api/books/my_books/` | Мои книги |
| POST | `/api/books/<id>/upload_cover/` | Загрузить обложку |

**Фильтры для списка книг:**
- `search` - поиск по названию, автору, описанию
- `transaction_type` - тип сделки (exchange/sale/both)
- `city` - город
- `condition` - состояние

### Избранное

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/favorites/` | Список избранного |
| POST | `/api/favorites/<book_id>/` | Добавить/удалить |
| GET | `/api/favorites/check/<book_id>/` | Проверка избранного |

### Чаты

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/messages/chats/` | Список чатов |
| GET | `/api/messages/` | Сообщения с пользователем |
| POST | `/api/messages/` | Отправить сообщение |
| DELETE | `/api/messages/<id>/` | Удалить сообщение |
| POST | `/api/messages/mark-as-read/` | Отметить как прочитанное |

### Подписки

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/subscriptions/` | Мои подписки |
| POST | `/api/subscriptions/<user_id>/` | Подписаться/отписаться |
| GET | `/api/subscription-feed/` | Лента подписок |

### Оценки

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/users/<user_id>/ratings/` | Отзывы о пользователе |
| POST | `/api/users/<user_id>/rate/` | Оценить пользователя |
| POST | `/api/users/<username>/rate/` | Оценить по username |

## 🔐 Аутентификация

Используется JWT (JSON Web Tokens).

### Получение токенов

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "test12345"}'
```

### Использование токена

```bash
curl http://localhost:8000/api/profile/ \
  -H "Authorization: Bearer <access_token>"
```

## 📝 Примеры запросов

### Регистрация

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "securepass123",
    "password_confirm": "securepass123",
    "city": "Москва"
  }'
```

### Создание книги

```bash
curl -X POST http://localhost:8000/api/books/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Война и мир",
    "author": "Толстой",
    "condition": "good",
    "transaction_type": "exchange",
    "city": "Москва",
    "description": "Классика литературы"
  }'
```

### Поиск книг

```bash
curl "http://localhost:8000/api/books/?search=Толстой&city=Москва"
```

## 🧪 Тестирование

```bash
python manage.py test books
```

## 📊 Admin панель

Доступна по адресу: `http://localhost:8000/admin/`

## ⚙️ Настройки

Основные настройки в `backend/settings.py`:

- `SECRET_KEY` - секретный ключ (из .env)
- `DEBUG` - режим отладки
- `CORS_ALLOW_ALL_ORIGINS` - разрешить CORS для всех
- `SIMPLE_JWT` - настройки JWT токенов

## 📦 Зависимости

- `Django 4.2.11` - веб-фреймворк
- `djangorestframework 3.16.1` - REST API
- `djangorestframework-simplejwt 5.3.1` - JWT аутентификация
- `django-cors-headers 4.9.0` - CORS поддержка
- `Pillow 10.4.0` - работа с изображениями
- `python-dotenv 1.0.0` - переменные окружения
