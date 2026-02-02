#!/bin/bash
#
# GitSoul MVP API Test Script
# This script demonstrates how to test the backend API endpoints
#

echo "GitSoul MVP API Test Script"
echo "============================"

# API Base URL (adjust as needed)
API_BASE="http://localhost:8000/api/v1"

echo ""
echo "1. Testing POST /api/v1/repositories/analyze"
echo "--------------------------------------------"

# Test with a real GitHub repository
REPO_URL="https://github.com/vercel/next.js"

curl_command="curl -X POST '${API_BASE}/repositories/analyze/' \\
  -H 'Content-Type: application/json' \\
  -d '{\"repo_url\": \"${REPO_URL}\"}'"

echo "Command to run:"
echo "$curl_command"
echo ""

echo "Expected response (200 OK):"
echo '{
  "analysis_id": "uuid-here",
  "status": "pending",
  "message": "Repository analysis started",
  "repository": {
    "name": "next.js",
    "owner": "vercel",
    "url": "https://github.com/vercel/next.js"
  }
}'

echo ""
echo "2. Testing GET /api/v1/analyses/{id}"
echo "--------------------------------------"

ANALYSIS_ID="your-analysis-id-here"

echo "Command to run:"
echo "curl -X GET '${API_BASE}/analyses/${ANALYSIS_ID}/'"
echo ""

echo "Expected response - pending (200 OK):"
echo '{
  "id": "uuid-here",
  "repository": {
    "id": "repo-uuid",
    "platform": "github",
    "repo_name": "next.js",
    "repo_url": "https://github.com/vercel/next.js",
    "owner": "vercel",
    "description": "The React Framework",
    "stars_count": 100000,
    "forks_count": 20000,
    "language": "JavaScript",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "status": "pending",
  "error_message": null,
  "file_count": null,
  "line_count": null,
  "commit_count": null,
  "top_languages": {},
  "analysis_metadata": {},
  "created_at": "2024-01-01T00:00:00Z",
  "completed_at": null,
  "progress": 10
}'

echo ""
echo "Expected response - completed (200 OK):"
echo '{
  "id": "uuid-here",
  "repository": {
    "id": "repo-uuid",
    "platform": "github",
    "repo_name": "next.js",
    "repo_url": "https://github.com/vercel/next.js",
    "owner": "vercel",
    "description": "The React Framework",
    "stars_count": 100000,
    "forks_count": 20000,
    "language": "JavaScript",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "status": "completed",
  "error_message": null,
  "file_count": 1542,
  "line_count": null,
  "commit_count": 45321,
  "top_languages": {
    "JavaScript": 78.5,
    "TypeScript": 15.2,
    "CSS": 4.3,
    "Python": 2.0
  },
  "analysis_metadata": {
    "github_api_response": {
      "full_name": "vercel/next.js",
      "default_branch": "canary",
      "size": 12345,
      "open_issues_count": 156,
      "license": "MIT"
    }
  },
  "created_at": "2024-01-01T00:00:00Z",
  "completed_at": "2024-01-01T00:05:00Z",
  "progress": 100
}'

echo ""
echo "3. Testing GET /api/v1/analyses/{id}/personality"
echo "--------------------------------------------------"

echo "Command to run:"
echo "curl -X GET '${API_BASE}/analyses/${ANALYSIS_ID}/personality/'"
echo ""

echo "Expected response (200 OK):"
echo '{
  "id": "personality-uuid",
  "analysis": "analysis-uuid",
  "complexity_score": 0.85,
  "creativity_score": 0.92,
  "maintainability_score": 0.75,
  "innovation_score": 0.95,
  "organization_score": 0.80,
  "performance_score": 0.88,
  "primary_color": "#6366f1",
  "secondary_color": "#8b5cf6",
  "accent_color": "#f472b6",
  "shape_type": "complex",
  "complexity_level": 9,
  "rotation_speed": 0.7,
  "particle_count": 150,
  "personality_description": "This repository represents a highly innovative and complex codebase with excellent organization and performance characteristics.",
  "tags": ["innovative", "complex", "performant", "well-structured"],
  "insights": [
    {
      "id": "insight-uuid-1",
      "personality": "personality-uuid",
      "category": "strengths",
      "insight_text": "Excellent separation of concerns and modular architecture",
      "severity": "info",
      "file_path": null,
      "line_numbers": null,
      "created_at": "2024-01-01T00:05:00Z"
    },
    {
      "id": "insight-uuid-2",
      "personality": "personality-uuid",
      "category": "patterns",
      "insight_text": "Consistent use of modern JavaScript/TypeScript patterns",
      "severity": "info",
      "file_path": "src/components",
      "line_numbers": null,
      "created_at": "2024-01-01T00:05:00Z"
    }
  ],
  "created_at": "2024-01-01T00:05:00Z"
}'

echo ""
echo "4. Testing Error Handling"
echo "-------------------------"

echo "Test 1: Missing repository URL"
curl -X POST '${API_BASE}/repositories/analyze/' \
  -H 'Content-Type: application/json' \
  -d '{}'
echo ""
echo "Expected: 400 Bad Request - {'error': 'Repository URL is required'}"

echo ""
echo "Test 2: Invalid repository URL"
curl -X POST '${API_BASE}/repositories/analyze/' \
  -H 'Content-Type: application/json' \
  -d '{"repo_url": "not-a-github-url"}'
echo ""
echo "Expected: 400 Bad Request - {'error': 'Only GitHub repositories are supported for MVP'}"

echo ""
echo "Test 3: Non-existent analysis"
curl -X GET '${API_BASE}/analyses/00000000-0000-0000-0000-000000000000/'
echo ""
echo "Expected: 404 Not Found"

echo ""
echo "============================"
echo "API Testing Complete"
echo ""
echo "To run these tests:"
echo "1. Start Django development server: python manage.py runserver"
echo "2. Copy and paste the curl commands above"
echo "3. Replace ANALYSIS_ID with actual ID from POST response"
echo ""
echo "Note: Make sure your .env file has the correct API keys"