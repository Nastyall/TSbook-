
from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Avg, Q
from django.shortcuts import get_object_or_404

from .models import Book, Profile, Message, Favorite, Rating, Subscription
from .serializers import (
    UserSerializer, UserRegisterSerializer, UserLoginSerializer, UserWithRatingSerializer,
    BookListSerializer, BookDetailSerializer, BookCreateUpdateSerializer,
    MessageSerializer, ProfileSerializer,
    FavoriteSerializer, RatingSerializer, RatingCreateSerializer,
    SubscriptionSerializer, SubscriptionCreateSerializer
)



# АУТЕНТИФИКАЦИЯ

class AuthCheckView(APIView):
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({'user': serializer.data})


class RegisterView(CreateAPIView):
    
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        try:
            user = User.objects.get(username=username)
            if not user.check_password(password):
                return Response(
                    {'detail': 'Неверное имя пользователя или пароль'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except User.DoesNotExist:
            return Response(
                {'detail': 'Неверное имя пользователя или пароль'},
                status=status.HTTP_400_BAD_REQUEST
            )

        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })



# ПОЛЬЗОВАТЕЛИ


class UserDetailView(RetrieveAPIView):
    """Информация о пользователе по ID"""
    queryset = User.objects.select_related('profile').all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    lookup_field = 'pk'


class UserByUsernameView(RetrieveAPIView):
    
    queryset = User.objects.select_related('profile').all()
    serializer_class = UserWithRatingSerializer
    permission_classes = [AllowAny]
    lookup_field = 'username'

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class UserBooksView(ListAPIView):
    
    serializer_class = BookListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        username = self.kwargs.get('username')
        user = get_object_or_404(User, username=username)
        
        queryset = Book.objects.filter(owner=user).select_related('owner__profile')
        
        
        status_param = self.request.query_params.get('status')
        if status_param == 'active':
            queryset = queryset.filter(is_active=True)
        elif status_param == 'completed':
            queryset = queryset.filter(is_active=False)
        
        return queryset.order_by('-created_at')



# ПРОФИЛЬ


class ProfileView(APIView):
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user.profile, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        profile = request.user.profile
        
        
        updatable_user_fields = ['first_name', 'last_name', 'email']
        for field in updatable_user_fields:
            if field in request.data:
                setattr(request.user, field, request.data[field])
        request.user.save()
        
        
        if 'avatar' in request.FILES:
            if profile.avatar:
                profile.avatar.delete(save=False)
            profile.avatar = request.FILES['avatar']
        
        
        elif request.data.get('delete_avatar') == 'true':
            if profile.avatar:
                profile.avatar.delete(save=False)
            profile.avatar = None
        
        
        updatable_fields = ['bio', 'phone', 'city', 'address']
        for field in updatable_fields:
            if field in request.data:
                setattr(profile, field, request.data[field])
        
        profile.save()
        
        
        user_serializer = UserSerializer(request.user, context={'request': request})
        serializer = ProfileSerializer(profile, context={'request': request})
        
        return Response({
            'user': user_serializer.data,
            'profile': serializer.data,
        })

    def put(self, request):
        
        profile = request.user.profile

        profile.bio = request.data.get('bio', profile.bio)
        profile.phone = request.data.get('phone', profile.phone)
        profile.city = request.data.get('city', profile.city)
        profile.address = request.data.get('address', profile.address)
        profile.save()
        
        serializer = ProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)



# КНИГИ


