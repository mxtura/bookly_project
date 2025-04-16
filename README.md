# Bookly Project

## Обзор
Bookly.

## Предварительные требования
Перед началом работы убедитесь, что у вас установлены:
- [Python](https://www.python.org/) (3.8 или выше)
- [Node.js](https://nodejs.org/) (v16 или выше)
- [Git](https://git-scm.com/)

## Настройка бэкенда (Django)

1. Клонирование репозитория:
   ```bash
   git clone [url-вашего-репозитория]
   cd bookly_project
   ```

2. Создание виртуального окружения Python:
   ```bash
   python -m venv venv
   ```

3. Активация виртуального окружения:
   ```bash
   # Для Windows
   venv\Scripts\activate
   
   # Для Linux/Mac
   source venv/bin/activate
   ```

4. Установка зависимостей бэкенда:
   ```bash
   pip install -r requirements.txt
   ```

5. Применение миграций:
   ```bash
   cd bookly
   python manage.py migrate
   ```

6. Создание суперпользователя (опционально):
   ```bash
   python manage.py createsuperuser
   ```

## Настройка фронтенда (React)

1. Перейдите в директорию фронтенда:
   ```bash
   cd bookly-frontend
   ```

2. Установка зависимостей:
   ```bash
   npm install
   # или
   yarn install
   ```

## Запуск проекта

### Запуск бэкенда
```bash
# Находясь в директории bookly-backend и с активированным venv
python manage.py runserver
```
Бэкенд будет доступен по адресу: http://127.0.0.1:8000/

### Запуск фронтенда
```bash
# Находясь в директории bookly-frontend
npm start
# или
yarn start
```
Фронтенд будет доступен по адресу: http://localhost:3000/

## Структура проекта
```
bookly_project/
├── bookly-backend/         # Django проект
│   ├── bookly/      # Основной проект Django
│   └── ...
├── bookly-frontend/        # React приложение
│   ├── public/      # Статические файлы
│   ├── src/         # Исходный код
│   └── ...
└── README.md        # Этот файл
```

## Дополнительные команды

### Бэкенд
- Запуск тестов:
  ```bash
  python manage.py test
  ```
- Создание миграций:
  ```bash
  python manage.py makemigrations
  ```

### Фронтенд
- Сборка для продакшена:
  ```bash
  npm run build
  # или
  yarn build
  ```
- Запуск тестов:
  ```bash
  npm test
  # или
  yarn test
  ```

## Решение проблем

Если у вас возникли проблемы при настройке или запуске проекта, проверьте:
1. Совместимость версий Python и Node.js
2. Правильность настройки переменных окружения
3. Подключение к сети для установки зависимостей
4. Активировано ли виртуальное окружение Python при работе с бэкендом
