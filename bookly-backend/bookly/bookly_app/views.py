from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from .models import (
    Book, Genre, UserProfile, Bookshelf, Review, 
    ExchangeOffer, ExchangeRequest, Discussion, 
    Comment, SupportTicket, TicketReply
)
from .serializers import (
    UserSerializer, UserProfileSerializer, BookSerializer, GenreSerializer, 
    BookshelfSerializer, ReviewSerializer, ExchangeOfferSerializer, 
    ExchangeRequestSerializer, DiscussionSerializer, CommentSerializer,
    SupportTicketSerializer, TicketReplySerializer
)

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
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['author', 'genres__name']
    search_fields = ['title', 'author', 'isbn', 'description']
    ordering_fields = ['title', 'author', 'publication_date', 'created_at']

class BookshelfViewSet(viewsets.ModelViewSet):
    serializer_class = BookshelfSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Bookshelf.objects.all()
        return Bookshelf.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

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
