# DevCareer AI

A full-stack platform for practicing technical job interviews with a real-time voice AI agent. The system conducts the interview, evaluates your responses, and generates a structured feedback report automatically.

---

## Overview

DevCareer AI simulates the experience of a real technical interview. Instead of reading questions on a screen, you have a live voice conversation with an AI interviewer. Once the session ends, GPT-4o analyzes the transcript and produces a detailed performance report with scores, strengths, and areas to improve.

The platform consists of three independent services:

- **Frontend** — Next.js application with the user interface
- **Backend** — Express REST API that handles business logic, data, and AI integrations
- **Voice Agent** — A LiveKit-powered process that runs the interview in real time

---

## Features

**Voice interview simulation**
Conduct interviews by speaking naturally through your microphone. The agent listens, responds, and progresses through each question just like a real interviewer. Supports English and Spanish with multiple selectable voices.

**Two ways to create an interview**
- Form-based: select your role, experience level, tech stack, interview type (technical, behavioral, mixed), and number of questions.
- Voice-based: tell the agent what you need. It collects all parameters through conversation and creates the interview automatically.

**AI feedback reports**
After each interview, the system generates a structured report including a score from 1 to 10, identified strengths, areas for improvement, and specific technical recommendations.

**CV analyzer**
Upload a resume as a PDF. The backend extracts the content and returns an analysis of how well it is positioned for the target role.

**Authentication**
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
| AI feedback and questions | OpenAI GPT-4o |
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

- [x] Voice interview simulation (Spanish and English)
- [x] Form-based interview creation
- [x] Voice-based interview creation
- [x] AI-generated feedback reports
- [x] CV analyzer
- [x] AWS infrastructure with Terraform
- [x] Supabase integration for local development
- [ ] Code challenge module
- [ ] Interview history with filtering
- [ ] Progress tracking over time
- [ ] PDF export of feedback reports

---

## License

MIT
