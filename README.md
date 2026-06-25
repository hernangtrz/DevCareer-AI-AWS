<![CDATA[<div align="center">

<img src="frontend/public/logo.svg" alt="DevCareer AI Logo" width="80" height="80" />

# DevCareer AI

**Practice technical interviews with an AI voice agent. Get real feedback, track your progress, and land your next job.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![LiveKit](https://img.shields.io/badge/LiveKit-Agents-orange?logo=livekit)](https://livekit.io/)
[![AWS](https://img.shields.io/badge/AWS-DynamoDB%20%7C%20Cognito-FF9900?logo=amazonaws)](https://aws.amazon.com/)
[![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC?logo=terraform)](https://www.terraform.io/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000?logo=vercel)](https://vercel.com/)

[Live Demo](#) · [Report Bug](https://github.com/hernangtrz/DevCareer-AI-AWS/issues) · [Request Feature](https://github.com/hernangtrz/DevCareer-AI-AWS/issues)

</div>

---

## What is this?

DevCareer AI is a full-stack platform that simulates real technical job interviews using voice AI. Instead of reading questions on a screen, you speak with an AI interviewer in real time — just like a real interview call.

After the session ends, the platform automatically analyzes your performance and generates a detailed feedback report with scores, strengths, and areas to improve.

The project combines several modern technologies into a cohesive product:

- A **voice AI agent** that conducts interviews using speech-to-text, a language model, and text-to-speech
- A **Next.js frontend** with a modern, minimal design
- A **REST API backend** built with Express and TypeScript
- **Cloud infrastructure** fully provisioned with Terraform on AWS
- A **Supabase integration** as an alternative for local development (no AWS needed)

---

## Features

### 🎙️ Voice Interview Simulation
Talk to an AI interviewer via your microphone. The agent listens, responds, and guides you through the interview just like a real recruiter would. Supports both **English** and **Spanish**, with selectable voices (Alejandro, Catalina, Katie, Daniel).

### ✍️ Interview Configuration — Two Ways
- **Form-based**: Fill out a form with your target role, experience level, tech stack, interview type (technical, behavioral, mixed), and number of questions.
- **Voice-based**: Tell the agent what you want. It asks the right questions, collects the data, and creates the interview for you automatically.

### 📊 AI-Generated Feedback
Once the interview ends, GPT-4o analyzes the transcript and generates a structured report with:
- A score from 1 to 10
- Identified strengths
- Areas to improve
- Specific technical recommendations

### 📄 CV Analyzer
Upload your resume as a PDF. The system reads it, extracts the relevant content, and gives you an analysis of how well it's positioned for your target job.

### 💻 Code Challenge (coming soon)
A module to practice coding exercises with AI feedback.

### 🔐 Authentication
Full auth flow: sign up, sign in, sign out, and protected routes. Works with AWS Cognito (production) or Supabase (local development).

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Browser (User)                      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│               Frontend — Next.js 16 (App Router)         │
│              Deployed on Vercel                          │
└────────────┬────────────────────────────┬───────────────┘
             │                            │
             ▼                            ▼
┌────────────────────────┐   ┌────────────────────────────┐
│  Backend — Express API  │   │  LiveKit Cloud             │
│  Node.js + TypeScript  │   │  (WebRTC signaling server) │
│  Port :3001            │   └────────────┬───────────────┘
└────────────┬───────────┘                │
             │                            ▼
             │                ┌───────────────────────────┐
             │                │  Voice Agent — Node.js     │
             │                │  Deepgram STT (speech→text)│
             │                │  Groq LLaMA 3.3 70B (LLM) │
             │                │  Cartesia TTS (text→speech)│
             │                │  Silero VAD                │
             │                └───────────┬───────────────┘
             │                            │
             └──────────────┬─────────────┘
                            │
                            ▼
             ┌──────────────────────────────┐
             │         Data Layer           │
             │                              │
             │  Production:                 │
             │  ├── AWS DynamoDB (tables)   │
             │  └── AWS Cognito (auth)      │
             │                              │
             │  Local dev:                  │
             │  └── Supabase (PostgreSQL)   │
             └──────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript | UI and routing |
| **Styling** | Tailwind CSS v4, Framer Motion | Design and animations |
| **Components** | shadcn/ui, Radix UI, Lucide React | UI components |
| **Forms** | React Hook Form, Zod | Form handling and validation |
| **Backend** | Express.js, TypeScript | REST API |
| **Voice (STT)** | Deepgram Nova-2 | Speech to text |
| **Voice (LLM)** | Groq — LLaMA 3.3 70B | Language model for the agent |
| **Voice (TTS)** | Cartesia Sonic-2 | Text to speech |
| **Voice (VAD)** | Silero | Voice activity detection |
| **WebRTC** | LiveKit Agents + Client SDK | Real-time audio/video |
| **AI Feedback** | OpenAI GPT-4o | Interview analysis |
| **AI Questions** | OpenAI GPT-4o | Interview generation |
| **Auth (prod)** | AWS Cognito | User authentication |
| **Database (prod)** | AWS DynamoDB | NoSQL data storage |
| **Auth (local)** | Supabase Auth | Alternative authentication |
| **Database (local)** | Supabase PostgreSQL | Alternative database |
| **Infrastructure** | Terraform | AWS IaC provisioning |
| **Deployment** | Vercel (frontend), AWS (backend) | Hosting |

---

## Project Structure

```
DevCareer AI/
├── frontend/               # Next.js application
│   ├── app/
│   │   ├── (auth)/         # Sign-in and sign-up pages
│   │   ├── (root)/
│   │   │   ├── dashboard/      # Main user dashboard
│   │   │   ├── interview/      # Live interview room
│   │   │   ├── cv-analyzer/    # Resume analysis tool
│   │   │   ├── cv-creator/     # Resume builder
│   │   │   └── code-challenge/ # Coding challenges
│   │   └── page.tsx        # Landing page
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React context providers
│   ├── lib/                # API clients, auth helpers, utilities
│   └── types/              # TypeScript type definitions
│
├── Backend/                # Express REST API
│   └── src/
│       ├── config/         # Supabase, DynamoDB, Cognito setup
│       ├── middleware/      # Auth middleware (hybrid Supabase/Cognito)
│       ├── routes/         # API route handlers
│       ├── services/       # Business logic per domain
│       └── types/          # Shared type definitions
│
├── livekit-agent/          # Voice AI agent (standalone process)
│   └── agent.ts            # Main agent logic with tool calling
│
├── terraform-aws/          # Infrastructure as Code
│   └── ...                 # DynamoDB tables, Cognito, IAM, etc.
│
└── scripts/                # Helper scripts
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- Accounts for the external services listed below

### External Services Required

| Service | Used for | Free tier |
|---|---|---|
| [LiveKit Cloud](https://cloud.livekit.io/) | WebRTC signaling | ✅ Yes |
| [Deepgram](https://deepgram.com/) | Speech-to-text | ✅ Yes |
| [Groq](https://groq.com/) | LLaMA 3.3 LLM inference | ✅ Yes |
| [Cartesia](https://cartesia.ai/) | Text-to-speech | ✅ Yes |
| [OpenAI](https://platform.openai.com/) | GPT-4o for feedback/questions | 💳 Paid |
| [Supabase](https://supabase.com/) | Auth + DB (local dev) | ✅ Yes |
| [AWS](https://aws.amazon.com/) | Cognito + DynamoDB (production) | 💳 Paid |

---

### Option A — Local Development with Supabase (recommended for testing)

This setup lets you run the full application without any AWS costs.

**1. Clone the repository**

```bash
git clone https://github.com/hernangtrz/DevCareer-AI-AWS.git
cd DevCareer-AI-AWS
```

**2. Set up Supabase**

Create a free project at [supabase.com](https://supabase.com), then run this SQL in the Supabase SQL editor to create the required tables:

```sql
-- Users table
create table users (
  id text primary key,
  email text unique not null,
  name text,
  created_at timestamptz default now()
);

-- Interviews table
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

-- Feedback table
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

**3. Configure the Backend**

```bash
cd Backend
cp .env.example .env
```

Edit `.env` with your credentials:

```env
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
LIVEKIT_URL=wss://your-project.livekit.cloud
OPENAI_API_KEY=your-openai-api-key
```

**4. Configure the Frontend**

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
```

**5. Configure the Voice Agent**

```bash
cd livekit-agent
cp .env.example .env
```

Edit `.env`:

```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
DEEPGRAM_API_KEY=your-deepgram-api-key
GROQ_API_KEY=your-groq-api-key
CARTESIA_API_KEY=your-cartesia-api-key
BACKEND_URL=http://localhost:3001
```

**6. Start all three services** (each in a separate terminal)

```bash
# Terminal 1 — Backend
cd Backend && npm install && npm run dev

# Terminal 2 — Frontend
cd frontend && npm install && npm run dev

# Terminal 3 — Voice Agent
cd livekit-agent && npm install && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Option B — Production Deployment with AWS

The backend infrastructure (DynamoDB tables, Cognito User Pool, IAM roles) is fully defined with Terraform.

```bash
cd terraform-aws
terraform init
terraform plan
terraform apply
```

Deploy the frontend to Vercel:

```bash
npm i -g vercel
cd frontend
vercel --prod
```

Deploy the backend to any Node.js-compatible host (EC2, Railway, Render, etc.) and the voice agent to a persistent server.

---

## How the Voice Interview Works

```
User clicks "Start Interview"
        │
        ▼
Frontend requests a LiveKit token from the Backend
        │
        ▼
Backend generates a signed token and dispatches a room
        │
        ▼
LiveKit assigns the Voice Agent to the room
        │
        ▼
Agent connects, fetches interview questions from Backend
        │
        ▼
Agent greets the user via Cartesia TTS
        │
        ▼
┌──────────────────────────────────────────┐
│           Real-time conversation loop    │
│                                          │
│  User speaks → Deepgram transcribes      │
│  Transcript → Groq LLaMA processes       │
│  Response → Cartesia speaks back         │
│  Silero VAD detects turn ends            │
└──────────────────────────────────────────┘
        │
        ▼
All questions asked → Agent ends the call
        │
        ▼
Backend sends transcript to GPT-4o
        │
        ▼
Feedback report saved → Available in dashboard
```

---

## API Endpoints

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/signin` | Sign in and receive a token |
| GET | `/api/auth/me` | Get current authenticated user |

### Interviews
| Method | Path | Description |
|---|---|---|
| POST | `/api/interviews` | Create a new interview (form-based) |
| GET | `/api/interviews/:userId` | Get all interviews for a user |
| GET | `/api/interviews/:id/details` | Get interview details |

### Feedback
| Method | Path | Description |
|---|---|---|
| POST | `/api/feedback` | Save AI-generated feedback |
| GET | `/api/feedback/:interviewId` | Get feedback for an interview |

### LiveKit (internal, called by agent)
| Method | Path | Description |
|---|---|---|
| POST | `/api/livekit/token` | Generate a room token |
| POST | `/api/livekit/generate` | Create interview from voice agent |
| GET | `/api/livekit/interview-details` | Fetch questions for agent |

### CV
| Method | Path | Description |
|---|---|---|
| POST | `/api/cv/analyze` | Analyze an uploaded resume PDF |

---

## Environment Variables Reference

<details>
<summary><strong>Backend (.env)</strong></summary>

```env
PORT=3001

# Supabase (local dev)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# AWS (production)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
COGNITO_USER_POOL_ID=
COGNITO_CLIENT_ID=

# LiveKit
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=

# AI
OPENAI_API_KEY=
```
</details>

<details>
<summary><strong>Frontend (.env)</strong></summary>

```env
# Supabase (local dev)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# AWS Cognito (production)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_COGNITO_CLIENT_ID=
NEXT_PUBLIC_COGNITO_REGION=

# Backend and LiveKit
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_LIVEKIT_URL=
```
</details>

<details>
<summary><strong>Voice Agent (.env)</strong></summary>

```env
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
DEEPGRAM_API_KEY=
GROQ_API_KEY=
CARTESIA_API_KEY=
BACKEND_URL=http://localhost:3001
```
</details>

---

## Roadmap

- [x] Voice interview simulation (Spanish + English)
- [x] Form-based interview creation
- [x] Voice-based interview creation (agent collects parameters)
- [x] AI feedback reports after each interview
- [x] CV analyzer
- [x] AWS infrastructure with Terraform
- [x] Supabase integration for local development
- [ ] Code challenge module with live execution
- [ ] Interview history with filtering and search
- [ ] Progress tracking dashboard with charts
- [ ] PDF export of feedback reports
- [ ] Mock behavioral interviews

---

## Contributing

Contributions are welcome. If you find a bug or have an idea for a feature, feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built by [Hernan Gutierrez](https://github.com/hernangtrz) · Powered by LiveKit, Groq, Deepgram, Cartesia & OpenAI

</div>
]]>
