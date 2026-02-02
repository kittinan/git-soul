import uuid
from django.db import models
from django.db.models import JSONField
from django.utils import timezone
from repositories.models import Repository


class Analysis(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    repository = models.ForeignKey(Repository, on_delete=models.CASCADE, related_name='analyses')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    error_message = models.TextField(blank=True, null=True)
    file_count = models.IntegerField(blank=True, null=True)
    line_count = models.IntegerField(blank=True, null=True)
    commit_count = models.IntegerField(blank=True, null=True)
    top_languages = JSONField(default=dict, blank=True)  # {"python": 60, "javascript": 30}
    analysis_metadata = JSONField(default=dict, blank=True)  # Additional stats
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'analyses'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['repository']),
        ]

    def __str__(self):
        return f"Analysis {self.id} for {self.repository}"

    def save(self, *args, **kwargs):
        if self.status == 'completed' and not self.completed_at:
            self.completed_at = timezone.now()
        super().save(*args, **kwargs)