import uuid
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
from django.utils import timezone
from repositories.models import Repository
from analyses.models import Analysis
from personalities.models import Personality
from .serializers import (
    RepositorySerializer, AnalysisSerializer, 
    PersonalitySerializer, PersonalityDetailSerializer
)
from .tasks import analyze_repository_task


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
        
        # Validate GitHub URL
        if 'github.com' not in repo_url:
            return Response(
                {'error': 'Only GitHub repositories are supported for MVP'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get or create repository
            repository, created = Repository.objects.get_or_create(
                repo_url=repo_url,
                defaults={
                    'repo_name': repo_url.split('/')[-1].replace('.git', ''),
                    'owner': repo_url.split('/')[-2],
                    'platform': 'github'
                }
            )
            
            # Create analysis
            analysis = Analysis.objects.create(
                repository=repository,
                status='pending'
            )
            
            # Start async analysis task
            analyze_repository_task(str(analysis.id), repo_url)
            
            return Response({
                'analysis_id': str(analysis.id),
                'status': 'pending',
                'message': 'Repository analysis started',
                'repository': {
                    'name': repository.repo_name,
                    'owner': repository.owner,
                    'url': repository.repo_url
                }
            }, status=status.HTTP_202_ACCEPTED)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Failed to start analysis: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AnalysisViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Analysis.objects.all()
    serializer_class = AnalysisSerializer
    permission_classes = [AllowAny]
    lookup_field = 'id'

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.select_related('repository')

    def retrieve(self, request, *args, **kwargs):
        """Get analysis details with progress calculation"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        # Calculate progress percentage
        progress = 0
        if instance.status == 'completed':
            progress = 100
        elif instance.status == 'failed':
            progress = 0
        elif instance.status == 'processing':
            progress = 50  # Midway through analysis
        elif instance.status == 'pending':
            progress = 10  # Just started
        
        response_data = serializer.data
        response_data['progress'] = progress
        
        return Response(response_data)

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
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Failed to get personality: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )