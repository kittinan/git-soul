import requests
import re
from typing import Dict, List, Any, Optional
from urllib.parse import urlparse


class GitHubClient:
    def __init__(self, github_token: str):
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"token {github_token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "GitSoul-MVP"
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)

    def parse_github_url(self, repo_url: str) -> Dict[str, str]:
        """Parse GitHub URL to extract owner and repo name"""
        try:
            # Remove .git suffix if present
            repo_url = repo_url.replace('.git', '')
            
            # Parse URL
            parsed = urlparse(repo_url)
            path_parts = parsed.path.strip('/').split('/')
            
            if len(path_parts) < 2:
                raise ValueError("Invalid GitHub URL format")
            
            owner = path_parts[0]
            repo = path_parts[1]
            
            return {
                "owner": owner,
                "repo": repo,
                "full_name": f"{owner}/{repo}"
            }
            
        except Exception as e:
            raise ValueError(f"Failed to parse GitHub URL: {str(e)}")

    def fetch_repository(self, repo_url: str) -> Dict[str, Any]:
        """Fetch repository metadata"""
        try:
            parsed = self.parse_github_url(repo_url)
            owner = parsed["owner"]
            repo = parsed["repo"]
            
            # Fetch repository metadata
            repo_response = self.session.get(f"{self.base_url}/repos/{owner}/{repo}")
            repo_response.raise_for_status()
            repo_data = repo_response.json()
            
            # Fetch commit history
            commits_response = self.session.get(f"{self.base_url}/repos/{owner}/{repo}/commits?per_page=10")
            commits_response.raise_for_status()
            commits_data = commits_response.json()
            
            # Fetch languages
            languages_response = self.session.get(f"{self.base_url}/repos/{owner}/{repo}/languages")
            languages_response.raise_for_status()
            languages_data = languages_response.json()
            
            # Calculate commit count (actual total might be more)
            commit_count = len(commits_data)
            
            # Get file structure from default branch
            default_branch = repo_data.get("default_branch", "main")
            tree_response = self.session.get(f"{self.base_url}/repos/{owner}/{repo}/git/trees/{default_branch}?recursive=1")
            tree_response.raise_for_status()
            tree_data = tree_response.json()
            
            # Count files (exclude directories)
            file_count = len([item for item in tree_data.get("tree", []) if item.get("type") == "blob"])
            
            # Get top languages
            total_bytes = sum(languages_data.values()) if languages_data else 0
            top_languages = {}
            
            if total_bytes > 0:
                for lang, bytes_count in sorted(languages_data.items(), key=lambda x: x[1], reverse=True)[:5]:
                    percentage = round((bytes_count / total_bytes) * 100, 2)
                    top_languages[lang] = percentage
            
            return {
                "repository": repo_data,
                "commit_count": commit_count,
                "file_count": file_count,
                "top_languages": top_languages,
                "languages_raw": languages_data,
                "commits_sample": commits_data[:3]  # First 3 commits for analysis
            }
            
        except requests.exceptions.RequestException as e:
            if e.response:
                status_code = e.response.status_code
                if status_code == 404:
                    raise ValueError(f"Repository not found: {repo_url}")
                elif status_code == 403:
                    raise ValueError("GitHub API rate limit exceeded")
                elif status_code == 401:
                    raise ValueError("Invalid GitHub token")
                else:
                    raise ValueError(f"GitHub API error ({status_code}): {e.response.text}")
            else:
                raise ValueError(f"Network error: {str(e)}")
        except Exception as e:
            raise ValueError(f"Failed to fetch repository: {str(e)}")

    def get_file_content(self, owner: str, repo: str, file_path: str, ref: str = "main") -> str:
        """Get content of a specific file"""
        try:
            response = self.session.get(f"{self.base_url}/repos/{owner}/{repo}/contents/{file_path}?ref={ref}")
            response.raise_for_status()
            
            data = response.json()
            if data.get("type") != "file":
                raise ValueError(f"Path is not a file: {file_path}")
            
            import base64
            content = base64.b64decode(data["content"]).decode("utf-8")
            return content
            
        except Exception as e:
            raise ValueError(f"Failed to get file content: {str(e)}")

    def get_repository_files_sample(self, repo_url: str, max_files: int = 5) -> Dict[str, str]:
        """Get sample files from repository for analysis"""
        try:
            parsed = self.parse_github_url(repo_url)
            owner = parsed["owner"]
            repo = parsed["repo"]
            
            # Get repository data to get default branch
            repo_response = self.session.get(f"{self.base_url}/repos/{owner}/{repo}")
            repo_response.raise_for_status()
            repo_data = repo_response.json()
            
            default_branch = repo_data.get("default_branch", "main")
            
            # Get file tree
            tree_response = self.session.get(f"{self.base_url}/repos/{owner}/{repo}/git/trees/{default_branch}?recursive=1")
            tree_response.raise_for_status()
            tree_data = tree_response.json()
            
            # Filter for code files (common extensions)
            code_extensions = {'.py', '.js', '.ts', '.java', '.cpp', '.c', '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.scala', '.hs', '.clj'}
            
            files = []
            for item in tree_data.get("tree", []):
                if item.get("type") == "blob":
                    path = item.get("path", "")
                    if any(path.lower().endswith(ext) for ext in code_extensions):
                        if not path.startswith('.') and len(path) < 100:  # Skip hidden files and very long paths
                            files.append(path)
            
            # Get sample files (first few)
            sample_files = {}
            for file_path in files[:max_files]:
                try:
                    content = self.get_file_content(owner, repo, file_path, default_branch)
                    # Truncate very large files
                    if len(content) > 2000:
                        content = content[:2000] + "\n\n... (truncated)"
                    sample_files[file_path] = content
                except Exception:
                    # Skip files that can't be read
                    continue
            
            return sample_files
            
        except Exception as e:
            raise ValueError(f"Failed to get sample files: {str(e)}")