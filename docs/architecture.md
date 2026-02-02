# GitSoul MVP - System Architecture

## Project Overview
GitSoul analyzes Git repositories and generates AI-powered personality visualizations with 3D elements.

**Tech Stack:**
- Frontend: Next.js 14+ (App Router)
- Backend: Django 4.2+ with DRF
- Database: PostgreSQL 15+
- AI: Z AI GLM 4.5
- 3D: Three.js + React Three Fiber

**Build Time:** 8 hours
**Philosophy:** Ship-First - MVP over Perfection

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Next.js Frontend (App Router)                             │ │
│  │  - Landing: GitHub URL input                               │ │
│  │  - Loading: Glassmorphism animations                        │ │
│  │  - Results: 3D personality + AI insights                   │ │
│  │  - Components: Three.js visualizations                     │ │
│  └─────────────┬───────────────────────────────┬───────────────┘ │
└────────────────┼───────────────────────────────┼─────────────────┘
                 │ HTTP/REST                     │ WebSocket (optional)
                 │                               │
┌────────────────▼───────────────────────────────▼─────────────────┐
│                      API Gateway Layer                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Django REST Framework (DRF)                               │ │
│  │  POST /api/v1/repositories/analyze                         │ │
│  │  GET  /api/v1/analyses/{id}/                               │ │
│  │  GET  /api/v1/personalities/{id}/                          │ │
│  └─────────────┬───────────────────────────────┬──────────────┘ │
└────────────────┼───────────────────────────────┼────────────────┘
                 │ Sync API                      │ Async Tasks
                 │                               │
┌────────────────▼─────────────────┐ ┌──────────▼─────────────────┐
│      Data Access Layer           │ │      Background Tasks      │
│  ┌─────────────────────────────┐ │ │  ┌───────────────────────┐ │
│  │  Django ORM → PostgreSQL    │ │ │  │  Celery/Django-Q      │ │
│  │  - Repository model         │ │ │  │  - GitHub API calls   │ │
│  │  - Analysis model           │ │ │  │  - Z AI processing    │ │
│  │  - Personality model         │ │ │  └───────────────────────┘ │
│  │  - CodeInsights model       │ │ └─────────────────────────────┘
│  └─────────────────────────────┘ │
└────────────────┼────────────────┘
                 │
┌────────────────▼────────────────┐
│     External APIs               │
│  ┌─────────────────────────────┐│
│  │  GitHub/GitLab API          ││
│  │  - Repository metadata      ││
│  │  - Commit history           ││
│  │  - File structure           ││
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │  Z AI API (GLM 4.5)         ││
│  │  - Code pattern analysis    ││
│  │  - Personality generation   ││
│  │  - 3D visualization params   ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

---

## Database Schema

### Repository Table
```sql
CREATE TABLE repositories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(20) NOT NULL, -- 'github' or 'gitlab'
    repo_name VARCHAR(255) NOT NULL,
    repo_url VARCHAR(500) NOT NULL UNIQUE,
    owner VARCHAR(255) NOT NULL,
    description TEXT,
    stars_count INTEGER DEFAULT 0,
    forks_count INTEGER DEFAULT 0,
    language VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_analyzed_at TIMESTAMP WITH TIME ZONE
);
```

### Analysis Table
```sql
CREATE TABLE analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
    error_message TEXT,
    file_count INTEGER,
    line_count INTEGER,
    commit_count INTEGER,
    top_languages JSONB, -- {"python": 60, "javascript": 30}
    analysis_metadata JSONB, -- Additional stats
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_analysis_status ON analyses(status);
CREATE INDEX idx_analysis_repository ON analyses(repository_id);
```

### Personality Table
```sql
CREATE TABLE personalities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,

    -- Personality traits (normalized 0-1)
    complexity_score DECIMAL(3,2),
    creativity_score DECIMAL(3,2),
    maintainability_score DECIMAL(3,2),
    innovation_score DECIMAL(3,2),
    organization_score DECIMAL(3,2),
    performance_score DECIMAL(3,2),

    -- 3D visualization parameters
    primary_color VARCHAR(7), -- Hex color
    secondary_color VARCHAR(7),
    accent_color VARCHAR(7),
    shape_type VARCHAR(50), -- 'sphere', 'cube', 'complex'
    complexity_level INTEGER, -- 1-10
    rotation_speed DECIMAL(5,2),
    particle_count INTEGER,

    -- AI-generated content
    personality_description TEXT,
    tags JSONB, -- ["structured", "innovative"]

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_personality_analysis ON personalities(analysis_id);
CREATE INDEX idx_personality_traits ON personalities(complexity_score, creativity_score);
```

