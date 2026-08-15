from rest_framework import serializers
from django.contrib.auth.models import User
from django.db.models import Avg
from .models import Profile, Book, Message, Favorite, Rating, Subscription


def get_image_url(obj, field_name):
    """Утилита для получения абсолютного URL изображения"""
    image = getattr(obj, field_name, None)
    if image:
        request = serializers.CurrentUserDefault()
        return image.url
    return None


class ProfileSerializer(serializers.ModelSerializer):
   
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    avatar_url = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    ratings_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = [
            'id', 'username', 'email', 'avatar', 'avatar_url', 'bio', 'phone',
            'city', 'address', 'created_at', 'average_rating', 'ratings_count'
        ]
        read_only_fields = ['id', 'username', 'email', 'created_at', 'average_rating', 'ratings_count']
    
    def get_avatar(self, obj):
        
        return self.get_avatar_url(obj)
    
    def get_avatar_url(self, obj):
        
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None
    
    def get_average_rating(self, obj):
        
        ratings = obj.user.received_ratings.all()
        if ratings.exists():
            return round(sum(r.rating for r in ratings) / ratings.count(), 2)
        return None

    def get_ratings_count(self, obj):
        
        return obj.user.received_ratings.count()


class BookOwnerSerializer(serializers.Serializer):
    
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True)
    first_name = serializers.CharField(read_only=True)
    last_name = serializers.CharField(read_only=True)
    profile = ProfileSerializer(read_only=True)
    average_rating = serializers.SerializerMethodField()

    def get_average_rating(self, obj):
        ratings = obj.received_ratings.all()
        if ratings.exists():
            return round(sum(r.rating for r in ratings) / ratings.count(), 2)
        return None
    

class BookBaseSerializer(serializers.ModelSerializer):
   
    owner = BookOwnerSerializer(read_only=True)
    owner_id = serializers.ReadOnlyField(source='owner.id')
    condition_display = serializers.CharField(source='get_condition_display', read_only=True)
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    cover_image_url = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Book
        fields = [
            'id', 'author', 'title', 'description', 'condition', 'condition_display',
            'transaction_type', 'transaction_type_display', 'price', 'exchange_for',
            'exchange_author', 'exchange_genre', 'publisher', 'year', 'pages', 'isbn',
            'city', 'address', 'cover_image_url', 'owner', 'owner_id', 'created_at',
            'is_active', 'average_rating'
        ]
        read_only_fields = ['owner', 'owner_id', 'created_at', 'is_active']

    def get_cover_image_url(self, obj):
        
        if obj.cover_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cover_image.url)
            return obj.cover_image.url
        return None

    def get_average_rating(self, obj):
       
        result = Rating.objects.filter(book=obj).aggregate(avg=Avg('rating'))
        return result['avg'] or 0


class BookListSerializer(BookBaseSerializer):
    
    class Meta(BookBaseSerializer.Meta):
        pass


class BookDetailSerializer(BookBaseSerializer):
    
    
    class Meta(BookBaseSerializer.Meta):
        pass


class BookCreateUpdateSerializer(BookBaseSerializer):
    
    cover_image = serializers.ImageField(write_only=True, required=False, allow_null=True)
    
    class Meta(BookBaseSerializer.Meta):
        fields = BookBaseSerializer.Meta.fields + ['cover_image']
        extra_kwargs = {
            'cover_image_url': {'read_only': True},
        }


class MessageSerializer(serializers.ModelSerializer):
    
    sender_username = serializers.ReadOnlyField(source='sender.username')
    receiver_username = serializers.ReadOnlyField(source='receiver.username')
    sender_avatar = serializers.SerializerMethodField()
    book_details = serializers.SerializerMethodField()
    attachment_url = serializers.SerializerMethodField()
    attachment_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'sender_username', 'sender_avatar', 'receiver', 
            'receiver_username', 'book', 'book_details', 'content', 
            'attachment_url', 'attachment_image', 'is_read', 'created_at'
        ]
        read_only_fields = ['sender', 'is_read', 'created_at']

    def get_sender_avatar(self, obj):
        
        if hasattr(obj.sender, 'profile') and obj.sender.profile.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.sender.profile.avatar.url)
        return None

    def get_book_details(self, obj):
        
        if obj.book:
            cover_url = None
            if obj.book.cover_image:
                request = self.context.get('request')
                if request:
                    cover_url = request.build_absolute_uri(obj.book.cover_image.url)
            return {
                'id': obj.book.id,
                'title': obj.book.title,
                'author': obj.book.author,
                'cover_url': cover_url,
            }
        return None

    def get_attachment_url(self, obj):
        
        if obj.attachment_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.attachment_image.url)
        return None

    def get_attachment_image(self, obj):
        
        if obj.attachment_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.attachment_image.url)
        return None


class ChatSerializer(serializers.Serializer):
    
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    last_message_time = serializers.DateTimeField()
    unread_count = serializers.IntegerField()
    book = serializers.SerializerMethodField()

    def get_other_user(self, obj):
       
        user = self.context.get('request').user
        other = obj.receiver if obj.sender == user else obj.sender
        avatar_url = None
        if hasattr(other, 'profile') and other.profile.avatar:
            request = self.context.get('request')
            if request:
                avatar_url = request.build_absolute_uri(other.profile.avatar.url)
        return {
            'id': other.id,
            'username': other.username,
            'avatar_url': avatar_url,
        }

    def get_last_message(self, obj):
        
        return obj.content[:50] + ('...' if len(obj.content) > 50 else '')

    def get_book(self, obj):
        
        if obj.book:
            return {
                'id': obj.book.id,
                'title': obj.book.title,
            }
        return None


