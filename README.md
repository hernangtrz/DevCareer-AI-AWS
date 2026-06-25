# DevCareer AI

A full-stack platform that helps developers prepare for technical job interviews. It combines AI voice interviews, resume generation, resume analysis, and real-time coding practice into a single product.

> **Models in use:** LLaMA 3.3 70B (Groq) powers the voice agent during interviews. Google Gemini Flash analyzes the transcript afterward and generates the feedback report.

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

Once the interview ends, Google Gemini analyzes the full transcript and generates a structured feedback report with a score from 0 to 100 across five categories: communication skills, technical knowledge, problem solving, cultural fit, and confidence. The report includes identified strengths, areas for improvement, and a final assessment. For English interviews, a separate English proficiency evaluation is generated in parallel with CEFR level, grammar score, and specific error examples.

Supports English and Spanish. Multiple voices available: Alejandro, Catalina, Katie, Daniel.

### CV Creator

A guided module that helps users build a professional resume with AI assistance. It structures the content following standard formats used in tech hiring, making it easier to present experience and skills clearly to recruiters and ATS systems.

### CV Analyzer

Upload an existing resume as a PDF. The backend extracts the content and sends it to the AI for analysis. The system evaluates how well the resume is positioned for a target role and returns specific suggestions to improve it.

### Real-time Coding Agent (beta)

An interactive module where an AI agent proposes coding challenges and evaluates your solution in real time, simulating a technical coding interview. This module is currently in beta and under active development.

---

## Authentication

Full auth flow with sign up, sign in, sign out, and protected routes. Compatible with AWS Cognito (production) and Supabase (local development).

---

## Architecture

```
Browser
  |
  v
Frontend (Next.js) — Vercel
  |                          \
  v                           v
Backend (Express API)     LiveKit Cloud (WebRTC)
  |                           |
  |                           v
  |                       Voice Agent
  |                         Deepgram  (speech to text)
  |                         Groq LLaMA 3.3 70B  (language model)
  |                         Cartesia Sonic-2  (text to speech)
  |                         Silero VAD  (voice activity detection)
  |
  v
Data Layer
  Production:   AWS DynamoDB + AWS Cognito
  Local dev:    Supabase (PostgreSQL + Auth)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4, Framer Motion |
| UI components | shadcn/ui, Radix UI |
| Forms and validation | React Hook Form, Zod |
| Backend | Express.js, TypeScript |
| Speech to text | Deepgram Nova-2 |
| Language model (agent) | Groq — LLaMA 3.3 70B |
| Text to speech | Cartesia Sonic-2 |
| Voice activity detection | Silero VAD |
| Real-time audio | LiveKit Agents SDK + Client SDK |
| AI feedback generation | Google Gemini Flash |
| AI question generation | Google Gemini Flash |
| Auth (production) | AWS Cognito |
| Database (production) | AWS DynamoDB |
| Auth (local dev) | Supabase Auth |
| Database (local dev) | Supabase PostgreSQL |
| Infrastructure | Terraform |
| Deployment | Vercel (frontend), AWS (backend) |

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
│   │   └── page.tsx            # Landing page
│   ├── components/             # Shared UI components
│   ├── contexts/               # React context providers
│   ├── lib/                    # API clients and auth helpers
│   └── types/                  # TypeScript type definitions
│
├── Backend/
│   └── src/
│       ├── config/             # Supabase, DynamoDB, Cognito initialization
│       ├── middleware/         # Auth middleware
│       ├── routes/             # API route handlers
│       ├── services/           # Business logic per domain
│       └── types/
│
├── livekit-agent/
│   └── agent.ts                # Voice agent with tool calling
│
├── terraform-aws/              # Infrastructure as Code for AWS
└── scripts/                    # Helper scripts
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
| LiveKit Cloud | WebRTC signaling | Yes |
| Deepgram | Speech to text | Yes |
| Groq | LLaMA 3.3 inference | Yes |
| Cartesia | Text to speech | Yes |
| OpenAI | GPT-4o for feedback and question generation | No |
| Supabase | Auth and database for local development | Yes |

### Setup

**1. Clone the repository**

```bash
git clone https://github.com/hernangtrz/DevCareer-AI-AWS.git
cd DevCareer-AI-AWS
```

**2. Create the Supabase tables**

In the Supabase SQL editor, run:

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
  techstack text,
  type text,
  questions jsonb,
  created_at timestamptz default now(),
  finished_at timestamptz
);

create table feedback (
  id text primary key,
  interview_id text references interviews(id),
  user_id text references users(id),
  total_score numeric,
  scores jsonb,
  strengths jsonb,
  areas_for_improvement jsonb,
  final_assessment text,
  created_at timestamptz default now()
);
```

**3. Configure environment variables**

Backend (`Backend/.env`):
```
PORT=3001
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
LIVEKIT_URL=
OPENAI_API_KEY=
```

Frontend (`frontend/.env`):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_LIVEKIT_URL=
```

Voice Agent (`livekit-agent/.env`):
```
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
DEEPGRAM_API_KEY=
GROQ_API_KEY=
CARTESIA_API_KEY=
BACKEND_URL=http://localhost:3001
```

**4. Start the services**

```bash
# Terminal 1
cd Backend && npm install && npm run dev

# Terminal 2
cd frontend && npm install && npm run dev

# Terminal 3
cd livekit-agent && npm install && npm run dev
```

Open http://localhost:3000.

---

## Production Deployment

The AWS infrastructure (DynamoDB tables, Cognito User Pool, IAM roles) is defined with Terraform:

```bash
cd terraform-aws
terraform init
terraform apply
```

Deploy the frontend to Vercel:

```bash
cd frontend
vercel --prod
```

The backend and voice agent can be deployed to any Node.js-compatible host.

---

## How the Voice Interview Works

1. The user starts an interview from the dashboard.
2. The frontend requests a LiveKit room token from the backend.
3. The backend generates the token and dispatches the room to LiveKit.
4. LiveKit assigns the voice agent to the room.
5. The agent fetches the interview questions from the backend.
6. The agent greets the user and begins the interview.
7. During the session: user speech is transcribed by Deepgram, processed by Groq LLaMA, and the response is synthesized by Cartesia.
8. Silero VAD handles turn detection to avoid interruptions.
9. Once all questions are asked, the agent ends the call.
10. The backend sends the full transcript to GPT-4o.
11. The feedback report is saved and displayed in the dashboard.

---

## API Reference

**Auth**

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/signin` | Sign in |
| GET | `/api/auth/me` | Get the current user |

**Interviews**

| Method | Path | Description |
|---|---|---|
| POST | `/api/interviews` | Create an interview |
| GET | `/api/interviews/:userId` | List interviews for a user |
| GET | `/api/interviews/:id/details` | Get interview details |

**Feedback**

| Method | Path | Description |
|---|---|---|
| POST | `/api/feedback` | Save feedback |
| GET | `/api/feedback/:interviewId` | Get feedback for an interview |

**LiveKit (called by agent)**

| Method | Path | Description |
|---|---|---|
| POST | `/api/livekit/token` | Generate a room token |
| POST | `/api/livekit/generate` | Create an interview via voice agent |
| GET | `/api/livekit/interview-details` | Fetch questions for the agent |

**CV**

| Method | Path | Description |
|---|---|---|
| POST | `/api/cv/analyze` | Analyze a resume PDF |

---

## Roadmap

**AI Voice Interview**
- [x] Voice interview simulation (Spanish and English)
- [x] Form-based interview creation
- [x] Voice-based interview creation via agent
- [x] AI-generated feedback reports after each session
- [ ] Interview history with filtering and search
- [ ] Progress tracking over time

**CV Creator**
- [x] AI-assisted resume builder with standard tech formats
- [ ] PDF export of the generated resume
- [ ] Multiple template options

**CV Analyzer**
- [x] PDF upload and AI-powered resume analysis
- [ ] Role-specific scoring and positioning feedback

**Real-time Coding Agent** *(beta)*
- [x] Basic coding challenge flow
- [ ] Live code execution and evaluation
- [ ] Multi-language support
- [ ] Difficulty levels and topic filtering

**Infrastructure**
- [x] AWS infrastructure with Terraform (DynamoDB, Cognito)
- [x] Supabase integration for local development
- [ ] PDF export of feedback reports

---

## License

MIT
