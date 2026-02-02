from django.contrib import admin
from .models import Analysis


@admin.register(Analysis)
class AnalysisAdmin(admin.ModelAdmin):
    list_display = ['id', 'repository', 'status', 'file_count', 'line_count', 'created_at', 'completed_at']
    list_filter = ['status', 'created_at']
    search_fields = ['repository__repo_name', 'repository__owner', 'id']
    readonly_fields = ['created_at', 'completed_at']
    fieldsets = (
        ('Analysis Information', {
            'fields': ('repository', 'status', 'error_message')
        }),
        ('Analysis Results', {
            'fields': ('file_count', 'line_count', 'commit_count', 'top_languages', 'analysis_metadata')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'completed_at'),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        return False  # Analyses should be created programmatically