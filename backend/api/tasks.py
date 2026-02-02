import threading
import time
import os
import uuid
from typing import Dict, Any
from django.utils import timezone
from .github_client import GitHubClient
from .zai_client import ZAIClient
from repositories.models import Repository
from analyses.models import Analysis
from personalities.models import Personality, CodeInsight


class AnalysisTask:
    def __init__(self):
        self.active_tasks = {}
        self.lock = threading.Lock()

    def analyze_repository_task(self, analysis_id: str, repo_url: str):
        """
        Async task to analyze a repository
        """
        try:
            # Get API keys from environment
            github_token = os.getenv('GITHUB_TOKEN')
            zai_api_key = os.getenv('Z_AI_API_KEY')
            
            if not github_token:
                raise ValueError("GITHUB_TOKEN not found in environment")
            
            if not zai_api_key:
                raise ValueError("Z_AI_API_KEY not found in environment")
            
            # Get analysis record
            try:
                analysis = Analysis.objects.get(id=analysis_id)
            except Analysis.DoesNotExist:
                raise ValueError(f"Analysis with ID {analysis_id} not found")
            
            # Update status to processing
            analysis.status = 'processing'
            analysis.save()
            
            # Initialize clients
            github_client = GitHubClient(github_token)
            zai_client = ZAIClient(zai_api_key)
            
            # Step 1: Fetch repository data from GitHub
            try:
                repository_data = github_client.fetch_repository(repo_url)
            except Exception as e:
                raise ValueError(f"GitHub API error: {str(e)}")
            
            # Update repository metadata
            repository = analysis.repository
            repo_info = repository_data.get("repository", {})
            
            repository.description = repo_info.get("description") or repository.description
            repository.stars_count = repo_info.get("stargazers_count", 0)
            repository.forks_count = repo_info.get("forks_count", 0)
            repository.language = repo_info.get("language") or repository.language
            repository.last_analyzed_at = timezone.now()
            repository.save()
            
            # Update analysis with basic stats
            analysis.file_count = repository_data.get("file_count", 0)
            analysis.commit_count = repository_data.get("commit_count", 0)
            analysis.top_languages = repository_data.get("top_languages", {})
            analysis.analysis_metadata = {
                "github_api_response": {
                    "full_name": repo_info.get("full_name"),
                    "default_branch": repo_info.get("default_branch"),
                    "size": repo_info.get("size"),
                    "open_issues_count": repo_info.get("open_issues_count"),
                    "license": repo_info.get("license", {}).get("name") if repo_info.get("license") else None
                }
            }
            analysis.save()
            
            # Step 2: Get sample files for AI analysis
            try:
                sample_files = github_client.get_repository_files_sample(repo_url, max_files=3)
            except Exception as e:
                # Log warning but continue
                print(f"Warning: Could not get sample files: {str(e)}")
                sample_files = {}
            
            # Step 3: Analyze with Z AI
            try:
                zai_result = zai_client.analyze_repository_with_zai(repository_data, sample_files)
                
                # Validate the response
                if not zai_client.validate_response(zai_result):
                    raise ValueError("Invalid response structure from Z AI API")
                
            except Exception as e:
                raise ValueError(f"Z AI analysis failed: {str(e)}")
            
            # Step 4: Create personality record
            traits = zai_result.get("traits", {})
            visualization = zai_result.get("visualization", {})
            colors = visualization.get("colors", {})
            shape = visualization.get("shape", {})
            
            personality = Personality.objects.create(
                analysis=analysis,
                complexity_score=traits.get("complexity"),
                creativity_score=traits.get("creativity"),
                maintainability_score=traits.get("maintainability"),
                innovation_score=traits.get("innovation"),
                organization_score=traits.get("organization"),
                performance_score=traits.get("performance"),
                primary_color=colors.get("primary"),
                secondary_color=colors.get("secondary"),
                accent_color=colors.get("accent"),
                shape_type=shape.get("type", "sphere"),
                complexity_level=shape.get("complexity", 5),
                rotation_speed=shape.get("rotation_speed", 1.0),
                particle_count=shape.get("particle_count", 50),
                personality_description=zai_result.get("description", ""),
                tags=zai_result.get("tags", [])
            )
            
            # Step 5: Create code insights
            insights = zai_result.get("insights", [])
            for insight_data in insights:
                CodeInsight.objects.create(
                    personality=personality,
                    category=insight_data.get("category", "patterns"),
                    insight_text=insight_data.get("text", ""),
                    severity=insight_data.get("severity", "info")
                )
            
            # Mark analysis as completed
            analysis.status = 'completed'
            analysis.completed_at = timezone.now()
            analysis.save()
            
        except Exception as e:
            # Mark analysis as failed
            try:
                analysis = Analysis.objects.get(id=analysis_id)
                analysis.status = 'failed'
                analysis.error_message = str(e)
                analysis.save()
            except Analysis.DoesNotExist:
                pass  # Already handled above
            
            # Re-raise the exception
            raise

    def start_analysis_task(self, analysis_id: str, repo_url: str) -> threading.Thread:
        """
        Start analysis task in a background thread
        """
        def task_wrapper():
            try:
                self.analyze_repository_task(analysis_id, repo_url)
            except Exception as e:
                print(f"Analysis task failed for {analysis_id}: {str(e)}")
            finally:
                # Clean up task tracking
                with self.lock:
                    if analysis_id in self.active_tasks:
                        del self.active_tasks[analysis_id]
        
        thread = threading.Thread(target=task_wrapper, daemon=True)
        thread.start()
        
        # Track the task
        with self.lock:
            self.active_tasks[analysis_id] = {
                'thread': thread,
                'start_time': timezone.now(),
                'repo_url': repo_url
            }
        
        return thread

    def get_task_status(self, analysis_id: str) -> Dict[str, Any]:
        """
        Get status of an analysis task
        """
        with self.lock:
            if analysis_id not in self.active_tasks:
                return {'status': 'not_found'}
            
            task_info = self.active_tasks[analysis_id]
            thread = task_info['thread']
            
            return {
                'status': 'running' if thread.is_alive() else 'completed',
                'start_time': task_info['start_time'],
                'repo_url': task_info['repo_url']
            }


# Global task manager instance
task_manager = AnalysisTask()


def analyze_repository_task(analysis_id: str, repo_url: str):
    """
    Public function to start repository analysis task
    """
    return task_manager.start_analysis_task(analysis_id, repo_url)