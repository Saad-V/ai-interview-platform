# AI Interview Platform — Frontend Implementation Plan

## Background

The backend is a **FastAPI** application with 6 endpoints that drive the full interview lifecycle. The frontend must consume these APIs without modifying the backend. This plan builds a production-quality React/TypeScript SPA.

## User Review Required

> [!IMPORTANT]
> **CORS**: The backend has **no CORS middleware**. The Vite dev server will use a proxy (`/api` → `http://127.0.0.1:8000/api`) so the browser never hits a cross-origin wall during development. For production you'll need to either add CORS to FastAPI or serve both from the same origin.

> [!IMPORTANT]
> **`/start` latency**: The backend's `/start` endpoint contains two `time.sleep(60)` calls (Gemini free-tier rate limiting), so the preparation step can take **~2+ minutes**. The frontend will show an animated preparation screen with simulated progress steps during this wait.

## API Contract Summary

| Step | Method | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| 1. Create session | `POST` | `/api/v1/interview-sessions/` | `{ planned_duration_minutes, difficulty }` | `{ id, status, difficulty, planned_duration_minutes, created_at }` |
| 2. Upload resume | `POST` | `/api/v1/interview-sessions/{id}/resume` | `multipart/form-data` (field: `file`) | `ResumeResponse` |
| 3. Upload JD | `POST` | `/api/v1/interview-sessions/{id}/job-description` | `multipart/form-data` (field: `file`) | `JobDescriptionResponse` |
| 4. Start prep | `POST` | `/api/v1/interview-sessions/{id}/start` | — | `{ "Message": "..." }` |
| 5. Begin interview | `POST` | `/api/v1/interview-sessions/{id}/begin` | — | `{ turn_number, section_title, question }` |
| 6. Submit answer | `POST` | `/api/v1/interview-sessions/{id}/answer` | `{ answer }` | `{ interview_completed, current_question?, report? }` |

## Proposed Changes

### 1. Project Scaffolding

#### [NEW] `frontend/` directory

- Initialize with `npx create-vite@latest ./ --template react-ts`
- Install dependencies: `tailwindcss`, `@tailwindcss/vite`, `shadcn/ui`, `react-router-dom`, `@tanstack/react-query`, `axios`, `react-hook-form`, `zod`, `@hookform/resolvers`, `framer-motion`, `lucide-react`
- Configure Vite proxy for `/api` → `http://127.0.0.1:8000`
- Configure Tailwind CSS with dark theme defaults
- Initialize shadcn/ui

---

### 2. Design System & Global Styles

#### [NEW] `frontend/src/index.css`

- Tailwind directives + CSS custom properties
- Dark theme: background `#09090B`, primary `#4F46E5` (indigo)
- Inter font import from Google Fonts
- Global transition defaults

---

### 3. Types

#### [NEW] `frontend/src/types/interview.ts`

All TypeScript interfaces mirroring the backend schemas:

- `InterviewDifficulty` enum (`EASY`, `MEDIUM`, `HARD`)
- `InterviewStatus` enum (`CREATED`, `PARSING`, `READY`, `IN_PROGRESS`, `COMPLETED`, `FAILED`)
- `InterviewSessionCreate`, `InterviewSessionResponse`
- `ResumeResponse`, `JobDescriptionResponse`
- `QuestionResponse`, `SubmitAnswerRequest`, `SubmitAnswerResponse`
- `InterviewReport` (overall_score, technical_score, communication_score, strengths, areas_for_improvement, summary, recommendation)

---

### 4. Service Layer

#### [NEW] `frontend/src/services/api.ts`

- Axios instance with `baseURL: "/api/v1"` and default headers

#### [NEW] `frontend/src/services/interviewService.ts`

- `createSession(data)` → POST `/interview-sessions/`
- `startPreparation(sessionId)` → POST `/interview-sessions/{id}/start`
- `beginInterview(sessionId)` → POST `/interview-sessions/{id}/begin`
- `submitAnswer(sessionId, answer)` → POST `/interview-sessions/{id}/answer`

