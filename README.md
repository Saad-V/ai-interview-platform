#  AI Interview Platform Backend

An AI-powered interview backend built with **FastAPI**, **PostgreSQL**, **SQLAlchemy**, and **Google Gemini**, capable of generating personalized interview plans, evaluating candidate responses, and producing structured interview reports.

The system simulates a complete technical interview lifecycle by leveraging Large Language Models (LLMs) while maintaining a clean, production-inspired backend architecture.

---

## ✨ Features

### 📄 Intelligent Resume & Job Description Analysis
- Upload candidate resume and job description.
- Automatically extract structured candidate and job profiles using Gemini.
- Store AI-generated profiles in PostgreSQL.

### 🧠 AI Interview Blueprint Generation
- Dynamically generates interview sections and questions based on:
  - Candidate profile
  - Job requirements
  - Difficulty level
  - Interview duration
- Includes:
  - Expected topics
  - Evaluation criteria
  - Follow-up questions
  - Maximum score per question

### 🎤 AI Interview Runtime
- Begins interview from generated blueprint.
- Delivers one question at a time.
- Maintains interview state throughout the session.
- Supports sequential interview flow.

### 🤖 AI Answer Evaluation
For every candidate response, Gemini evaluates:

- Technical correctness
- Communication quality
- Missing concepts
- Strengths
- Weaknesses
- Improvement suggestions
- Numerical score

### 📊 Final Interview Report
Generates a comprehensive report including:

- Overall score
- Technical score
- Communication score
- Candidate strengths
- Areas for improvement
- Overall summary
- Hiring recommendation

---

# 🏗 Architecture

```
                FastAPI REST API
                        │
        ┌───────────────┴───────────────┐
        │                               │
     Routers                        AI Services
        │                               │
        ▼                               ▼
     Services  ─────────────► Gemini API
        │
        ▼
   Repositories
        │
        ▼
 PostgreSQL Database
```

The project follows a layered architecture:

- API Layer
- Service Layer
- Repository Layer
- Persistence Layer
- AI Layer

This separation keeps business logic independent from database operations and AI interactions.

---

# ⚙ Tech Stack

### Backend

- FastAPI
- Python 3.11
- SQLAlchemy ORM
- Alembic
- PostgreSQL

### AI

- Google Gemini API
- Prompt Engineering

### Storage

- PostgreSQL JSONB
- Local File Storage

---

# 🗄 Database Design

The system consists of **8 normalized entities**.

| Table | Purpose |
|---------|----------|
| interview_sessions | Tracks interview lifecycle |
| resumes | Resume metadata |
| job_descriptions | Job description metadata |
| candidate_profiles | AI-generated candidate profile |
| job_profiles | AI-generated job profile |
| interview_blueprints | Generated interview plan |
| conversation_turns | Every interview interaction |
| reports | Final interview report |

---

# 🔄 Interview Workflow

```
Create Interview Session
        │
        ▼
Upload Resume + Job Description
        │
        ▼
Generate Candidate Profile
Generate Job Profile
        │
        ▼
Generate Interview Blueprint
        │
        ▼
Interview Ready
        │
        ▼
Begin Interview
        │
        ▼
Question 1
        │
        ▼
Candidate Answer
        │
        ▼
Gemini Evaluation
        │
        ▼
Save Conversation Turn
        │
        ▼
Repeat...
        │
        ▼
Generate Final Report
        │
        ▼
Interview Completed
```

---

# 📁 Project Structure

```
app/
│
├── ai/
│   ├── llm.py
│   ├── prompts.py
│   └── schemas.py
│
├── api/
│   └── v1/
│
├── core/
│
├── models/
│
├── repositories/
│
├── schemas/
│
├── services/
│
├── storage/
│
└── main.py
```

---

# 🧠 AI Pipeline

The project uses Gemini four different times.

## 1. Candidate Profile Generation

Resume

↓

Structured Candidate Profile

---

## 2. Job Profile Generation

Job Description

↓

Structured Job Profile

---

## 3. Interview Blueprint Generation

Candidate Profile

+

Job Profile

↓

Interview Sections

↓

Questions

↓

Evaluation Criteria

---

## 4. Interview Evaluation

Question

+

Expected Topics

+

Candidate Answer

↓

Evaluation

↓

Stored Conversation Turn

---

## 5. Interview Report

Candidate Profile

+

Job Profile

+

Conversation History

↓

Final Interview Report

---

# 📌 API Endpoints

## Interview Sessions

| Method | Endpoint |
|---------|-----------|
| POST | `/api/v1/interview-sessions` |
| POST | `/api/v1/interview-sessions/{id}/start` |
| POST | `/api/v1/interview-sessions/{id}/begin` |
| POST | `/api/v1/interview-sessions/{id}/answer` |

---

## Resume

| Method | Endpoint |
|---------|-----------|
| POST | `/api/v1/resumes/upload` |

---

## Job Description

| Method | Endpoint |
|---------|-----------|
| POST | `/api/v1/job-descriptions/upload` |

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/Saad-V/AiiN.git
cd ai-interview-platform
```

## Create Virtual Environment

```bash
python -m venv .venv
```

Windows

```bash
.venv\Scripts\activate
```

Linux/macOS

```bash
source .venv/bin/activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Environment Variables

Create a `.env` file.

```env
DATABASE_URL=postgresql://username:password@localhost:5432/ai_interview
GEMINI_API_KEY=YOUR_API_KEY
GEMINI_MODEL=gemini-2.5-flash
```

---

## Run Alembic

```bash
alembic upgrade head
```

---

## Start Server

```bash
uvicorn app.main:app --reload
```

Swagger UI

```
http://127.0.0.1:8000/docs
```

---

# 🧪 Example Workflow

1. Create Interview Session
2. Upload Resume
3. Upload Job Description
4. Start Interview Preparation
5. Begin Interview
6. Submit Candidate Answers
7. Receive Final AI Report

---

# 📈 Current Capabilities

- AI Resume Parsing
- AI Job Description Parsing
- AI Interview Planning
- AI Response Evaluation
- Persistent Conversation Storage
- AI Interview Reports
- PostgreSQL Persistence
- RESTful API
- Layered Backend Architecture

---

# 🔮 Future Enhancements

- Voice-based Interview (Speech-to-Text / Text-to-Speech)
- WebSocket Streaming
- JWT Authentication & Authorization
- Multi-user Support
- PDF Report Generation
- Cloud File Storage (AWS S3)
- Docker & Kubernetes Deployment
- Interview Analytics Dashboard
- Email Report Delivery

---

# 👨‍💻 Author

**V Muhammed Saad Sabeel**

Electronics & Telecommunication Engineering  
AI • Backend Engineering • Edge AI • Embedded Systems

GitHub: https://github.com/Saad-V

---

## ⭐ Project Highlights

- Production-inspired layered backend architecture
- AI-powered interview orchestration
- Structured LLM outputs using Pydantic schemas
- Persistent interview lifecycle management
- PostgreSQL + JSONB for flexible AI-generated data
- Designed as an end-to-end AI interview backend for technical hiring