class FavoriteSerializer(serializers.ModelSerializer):
    
    book = BookListSerializer(read_only=True)
    
    class Meta:
        model = Favorite
        fields = ['id', 'book', 'created_at']
        read_only_fields = ['user']


class UserSerializer(serializers.ModelSerializer):
   
    profile = ProfileSerializer(read_only=True)
    active_books_count = serializers.SerializerMethodField()
    completed_books_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile', 'active_books_count', 'completed_books_count']
    
    def get_active_books_count(self, obj):
        return obj.books.filter(is_active=True).count()

    def get_completed_books_count(self, obj):
        return obj.books.filter(is_active=False).count()


class UserRegisterSerializer(serializers.ModelSerializer):
    
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    city = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'city']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password': 'Пароли не совпадают'})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        city = validated_data.pop('city', '')
        user = User.objects.create_user(**validated_data)
        Profile.objects.create(user=user, city=city or '')
        return user


class UserLoginSerializer(serializers.Serializer):
    
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class RatingSerializer(serializers.ModelSerializer):
    
    reviewer_username = serializers.ReadOnlyField(source='reviewer.username')
    reviewer_avatar = serializers.SerializerMethodField()
    reviewer_details = serializers.SerializerMethodField()
    book_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Rating
        fields = [
            'id', 'reviewer', 'reviewer_username', 'reviewer_avatar', 'reviewer_details',
            'reviewed_user', 'rating', 'comment', 'book', 'book_details', 'created_at'
        ]
        read_only_fields = ['reviewer', 'created_at']

    def get_reviewer_avatar(self, obj):
        
        if hasattr(obj.reviewer, 'profile') and obj.reviewer.profile.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.reviewer.profile.avatar.url)
        return None

    def get_reviewer_details(self, obj):
       
        return {
            'id': obj.reviewer.id,
            'username': obj.reviewer.username,
            'avatar': self.get_reviewer_avatar(obj),
        }

    def get_book_details(self, obj):
        
        if obj.book:
            return {
                'id': obj.book.id,
                'title': obj.book.title,
                'author': obj.book.author,
            }
        return None


class RatingCreateSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Rating
        fields = ['rating', 'comment', 'book']
    
    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError('Оценка должна быть от 1 до 5')
        return value
    
    def validate(self, data):
        request = self.context.get('request')
        reviewed_user = data.get('reviewed_user') or self.context.get('reviewed_user')
        book = data.get('book')
        
        if not reviewed_user:
            raise serializers.ValidationError({'reviewed_user': 'Укажите пользователя для оценки'})
        
        if request.user == reviewed_user:
            raise serializers.ValidationError({'reviewed_user': 'Нельзя оценить себя'})
        
        
        existing = Rating.objects.filter(
            reviewer=request.user,
            reviewed_user=reviewed_user,
            book=book
        )
        if existing.exists():
            raise serializers.ValidationError('Вы уже оставляли такой отзыв')
        
        return data
    
    def create(self, validated_data):
        request = self.context.get('request')
        reviewed_user = self.context.get('reviewed_user')
        return Rating.objects.create(
            reviewer=request.user,
            reviewed_user=reviewed_user,
            **validated_data
        )


class UserWithRatingSerializer(serializers.ModelSerializer):
    
    profile = ProfileSerializer(read_only=True)
    average_rating = serializers.SerializerMethodField()
    ratings_count = serializers.SerializerMethodField()
    active_books_count = serializers.SerializerMethodField()
    completed_books_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'profile', 'average_rating', 'ratings_count',
            'active_books_count', 'completed_books_count', 'date_joined'
        ]
    
    def get_average_rating(self, obj):
        
        ratings = obj.received_ratings.all()
        if ratings.exists():
            return round(sum(r.rating for r in ratings) / ratings.count(), 2)
        return None
    
    def get_ratings_count(self, obj):
        
        return obj.received_ratings.count()

    def get_active_books_count(self, obj):
        
        return obj.books.filter(is_active=True).count()

    def get_completed_books_count(self, obj):
        
        return obj.books.filter(is_active=False).count()


class SubscriptionSerializer(serializers.ModelSerializer):
    
    subscribed_user = UserWithRatingSerializer(read_only=True)
    
    class Meta:
        model = Subscription
        fields = ['id', 'subscribed_user', 'created_at']
        read_only_fields = ['subscriber', 'created_at']


class SubscriptionCreateSerializer(serializers.Serializer):
    
    
    def validate(self, data):
        request = self.context.get('request')
        subscribed_user = data.get('subscribed_user') or self.context.get('subscribed_user')
        
        if not subscribed_user:
            raise serializers.ValidationError({'subscribed_user': 'Укажите пользователя'})
        
        if request.user == subscribed_user:
            raise serializers.ValidationError({'subscribed_user': 'Нельзя подписаться на себя'})
        
        if Subscription.objects.filter(subscriber=request.user, subscribed_user=subscribed_user).exists():
            raise serializers.ValidationError({'subscribed_user': 'Вы уже подписаны'})
        
        return data
    
    def create(self, validated_data):
        request = self.context.get('request')
        subscribed_user = self.context.get('subscribed_user')
        return Subscription.objects.create(
            subscriber=request.user,
            subscribed_user=subscribed_user
        )