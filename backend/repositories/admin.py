from django.contrib import admin
from .models import Repository


@admin.register(Repository)
class RepositoryAdmin(admin.ModelAdmin):
    list_display = ['repo_name', 'owner', 'platform', 'language', 'stars_count', 'forks_count', 'created_at', 'last_analyzed_at']
    list_filter = ['platform', 'language', 'created_at']
    search_fields = ['repo_name', 'owner', 'description', 'repo_url']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('platform', 'repo_name', 'repo_url', 'owner', 'description')
        }),
        ('GitHub Statistics', {
            'fields': ('stars_count', 'forks_count', 'language')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_analyzed_at'),
            'classes': ('collapse',)
        }),
    )