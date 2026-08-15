from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class Profile(models.Model):

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, null=True, verbose_name='О себе')
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='Телефон')
    city = models.CharField(max_length=100, blank=True, null=True, verbose_name='Город')
    address = models.TextField(blank=True, null=True, verbose_name='Адрес')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name='Аватар')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')

    class Meta:
        verbose_name = 'Профиль'
        verbose_name_plural = 'Профили'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['city']),
        ]

    def __str__(self):
        return f"Профиль {self.user.username}"

    @property
    def average_rating(self):
        
        ratings = self.user.received_ratings.all()
        if ratings.exists():
            return round(sum(r.rating for r in ratings) / ratings.count(), 2)
        return None


class Book(models.Model):
    
    
    CONDITION_CHOICES = [
        ('new', 'Новое'),
        ('excellent', 'Отличное'),
        ('good', 'Хорошее'),
        ('satisfactory', 'Удовлетворительное'),
        ('poor', 'Плохое'),
    ]

    TRANSACTION_CHOICES = [
        ('exchange', 'Обмен'),
        ('sale', 'Продажа'),
        ('both', 'И то, и другое'),
    ]

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='books', verbose_name='Владелец')
    title = models.CharField(max_length=200, verbose_name='Название')
    author = models.CharField(max_length=200, verbose_name='Автор')
    description = models.TextField(blank=True, null=True, verbose_name='Описание')
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, verbose_name='Состояние')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_CHOICES, verbose_name='Тип сделки')
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, verbose_name='Цена')
    city = models.CharField(max_length=100, verbose_name='Город')
    cover_image = models.ImageField(upload_to='book_covers/', blank=True, null=True, verbose_name='Обложка')
    
    exchange_for = models.CharField(max_length=200, blank=True, null=True, verbose_name='Что хочу получить')
    exchange_author = models.CharField(max_length=200, blank=True, null=True, verbose_name='Желаемый автор')
    exchange_genre = models.CharField(max_length=200, blank=True, null=True, verbose_name='Желаемый жанр')
    
    publisher = models.CharField(max_length=200, blank=True, null=True, verbose_name='Издательство')
    year = models.PositiveIntegerField(blank=True, null=True, verbose_name='Год издания')
    pages = models.PositiveIntegerField(blank=True, null=True, verbose_name='Количество страниц')
    isbn = models.CharField(max_length=20, blank=True, null=True, verbose_name='ISBN')
    address = models.TextField(blank=True, null=True, verbose_name='Адрес')

    is_active = models.BooleanField(default=True, verbose_name='Активно')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')

    class Meta:
        verbose_name = 'Книга'
        verbose_name_plural = 'Книги'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['owner']),
            models.Index(fields=['city']),
            models.Index(fields=['is_active']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['transaction_type']),
            models.Index(fields=['condition']),
        ]

    def __str__(self):
        return f"{self.title} by {self.author}"

    @property
    def average_rating(self):
        
        from django.db.models import Avg
        from .models import Rating
        result = Rating.objects.filter(book=self).aggregate(avg=Avg('rating'))
        return result['avg'] or 0


class Message(models.Model):
    
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages', verbose_name='Отправитель')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages', verbose_name='Получатель')
    book = models.ForeignKey('Book', on_delete=models.SET_NULL, blank=True, null=True, related_name='messages', verbose_name='Книга')
    content = models.TextField(verbose_name='Текст сообщения')
    attachment_image = models.ImageField(upload_to='message_attachments/', blank=True, null=True, verbose_name='Вложение')
    is_read = models.BooleanField(default=False, verbose_name='Прочитано')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата отправки')

    class Meta:
        verbose_name = 'Сообщение'
        verbose_name_plural = 'Сообщения'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['sender', 'receiver']),
            models.Index(fields=['receiver', 'is_read']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"От {self.sender} к {self.receiver}"


class Favorite(models.Model):
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites', verbose_name='Пользователь')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, verbose_name='Книга')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата добавления')

    class Meta:
        verbose_name = 'Избранное'
        verbose_name_plural = 'Избранное'
        unique_together = ['user', 'book']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['book']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.book.title}"


class Rating(models.Model):
    
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_ratings', verbose_name='Оценивший')
    reviewed_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_ratings', verbose_name='Оценённый')
    book = models.ForeignKey(Book, on_delete=models.SET_NULL, blank=True, null=True, verbose_name='Книга')
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='Оценка'
    )
    comment = models.TextField(blank=True, null=True, verbose_name='Комментарий')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата оценки')

    class Meta:
        verbose_name = 'Оценка'
        verbose_name_plural = 'Оценки'
        unique_together = ['reviewer', 'reviewed_user', 'book']
        indexes = [
            models.Index(fields=['reviewer']),
            models.Index(fields=['reviewed_user']),
            models.Index(fields=['book']),
        ]

    def __str__(self):
        return f"{self.reviewer.username} -> {self.reviewed_user.username}: {self.rating}"


class Subscription(models.Model):
    
    subscriber = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions', verbose_name='Подписчик')
    subscribed_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscribers', verbose_name='Подписанный')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата подписки')

    class Meta:
        verbose_name = 'Подписка'
        verbose_name_plural = 'Подписки'
        unique_together = ['subscriber', 'subscribed_user']
        indexes = [
            models.Index(fields=['subscriber']),
            models.Index(fields=['subscribed_user']),
        ]

    def __str__(self):
        return f"{self.subscriber} -> {self.subscribed_user}"
