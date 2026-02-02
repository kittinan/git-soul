import uuid
from django.db import models
from django.utils import timezone


class Repository(models.Model):
    PLATFORM_CHOICES = [
        ('github', 'GitHub'),
        ('gitlab', 'GitLab'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES, default='github')
    repo_name = models.CharField(max_length=255)
    repo_url = models.URLField(max_length=500, unique=True)
    owner = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    stars_count = models.IntegerField(default=0)
    forks_count = models.IntegerField(default=0)
    language = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_analyzed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'repositories'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['platform']),
            models.Index(fields=['owner']),
            models.Index(fields=['language']),
        ]

    def __str__(self):
        return f"{self.owner}/{self.repo_name}"

    def save(self, *args, **kwargs):
        if self.last_analyzed_at:
            self.updated_at = timezone.now()
        super().save(*args, **kwargs)