### CodeInsights Table
```sql
CREATE TABLE code_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    personality_id UUID REFERENCES personalities(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- 'patterns', 'issues', 'strengths'
    insight_text TEXT NOT NULL,
    severity VARCHAR(20), -- 'info', 'low', 'medium', 'high'
    file_path VARCHAR(500),
    line_numbers TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_insights_personality ON code_insights(personality_id);
CREATE INDEX idx_insights_category ON code_insights(category);
```

---

## API Contracts

### 1. Analyze Repository
```http
POST /api/v1/repositories/analyze
Content-Type: application/json

Request Body:
{
    "repo_url": "https://github.com/username/repo-name"
}

Success Response (202 Accepted):
{
    "analysis_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "pending",
    "message": "Repository analysis started"
}

Error Response (400 Bad Request):
{
    "error": "Invalid repository URL"
}
```

### 2. Get Analysis Status
```http
GET /api/v1/analyses/{analysis_id}

Success Response (200 OK):
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "repository": {
        "name": "repo-name",
        "owner": "username",
        "language": "Python",
        "stars": 123,
        "forks": 45,
        "file_count": 67
    },
    "progress": 100,
    "created_at": "2026-02-02T22:00:00Z",
    "completed_at": "2026-02-02T22:02:30Z"
}

Pending Response (200 OK):
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "processing",
    "progress": 65,
    "message": "Analyzing code patterns..."
}
```

### 3. Get Personality & 3D Data
```http
GET /api/v1/personalities/{analysis_id}

Success Response (200 OK):
{
    "analysis_id": "550e8400-e29b-41d4-a716-446655440000",
    "personality": {
        "traits": {
            "complexity": 0.75,
            "creativity": 0.82,
            "maintainability": 0.68,
            "innovation": 0.90,
            "organization": 0.55,
            "performance": 0.70
        },
        "visualization": {
            "colors": {
                "primary": "#6366f1",
                "secondary": "#8b5cf6",
                "accent": "#f472b6"
            },
            "shape": {
                "type": "complex",
                "complexity": 8,
                "rotation_speed": 0.5,
                "particle_count": 100
            }
        },
        "description": "This repository demonstrates innovative code patterns with high complexity...",
        "tags": ["innovative", "complex", "structured"]
    },
    "insights": [
        {
            "id": "insight-1",
            "category": "strengths",
            "text": "Well-structured code organization with clear separation of concerns",
            "severity": "info"
        },
        {
            "id": "insight-2",
            "category": "patterns",
            "text": "Frequent use of factory pattern and dependency injection",
            "severity": "info"
        }
    ]
}

Error Response (404 Not Found):
{
    "error": "Personality not found for this analysis"
}
```

---

## Data Flow

```
User Input (GitHub URL)
    │
    ▼
[Frontend] Validates URL format
    │
    ▼ POST /api/v1/repositories/analyze
[Backend DRF] Creates Analysis record (status: pending)
    │
    ▼ Background Task (Django-Q / Celery)
    │
    ├─► [GitHub API] Fetch repository data
    │   ├─ Get repository metadata
    │   ├─ List files (tree structure)
    │   ├─ Get commit history
    │   └─ Get language statistics
    │
    ├─► [PostgreSQL] Store repository data
    │   Update Analysis: status = "processing"
    │
    ├─► [Z AI API] Analyze code patterns
    │   Input: Repository data + sample code files
    │   Output: JSON with:
    │     - Personality traits (0-1 scores)
    │     - Color palette (primary, secondary, accent)
    │     - 3D shape parameters
    │     - Description text
    │     - Tags
    │     - Code insights
    │
    └─► [PostgreSQL] Store personality + insights
        Update Analysis: status = "completed", completed_at = NOW()
    │
    ▼ Frontend Polling (every 2s)
[Frontend] GET /api/v1/analyses/{id}
    │
    ▼ When status = "completed"
[Frontend] GET /api/v1/personalities/{id}
    │
    ▼ [Three.js Component]
    - Parse 3D visualization data
    - Create 3D scene with React Three Fiber
    - Apply colors and shape parameters
    - Add animations (rotation, particles)
    │
    ▼ [UI Components]
    - Display personality description
    - Show trait scores (progress bars)
    - Render code insights cards
    - Apply glassmorphism styling
    │
    ▼ Final Result
User sees 3D personality visualization + AI insights
```

---

## Technology Rationale