class BookViewSet(viewsets.ModelViewSet):
    
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Book.objects.select_related('owner__profile').filter(is_active=True)
        
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(author__icontains=search) |
                Q(description__icontains=search)
            )

        
        transaction_type = self.request.query_params.get('transaction_type')
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
        
        city = self.request.query_params.get('city')
        if city:
            queryset = queryset.filter(city__icontains=city)
        
        condition = self.request.query_params.get('condition')
        if condition:
            queryset = queryset.filter(condition=condition)
        
        return queryset.order_by('-created_at')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return BookCreateUpdateSerializer
        if self.action == 'retrieve':
            return BookDetailSerializer
        return BookListSerializer

    def get_serializer_context(self):
        
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_destroy(self, instance):
        
        instance.is_active = False
        instance.save()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_books(self, request):
        
        is_active = request.query_params.get('is_active')
        
        queryset = Book.objects.filter(owner=request.user).select_related('owner__profile')
        
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        serializer = BookListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def upload_cover(self, request, pk=None):
        
        book = self.get_object()

        if book.owner != request.user:
            return Response(
                {'detail': 'Нет прав на редактирование'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if 'cover' not in request.FILES:
            return Response(
                {'detail': 'Укажите файл обложки'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if book.cover_image:
            book.cover_image.delete(save=False)
        book.cover_image = request.FILES['cover']
        book.save()
        
        return Response({
            'detail': 'Обложка загружена',
            'cover_url': request.build_absolute_uri(book.cover_image.url)
        })



# ИЗБРАННОЕ


class FavoritesListView(ListAPIView):
    
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related(
            'book__owner__profile'
        ).order_by('-created_at')


class FavoriteToggleView(APIView):
    
    permission_classes = [IsAuthenticated]

    def post(self, request, book_id):
        book = get_object_or_404(Book, pk=book_id)
        
        favorite, created = Favorite.objects.get_or_create(
            user=request.user,
            book=book
        )

        if not created:
            favorite.delete()
            return Response({'is_favorite': False})

        return Response({'is_favorite': True}, status=status.HTTP_201_CREATED)


class FavoriteCheckView(APIView):
    
    permission_classes = [IsAuthenticated]

    def get(self, request, book_id):
        is_favorite = Favorite.objects.filter(
            user=request.user,
            book_id=book_id
        ).exists()
        return Response({'is_favorite': is_favorite})



# СООБЩЕНИЯ И ЧАТЫ


class ChatListView(APIView):
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        
        messages = Message.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).select_related(
            'sender__profile', 'receiver__profile', 'book'
        ).order_by('-created_at')

        
        seen_chats = {}
        for msg in messages:
            chat_key = (min(msg.sender_id, msg.receiver_id), max(msg.sender_id, msg.receiver_id))
            if chat_key not in seen_chats:
                seen_chats[chat_key] = msg

        
        result = []
        for msg in seen_chats.values():
            other = msg.receiver if msg.sender == user else msg.sender
            
            
            unread_count = Message.objects.filter(
                sender=other,
                receiver=user,
                is_read=False
            ).count()
            
            result.append({
                'other_user': {
                    'id': other.id,
                    'username': other.username,
                    'first_name': other.first_name,
                    'last_name': other.last_name,
                    'profile': {
                        'avatar': other.profile.avatar.url if other.profile and other.profile.avatar else None,
                        'city': other.profile.city if other.profile else None,
                    } if other.profile else None,
                },
                'last_message': msg.content,
                'last_message_time': msg.created_at.isoformat(),
                'unread_count': unread_count,
                'book': {
                    'id': msg.book.id,
                    'title': msg.book.title,
                } if msg.book else None,
            })
        
        
        result.sort(key=lambda x: x['last_message_time'], reverse=True)
        
        return Response(result)


class MessageListView(APIView):
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        other_user_id = request.query_params.get('other_user_id')
        book_id = request.query_params.get('book_id')

        if not other_user_id and not book_id:
            return Response(
                {'detail': 'Укажите other_user_id или book_id'},
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = Message.objects.filter(
            Q(sender=request.user) | Q(receiver=request.user)
        ).select_related('sender__profile', 'receiver__profile', 'book')

        if other_user_id:
            queryset = queryset.filter(
                Q(sender_id=other_user_id, receiver=request.user) |
                Q(receiver_id=other_user_id, sender=request.user)
            )
        
        if book_id:
            queryset = queryset.filter(book_id=book_id)

        
        unread = queryset.filter(receiver=request.user, is_read=False)
        unread.update(is_read=True)

        messages = queryset.order_by('created_at')[:100]
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        receiver_id = request.data.get('receiver_id')
        book_id = request.data.get('book_id')
        content = request.data.get('content', '').strip()

        if not content and 'attachment_image' not in request.FILES:
            return Response(
                {'detail': 'Текст сообщения обязателен или укажите вложение'},
                status=status.HTTP_400_BAD_REQUEST
            )

        
        if receiver_id:
            receiver = get_object_or_404(User, pk=receiver_id)
        elif book_id:
            book = get_object_or_404(Book, pk=book_id)
            receiver = book.owner
        else:
            return Response(
                {'detail': 'Укажите receiver_id или book_id'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if receiver == request.user:
            return Response(
                {'detail': 'Нельзя отправить сообщение себе'},
                status=status.HTTP_400_BAD_REQUEST
            )

        
        attachment = request.FILES.get('attachment_image')
        import logging
        logging.error(f'MSG POST: files={dict(request.FILES)}, data_keys={list(request.data.keys())}, attachment={attachment}')

        
        message = Message.objects.create(
            sender=request.user,
            receiver=receiver,
            book_id=book_id if book_id else None,
            content=content or ' '
        )

        
        if attachment:
            message.attachment_image = attachment
            message.save(update_fields=['attachment_image'])
            logging.error(f'MSG POST: saved attachment to {message.attachment_image.name}')
        else:
            logging.error(f'MSG POST: NO ATTACHMENT, message.content={message.content}')

        serializer = MessageSerializer(message, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MessageDetailView(APIView):
    
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        message = get_object_or_404(Message, pk=pk)
        
        if message.sender != request.user:
            return Response(
                {'detail': 'Нет прав на удаление'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        message.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MarkMessagesAsReadView(APIView):
    
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message_id = request.data.get('message_id')
        other_user_id = request.data.get('other_user_id')

        if message_id:
            message = get_object_or_404(Message, pk=message_id, receiver=request.user)
            message.is_read = True
            message.save(update_fields=['is_read'])
            return Response({'detail': 'Сообщение прочитано'})

        if other_user_id:
            count = Message.objects.filter(
                receiver=request.user,
                sender_id=other_user_id,
                is_read=False
            ).update(is_read=True)
            return Response({'detail': f'{count} сообщений прочитано'})

        return Response(
            {'detail': 'Укажите message_id или other_user_id'},
            status=status.HTTP_400_BAD_REQUEST
        )



# ПОДПИСКИ


class SubscriptionsListView(ListAPIView):
    """Мои подписки"""
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(
            subscriber=self.request.user
        ).select_related('subscribed_user__profile').order_by('-created_at')


class SubscriptionToggleView(APIView):
    
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        if user_id == request.user.id:
            return Response(
                {'detail': 'Нельзя подписаться на себя'},
                status=status.HTTP_400_BAD_REQUEST
            )

        subscribed_user = get_object_or_404(User, pk=user_id)

        try:
            subscription = Subscription.objects.get(
                subscriber=request.user,
                subscribed_user=subscribed_user
            )
            subscription.delete()
            return Response({'is_subscribed': False})
        except Subscription.DoesNotExist:
            Subscription.objects.create(
                subscriber=request.user,
                subscribed_user=subscribed_user
            )
            return Response({'is_subscribed': True}, status=status.HTTP_201_CREATED)


class SubscriptionCheckView(APIView):
    
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        target_user = get_object_or_404(User, username=username)
        is_subscribed = Subscription.objects.filter(
            subscriber=request.user,
            subscribed_user=target_user
        ).exists()
        return Response({'is_subscribed': is_subscribed})


class SubscriptionFeedView(ListAPIView):
    
    serializer_class = BookListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        subscribed_ids = Subscription.objects.filter(
            subscriber=self.request.user
        ).values_list('subscribed_user_id', flat=True)

        return Book.objects.filter(
            owner_id__in=subscribed_ids,
            is_active=True
        ).select_related('owner__profile').order_by('-created_at')[:20]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)



# ОЦЕНКИ И ОТЗЫВЫ


class UserRatingsView(ListAPIView):
    
    serializer_class = RatingSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        return Rating.objects.filter(
            reviewed_user_id=user_id
        ).select_related('reviewer__profile', 'book').order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        user_id = self.kwargs.get('user_id')
        avg = Rating.objects.filter(reviewed_user_id=user_id).aggregate(Avg('rating'))
        
        return Response({
            'ratings': serializer.data,
            'average_rating': round(avg['rating__avg'], 1) if avg['rating__avg'] else None,
            'count': queryset.count()
        })


class UserRatingsByUsernameView(ListAPIView):
    
    serializer_class = RatingSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        username = self.kwargs.get('username')
        user = get_object_or_404(User, username=username)
        return Rating.objects.filter(
            reviewed_user_id=user.id
        ).select_related('reviewer__profile', 'book').order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        username = self.kwargs.get('username')
        user = get_object_or_404(User, username=username)
        avg = Rating.objects.filter(reviewed_user_id=user.id).aggregate(Avg('rating'))
        
        return Response({
            'ratings': serializer.data,
            'average_rating': round(avg['rating__avg'], 1) if avg['rating__avg'] else None,
            'count': queryset.count()
        })


class UserRatingInfoView(APIView):
    
    permission_classes = [AllowAny]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        avg = Rating.objects.filter(reviewed_user_id=user.id).aggregate(Avg('rating'))
        count = Rating.objects.filter(reviewed_user_id=user.id).count()
        return Response({
            'average_rating': round(avg['rating__avg'], 1) if avg['rating__avg'] else None,
            'ratings_count': count
        })


class RatingCreateView(CreateAPIView):
    
    serializer_class = RatingCreateSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        user_id = self.kwargs.get('user_id')
        context['reviewed_user'] = get_object_or_404(User, pk=user_id)
        return context

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context=self.get_serializer_context())
        serializer.is_valid(raise_exception=True)
        rating = serializer.save()
        
        return Response(
            RatingSerializer(rating, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class RatingCreateByUsernameView(RatingCreateView):
   
    def get_serializer_context(self):
       
        context = super(CreateAPIView, self).get_serializer_context()
        username = self.kwargs.get('username')
        context['reviewed_user'] = get_object_or_404(User, username=username)
        return context

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context=self.get_serializer_context())
        serializer.is_valid(raise_exception=True)
        rating = serializer.save()
        
        return Response(
            RatingSerializer(rating, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )
