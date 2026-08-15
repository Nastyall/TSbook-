from django.contrib import admin
from .models import Profile, Book, Message, Favorite, Rating, Subscription


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'city', 'phone', 'created_at']
    search_fields = ['user__username', 'user__email', 'city']
    list_filter = ['city', 'created_at']


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'owner', 'city', 'price', 'condition', 'transaction_type', 'is_active', 'created_at']
    list_filter = ['condition', 'transaction_type', 'is_active', 'city', 'created_at']
    search_fields = ['title', 'author', 'description', 'owner__username']
    readonly_fields = ['created_at']
    list_editable = ['is_active']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'receiver', 'book', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['sender__username', 'receiver__username', 'content']
    readonly_fields = ['created_at']


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'book', 'created_at']
    search_fields = ['user__username', 'book__title']
    list_filter = ['created_at']


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ['reviewer', 'reviewed_user', 'book', 'rating', 'created_at']
    search_fields = ['reviewer__username', 'reviewed_user__username', 'comment']
    list_filter = ['rating', 'created_at']
    readonly_fields = ['created_at']


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['subscriber', 'subscribed_user', 'created_at']
    search_fields = ['subscriber__username', 'subscribed_user__username']
    list_filter = ['created_at']
    readonly_fields = ['created_at']
