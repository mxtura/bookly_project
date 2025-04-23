from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from django.db.models import Avg, Count
import logging
from .models import (
    Author, Book, Genre, UserProfile, Bookshelf, Review, 
    ExchangeOffer, ExchangeRequest, Discussion, 
    Comment, SupportTicket, TicketReply
)
from .serializers import (
    AuthorSerializer, UserSerializer, UserProfileSerializer, BookSerializer, GenreSerializer, 
    BookshelfSerializer, ReviewSerializer, ExchangeOfferSerializer, 
    ExchangeRequestSerializer, DiscussionSerializer, CommentSerializer,
    SupportTicketSerializer, TicketReplySerializer, BookshelfBooksUpdateSerializer
)

logger = logging.getLogger(__name__)

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user
        elif hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        elif hasattr(obj, 'requester'):
            return obj.requester == request.user
        
        return False

class AuthorViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    
    def create(self, request, *args, **kwargs):
        # Log the incoming data
        logger.debug(f"Creating author with data: {request.data}")
        
        # Call the parent class create method
        response = super().create(request, *args, **kwargs)
        
        # Log the created author
        logger.debug(f"Created author: {response.data}")
        return response

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    # Override default permission classes for specific actions
    def get_permissions(self):
        if self.action == 'create':  # For user registration
            permission_classes = [permissions.AllowAny]
        elif self.action == 'me':  # For getting user profile
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return UserProfile.objects.all()
        return UserProfile.objects.filter(user=self.request.user)

class GenreViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all().select_related('author').prefetch_related('genres')
    serializer_class = BookSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'author__name', 'isbn']
    
    def create(self, request, *args, **kwargs):
        # Log the incoming data
        logger.debug(f"Creating book with data: {request.data}")
        
        # Check if author is provided
        author_data = request.data.get('author')
        if not author_data:
            return Response(
                {"author": ["This field is required."]}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Try to get the author by ID or create by name
        try:
            if isinstance(author_data, int):
                author = Author.objects.get(id=author_data)
            else:
                author, created = Author.objects.get_or_create(name=author_data)
                request.data['author'] = author.id
                if created:
                    logger.info(f"Created new author: {author.name}")
        except Exception as e:
            logger.error(f"Error processing author: {str(e)}")
            return Response(
                {"author": [f"Error processing author: {str(e)}"]},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Call the parent create method
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        # Log the incoming data
        logger.debug(f"Updating book {kwargs.get('pk')} with data: {request.data}")
        
        # Check if author is being updated
        author_data = request.data.get('author')
        if author_data:
            # Try to get the author by ID or create by name
            try:
                if isinstance(author_data, int):
                    author = Author.objects.get(id=author_data)
                else:
                    author, created = Author.objects.get_or_create(name=author_data)
                    request.data['author'] = author.id
                    if created:
                        logger.info(f"Created new author: {author.name}")
            except Exception as e:
                logger.error(f"Error processing author: {str(e)}")
                return Response(
                    {"author": [f"Error processing author: {str(e)}"]},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Call the parent update method
        return super().update(request, *args, **kwargs)

class BookshelfViewSet(viewsets.ModelViewSet):
    queryset = Bookshelf.objects.all()
    serializer_class = BookshelfSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Only return bookshelves owned by current user
        return Bookshelf.objects.filter(user=self.request.user).prefetch_related('books', 'books__author')
    
    def get_serializer_class(self):
        # Use BookshelfBooksUpdateSerializer for partial updates to handle book additions/removals
        if self.action == 'partial_update' and 'books' in self.request.data:
            return BookshelfBooksUpdateSerializer
        return BookshelfSerializer
    
    @action(detail=True, methods=['patch'])
    def update_books(self, request, pk=None):
        """Endpoint specifically for updating books in a bookshelf"""
        bookshelf = self.get_object()
        
        # Get the books IDs from the request
        books_ids = request.data.get('books', [])
        if not books_ids:
            return Response({"books": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)
        
        # Log the books being added
        logger.debug(f"Updating bookshelf {pk} books with: {books_ids}")
        
        # Update the books
        try:
            # Fetch the books and ensure they exist
            books = []
            for book_id in books_ids:
                try:
                    book = Book.objects.get(pk=book_id)
                    books.append(book)
                except Book.DoesNotExist:
                    return Response(
                        {"books": [f"Book with ID {book_id} does not exist."]},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Set the books on the bookshelf
            bookshelf.books.set(books)
            
            # Return the updated bookshelf
            serializer = self.get_serializer(bookshelf)
            logger.debug(f"Updated bookshelf {pk} books successfully: {bookshelf.books.count()} books")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error updating bookshelf books: {str(e)}")
            return Response(
                {"detail": f"Error updating books: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.query_params.get('book'):
            return Review.objects.filter(book_id=self.request.query_params.get('book'))
        if self.request.user.is_staff:
            return Review.objects.all()
        return Review.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ExchangeOfferViewSet(viewsets.ModelViewSet):
    serializer_class = ExchangeOfferSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.query_params.get('book'):
            return ExchangeOffer.objects.filter(book_id=self.request.query_params.get('book'))
        if self.request.user.is_staff:
            return ExchangeOffer.objects.all()
        return ExchangeOffer.objects.filter(owner=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class ExchangeRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ExchangeRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return ExchangeRequest.objects.all()
        
        # Get requests for my offers
        my_offers = ExchangeOffer.objects.filter(owner=self.request.user)
        requests_for_my_offers = ExchangeRequest.objects.filter(offer__in=my_offers)
        
        # Get my requests for other offers
        my_requests = ExchangeRequest.objects.filter(requester=self.request.user)
        
        # Combine both querysets
        return requests_for_my_offers | my_requests
    
    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)

class DiscussionViewSet(viewsets.ModelViewSet):
    serializer_class = DiscussionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.query_params.get('book'):
            return Discussion.objects.filter(book_id=self.request.query_params.get('book'))
        return Discussion.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.query_params.get('discussion'):
            return Comment.objects.filter(discussion_id=self.request.query_params.get('discussion'))
        if self.request.user.is_staff:
            return Comment.objects.all()
        return Comment.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        comment = self.get_object()
        comment.likes.add(request.user)
        return Response({'status': 'liked'})
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def unlike(self, request, pk=None):
        comment = self.get_object()
        comment.likes.remove(request.user)
        return Response({'status': 'unliked'})

class SupportTicketViewSet(viewsets.ModelViewSet):
    serializer_class = SupportTicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return SupportTicket.objects.all()
        return SupportTicket.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TicketReplyViewSet(viewsets.ModelViewSet):
    serializer_class = TicketReplySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.query_params.get('ticket'):
            ticket_id = self.request.query_params.get('ticket')
            ticket = SupportTicket.objects.get(id=ticket_id)
            
            # Only the ticket owner and admins can see replies
            if self.request.user.is_staff or ticket.user == self.request.user:
                return TicketReply.objects.filter(ticket_id=ticket_id)
            return TicketReply.objects.none()
        
        if self.request.user.is_staff:
            return TicketReply.objects.all()
        
        # Users can see replies to their own tickets
        user_tickets = SupportTicket.objects.filter(user=self.request.user)
        return TicketReply.objects.filter(ticket__in=user_tickets)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
