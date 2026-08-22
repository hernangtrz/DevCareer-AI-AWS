# 🚀 DevCareer AI — Guía Integral y Documentación del Proyecto

Bienvenido al proyecto **DevCareer AI**. Este documento está diseñado para que cualquier nuevo desarrollador o colaborador que se sume al equipo pueda entender de forma rápida, clara y profunda cómo funciona todo el ecosistema, qué tecnologías utilizamos, cómo se comunican los servicios y cómo empezar a desarrollar.

---

## 📌 1. ¿Qué es DevCareer AI?

**DevCareer AI** es una plataforma *Full-Stack* todo-en-uno diseñada para preparar a desarrolladores de software para sus entrevistas técnicas y procesos de contratación internacional.

El producto centraliza 4 herramientas clave:
1. **🎙️ Entrevistas de Voz en Tiempo Real con IA:** Simulación de una llamada de entrevista real con audio bidireccional de bajísima latencia.
2. **📄 Creador de CV Asistido por IA:** Generador y optimizador de currículums enfocado en superar filtros ATS (Applicant Tracking Systems).
3. **📊 Analizador de CV Multimodal:** Evaluación de compatibilidad entre un CV (en PDF o texto) y una oferta laboral específica mediante IA multimodal.
4. **💻 Retos de Código en Tiempo Real (Beta):** Entorno interactivo con editor de código, ejecución de casos de prueba y evaluación técnica automatizada (complejidad temporal y espacial Big-O).

---

## 🏗️ 2. Arquitectura General del Sistema

El sistema opera mediante **3 servicios independientes** que colaboran en tiempo real:

```
                               ┌────────────────────────────────────────┐
                               │           Navegador Web                │
                               │  (Audio WebRTC + HTTP + Monaco Editor) │
                               └──────────────────┬─────────────────────┘
                                                  │
                  ┌───────────────────────────────┴───────────────────────────────┐
                  ▼                                                               ▼
  ┌───────────────────────────────┐                               ┌───────────────────────────────┐
  │      Frontend (Next.js 16)    │                               │     LiveKit Cloud (WebRTC)    │
  │   - Dashboard, UI, Auth       │                               │   - Transporte de Audio       │
  │   - Rutas API de CV y Código  │                               │   - Señalización de Salas     │
  └───────────────┬───────────────┘                               └───────────────┬───────────────┘
                  │                                                               │
                  ▼                                                               ▼
  ┌───────────────────────────────┐                               ┌───────────────────────────────┐
  │     Backend API (Express)     │                               │      LiveKit Voice Agent      │
  │   - Gestión de Entrevistas    │◄──────────────────────────────│   - Deepgram (Speech-to-Text) │
  │   - Generación de Feedback    │     Consulta preguntas y      │   - Groq LLaMA 3.3 (Cerebro)  │
  │   - Tokens de Sala LiveKit    │     guarda parámetros         │   - Cartesia (Text-to-Speech) │
  └───────────────┬───────────────┘                               │   - Silero VAD (Voz/Silencios)│
                  │                                               └───────────────────────────────┘
                  ▼
  ┌───────────────────────────────────────────────────────────────┐
  │                         Capa de Datos                         │
  │  • Desarrollo Local: Supabase (PostgreSQL + Auth)            │
  │  • Producción AWS:   AWS DynamoDB + AWS Cognito User Pools    │
  │  • Modelos de IA:    Google Gemini Flash (`gemini-3.1-flash`) │
  └───────────────────────────────────────────────────────────────┘
```

---

## 🧩 3. Módulos del Sistema en Detalle

### 3.1. 🎙️ Módulo de Entrevistas de Voz con IA
Es el módulo estrella. El candidato conversa con un entrevistador de voz con IA como si estuviera en una llamada de Google Meet o Zoom.

* **Modalidades de creación de entrevista:**
  1. **Por Formulario:** El usuario elige rol (ej. *Frontend Developer*), nivel (*Junior, Mid, Senior*), stack tecnológico (*React, TypeScript, Next.js*), enfoque (*Técnica, Comportamiento o Mixta*) y número de preguntas.
  2. **Por Voz (Setup Agent):** Un agente de voz conversacional le hace preguntas al usuario para recopilar estos 5 parámetros y crea la entrevista automáticamente usando *Tool Calling* (`saveParameters`).

