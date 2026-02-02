from rest_framework import serializers
from repositories.models import Repository
from analyses.models import Analysis
from personalities.models import Personality, CodeInsight


class RepositorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Repository
        fields = ['id', 'platform', 'repo_name', 'repo_url', 'owner', 'description', 
                 'stars_count', 'forks_count', 'language', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class AnalysisSerializer(serializers.ModelSerializer):
    repository = RepositorySerializer(read_only=True)
    
    class Meta:
        model = Analysis
        fields = ['id', 'repository', 'status', 'error_message', 'file_count', 
                 'line_count', 'commit_count', 'top_languages', 'analysis_metadata',
                 'created_at', 'completed_at']
        read_only_fields = ['id', 'created_at', 'completed_at']


class PersonalitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Personality
        fields = ['id', 'analysis', 'complexity_score', 'creativity_score', 
                 'maintainability_score', 'innovation_score', 'organization_score', 
                 'performance_score', 'primary_color', 'secondary_color', 
                 'accent_color', 'shape_type', 'complexity_level', 'rotation_speed',
                 'particle_count', 'personality_description', 'tags', 'created_at']
        read_only_fields = ['id', 'created_at']


class CodeInsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeInsight
        fields = ['id', 'personality', 'category', 'insight_text', 'severity',
                 'file_path', 'line_numbers', 'created_at']
        read_only_fields = ['id', 'created_at']


class PersonalityDetailSerializer(serializers.ModelSerializer):
    insights = CodeInsightSerializer(many=True, read_only=True)
    
    class Meta:
        model = Personality
        fields = ['id', 'analysis', 'complexity_score', 'creativity_score', 
                 'maintainability_score', 'innovation_score', 'organization_score', 
                 'performance_score', 'primary_color', 'secondary_color', 
                 'accent_color', 'shape_type', 'complexity_level', 'rotation_speed',
                 'particle_count', 'personality_description', 'tags', 'insights', 'created_at']
        read_only_fields = ['id', 'created_at']