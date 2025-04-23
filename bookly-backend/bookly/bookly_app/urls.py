from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'profiles', views.UserProfileViewSet)
router.register(r'books', views.BookViewSet)
router.register(r'genres', views.GenreViewSet)
router.register(r'bookshelves', views.BookshelfViewSet)
router.register(r'reviews', views.ReviewViewSet, basename='review')
router.register(r'exchange-offers', views.ExchangeOfferViewSet, basename='exchange-offer')
router.register(r'exchange-requests', views.ExchangeRequestViewSet, basename='exchange-request')
router.register(r'discussions', views.DiscussionViewSet, basename='discussion')
router.register(r'comments', views.CommentViewSet, basename='comment')
router.register(r'support-tickets', views.SupportTicketViewSet, basename='support-ticket')
router.register(r'ticket-replies', views.TicketReplyViewSet, basename='ticket-reply')

urlpatterns = [
    path('', include(router.urls)),
    path('api/', include(router.urls)),
]