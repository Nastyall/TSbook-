
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('books', '0002_book_address_book_isbn_book_pages_book_publisher_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='book',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='books.book', verbose_name='Книга'),
        ),
    ]
