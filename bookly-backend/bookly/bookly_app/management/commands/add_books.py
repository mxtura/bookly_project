from django.core.management.base import BaseCommand
from bookly_app.models import Book, Genre, Author
import datetime
import os
from django.core.files import File
from django.conf import settings

class Command(BaseCommand):
    help = 'Инициализирует базу данных тестовыми данными: авторами, жанрами и книгами'

    def handle(self, *args, **kwargs):
        # Создание или получение жанров
        genres = {
            'fantasy': Genre.objects.get_or_create(name="Фэнтези")[0],
            'scifi': Genre.objects.get_or_create(name="Научная фантастика")[0],
            'classic': Genre.objects.get_or_create(name="Классика")[0],
            'detective': Genre.objects.get_or_create(name="Детектив")[0],
            'novel': Genre.objects.get_or_create(name="Роман")[0]
        }
        self.stdout.write(self.style.SUCCESS('✅ Жанры успешно обработаны'))
        
        # Создание или получение авторов
        authors = {
            'tolkien': Author.objects.get_or_create(
                name="Дж. Р. Р. Толкин",
                defaults={
                    'birth_date': datetime.date(1892, 1, 3),
                    'death_date': datetime.date(1973, 9, 2),
                    'bio': 'Английский писатель и филолог, автор классических произведений '
                           'высокого фэнтези «Хоббит», «Властелин колец» и «Сильмариллион».'
                }
            )[0],
            'adams': Author.objects.get_or_create(
                name="Дуглас Адамс",
                defaults={
                    'birth_date': datetime.date(1952, 3, 11),
                    'death_date': datetime.date(2001, 5, 11),
                    'bio': 'Английский писатель, драматург и сценарист, автор юмористических '
                           'фантастических романов «Автостопом по галактике».'
                }
            )[0],
            'tolstoy': Author.objects.get_or_create(
                name="Лев Толстой",
                defaults={
                    'birth_date': datetime.date(1828, 9, 9),
                    'death_date': datetime.date(1910, 11, 20),
                    'bio': 'Один из наиболее известных русских писателей и мыслителей, '
                           'участник обороны Севастополя, просветитель, публицист.'
                }
            )[0],
            'christie': Author.objects.get_or_create(
                name="Агата Кристи",
                defaults={
                    'birth_date': datetime.date(1890, 9, 15),
                    'death_date': datetime.date(1976, 1, 12),
                    'bio': 'Английская писательница, автор детективных романов и пьес, '
                           'один из самых публикуемых авторов в истории.'
                }
            )[0],
            'pushkin': Author.objects.get_or_create(
                name="Александр Пушкин",
                defaults={
                    'birth_date': datetime.date(1799, 6, 6),
                    'death_date': datetime.date(1837, 2, 10),
                    'bio': 'Великий русский поэт, драматург и прозаик, '
                           'реформатор русского литературного языка.'
                }
            )[0]
        }
        self.stdout.write(self.style.SUCCESS('✅ Авторы успешно обработаны'))
        
        # Путь к папке с обложками книг (на уровень выше)
        covers_dir = os.path.join(os.path.dirname(settings.BASE_DIR), 'bookly','media', 'book_covers')
        self.stdout.write(f'🔍 Поиск обложек в папке: {covers_dir}')
        
        # Проверяем существование папки с обложками
        if not os.path.exists(covers_dir):
            self.stdout.write(self.style.WARNING(f'⚠️ Папка с обложками не найдена: {covers_dir}'))
        
        # Список книг для добавления
        books_data = [
            {
                'title': 'Властелин колец',
                'author': authors['tolkien'],
                'description': 'Эпическое фэнтези о Фродо и его путешествии чтобы уничтожить Кольцо Всевластия.',
                'isbn': '9780618640157',
                'publication_date': datetime.date(1954, 7, 29),
                'genres': [genres['fantasy']],
                'cover_image': 'Властелин_колец.webp'
            },
            {
                'title': 'Автостопом по Галактике',
                'author': authors['adams'],
                'description': 'Юмористический научно-фантастический роман о приключениях землянина Артура Дента.',
                'isbn': '9780345391803',
                'publication_date': datetime.date(1979, 10, 12),
                'genres': [genres['scifi']],
                'cover_image': 'Автостопом_по_галактике.webp'
            },
            {
                'title': 'Война и мир',
                'author': authors['tolstoy'],
                'description': 'Роман-эпопея, описывающий русское общество в эпоху войн против Наполеона.',
                'isbn': '9781400079988',
                'publication_date': datetime.date(1869, 1, 1),
                'genres': [genres['classic'], genres['novel']],
                'cover_image': 'Война_и_мир.webp'
            },
            {
                'title': 'Убийство в Восточном экспрессе',
                'author': authors['christie'],
                'description': 'Детективный роман о расследовании убийства в поезде Эркюлем Пуаро.',
                'isbn': '9780062693662',
                'publication_date': datetime.date(1934, 1, 1),
                'genres': [genres['detective']],
                'cover_image': 'Убийство_в_Восточном_экспрессе.jpg'
            },
            {
                'title': 'Евгений Онегин',
                'author': authors['pushkin'],
                'description': 'Роман в стихах, одно из самых значительных произведений русской литературы.',
                'isbn': '9785699280640',
                'publication_date': datetime.date(1833, 1, 1),
                'genres': [genres['classic'], genres['novel']],
                'cover_image': 'евгений_онегин.jpg'
            }
        ]
        
        # Добавление книг с проверкой ISBN
        for book_data in books_data:
            genres_list = book_data.pop('genres')
            cover_image = book_data.pop('cover_image', None)
            book, created = Book.objects.get_or_create(
                isbn=book_data['isbn'],
                defaults=book_data
            )
            
            if created:
                book.genres.set(genres_list)
                
                # Установка обложки из файла, если указан filename
                if cover_image:
                    cover_path = os.path.join(covers_dir, cover_image)
                    if os.path.exists(cover_path):
                        with open(cover_path, 'rb') as cover_file:
                            book.cover_image.save(cover_image, File(cover_file), save=True)
                        self.stdout.write(f'🖼️ Обложка для книги "{book.title}" установлена')
                    else:
                        self.stdout.write(self.style.WARNING(f'⚠️ Файл обложки не найден: {cover_path}'))
                
                self.stdout.write(f'📖 Книга "{book.title}" успешно добавлена')
            else:
                self.stdout.write(f'ℹ️ Книга "{book.title}" уже существует, пропускаем')
        
        self.stdout.write(self.style.SUCCESS('\n🎉 База данных успешно инициализирована!'))
        self.stdout.write(self.style.SUCCESS('✨ Всего добавлено:'))
        self.stdout.write(f'• Авторов: {Author.objects.count()}')
        self.stdout.write(f'• Жанров: {Genre.objects.count()}')
        self.stdout.write(f'• Книг: {Book.objects.count()}')