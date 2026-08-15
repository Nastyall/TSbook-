from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
from .views import (
    # Auth
    AuthCheckView, RegisterView, LoginView,
    # Users
    UserDetailView, UserByUsernameView, UserBooksView,
    # Profile
    ProfileView,
    # Books
    BookViewSet,
    # Favorites
    FavoritesListView, FavoriteToggleView, FavoriteCheckView,
    # Messages
    ChatListView, MessageListView, MessageDetailView, MarkMessagesAsReadView,
    # Subscriptions
    SubscriptionsListView, SubscriptionToggleView, SubscriptionFeedView, SubscriptionCheckView,
    # Ratings
    UserRatingsView, RatingCreateView, RatingCreateByUsernameView,
    UserRatingsByUsernameView, UserRatingInfoView,
)

router = DefaultRouter()
router.register(r'books', BookViewSet, basename='book')

urlpatterns = [
    # Auth
    path('auth/check/', AuthCheckView.as_view(), name='auth-check'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # Users
    path('users/<int:user_id>/', UserDetailView.as_view(), name='user-detail'),
    path('users/<str:username>/', UserByUsernameView.as_view(), name='user-by-username'),
    path('users/<str:username>/books/', UserBooksView.as_view(), name='user-books'),
    
    # Profile
    path('profile/', ProfileView.as_view(), name='profile'),
    
    # Favorites
    path('favorites/', FavoritesListView.as_view(), name='favorites'),
    path('favorites/<int:book_id>/', FavoriteToggleView.as_view(), name='favorite-toggle'),
    path('favorites/check/<int:book_id>/', FavoriteCheckView.as_view(), name='favorite-check'),
    
    # Messages
    path('messages/', MessageListView.as_view(), name='messages'),
    path('messages/chats/', ChatListView.as_view(), name='chats'),
    path('messages/<int:pk>/', MessageDetailView.as_view(), name='message-detail'),
    path('messages/mark-as-read/', MarkMessagesAsReadView.as_view(), name='mark-as-read'),
    
    # Subscriptions
    path('subscriptions/', SubscriptionsListView.as_view(), name='subscriptions'),
    path('subscriptions/<int:user_id>/', SubscriptionToggleView.as_view(), name='subscription-toggle'),
    path('users/<str:username>/subscribe/', SubscriptionCheckView.as_view(), name='subscription-check'),
    path('subscription-feed/', SubscriptionFeedView.as_view(), name='subscription-feed'),
    
    # Ratings
    path('users/<int:user_id>/ratings/', UserRatingsView.as_view(), name='user-ratings'),
    path('users/<str:username>/ratings/', UserRatingsByUsernameView.as_view(), name='user-ratings-by-username'),
    path('users/<str:username>/rating-info/', UserRatingInfoView.as_view(), name='user-rating-info'),
    path('users/<int:user_id>/rate/', RatingCreateView.as_view(), name='rate-user'),
    path('users/<str:username>/rate/', RatingCreateByUsernameView.as_view(), name='rate-user-by-username'),
    
    # Router (books)
    path('', include(router.urls)),
]