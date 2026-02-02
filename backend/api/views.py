import uuid
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
from repositories.models import Repository
from analyses.models import Analysis
from personalities.models import Personality
from .serializers import (
    RepositorySerializer, AnalysisSerializer, 
    PersonalitySerializer, PersonalityDetailSerializer
)


class RepositoryViewSet(viewsets.ModelViewSet):
    queryset = Repository.objects.all()
    serializer_class = RepositorySerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def analyze(self, request):
        """Start analysis of a repository"""
        repo_url = request.data.get('repo_url')
        
        if not repo_url:
            return Response(
                {'error': 'Repository URL is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # For MVP, we'll just create an analysis entry
        # In a real implementation, this would trigger background tasks
        try:
            # Get or create repository
            repository, created = Repository.objects.get_or_create(
                repo_url=repo_url,
                defaults={
                    'repo_name': repo_url.split('/')[-1].replace('.git', ''),
                    'owner': repo_url.split('/')[-2],
                    'platform': 'github' if 'github.com' in repo_url else 'gitlab'
                }
            )
            
            # Create analysis
            analysis = Analysis.objects.create(
                repository=repository,
                status='pending'
            )
            
            return Response({
                'analysis_id': str(analysis.id),
                'status': 'pending',
                'message': 'Repository analysis started'
            }, status=status.HTTP_202_ACCEPTED)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to start analysis: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class AnalysisViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Analysis.objects.all()
    serializer_class = AnalysisSerializer
    permission_classes = [AllowAny]
    lookup_field = 'id'

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.select_related('repository')

    @action(detail=True, methods=['get'])
    def personality(self, request, id=None):
        """Get personality data for this analysis"""
        try:
            analysis = self.get_object()
            personality = Personality.objects.filter(analysis=analysis).first()
            
            if not personality:
                return Response(
                    {'error': 'Personality not found for this analysis'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            serializer = PersonalityDetailSerializer(personality)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to get personality: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )