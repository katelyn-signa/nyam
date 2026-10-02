# CourtLens Setup & Deployment Guide

## Quick Start with Docker
```bash
# 1. Clone repository
git clone https://github.com/courtlens/courtlens.git
cd courtlens

# 2. Configure environment
cp .env.example .env

# 3. Start PostgreSQL, Backend, and Frontend
docker-compose up -d --build

# 4. Access the platform
# Web Application: http://localhost:3000
# Backend API Docs: http://localhost:8000/docs
```

## Running Locally Without Docker
### Backend (Python 3.10+)
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend (Node 20+)
```bash
npm install
npm run dev
# Running on http://localhost:3000
```