* **Durante la entrevista:**
  - **LiveKit Client & Agent SDK:** Establece un canal de WebRTC bidireccional.
  - **Deepgram Nova-2:** Transcribe la voz del usuario a texto en tiempo real (*STT*).
  - **Groq (LLaMA 3.3 70B Versatile):** Procesa el diálogo con ultra-baja latencia y decide la siguiente intervención o repregunta técnica.
  - **Cartesia Sonic-2:** Sintetiza la voz del entrevistador (*TTS* con voces humanas naturales en español e inglés: Alejandro, Catalina, Katie, Daniel).
  - **Silero VAD:** Detecta la actividad de la voz para manejar interrupciones y turnos de habla de forma fluida.

* **Post-Entrevista (Reporte de Feedback):**
  - Al terminar, la transcripción completa se envía al endpoint `/feedback` del backend.
  - **Google Gemini Flash** evalúa 5 categorías del 0 al 100 (*Comunicación, Conocimiento Técnico, Resolución de Problemas, Ajuste Cultural y Confianza*), identificando fortalezas, áreas de mejora y resumen final.
  - **Evaluación de Inglés (CEFR):** Si la entrevista se realizó en inglés, Gemini ejecuta en paralelo una evaluación lingüística que determina el nivel MCER (*A1 a C2*), errores gramaticales detectados en la llamada y sugerencias de vocabulario técnico.

---

### 3.2. 📄 Creador de CV (CV Creator)
Asistente guiado paso a paso para construir un currículum profesional:
* Permite ingresar información personal, experiencias laborales, proyectos, habilidades y educación.
* **Optimización con Gemini:** Reescribe los logros laborales (*bullet points*) usando verbos de acción y metodologías cuantificables (CAR/STAR).
* Permite traducir todo el currículum de español a inglés o viceversa de manera coherente con la industria tech.

---

### 3.3. 📊 Analizador de CV (CV Analyzer)
Permite subir un CV en formato PDF o pegar el texto, junto con la descripción de una vacante:
* **Entrada Multimodal:** Next.js Server Route (`/api/cv/analyze`) procesa el archivo PDF directamente con **Gemini Multimodal**.
* **Métricas calculadas:**
  - Puntuación global de compatibilidad ATS (0 a 100).
  - Desglose por *Palabras clave*, *Formato*, *Gramática* e *Impacto de logros*.
  - Lista de *keywords encontradas* y *keywords faltantes* cruciales de la oferta.
  - Recomendaciones priorizadas por severidad (*Alta, Media, Baja*).

---

### 3.4. 💻 Retos de Código en Tiempo Real (Code Challenge - Beta)
Un entorno práctico de algoritmos y estructuras de datos para entrevistas técnicas de código:
* Editor integrado con **Monaco Editor** (el editor base de VS Code) con resaltado de sintaxis JavaScript/TypeScript.
* Ejecución de código del lado del cliente contra múltiples *Test Cases* predefinidos.
* **Evaluación Senior con Gemini:** La ruta `/api/code/feedback` analiza la solución del usuario, determina la **complejidad temporal y espacial (Big-O)**, califica la legibilidad y entrega un consejo como si fuera un entrevistador senior en vivo.

---

## 🛠️ 4. Stack Tecnológico

| Capa / Función | Tecnologías Utilizadas |
|---|---|
| **Frontend Web** | Next.js 16 (App Router), React 19, TypeScript |
| **Estilos & UI** | Tailwind CSS v4, Framer Motion, Radix UI, Lucide Icons, Monaco Editor |
| **Formularios & Validación** | React Hook Form, Zod |
| **Backend REST API** | Express.js, TypeScript, ts-node-dev |
| **Audio & WebRTC** | LiveKit Client SDK, LiveKit Agents SDK, LiveKit Server SDK |
| **Speech-to-Text (STT)** | Deepgram Nova-2 (Español e Inglés) |
| **Modelo del Agente de Voz** | Groq — LLaMA 3.3 70B Versatile |
| **Text-to-Speech (TTS)** | Cartesia Sonic-2 |
| **Detección de Voz (VAD)** | Silero VAD |
| **IA de Análisis & Evaluaciones** | Google Gemini Flash (`gemini-3.1-flash-lite`) |
| **Bases de Datos & Auth** | **Local:** Supabase (PostgreSQL + Auth) <br> **Producción:** AWS DynamoDB + AWS Cognito |
| **Infraestructura & Nube** | Terraform, AWS ECS Fargate, Application Load Balancer (ALB), VPC |
| **CI / CD** | GitHub Actions Workflows |

