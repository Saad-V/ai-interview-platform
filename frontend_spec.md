
# Frontend Specification – AI Interview Platform (V1)

## Purpose
This document is the single source of truth for building the frontend. The backend is feature complete and MUST NOT be modified. The frontend should consume existing REST APIs only.

## Product Overview
The AI Interview Platform allows a candidate to:
1. Create an interview session.
2. Upload a resume.
3. Upload a job description.
4. Generate a personalized interview using AI.
5. Answer interview questions one at a time.
6. Receive an AI-generated report.

## Scope
Included:
- Resume upload
- JD upload
- Interview setup
- Preparation screen
- Interview screen
- Report screen
- Responsive UI

Excluded:
- Authentication
- Voice (STT/TTS)
- WebSockets
- PDF generation
- Admin dashboard

## Recommended Stack
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query
- Axios
- React Hook Form
- Zod
- Framer Motion
- Lucide Icons

## Backend Contract
The backend is complete. Do not modify it.

Flow:
Create Session
→ Upload Resume
→ Upload Job Description
→ Start Preparation
→ Begin Interview
→ Submit Answers
→ Receive Final Report

Frontend state:
- interviewSessionId
- interviewStatus
- currentQuestion
- currentTurn
- report

## Pages

### Landing
- Hero
- Features
- CTA button

### Interview Setup
- Resume upload
- JD upload
- Difficulty
- Duration
- Start Interview button

### Preparing
Animated progress:
- Parsing Resume
- Understanding JD
- Building Candidate Profile
- Building Job Profile
- Generating Blueprint
- Finalizing

### Interview
- Section title
- Turn number
- Question card
- Multiline answer box
- Submit button
- Progress indicator
- Loading state

### Report
Display:
- Overall Score
- Technical Score
- Communication Score
- Recommendation
- Strengths
- Areas for Improvement
- Summary

## Folder Structure

src/
├── assets
├── components
├── contexts
├── hooks
├── pages
├── services
├── types
└── utils

## Service Layer
Create separate services:
- interviewService
- resumeService
- jobDescriptionService

Never call axios directly inside page components.

## Design System
Theme:
- Dark by default
- Modern AI SaaS

Colors:
Primary: #4F46E5
Background: #09090B

Typography:
- Inter

Icons:
- Lucide

Animations:
- Framer Motion
- Subtle only

## Coding Rules
Always:
- Functional components
- Strict TypeScript
- Reusable hooks
- Reusable components
- Loading and error states

Never:
- inline CSS
- any
- duplicated API logic
- hardcoded URLs

## Future Ready
Keep architecture ready for:
- Voice Interview
- Authentication
- WebSockets
- PDF Reports
- Analytics

Do not implement them in V1.

## AI Coding Prompt

Read this specification completely before generating code.

The backend is already complete and must not be modified. Implement the frontend incrementally using React, TypeScript, Vite, Tailwind CSS, and shadcn/ui. Follow the documented page flow and API contract exactly. Build reusable components, isolate API calls in a service layer, maintain strict typing, and produce a clean, modern, responsive UI suitable for a production-quality portfolio project.
