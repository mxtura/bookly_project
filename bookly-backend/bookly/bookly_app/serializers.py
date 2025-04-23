from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Book, Genre, Author, UserProfile, Bookshelf, Review, 
    ExchangeOffer, ExchangeRequest, Discussion, 
    Comment, SupportTicket, TicketReply
)

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ['id', 'name', 'bio', 'birth_date', 'death_date', 'photo']

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name']

class BookSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.name', read_only=True)
    genres = GenreSerializer(many=True, read_only=True)
    
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'author_name', 'description', 'isbn', 
                  'cover_image', 'publication_date', 'genres', 'average_rating']
    
    def create(self, validated_data):
        # Get the author data from validated_data
        author_id = validated_data.get('author')
        
        # If author_id is a string (name), try to find or create the author
        if isinstance(author_id, str):
            try:
                author, created = Author.objects.get_or_create(name=author_id)
                validated_data['author'] = author
            except Exception as e:
                raise serializers.ValidationError(f"Error with author: {str(e)}")
                
        # Get genres data if present
        genres_data = self.initial_data.get('genres', [])
        
        # Create the book instance
        book = Book.objects.create(**validated_data)
        
        # Add genres if provided
        if genres_data:
            for genre_id in genres_data:
                if isinstance(genre_id, int):
                    try:
                        genre = Genre.objects.get(id=genre_id)
                        book.genres.add(genre)
                    except Genre.DoesNotExist:
                        pass
        
        return book
    
    def update(self, instance, validated_data):
        # Update basic fields
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.isbn = validated_data.get('isbn', instance.isbn)
        instance.publication_date = validated_data.get('publication_date', instance.publication_date)
        
        # Update author if provided
        author_id = validated_data.get('author')
        if author_id:
            try:
                if isinstance(author_id, str):
                    author, created = Author.objects.get_or_create(name=author_id)
                    instance.author = author
                elif isinstance(author_id, int):
                    author = Author.objects.get(id=author_id)
                    instance.author = author
            except Author.DoesNotExist:
                pass
        
        # Update genres if provided in the request data
        genres_data = self.initial_data.get('genres')
        if genres_data is not None:
            instance.genres.clear()
            for genre_id in genres_data:
                if isinstance(genre_id, int):
                    try:
                        genre = Genre.objects.get(id=genre_id)
                        instance.genres.add(genre)
                    except Genre.DoesNotExist:
                        pass
        
        instance.save()
        return instance

# Create a simplified BookSerializer for use in nested relationships
class SimpleBookSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.name', read_only=True)
    
    class Meta:
        model = Book
        fields = ['id', 'title', 'author_name', 'cover_image']

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

class BookshelfSerializer(serializers.ModelSerializer):
    # Use the SimpleBookSerializer for listing books in a bookshelf to reduce payload size
    books = SimpleBookSerializer(many=True, read_only=True)
    
    class Meta:
        model = Bookshelf
        fields = ['id', 'name', 'user', 'books', 'created_at']
        read_only_fields = ['user']
    
    def create(self, validated_data):
        # Automatically set the user from the request
        user = self.context['request'].user
        bookshelf = Bookshelf.objects.create(user=user, **validated_data)
        return bookshelf

# This is critical for updating the books in a bookshelf
class BookshelfBooksUpdateSerializer(serializers.ModelSerializer):
    books = serializers.PrimaryKeyRelatedField(
        queryset=Book.objects.all(), 
        many=True, 
        required=True
    )
    
    class Meta:
        model = Bookshelf
        fields = ['books']
    
    def update(self, instance, validated_data):
        # Replace the books in the bookshelf with the provided list
        if 'books' in validated_data:
            # Log for debugging
            print(f"Updating books for bookshelf {instance.id}. Books: {validated_data['books']}")
            instance.books.set(validated_data['books'])
        
        instance.save()
        return instance

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
    book_id = serializers.IntegerField(source='book.id', read_only=True)
    book_title = serializers.CharField(source='book.title', read_only=True)
    author_id = serializers.IntegerField(source='author.id', read_only=True)  # Добавляем
    author_name = serializers.CharField(source='author.name', read_only=True) # Добавляем
    creator_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Discussion
        fields = (
            'id', 'title', 'created_by', 'creator_username',
            'book_id', 'book_title', 'author_id', 'author_name',
            'content', 'created_at'
        )

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