---

## 📂 5. Estructura del Repositorio

```text
DevCareer AI/
│
├── frontend/                        # Aplicación Web Next.js
│   ├── app/                         # App Router de Next.js
│   │   ├── (auth)/                  # Rutas públicas de Login y Registro
│   │   ├── (root)/                  # Rutas protegidas de la aplicación
│   │   │   ├── dashboard/           # Panel principal de entrevistas y métricas
│   │   │   ├── interview/           # Sala de entrevista de voz en vivo
│   │   │   ├── cv-creator/          # Creador y optimizador de CV
│   │   │   ├── cv-analyzer/         # Analizador ATS de currículums
│   │   │   └── code-challenge/      # Retos de código interactivos
│   │   ├── api/                     # Rutas de servidor Next.js (CV y Código)
│   │   │   ├── cv/analyze/          # Endpoint para análisis multimodal con Gemini
│   │   │   └── code/feedback/       # Endpoint para evaluar soluciones Big-O
│   │   └── layout.tsx & page.tsx    # Layout raíz y Landing page
│   ├── components/                  # Componentes reutilizables (shadcn/ui, modals, etc.)
│   ├── contexts/                    # Contextos de React (AuthContext, etc.)
│   └── lib/                         # Clientes API, configuración de Supabase/Cognito
│
├── Backend/                         # API REST en Express + TypeScript
│   └── src/
│       ├── config/                  # Conexiones a Supabase, DynamoDB, Cognito y constantes
│       ├── middleware/              # Middleware de verificación de tokens (requireAuth)
│       ├── routes/                  # Controladores de rutas:
│       │   ├── auth.routes.ts       # Signup, Signin, Me, Verify-Session
│       │   ├── interviews.routes.ts # Mis entrevistas, últimas, por ID, plantillas
│       │   ├── feedback.routes.ts   # Generación de feedback y reportes con Gemini
│       │   ├── livekit.routes.ts    # Tokens WebRTC y endpoints consumidos por el agente
│       │   └── cv.routes.ts         # Optimización de bullets y perfil con Gemini
│       ├── services/                # Capa de acceso a datos (DynamoDB / Supabase)
│       └── index.ts                 # Punto de entrada del servidor Express
│
├── livekit-agent/                   # Worker del Agente de Voz en tiempo real
│   ├── agent.ts                     # Lógica del pipeline STT -> LLM -> TTS y Tool Calling
│   ├── Dockerfile                   # Empaquetado para despliegue en contenedor
│   └── package.json                 # Dependencias del LiveKit Agents SDK
│
├── terraform-aws/                   # Infraestructura como Código (IaC) para AWS
│   ├── modules/                     # Módulos de VPC, ECS, ALB, DynamoDB, Cognito
│   ├── main.tf                      # Configuración principal de Terraform
│   └── variables.tf                 # Variables y credenciales de despliegue
│
├── scripts/                         # Scripts de PowerShell para limpieza y automatización
└── README.md                        # Documentación rápida del repositorio
```

---

## 🔄 6. Flujo de Funcionamiento de una Entrevista de Voz

Para comprender cómo interactúan todos los componentes, este es el ciclo de vida de una entrevista:

```
[1. Usuario]              [2. Frontend]             [3. Backend]            [4. LiveKit Server]       [5. LiveKit Agent]
     │                          │                         │                          │                         │
     │── Clic en "Comenzar" ───►│                         │                          │                         │
     │                          │── GET /api/livekit/token ─►│                       │                         │
     │                          │◄── Retorna JWT Token ───│                          │                         │
     │                          │                                                    │                         │
     │                          │──────── Conecta WebRTC con Token ─────────────────►│                         │
     │                          │                                                    │◄── Asigna sala al agente │
     │                          │                                                    │                         │
     │                          │                                                    │◄── Consulta preguntas ──│
     │                          │                                                    │    GET /interview-details
     │                          │◄════════════ Canal de Audio Bidireccional ═════════│════════════════════════►│
     │                          │  (Deepgram transcribe ◄-► Groq razona ◄-► Cartesia habla)                    │
     │                          │                                                                              │
     │── Finaliza la llamada ──►│                                                                              │
     │                          │── POST /feedback (con transcript completo) ──►│                              │
     │                          │                                               │── Llama a Gemini Flash ──┐   │
     │                          │                                               │◄── Retorna puntuaciones ─┘   │
     │                          │◄── Reporte generado con éxito ────────────────│                              │
     │◄── Muestra Dashboard ────│                                                                              │
```

