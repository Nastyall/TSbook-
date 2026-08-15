
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Book',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200, verbose_name='Название')),
                ('author', models.CharField(max_length=200, verbose_name='Автор')),
                ('description', models.TextField(blank=True, null=True, verbose_name='Описание')),
                ('condition', models.CharField(choices=[('new', 'Новое'), ('excellent', 'Отличное'), ('good', 'Хорошее'), ('satisfactory', 'Удовлетворительное'), ('poor', 'Плохое')], max_length=20, verbose_name='Состояние')),
                ('transaction_type', models.CharField(choices=[('exchange', 'Обмен'), ('sale', 'Продажа'), ('both', 'И то, и другое')], max_length=20, verbose_name='Тип сделки')),
                ('price', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True, verbose_name='Цена')),
                ('city', models.CharField(max_length=100, verbose_name='Город')),
                ('cover_image', models.ImageField(blank=True, null=True, upload_to='book_covers/', verbose_name='Обложка')),
                ('exchange_for', models.CharField(blank=True, max_length=200, null=True, verbose_name='Что хочу получить')),
                ('exchange_author', models.CharField(blank=True, max_length=200, null=True, verbose_name='Желаемый автор')),
                ('exchange_genre', models.CharField(blank=True, max_length=200, null=True, verbose_name='Желаемый жанр')),
                ('is_active', models.BooleanField(default=True, verbose_name='Активно')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='books', to=settings.AUTH_USER_MODEL, verbose_name='Владелец')),
            ],
            options={
                'verbose_name': 'Книга',
                'verbose_name_plural': 'Книги',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('bio', models.TextField(blank=True, null=True, verbose_name='О себе')),
                ('phone', models.CharField(blank=True, max_length=20, null=True, verbose_name='Телефон')),
                ('city', models.CharField(blank=True, max_length=100, null=True, verbose_name='Город')),
                ('address', models.TextField(blank=True, null=True, verbose_name='Адрес')),
                ('avatar', models.ImageField(blank=True, null=True, upload_to='avatars/', verbose_name='Аватар')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField(verbose_name='Текст сообщения')),
                ('attachment_image', models.ImageField(blank=True, null=True, upload_to='message_attachments/', verbose_name='Вложение')),
                ('is_read', models.BooleanField(default=False, verbose_name='Прочитано')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата отправки')),
                ('book', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='books.book', verbose_name='Книга')),
                ('receiver', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='received_messages', to=settings.AUTH_USER_MODEL, verbose_name='Получатель')),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sent_messages', to=settings.AUTH_USER_MODEL, verbose_name='Отправитель')),
            ],
            options={
                'verbose_name': 'Сообщение',
                'verbose_name_plural': 'Сообщения',
                'ordering': ['created_at'],
            },
        ),
        migrations.CreateModel(
            name='Subscription',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата подписки')),
                ('subscribed_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subscribers', to=settings.AUTH_USER_MODEL, verbose_name='Подписанный')),
                ('subscriber', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subscriptions', to=settings.AUTH_USER_MODEL, verbose_name='Подписчик')),
            ],
            options={
                'verbose_name': 'Подписка',
                'verbose_name_plural': 'Подписки',
                'unique_together': {('subscriber', 'subscribed_user')},
            },
        ),
        migrations.CreateModel(
            name='Rating',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rating', models.IntegerField(choices=[(1, '1'), (2, '2'), (3, '3'), (4, '4'), (5, '5')], verbose_name='Оценка')),
                ('comment', models.TextField(blank=True, null=True, verbose_name='Комментарий')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата оценки')),
                ('book', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='books.book', verbose_name='Книга')),
                ('reviewed_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='received_ratings', to=settings.AUTH_USER_MODEL, verbose_name='Оценённый')),
                ('reviewer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='given_ratings', to=settings.AUTH_USER_MODEL, verbose_name='Оценивший')),
            ],
            options={
                'verbose_name': 'Оценка',
                'verbose_name_plural': 'Оценки',
                'unique_together': {('reviewer', 'reviewed_user', 'book')},
            },
        ),
        migrations.CreateModel(
            name='Favorite',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата добавления')),
                ('book', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='books.book', verbose_name='Книга')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='favorites', to=settings.AUTH_USER_MODEL, verbose_name='Пользователь')),
            ],
            options={
                'verbose_name': 'Избранное',
                'verbose_name_plural': 'Избранное',
                'unique_together': {('user', 'book')},
            },
        ),
    ]
