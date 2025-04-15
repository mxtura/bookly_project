from django.core.management.base import BaseCommand
from bookly_app.models import Book, Genre
import datetime

class Command(BaseCommand):
    help = 'Добавляет несколько книг и жанров в базу данных'

    def handle(self, *args, **kwargs):
        # Создание жанров
        genres = {
            'fantasy': Genre.objects.create(name="Фэнтези"),
            'scifi': Genre.objects.create(name="Научная фантастика"),
            'classic': Genre.objects.create(name="Классика"),
            'detective': Genre.objects.create(name="Детектив")
        }
        
        self.stdout.write(self.style.SUCCESS('Жанры созданы успешно'))
        
        # Список книг для добавления
        books_data = [
            {
                'title': 'Властелин колец',
                'author': 'Дж. Р. Р. Толкин',
                'description': 'Эпическое фэнтези о Фродо и его путешествии чтобы уничтожить Кольцо Всевластия.',
                'isbn': '9780618640157',
                'publication_date': datetime.date(1954, 7, 29),
                'genres': [genres['fantasy']]
            },
            {
                'title': 'Автостопом по Галактике',
                'author': 'Дуглас Адамс',
                'description': 'Юмористический научно-фантастический роман.',
                'isbn': '9780345391803',
                'publication_date': datetime.date(1979, 10, 12),
                'genres': [genres['scifi']]
            },
            {
                'title': 'Война и мир',
                'author': 'Лев Толстой',
                'description': 'Роман-эпопея, описывающий русское общество в эпоху войн против Наполеона.',
                'isbn': '9781400079988',
                'publication_date': datetime.date(1869, 1, 1),
                'genres': [genres['classic']]
            },
            {
                'title': 'Убийство в Восточном экспрессе',
                'author': 'Агата Кристи',
                'description': 'Детективный роман о расследовании убийства в поезде.',
                'isbn': '9780062693662',
                'publication_date': datetime.date(1934, 1, 1),
                'genres': [genres['detective']]
            }
        ]
        
        # Добавление книг
        for book_data in books_data:
            genres_list = book_data.pop('genres')
            book = Book.objects.create(**book_data)
            for genre in genres_list:
                book.genres.add(genre)
        
        self.stdout.write(self.style.SUCCESS('Книги добавлены успешно'))