### Frontend: Next.js 14+ (App Router)
- **Server Components** for performance and SEO
- **Built-in API Routes** for proxying requests
- **File-based routing** for clean structure
- **React ecosystem** with hooks and context
- **Great DX** with TypeScript and hot reload

### Backend: Django 4.2+ with DRF
- **Robust ORM** for PostgreSQL operations
- **Built-in Admin** for quick debugging
- **DRF Serializers** for API validation
- **Mature ecosystem** (Celery, Django-Q, etc.)
- **Security best practices** out of the box

### Database: PostgreSQL 15+
- **JSONB support** for flexible schema-less data
- **Full-text search** for insights (future feature)
- **ACID transactions** for data integrity
- **Complex queries** with JOINs and aggregations
- **Reliable and scalable**

### 3D Library: Three.js + React Three Fiber
- **Industry standard** for WebGL 3D
- **React-friendly** API with hooks
- **Good performance** with optimized rendering
- **Large community** and examples
- **Future-proof** with active development

### AI: Z AI GLM 4.5
- **Strong code understanding** capabilities
- **JSON output** support for structured data
- **Configurable prompts** for consistent results
- **Reasonable latency** for real-time analysis
- **Cost-effective** for MVP

---

## Security Considerations

### API Key Management
- **Z AI API Key:** Store in Django settings (environment variable)
- **GitHub Token:** Optional, use for higher rate limits (user-provided)

### Rate Limiting
- **GitHub API:** 60 requests/hour (unauthenticated)
- **Z AI API:** Implement client-side rate limiting
- **User requests:** Limit to 5 analyses per hour per IP

### Input Validation
- **Repository URL:** Regex validation for GitHub/GitLab patterns
- **Analysis Size:** Limit repositories to <1000 files for MVP
- **Sanitization:** Escape all user-generated content

### CORS Configuration
- Allow frontend domain only
- Validate Origin header
- Use credentials mode if needed

---

## Performance Optimization

### Database
- **Indexes** on frequently queried fields (status, repository_id, analysis_id)
- **Connection pooling** with PgBouncer (optional for MVP)
- **Query optimization** with select_related/prefetch_related

### Caching
- **Repository metadata:** Cache for 1 hour (avoid repeated GitHub API calls)
- **Analysis results:** Cache for 24 hours
- **Use Redis** if available, or in-memory cache for MVP

### Frontend
- **Code splitting** with Next.js dynamic imports
- **Lazy load** Three.js components
- **Optimize** 3D scene (reduce geometry, use textures efficiently)
- **Debounce** polling requests

---

## MVP Limitations

**What's IN scope:**
- Public GitHub repositories only
- Basic file structure analysis
- Single language personality (dominant language)
- 6 personality traits
- Simple 3D shapes (sphere, cube, complex mesh)
- Basic code insights (strengths, patterns)

**What's OUT of scope:**
- Private repositories (requires OAuth)
- Multi-language deep analysis
- Complex 3D animations
- User accounts/saving profiles
- Sharing/social features
- Historical comparison
- Advanced metrics (cyclomatic complexity, etc.)

---

## Deployment Architecture

### Development
```
Frontend: http://localhost:3000 (Next.js dev server)
Backend:  http://localhost:8000 (Django runserver)
Database: localhost:5432 (PostgreSQL)
```

### Production (Simplified for MVP)
```
Frontend: Vercel (Next.js)
Backend:  Railway/Render (Django + PostgreSQL)
AI API:   Z AI (managed service)
```

### Alternative: Single Container
```
Docker Compose with:
- Next.js (frontend)
- Django (backend)
- PostgreSQL (database)
```

---

## Monitoring & Logging

### Backend Logs
- Request/response logs
- GitHub API calls
- Z AI API calls
- Analysis job status changes
- Error stack traces

### Frontend Analytics
- Page views
- Analysis submissions
- Error tracking (Sentry optional)

### Health Checks
- `/health/` endpoint
- Database connection check
- External API availability check

---

## Timeline Estimates

**Software Architect Phase (30 min):** ✅ Complete

**Parallel Phases (starting now):**
- Researcher: 45 min
- Product Manager: 30 min
- Designer: 45 min
- QA Agent: 30 min

**Development Phase (next 5 hours):**
- Backend setup: 60 min
- Frontend setup: 60 min
- Integration: 120 min
- 3D implementation: 60 min

**Testing & Polish (remaining 1.5 hours):**
- Bug fixes
- Performance optimization
- Final polish

---

**Document Version:** 1.0
**Author:** คุณฐาน (Software Architect)
**Date:** 2026-02-02
**Status:** MVP Architecture Complete ✅
