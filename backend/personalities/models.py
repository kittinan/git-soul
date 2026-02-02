import uuid
from django.db import models
from django.db.models import JSONField
from analyses.models import Analysis


class Personality(models.Model):
    SHAPE_TYPE_CHOICES = [
        ('sphere', 'Sphere'),
        ('cube', 'Cube'),
        ('complex', 'Complex'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    analysis = models.OneToOneField(Analysis, on_delete=models.CASCADE, related_name='personality')

    # Personality traits (normalized 0-1)
    complexity_score = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    creativity_score = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    maintainability_score = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    innovation_score = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    organization_score = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    performance_score = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)

    # 3D visualization parameters
    primary_color = models.CharField(max_length=7, blank=True, null=True)  # Hex color
    secondary_color = models.CharField(max_length=7, blank=True, null=True)
    accent_color = models.CharField(max_length=7, blank=True, null=True)
    shape_type = models.CharField(max_length=50, choices=SHAPE_TYPE_CHOICES, default='sphere')
    complexity_level = models.IntegerField(default=5)  # 1-10
    rotation_speed = models.DecimalField(max_digits=5, decimal_places=2, default=1.0)
    particle_count = models.IntegerField(default=50)

    # AI-generated content
    personality_description = models.TextField(blank=True, null=True)
    tags = JSONField(default=list, blank=True)  # ["structured", "innovative"]

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'personalities'
        indexes = [
            models.Index(fields=['analysis']),
            models.Index(fields=['complexity_score', 'creativity_score']),
        ]

    def __str__(self):
        return f"Personality for {self.analysis}"


class CodeInsight(models.Model):
    CATEGORY_CHOICES = [
        ('patterns', 'Patterns'),
        ('issues', 'Issues'),
        ('strengths', 'Strengths'),
    ]
    
    SEVERITY_CHOICES = [
        ('info', 'Info'),
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    personality = models.ForeignKey(Personality, on_delete=models.CASCADE, related_name='insights')
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    insight_text = models.TextField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='info')
    file_path = models.CharField(max_length=500, blank=True, null=True)
    line_numbers = models.TextField(blank=True, null=True)  # Can store ranges like "1-25, 30-45"
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'code_insights'
        ordering = ['category', 'severity']
        indexes = [
            models.Index(fields=['personality']),
            models.Index(fields=['category']),
        ]

    def __str__(self):
        return f"{self.category}: {self.insight_text[:50]}..."