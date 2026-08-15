
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('books', '0003_alter_message_book'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='profile',
            options={'verbose_name': 'Профиль', 'verbose_name_plural': 'Профили'},
        ),
        migrations.AlterField(
            model_name='message',
            name='book',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='messages', to='books.book', verbose_name='Книга'),
        ),
        migrations.AlterField(
            model_name='rating',
            name='rating',
            field=models.IntegerField(validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(5)], verbose_name='Оценка'),
        ),
        migrations.AddIndex(
            model_name='book',
            index=models.Index(fields=['owner'], name='books_book_owner_i_9ce4a9_idx'),
        ),
        migrations.AddIndex(
            model_name='book',
            index=models.Index(fields=['city'], name='books_book_city_cf5625_idx'),
        ),
        migrations.AddIndex(
            model_name='book',
            index=models.Index(fields=['is_active'], name='books_book_is_acti_d03df1_idx'),
        ),
        migrations.AddIndex(
            model_name='book',
            index=models.Index(fields=['-created_at'], name='books_book_created_ea3fe5_idx'),
        ),
        migrations.AddIndex(
            model_name='book',
            index=models.Index(fields=['transaction_type'], name='books_book_transac_91c861_idx'),
        ),
        migrations.AddIndex(
            model_name='book',
            index=models.Index(fields=['condition'], name='books_book_conditi_b8b9d7_idx'),
        ),
        migrations.AddIndex(
            model_name='favorite',
            index=models.Index(fields=['user'], name='books_favor_user_id_9a5a0e_idx'),
        ),
        migrations.AddIndex(
            model_name='favorite',
            index=models.Index(fields=['book'], name='books_favor_book_id_f51fb6_idx'),
        ),
        migrations.AddIndex(
            model_name='message',
            index=models.Index(fields=['sender', 'receiver'], name='books_messa_sender__1cb991_idx'),
        ),
        migrations.AddIndex(
            model_name='message',
            index=models.Index(fields=['receiver', 'is_read'], name='books_messa_receive_e149f7_idx'),
        ),
        migrations.AddIndex(
            model_name='message',
            index=models.Index(fields=['-created_at'], name='books_messa_created_e04c10_idx'),
        ),
        migrations.AddIndex(
            model_name='profile',
            index=models.Index(fields=['user'], name='books_profi_user_id_d6ef34_idx'),
        ),
        migrations.AddIndex(
            model_name='profile',
            index=models.Index(fields=['city'], name='books_profi_city_9a8345_idx'),
        ),
        migrations.AddIndex(
            model_name='rating',
            index=models.Index(fields=['reviewer'], name='books_ratin_reviewe_60bf0f_idx'),
        ),
        migrations.AddIndex(
            model_name='rating',
            index=models.Index(fields=['reviewed_user'], name='books_ratin_reviewe_cf2224_idx'),
        ),
        migrations.AddIndex(
            model_name='rating',
            index=models.Index(fields=['book'], name='books_ratin_book_id_7cff32_idx'),
        ),
        migrations.AddIndex(
            model_name='subscription',
            index=models.Index(fields=['subscriber'], name='books_subsc_subscri_f08862_idx'),
        ),
        migrations.AddIndex(
            model_name='subscription',
            index=models.Index(fields=['subscribed_user'], name='books_subsc_subscri_a2db4a_idx'),
        ),
    ]
