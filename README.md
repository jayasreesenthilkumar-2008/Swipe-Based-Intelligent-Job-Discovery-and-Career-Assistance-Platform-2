# SwipeX

**Swipe-Based Intelligent Job Discovery and Career Assistance Platform**

SwipeX is an AI-powered job discovery platform that reimagines job hunting through an 
intuitive swipe-based interface. It combines resume analysis, ATS scoring, personalized 
recommendations, and real-time opportunity tracking to help candidates find and apply to 
the most relevant roles across MNCs, startups, and newly founded companies.

---

## 🚀 Overview

Finding the right job is often slow and overwhelming. SwipeX simplifies the process by letting 
users swipe through curated job cards — right to apply/save, left to skip — while an AI engine 
continuously learns their preferences and improves recommendations. Alongside discovery, the 
platform analyzes resumes against job descriptions, scores ATS compatibility, and gives 
actionable suggestions to improve match rates.

Built for students, fresh graduates, experienced professionals, recruiters, career coaches, 
and job placement platforms.

---

## ✨ Key Features

- **Swipe-Based Job Discovery** – Tinder-style interface to explore and act on job opportunities
- **AI Resume Analyzer & ATS Scoring** – Upload a resume and get a compatibility score, missing 
  keywords, and improvement suggestions
- **Personalized Recommendations** – AI-generated match percentages that improve based on swipe 
  behavior
- **Smart Search & Filtering** – Filter by company type, remote/internship/full-time, salary, 
  skills, location, and experience level
- **Real-Time Job Freshness & Competition Tracking** – See posting time, applicant count, and 
  competition level (Low/Medium/High)
- **Application Tracking System** – Track Saved, Applied, Interview, Shortlisted, and Rejected 
  applications in one dashboard
- **Smart Notifications** – Alerts for high-match jobs, low-competition opportunities, and 
  startup hiring
- **Role-Based Dashboards** – Separate experiences for Job Seekers, Recruiters, and Admins
- **Analytics & Insights** – Resume performance tracking, skill gap analysis, and hiring trends

---

## 🧑‍🤝‍🧑 User Roles

| Role | Capabilities |
|------|-------------|
| **Job Seeker** | Create profile, upload resumes, swipe/apply/save jobs, track applications, view recommendations |
| **Recruiter** | Post jobs, review applicants, manage hiring workflows, access analytics |
| **Admin** | Manage users/recruiters, monitor platform activity, configure settings, view platform-wide analytics |

---

## 🏗️ Architecture

SwipeX follows a modular, service-oriented architecture:

- **Frontend** – React-based web app with swipe interface, filters, dashboards, and profile management
- **Backend** – API layer handling job listings, swipes, matching, resumes, ATS scoring, 
  recommendations, applications, and notifications
- **AI/NLP Services** – Text extraction, skill/keyword analysis, semantic similarity matching, 
  and LLM-based suggestions
- **Database & Storage** – Relational database for structured data, cache for real-time data, 
  file storage for resumes, vector database for semantic matching
- **External Services** – OAuth providers, email/push notification services, LLM/embedding APIs

*(See architecture diagram in `/docs` for full system design.)*

---

## 🛠️ Tech Stack

**Backend:** Python (Django REST Framework / FastAPI)
**Frontend:** React.js, React Router, Axios, Tailwind CSS, Redux/Context API, Framer Motion
**Database:** PostgreSQL (SQLite for development)
**AI & NLP:** OpenAI API, spaCy, sentence-transformers, scikit-learn
**Authentication:** JWT, OAuth2
**Cloud & DevOps:** Docker, AWS/Azure, GitHub Actions
**Testing:** Pytest, Django Test Client, Jest, React Testing Library
**Dev Tools:** VS Code, Git & GitHub, Postman, Render/AWS/Vercel

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL
- Docker (optional, for containerized setup)

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/swipex.git
cd swipex

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend setup
cd ../frontend
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in both `backend/` and `frontend/` with values such as:
