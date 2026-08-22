# DevCareer AI

A full-stack platform that helps developers prepare for technical job interviews. It combines AI voice interviews, resume generation, resume analysis, and real-time coding practice into a single product.

> **Models in use:** LLaMA 3.3 70B (Groq) powers the voice agent during interviews. Google Gemini Flash analyzes the transcript afterward, generates interview questions, powers CV optimization/analysis, and evaluates real-time coding challenges.

---

## Overview

DevCareer AI is built around four core modules that cover different stages of technical interview preparation. The platform consists of three independent services that run together: a Next.js frontend, an Express REST API backend, and a LiveKit voice agent process.

---

## Modules

### AI Voice Interview

The main module. You have a live voice conversation with an AI interviewer through your microphone, just like a real interview call. The agent listens to your answers, responds naturally, and moves through each question in sequence.

Interviews can be created in two ways:
- **Form-based**: choose your target role, experience level, tech stack, interview type (technical, behavioral, or mixed), and number of questions.
- **Voice-based**: talk to a setup agent that collects all parameters through conversation and creates the interview automatically.

Once the interview ends, Google Gemini analyzes the full transcript and generates a structured feedback report with a score from 0 to 100 across five categories: communication skills, technical knowledge, problem solving, cultural fit, and confidence. The report includes identified strengths, areas for improvement, and a final assessment. For English interviews, a separate English proficiency evaluation is generated in parallel with CEFR level, grammar score, vocabulary suggestions, and specific error examples.

Supports English and Spanish. Multiple voices available: Alejandro, Catalina, Katie, Daniel.

### CV Creator

A guided module that helps users build a professional resume with AI assistance. It structures the content following standard formats used in tech hiring, translating and refining experience bullets and executive summaries using Gemini AI to pass ATS filters.

### CV Analyzer

Upload an existing resume as a PDF or paste text along with a job description. The system uses Gemini multimodal analysis to extract the content, compare it against the job opening, calculate an ATS compatibility score (keywords, formatting, grammar, impact), and provide actionable suggestions.

### Real-time Coding Agent (beta)

An interactive module where users solve coding challenges in a Monaco Editor. Solutions are verified against test cases and analyzed by Gemini AI to grade code correctness, assess Big-O time and space complexity, and provide senior interviewer tips.

---

## Authentication

Full auth flow with sign up, sign in, sign out, and protected routes. Compatible with:
- **Production:** AWS Cognito (User Pools + JWT verification)
- **Local development:** Supabase (PostgreSQL + Auth)

---

## Architecture

```
Browser
  |
  v
Frontend (Next.js) — Vercel / ECS
  |                          \
  v                           v
Backend (Express API)     LiveKit Cloud (WebRTC)
  |                           |
  |                           v
  |                       Voice Agent
  |                         Deepgram  (speech to text: Nova-2)
  |                         Groq LLaMA 3.3 70B  (language model)
  |                         Cartesia Sonic-2  (text to speech)
  |                         Silero VAD  (voice activity detection)
  |
  v
Data Layer
  Production:   AWS DynamoDB + AWS Cognito
  Local dev:    Supabase (PostgreSQL + Auth)
  AI Provider:  Google Gemini Flash (Feedback, Questions, CV, Coding)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4, Framer Motion |
| UI components | shadcn/ui, Radix UI, Monaco Editor |
| Forms and validation | React Hook Form, Zod |
| Backend | Express.js, TypeScript |
| Speech to text | Deepgram Nova-2 |
| Language model (Voice Agent) | Groq — LLaMA 3.3 70B |
| Text to speech | Cartesia Sonic-2 |
| Voice activity detection | Silero VAD |
| Real-time audio | LiveKit Agents SDK + Client SDK |
| AI analysis & generation | Google Gemini Flash (`gemini-3.1-flash-lite`) |
| Auth (production) | AWS Cognito |
| Database (production) | AWS DynamoDB |
| Auth (local dev) | Supabase Auth |
| Database (local dev) | Supabase PostgreSQL |
| Infrastructure | Terraform |
| Deployment | Vercel / AWS ECS Fargate |

---

## Project Structure

```
DevCareer AI/
├── frontend/
│   ├── app/
│   │   ├── (auth)/             # Sign-in and sign-up pages
│   │   ├── (root)/
│   │   │   ├── dashboard/      # User dashboard
│   │   │   ├── interview/      # Live interview room
│   │   │   ├── cv-analyzer/    # Resume analysis
│   │   │   ├── cv-creator/     # Resume builder
│   │   │   └── code-challenge/ # Coding challenges
│   │   ├── api/                # Next.js Server Routes (CV analyzer & code feedback)
│   │   └── page.tsx            # Landing page
│   ├── components/             # Shared UI components
│   ├── contexts/               # React context providers
│   ├── lib/                    # API clients and auth helpers
│   └── types/                  # TypeScript type definitions
│
├── Backend/
│   └── src/
│       ├── config/             # Supabase, DynamoDB, Cognito initialization
│       ├── middleware/         # Auth middleware (Cognito / Supabase)
│       ├── routes/             # API route handlers (auth, interviews, feedback, livekit, cv)
│       ├── services/           # Business logic per domain
│       └── types/
│
├── livekit-agent/
│   └── agent.ts                # Voice agent with tool calling and LiveKit Agents SDK
│
├── terraform-aws/              # Infrastructure as Code for AWS (ECS, ALB, DynamoDB, Cognito)
└── scripts/                    # Automation and cleanup scripts
```

---

## Running Locally

The full application runs with three services in separate terminals.

### Prerequisites

- Node.js 20+
- Accounts for the required external services (see table below)

### Required services

| Service | Purpose | Free tier |
|---|---|---|
| LiveKit Cloud | WebRTC audio signaling | Yes |
| Deepgram | Speech to text (Nova-2) | Yes |
| Groq | LLaMA 3.3 70B inference for voice agent | Yes |
| Cartesia | Text to speech (Sonic-2) | Yes |
| Google Gemini AI | Feedback, questions, CV, and coding evaluations | Yes |
| Supabase | Auth and PostgreSQL database for local development | Yes |

### Setup

**1. Clone the repository**

```bash
git clone https://github.com/hernangtrz/DevCareer-AI-AWS.git
cd DevCareer-AI-AWS
```

**2. Create the Supabase tables**

In your Supabase SQL editor, run:

```sql
create table users (
  id text primary key,
  email text unique not null,
  name text,
  created_at timestamptz default now()
);

create table interviews (
  id text primary key,
  user_id text references users(id),
  role text,
  level text,
  techstack jsonb,
  type text,
  questions jsonb,
  finalized boolean default false,
  cover_image text,
  created_at timestamptz default now()
);

create table feedback (
  id text primary key,
  interview_id text references interviews(id),
  user_id text references users(id),
  total_score numeric,
  category_scores jsonb,
  strengths jsonb,
  areas_for_improvement jsonb,
  final_assessment text,
  english_feedback jsonb,
  created_at timestamptz default now()
);
```

**3. Configure environment variables**

Backend (`Backend/.env`):
```env
PORT=3001
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
LIVEKIT_URL=https://your-project.livekit.cloud
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key

# Optional (Production AWS Mode):
# AWS_REGION=us-east-1
# COGNITO_USER_POOL_ID=
# COGNITO_CLIENT_ID=
```

Frontend (`frontend/.env`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_LIVEKIT_URL=https://your-project.livekit.cloud
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
```

Voice Agent (`livekit-agent/.env`):
```env
LIVEKIT_URL=https://your-project.livekit.cloud
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
DEEPGRAM_API_KEY=your-deepgram-api-key
GROQ_API_KEY=your-groq-api-key
CARTESIA_API_KEY=your-cartesia-api-key
BACKEND_URL=http://localhost:3001
```

**4. Start the services**

```bash
# Terminal 1 - Backend API
cd Backend && npm install && npm run dev

# Terminal 2 - Frontend App
cd frontend && npm install && npm run dev

# Terminal 3 - LiveKit Voice Agent
cd livekit-agent && npm install && npm run dev
```

Open http://localhost:3000 in your browser.

---

## Production Deployment

The AWS infrastructure (VPC, ECS Fargate, ALB, DynamoDB tables, Cognito User Pool, IAM roles) is defined with Terraform:

```bash
cd terraform-aws
terraform init
terraform apply
```

Alternatively, automated deployment pipelines are available via GitHub Actions (see [REDEPLOY.md](REDEPLOY.md) for continuous deployment instructions).

---

## How the Voice Interview Works

1. The user starts an interview from the dashboard.
2. The frontend requests a LiveKit room token from the backend.
3. The backend generates the token with appropriate room permissions.
4. LiveKit connects the frontend client and dispatches the voice agent to the room.
5. The agent fetches the interview details and questions from the backend.
6. The agent greets the user and begins the interview session.
7. During the session: user speech is transcribed by Deepgram Nova-2, processed by Groq LLaMA 3.3 70B, and responses are synthesized with low latency by Cartesia Sonic-2.
8. Silero VAD handles turn detection and interruption handling.
9. Once all questions are completed, the agent cordially ends the call.
10. The backend sends the full transcript to Google Gemini Flash to evaluate performance and CEFR English proficiency in parallel.
11. The generated feedback report is saved and displayed immediately in the user's dashboard.

---

## API Reference

### Backend API (Express)

**Authentication** (`/auth`)

| Method | Path | Description |
|---|---|---|
| POST | `/auth/signup` | Register user record in database after verification |
| POST | `/auth/signin` | Validate token (Cognito / Supabase) and return session |
| GET | `/auth/me` | Get currently authenticated user |
| POST | `/auth/verify-session` | Verify existing session cookie |

**Interviews** (`/interviews`)

| Method | Path | Description |
|---|---|---|
| GET | `/interviews/mine` | List all interviews for the authenticated user |
| GET | `/interviews/latest?limit=20` | List recent finalized interviews |
| GET | `/interviews/:id` | Get interview details by ID |
| POST | `/interviews/from-template` | Create an interview from a predefined template |

**Feedback** (`/feedback`)

| Method | Path | Description |
|---|---|---|
| POST | `/feedback` | Generate Gemini feedback from transcript and store report |
| GET | `/feedback/:interviewId` | Get feedback report for a specific interview |

**LiveKit Webhooks & Voice Agent** (`/api/livekit`)

| Method | Path | Description |
|---|---|---|
| GET | `/api/livekit/token` | Generate a WebRTC room access token |
| GET | `/api/livekit/interview-details` | Fetch interview questions for the voice agent |
| POST | `/api/livekit/generate` | Generate interview questions asynchronously via voice agent |

**CV Optimization** (`/api/cv`)

| Method | Path | Description |
|---|---|---|
| POST | `/api/cv/improve` | Optimize resume bullets and skills for ATS with Gemini |
| POST | `/api/cv/improve-profile` | Refine professional profile summary with Gemini |

---

### Frontend Server Routes (Next.js)

| Method | Path | Description |
|---|---|---|
| POST | `/api/cv/analyze` | Multimodal ATS CV analysis (PDF / Text) via Gemini |
| POST | `/api/code/feedback` | Evaluate coding challenge solution and Big-O complexity via Gemini |

---

## Roadmap

**AI Voice Interview**
- [x] Voice interview simulation (Spanish and English)
- [x] Form-based interview creation
- [x] Voice-based interview creation via setup agent
- [x] AI-generated feedback reports with CEFR English proficiency
- [ ] Interview history with advanced filtering and search
- [ ] Progress tracking over time

**CV Creator & Analyzer**
- [x] AI-assisted resume builder with standard tech formats
- [x] Multimodal PDF upload and ATS compatibility analysis
- [ ] PDF export of generated resumes
- [ ] Multiple template options

**Real-time Coding Agent** *(beta)*
- [x] Interactive Monaco Editor challenge interface
- [x] Test case execution & Gemini solution evaluation (Big-O, score, tips)
- [ ] Multi-language execution runtime
- [ ] Topic and difficulty filtering

**Infrastructure & DevOps**
- [x] AWS infrastructure with Terraform (ECS, ALB, DynamoDB, Cognito)
- [x] Supabase integration for local development
- [x] CI/CD pipelines via GitHub Actions

---

## License

MIT
