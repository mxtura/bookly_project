# Generated by Django 4.2.20 on 2025-04-18 16:43

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('bookly_app', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Author',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200, unique=True)),
                ('bio', models.TextField(blank=True)),
                ('birth_date', models.DateField(blank=True, null=True)),
                ('death_date', models.DateField(blank=True, null=True)),
                ('photo', models.ImageField(blank=True, null=True, upload_to='author_photos/')),
            ],
        ),
        migrations.AddField(
            model_name='discussion',
            name='author',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='discussions', to='bookly_app.author'),
        ),
        migrations.AlterField(
            model_name='book',
            name='author',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='books', to='bookly_app.author'),
        ),
    ]
