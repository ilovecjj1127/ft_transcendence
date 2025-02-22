# Generated by Django 5.1.3 on 2025-02-04 18:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_alter_friendshiprequest_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='is_2fa_enabled',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='otp_secret',
            field=models.CharField(blank=True, max_length=32, null=True),
        ),
    ]
