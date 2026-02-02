from django.contrib import admin
from .models import Personality, CodeInsight


@admin.register(Personality)
class PersonalityAdmin(admin.ModelAdmin):
    list_display = ['id', 'analysis', 'complexity_score', 'creativity_score', 'maintainability_score', 'shape_type', 'created_at']
    list_filter = ['shape_type', 'complexity_level', 'created_at']
    search_fields = ['analysis__repository__repo_name', 'personality_description']
    readonly_fields = ['created_at']
    fieldsets = (
        ('Analysis Link', {
            'fields': ('analysis',)
        }),
        ('Personality Traits', {
            'fields': (('complexity_score', 'creativity_score'), 
                      ('maintainability_score', 'innovation_score'),
                      ('organization_score', 'performance_score'))
        }),
        ('3D Visualization Parameters', {
            'fields': ('primary_color', 'secondary_color', 'accent_color', 'shape_type')
        }),
        ('Animation & Effects', {
            'fields': ('complexity_level', 'rotation_speed', 'particle_count')
        }),
        ('AI Content', {
            'fields': ('personality_description', 'tags')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        return False  # Personalities should be created programmatically


@admin.register(CodeInsight)
class CodeInsightAdmin(admin.ModelAdmin):
    list_display = ['id', 'personality', 'category', 'severity', 'insight_text_short', 'file_path', 'created_at']
    list_filter = ['category', 'severity', 'created_at']
    search_fields = ['insight_text', 'file_path', 'personality__analysis__repository__repo_name']
    readonly_fields = ['created_at']
    fieldsets = (
        ('Insight Details', {
            'fields': ('personality', 'category', 'severity')
        }),
        ('Content', {
            'fields': ('insight_text', 'file_path', 'line_numbers')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def insight_text_short(self, obj):
        return obj.insight_text[:75] + "..." if len(obj.insight_text) > 75 else obj.insight_text
    insight_text_short.short_description = 'Insight'
    
    def has_add_permission(self, request):
        return False  # Insights should be created programmatically