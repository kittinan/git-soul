# GitSoul - AI Repository Personality 3D Visualization

> Analyze your Git repository and see its personality visualized in 3D with AI insights.

## 🚀 Quick Start with Docker

```bash
# Clone the repository
git clone git@github.com:kittinan/git-soul.git
cd git-soul

# Create .env file
cp .env.example .env
# Edit .env and add your Z_AI_API_KEY

# Start all services
docker-compose up --build

# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/api/v1/docs/
```

## 📁 Project Structure

```
gitsoul-mvp/
├── frontend/              # Next.js Frontend
│   ├── app/              # App Router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities
│   └── package.json
├── backend/              # Django REST API
│   ├── gitsoul/          # Django project
│   ├── api/              # API apps
│   ├── requirements.txt
│   └── manage.py
├── docs/                 # Documentation
├── docker-compose.yml    # Docker orchestration
└── README.md
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Z AI API (Required)
Z_AI_API_KEY=your_z_ai_api_key_here

# GitHub Token (Optional - for higher rate limits)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxx

# Database (for docker-compose)
DATABASE_URL=postgresql://gitsoul:gitsoul_dev@db:5432/gitsoul
```

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **3D**: Three.js + React Three Fiber
- **Styling**: Tailwind CSS
- **HTTP**: Axios

### Backend
- **Framework**: Django 4.2 + DRF
- **Database**: PostgreSQL 15
- **API Clients**: Requests (GitHub API, Z AI API)

## 📊 API Endpoints

### Analyze Repository
```http
POST /api/v1/repositories/analyze
Content-Type: application/json

{
  "repo_url": "https://github.com/username/repo-name"
}
```

### Get Analysis Status
```http
GET /api/v1/analyses/{analysis_id}
```

### Get Personality & 3D Data
```http
GET /api/v1/personalities/{analysis_id}
```

## 🎨 Features

- ✅ Analyze public GitHub repositories
- ✅ AI-powered personality insights (6 traits)
- ✅ 3D visualization of repository personality
- ✅ Clean, futuristic UI with glassmorphism
- ✅ Dark mode by default
- ✅ Code pattern analysis

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| frontend | 3000 | Next.js dev server |
| backend | 8000 | Django REST API |
| db | 5432 | PostgreSQL database |

## 🧪 Development

### Frontend (Local)
```bash
cd frontend
npm install
npm run dev
```

### Backend (Local)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Database Setup
```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Access Django admin
# http://localhost:8000/admin/
```

## 📝 Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push origin feature/your-feature-name
```

## 🎯 MVP Scope

**Must-Have:**
- GitHub repository URL input
- Repository analysis via AI
- 6 personality traits visualization
- 3D rendering with Three.js
- Dark mode with glassmorphism

**Out of Scope:**
- User accounts
- Private repositories
- Mobile optimization (basic only)
- Sharing features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Credits

Built with:
- Z AI GLM 4.5 for code analysis
- Three.js for 3D visualization
- Next.js + Django for full-stack

---

**Built in 8 hours** with a Ship-First mindset 🚀