---

## 🚀 7. Guía de Inicio Rápido para Desarrolladores (Puesta en Marcha Local)

Para ejecutar el proyecto en tu entorno local, sigue estos sencillos pasos:

### Paso 1: Requisitos Previos
* **Node.js** v20 o superior instalado.
* Cuentas gratuitas para obtener API Keys de:
  - [LiveKit Cloud](https://cloud.livekit.io/) (URL, API Key, Secret)
  - [Google AI Studio](https://aistudio.google.com/) (`GOOGLE_GENERATIVE_AI_API_KEY`)
  - [Deepgram](https://console.deepgram.com/) (`DEEPGRAM_API_KEY`)
  - [Groq](https://console.groq.com/) (`GROQ_API_KEY`)
  - [Cartesia](https://play.cartesia.ai/) (`CARTESIA_API_KEY`)
  - [Supabase](https://supabase.com/) (URL y Anon/Service Role Keys para desarrollo local)

---

### Paso 2: Base de Datos Local en Supabase
Crea un proyecto en Supabase y ejecuta este script en el **SQL Editor**:

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

---

### Paso 3: Configurar Archivos `.env`

#### 1. Backend (`Backend/.env`):
```env
PORT=3001
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
LIVEKIT_API_KEY=tu-livekit-key
LIVEKIT_API_SECRET=tu-livekit-secret
LIVEKIT_URL=https://tu-proyecto.livekit.cloud
GOOGLE_GENERATIVE_AI_API_KEY=tu-gemini-api-key
```

#### 2. Frontend (`frontend/.env`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_LIVEKIT_URL=https://tu-proyecto.livekit.cloud
GOOGLE_GENERATIVE_AI_API_KEY=tu-gemini-api-key
```

#### 3. Agente de Voz (`livekit-agent/.env`):
```env
LIVEKIT_URL=https://tu-proyecto.livekit.cloud
LIVEKIT_API_KEY=tu-livekit-key
LIVEKIT_API_SECRET=tu-livekit-secret
DEEPGRAM_API_KEY=tu-deepgram-key
GROQ_API_KEY=tu-groq-key
CARTESIA_API_KEY=tu-cartesia-key
BACKEND_URL=http://localhost:3001
```

---

### Paso 4: Levantar los 3 Servicios
Abre **3 terminales independientes** en la raíz del proyecto:

```bash
# Terminal 1: Backend Express API
cd Backend
npm install
npm run dev

# Terminal 2: Frontend Next.js
cd frontend
npm install
npm run dev

# Terminal 3: Agente de Voz LiveKit
cd livekit-agent
npm install
npm run dev
```

Abre tu navegador en **`http://localhost:3000`** y ya tendrás el entorno completo listo para desarrollar y probar.

---

## 💡 8. Buenas Prácticas y Puntos a Tener en Cuenta

1. **Separación de Responsabilidades:** 
   - El **Backend (Express)** gestiona la lógica de negocio persistente, autenticación y llamadas del agente.
   - El **Frontend (Next.js)** gestiona la interfaz gráfica, componentes y dos Server Routes especializadas (`/api/cv/analyze` y `/api/code/feedback`).
   - El **LiveKit Agent** corre de forma autónoma procesando flujos de audio en streaming sin bloquear peticiones HTTP.
2. **Compatibilidad Dual (Local vs AWS):** 
   - El backend detecta automáticamente mediante variables de entorno si debe persistir datos en **Supabase** (cuando existe `SUPABASE_URL`) o en **AWS DynamoDB + Cognito** (en entorno de producción de AWS).
3. **Manejo de Errores con IA:** 
   - Todas las llamadas a Gemini y LiveKit cuentan con *fallbacks* y respuestas estructuradas en JSON con tipos seguros validados con Zod y TypeScript.

---
*¡Listo! Con esta guía tu compañero de equipo tendrá todo el contexto necesario para integrarse al desarrollo de inmediato.*
