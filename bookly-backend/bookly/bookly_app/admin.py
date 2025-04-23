from django.contrib import admin
from .models import Book, Genre, UserProfile, Bookshelf, Review, ExchangeOffer, ExchangeRequest, Discussion, Comment, SupportTicket, TicketReply, Author

# Регистрация моделей в админке
admin.site.register(Book)
admin.site.register(Genre)
admin.site.register(UserProfile)
admin.site.register(Bookshelf)
admin.site.register(Review)
admin.site.register(ExchangeOffer)
admin.site.register(ExchangeRequest)
admin.site.register(Discussion)
admin.site.register(Comment)
admin.site.register(SupportTicket)
admin.site.register(TicketReply)
admin.site.register(Author)