#### [NEW] `frontend/src/services/resumeService.ts`

- `uploadResume(sessionId, file)` → POST `/interview-sessions/{id}/resume`

#### [NEW] `frontend/src/services/jobDescriptionService.ts`

- `uploadJobDescription(sessionId, file)` → POST `/interview-sessions/{id}/job-description`

---

### 5. State Management

#### [NEW] `frontend/src/contexts/InterviewContext.tsx`

React Context + Reducer to hold:
- `sessionId`, `status`, `currentQuestion`, `currentTurn`, `report`
- Actions: `SET_SESSION`, `SET_STATUS`, `SET_QUESTION`, `SET_REPORT`, `RESET`

---

### 6. Pages

#### [NEW] `frontend/src/pages/LandingPage.tsx`

- Hero section with animated gradient headline
- Feature cards (Resume Analysis, AI Interview, Instant Report)
- CTA button → navigates to `/setup`

#### [NEW] `frontend/src/pages/SetupPage.tsx`

- Resume file drop zone (drag-and-drop + click)
- Job description file drop zone
- Difficulty selector (EASY / MEDIUM / HARD) — styled radio cards
- Duration input (minutes)
- "Start Interview" button
- Flow: create session → upload resume → upload JD → navigate to `/preparing`

#### [NEW] `frontend/src/pages/PreparingPage.tsx`

- Animated stepper showing 6 stages:
  1. Parsing Resume
  2. Understanding Job Description
  3. Building Candidate Profile
  4. Building Job Profile
  5. Generating Interview Blueprint
  6. Finalizing
- Calls `/start` endpoint; on success, auto-navigates to `/interview`
- Shows animated progress with Framer Motion

#### [NEW] `frontend/src/pages/InterviewPage.tsx`

- Calls `/begin` to get first question
- Shows: section title, turn number, question card, multiline answer textarea, submit button
- Progress bar (current turn / total — estimated from section data)
- On submit → calls `/answer`, updates question or navigates to `/report`
- Loading spinner while evaluating

#### [NEW] `frontend/src/pages/ReportPage.tsx`

- Overall score (large circular gauge)
- Technical & Communication scores (progress bars)
- Recommendation badge (Hire / Maybe / No Hire)
- Strengths list (green checkmarks)
- Areas for Improvement list (orange caution icons)
- Summary paragraph
- "Start New Interview" button

---

### 7. Reusable Components

#### [NEW] `frontend/src/components/ui/` (shadcn components)

- Button, Card, Input, Textarea, Badge, Progress, Label, etc.

#### [NEW] `frontend/src/components/FileDropZone.tsx`

- Drag-and-drop file upload component with visual feedback

#### [NEW] `frontend/src/components/ScoreGauge.tsx`

- Animated circular score display using SVG + Framer Motion

#### [NEW] `frontend/src/components/StepProgress.tsx`

- Animated step indicator for the preparation screen

#### [NEW] `frontend/src/components/Navbar.tsx`

- Minimal top nav with logo and optional session indicator

#### [NEW] `frontend/src/components/PageTransition.tsx`

- Framer Motion page transition wrapper

---

### 8. Routing

#### [MODIFY] `frontend/src/App.tsx`

```
/          → LandingPage
/setup     → SetupPage
/preparing → PreparingPage
/interview → InterviewPage
/report    → ReportPage
```

---

### 9. Hooks

#### [NEW] `frontend/src/hooks/useInterview.ts`

- Convenience hook wrapping `useContext(InterviewContext)`

---

## Verification Plan

### Automated
- `npm run build` — confirm zero TypeScript errors and successful production build

### Manual
- Start the backend (`uvicorn app.main:app --reload`)
- Start the frontend (`npm run dev`)
- Walk through the full flow: Landing → Setup → Preparing → Interview → Report
- Verify responsive layout on mobile viewport
