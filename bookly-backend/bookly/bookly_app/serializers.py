from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Book, Genre, UserProfile, Bookshelf, Review, 
    ExchangeOffer, ExchangeRequest, Discussion, 
    Comment, SupportTicket, TicketReply
)

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'is_staff')
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ('id', 'username', 'email', 'full_name', 'birth_date', 'profile_picture')

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ('id', 'name')

class BookSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)
    average_rating = serializers.ReadOnlyField()
    
    class Meta:
        model = Book
        fields = ('id', 'title', 'author', 'description', 'isbn', 'cover_image', 
                  'publication_date', 'genres', 'created_at', 'average_rating')

class BookshelfSerializer(serializers.ModelSerializer):
    books = BookSerializer(many=True, read_only=True)
    
    class Meta:
        model = Bookshelf
        fields = ('id', 'name', 'user', 'books', 'created_at')

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Review
        fields = ('id', 'book', 'user', 'username', 'title', 'content', 'rating', 'created_at', 'updated_at')

class ExchangeOfferSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    
    class Meta:
        model = ExchangeOffer
        fields = ('id', 'book', 'book_title', 'owner', 'owner_username', 'condition', 
                  'exchange_type', 'price', 'exchange_preferences', 'status', 'created_at')

class ExchangeRequestSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='offer.book.title', read_only=True)
    requester_username = serializers.CharField(source='requester.username', read_only=True)
    
    class Meta:
        model = ExchangeRequest
        fields = ('id', 'offer', 'book_title', 'requester', 'requester_username', 
                  'message', 'status', 'created_at')

class DiscussionSerializer(serializers.ModelSerializer):
    creator_username = serializers.CharField(source='created_by.username', read_only=True)
    book_title = serializers.CharField(source='book.title', read_only=True)
    
    class Meta:
        model = Discussion
        fields = ('id', 'title', 'created_by', 'creator_username', 'book', 'book_title', 
                  'content', 'created_at')

class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    likes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ('id', 'discussion', 'user', 'username', 'content', 'created_at', 'likes_count')
    
    def get_likes_count(self, obj):
        return obj.likes.count()

class SupportTicketSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = SupportTicket
        fields = ('id', 'user', 'username', 'subject', 'message', 'status', 'created_at')

class TicketReplySerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = TicketReply
        fields = ('id', 'ticket', 'user', 'username', 'message', 'created_at')
