# AI Quiz Platform

AI Quiz Platform is a full-stack quiz management application that helps users generate topic-based quizzes with AI, organize them into folders, build question banks manually and using AI, and attend quizzes through an interactive interface. It combines a polished Next.js frontend with PostgreSQL-backed APIs for persistent quiz storage and retrieval.

## Overview

This project is designed for learners, educators, and builders who want a single workspace to:

- generate quiz questions from a topic and difficulty level
- create folders to organize quiz collections
- build quizzes manually with CRUD support for questions
- attend quizzes with instant scoring and progress tracking
- manage quiz data through a PostgreSQL database

> Note: the current `/api/generate` route is configured to return mock questions while the live AI provider calls are commented out to save API quota.

## Features

- AI-assisted quiz generation by topic, difficulty, and question count
- Folder-based quiz organization for structured content management
- Manual quiz creation flow with question editing and deletion
- Quiz-taking experience with per-question navigation and final score summary
- PostgreSQL persistence for folders, quizzes, and questions
- REST-style API routes built with the Next.js App Router
- Animated, modern UI using Framer Motion, GSAP, and Three.js
- Theme toggle and polished visual presentation for a better user experience

## Tech Stack

- **Next.js 16**: React framework used for routing, server endpoints, and full-stack app structure
- **React 19**: Component-based UI library powering the frontend experience
- **PostgreSQL**: Relational database used to store folders, quizzes, and questions
- **`pg`**: Node.js PostgreSQL client used for database connectivity
- **Google Gemini API**: Intended primary AI provider for quiz generation
- **Groq API**: Intended fallback AI provider for quiz generation
- **Framer Motion**: Page and component animation library for interactive transitions
- **GSAP**: Fine-grained animation control for reveal effects in the generator flow
- **Three.js**: Background visual effects for a more immersive landing experience
- **Axios**: HTTP client used in selected client-side data-fetching flows
- **Lucide React**: Icon library used across the UI
- **Lenis**: Smooth scrolling utility for enhanced motion and page feel

## Folder Structure

```text
ai-quiz-app-2/
+-- src/
|   +-- app/
|   |   +-- api/
|   |   |   +-- folders/
|   |   |   +-- generate/
|   |   |   `-- quizzes/
|   |   +-- create/
|   |   +-- create-quiz/
|   |   +-- dashboard/
|   |   +-- generate/
|   |   +-- quiz/
|   |   +-- globals.css
|   |   +-- layout.js
|   |   `-- page.js
|   +-- components/
|   |   `-- layout/
|   +-- features/
|   |   +-- create/
|   |   +-- create-quiz/
|   |   +-- dashboard/
|   |   +-- generator/
|   |   +-- quiz/
|   |   `-- quiz-list/
|   `-- server/
|       +-- db/
|       +-- repositories/
|       `-- utils/
+-- package.json
+-- next.config.mjs
`-- .env.local
```

## Installation

### Prerequisites

- Node.js 18+ recommended
- npm
- PostgreSQL database or Supabase Postgres connection string

### Steps

```bash
git clone <your-repository-url>
cd ai-quiz-app-2
npm install
```

Create a `.env.local` file in the project root and add the required environment variables shown below.

## Run Commands

### 1. Start the development server

```bash
npm run dev
```

### 2. Open the app

Visit:

```text
http://localhost:3000
```

### 3. Create a production build

```bash
npm run build
```

### 4. Start the production server

```bash
npm run start
```

### 5. Run linting

```bash
npm run lint
```

## Environment Variables

Create a `.env.local` file and use placeholder values like these:

```env
GEMINI_API_KEY=your_gemini_api_key
GROQ_KEY=your_groq_api_key
DATABASE_URL=your_postgresql_connection_string
DIRECT_URL=your_direct_database_connection_string
```

### Variable Notes

- `GEMINI_API_KEY`: API key for Google Gemini quiz generation
- `GROQ_KEY`: API key for Groq fallback generation
- `DATABASE_URL`: primary PostgreSQL connection string used by the app
- `DIRECT_URL`: optional fallback connection string if `DATABASE_URL` is unavailable

## API Summary

- `POST /api/generate`: generate quiz questions from topic, difficulty, and count
- `GET /api/folders`: fetch all folders
- `POST /api/folders`: create a folder
- `GET /api/quizzes`: fetch all quizzes or quizzes by `folderId`
- `POST /api/quizzes`: create a quiz inside a folder
- `GET /api/quizzes/[quizId]`: fetch a single quiz with questions
- `POST /api/quizzes/[quizId]/questions`: add a question to a quiz
- `PATCH /api/quizzes/[quizId]/questions/[questionId]`: update a question
- `DELETE /api/quizzes/[quizId]/questions/[questionId]`: delete a question

## Screenshots

Add screenshots here after capturing the UI:

- `docs/screenshots/home.png` - Landing page
- `docs/screenshots/generator.png` - AI quiz generation flow
- `docs/screenshots/create.png` - Quiz and question creation workspace
- `docs/screenshots/dashboard.png` - Folder dashboard
- `docs/screenshots/attend-quiz.png` - Quiz-taking experience

Example markdown:

```md
![Home Screen](docs/screenshots/home.png)
```

## Future Improvements

- Re-enable live Gemini and Groq generation with better response validation
- Add authentication and user-specific quiz ownership
- Persist quiz attempt history and analytics
- Support timed quizzes and difficulty-based scoring
- Add export options such as PDF, CSV, or shareable public links
- Introduce unit and integration tests for API routes and UI flows

## Contribution Guidelines

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commit messages
4. Test the affected functionality
5. Open a pull request with a short summary of the improvement

## License

This project is licensed under the **ISC License**.
