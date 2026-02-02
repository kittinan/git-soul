import requests
import json
from typing import Dict, List, Any, Optional
import time


class ZAIClient:
    def __init__(self, zai_api_key: str):
        self.api_url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {zai_api_key}",
            "Content-Type": "application/json"
        }

    def analyze_repository_with_zai(self, repository_data: Dict[str, Any], sample_files: Dict[str, str]) -> Dict[str, Any]:
        """
        Analyze repository using Z AI API and extract personality traits
        
        Args:
            repository_data: Repository metadata from GitHub API
            sample_files: Sample file contents for analysis
            
        Returns:
            Dict containing personality traits, visualization data, and insights
        """
        try:
            # Create the prompt for Z AI
            system_prompt = """You analyze Git repositories and extract personality traits based on code structure, patterns, and quality. 
            Provide analysis in JSON format with the following structure:
            {
                "traits": {
                    "complexity": 0.0-1.0,
                    "creativity": 0.0-1.0,
                    "maintainability": 0.0-1.0,
                    "innovation": 0.0-1.0,
                    "organization": 0.0-1.0,
                    "performance": 0.0-1.0
                },
                "visualization": {
                    "colors": {
                        "primary": "#hex_color",
                        "secondary": "#hex_color",
                        "accent": "#hex_color"
                    },
                    "shape": {
                        "type": "sphere|cube|complex",
                        "complexity": 1-10,
                        "rotation_speed": 0.1-2.0,
                        "particle_count": 10-200
                    }
                },
                "description": "Brief description of repository personality",
                "tags": ["tag1", "tag2", "tag3"],
                "insights": [
                    {
                        "category": "patterns|issues|strengths",
                        "text": "Insight description",
                        "severity": "info|low|medium|high"
                    }
                ]
            }

            Scoring guidelines:
            - Complexity: 0-1 (higher for intricate code, many abstractions)
            - Creativity: 0-1 (higher for unique solutions, novel approaches)
            - Maintainability: 0-1 (higher for clean code, good docs, consistency)
            - Innovation: 0-1 (higher for cutting-edge tech, unique features)
            - Organization: 0-1 (higher for good structure, clear separation)
            - Performance: 0-1 (higher for optimized code, good algorithms)
            """

            # Format repository data for the prompt
            repo_info = repository_data.get("repository", {})
            user_prompt = f"""
            Analyze this repository:

            Repository: {repo_info.get('full_name', 'Unknown')}
            Description: {repo_info.get('description', 'No description')}
            Language: {repo_info.get('language', 'Unknown')}
            Stars: {repo_info.get('stargazers_count', 0)}
            Forks: {repo_info.get('forks_count', 0)}
            File Count: {repository_data.get('file_count', 0)}
            Commit Count: {repository_data.get('commit_count', 0)}
            Top Languages: {repository_data.get('top_languages', {})}

            Sample Files:
            """
            
            # Add sample file contents
            for file_path, content in sample_files.items():
                user_prompt += f"\n\n--- {file_path} ---\n{content[:1000]}..."  # Truncate for context
            
            user_prompt += "\n\nProvide a comprehensive personality analysis of this codebase."

            # Make API request
            payload = {
                "model": "glm-4-plus",
                "messages": [
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": user_prompt
                    }
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.3,
                "max_tokens": 2000
            }

            response = requests.post(
                self.api_url,
                headers=self.headers,
                json=payload,
                timeout=60  # 60 second timeout
            )
            
            response.raise_for_status()
            response_data = response.json()
            
            # Extract the content
            if "choices" not in response_data or not response_data["choices"]:
                raise ValueError("Invalid response from Z AI API: No choices found")
            
            content = response_data["choices"][0].get("message", {}).get("content", "")
            
            if not content:
                raise ValueError("Empty response from Z AI API")
            
            # Parse JSON response
            try:
                result = json.loads(content)
                return result
            except json.JSONDecodeError as e:
                raise ValueError(f"Failed to parse Z AI response as JSON: {str(e)}. Content: {content[:500]}...")
                
        except requests.exceptions.Timeout:
            raise ValueError("Z AI API request timed out")
        except requests.exceptions.RequestException as e:
            if e.response:
                status_code = e.response.status_code
                error_text = e.response.text
                raise ValueError(f"Z AI API error ({status_code}): {error_text}")
            else:
                raise ValueError(f"Network error calling Z AI API: {str(e)}")
        except Exception as e:
            raise ValueError(f"Failed to analyze repository with Z AI: {str(e)}")

    def validate_response(self, response_data: Dict[str, Any]) -> bool:
        """Validate that the Z AI response has the expected structure"""
        required_fields = ["traits", "visualization", "description", "tags", "insights"]
        
        if not all(field in response_data for field in required_fields):
            return False
        
        # Validate traits
        traits = response_data.get("traits", {})
        required_traits = ["complexity", "creativity", "maintainability", "innovation", "organization", "performance"]
        
        if not all(trait in traits for trait in required_traits):
            return False
        
        # Validate trait values are between 0 and 1
        for trait_name, trait_value in traits.items():
            if not isinstance(trait_value, (int, float)) or trait_value < 0 or trait_value > 1:
                return False
        
        # Validate visualization
        visualization = response_data.get("visualization", {})
        if "colors" not in visualization or "shape" not in visualization:
            return False
        
        # Validate colors
        colors = visualization.get("colors", {})
        required_colors = ["primary", "secondary", "accent"]
        if not all(color in colors for color in required_colors):
            return False
        
        return True