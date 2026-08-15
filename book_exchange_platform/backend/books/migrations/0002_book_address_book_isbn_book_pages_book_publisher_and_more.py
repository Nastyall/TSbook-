
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('books', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='book',
            name='address',
            field=models.TextField(blank=True, null=True, verbose_name='Адрес'),
        ),
        migrations.AddField(
            model_name='book',
            name='isbn',
            field=models.CharField(blank=True, max_length=20, null=True, verbose_name='ISBN'),
        ),
        migrations.AddField(
            model_name='book',
            name='pages',
            field=models.PositiveIntegerField(blank=True, null=True, verbose_name='Количество страниц'),
        ),
        migrations.AddField(
            model_name='book',
            name='publisher',
            field=models.CharField(blank=True, max_length=200, null=True, verbose_name='Издательство'),
        ),
        migrations.AddField(
            model_name='book',
            name='year',
            field=models.PositiveIntegerField(blank=True, null=True, verbose_name='Год издания'),
        ),
    ]
