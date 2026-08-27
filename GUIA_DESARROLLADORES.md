# 🚀 Guía de Arquitectura y Desarrollo — DevCareer AI
> **Documento de Onboarding para Desarrolladores y Colaboradores**  
> *Versión actualizada — Ecosistema Full-Stack con Next.js, Express, LiveKit Cloud y Google Gemini.*

---

## 📌 1. ¿Qué es DevCareer AI?

**DevCareer AI** es una plataforma integral *Full-Stack* orientada a preparar a desarrolladores de software para procesos de contratación técnica nacional e internacional.

Centraliza todo el ciclo de preparación y búsqueda laboral:
1. **Práctica de Entrevistas por Voz en Tiempo Real** (con audio bidireccional de baja latencia e IA).
2. **Gestión y Diagnóstico de CV para Filtros ATS** (análisis multimodal en PDF).
3. **Retos de Código, Refactorización y Patrones de Diseño GoF** (con Monaco Editor y pruebas en vivo).
4. **Búsqueda Inteligente de Empleos y Postulación con Autofill** (*En desarrollo*).
5. **Pizarra Interactiva de Arquitectura Cloud (System Design)** (*En desarrollo*).
6. **Dashboard de Progreso y Métricas de Empleabilidad (Readiness Index)** (*En desarrollo*).

---

## 🏗️ 2. Arquitectura General y Stack Tecnológico

El proyecto está compuesto por **3 servicios independientes** que se ejecutan juntos:

```
                                ┌──────────────────────────────────────────────┐
                                │             Navegador Web (Frontend)         │
                                │  • Next.js 16 (React 19, TypeScript)         │
                                │  • Tailwind CSS v4 + Monaco Editor           │
                                │  • LiveKit WebRTC Client Audio               │
                                └──────────────────────┬───────────────────────┘
                                                       │
                     ┌─────────────────────────────────┴─────────────────────────────────┐
                     ▼                                                                   ▼
     ┌───────────────────────────────┐                                   ┌───────────────────────────────┐
     │     Backend API (Express)     │                                   │     LiveKit Cloud (WebRTC)    │
     │  • TypeScript + ts-node-dev   │                                   │  • Señalización y Audio       │
     │  • Gestión de Entrevistas     │                                   └───────────────┬───────────────┘
     │  • Feedback & Auth Endpoints  │                                                   │
     │  • Tokens de Sala LiveKit     │                                                   ▼
     └───────────────┬───────────────┘                                   ┌───────────────────────────────┐
                     │                                                   │      LiveKit Voice Agent      │
                     │◄──────────────────────────────────────────────────┤  • Deepgram (Speech-to-Text)  │
                     │     Consulta preguntas y detalles de entrevista   │  • Groq LLaMA 3.3 70B (LLM)   │
                     ▼                                                   │  • Cartesia Sonic-2 (TTS)     │
     ┌────────────────────────────────────────────────────────┐          │  • Silero VAD (Voz/Silencios) │
     │                     Capa de Datos                      │          └───────────────────────────────┘
     │  • Local:       Supabase (PostgreSQL + Auth)           │
     │  • Producción:  AWS DynamoDB + AWS Cognito User Pools  │
     │  • IA Motor:    Google Gemini Flash (`3.1-flash-lite`) │
     └────────────────────────────────────────────────────────┘
```

---

## 📂 3. Estructura del Repositorio

```text
DevCareer AI/
│
├── frontend/                        # Aplicación Web Next.js 16 (App Router)
│   ├── app/
│   │   ├── (auth)/                  # Login (/sign-in) y Registro (/sign-up)
│   │   ├── (root)/                  # Rutas protegidas con Layout y Sidebar
│   │   │   ├── dashboard/           # Panel principal y listado de entrevistas
│   │   │   ├── interview/           # Formulario y Sala de entrevista de voz en vivo
│   │   │   ├── cv/                  # CV & ATS Intelligence Hub (Builder + Scanner)
│   │   │   ├── code-challenge/      # Retos de código y patrones de diseño (/code-challenge/[id])
│   │   │   ├── jobs/                # Smart Job Portal y postulación
│   │   │   └── analytics/           # Dashboard de métricas, readiness y brechas
│   │   └── layout.tsx & page.tsx    # Layout raíz y Landing page
│   ├── components/                  # Componentes reutilizables (AppSidebar, UserMenu, Forms, etc.)
│   ├── contexts/                    # Contextos globales (LanguageContext, AuthContext)
│   └── lib/                         # Clientes API, problemas de código y traducciones
│
├── Backend/                         # API REST en Express + TypeScript
│   └── src/
│       ├── config/                  # Conexión dual (Supabase / DynamoDB / Cognito)
│       ├── middleware/              # Auth middleware (requireAuth verifica tokens JWT)
│       ├── routes/                  # Rutas (/auth, /interviews, /feedback, /api/livekit, /api/cv)
│       ├── services/                # Capa de datos y lógica de persistencia
│       └── index.ts                 # Servidor Express (Puerto 3001)
│
├── livekit-agent/                   # Worker del Agente de Voz en tiempo real
│   ├── agent.ts                     # Pipeline STT -> Groq LLaMA -> Cartesia TTS
│   └── Dockerfile                   # Empaquetado Docker
│
├── terraform-aws/                   # Infraestructura como Código (ECS, ALB, DynamoDB, Cognito)
└── README.md                        # Documentación rápida
```

---

## 🟢 4. MÓDULOS YA IMPLEMENTADOS (100% Funcionales)

Estos módulos ya están construidos, probados y en funcionamiento:

### 1. 🎙️ Simulador de Entrevistas de Voz con IA
* **Ruta:** `/dashboard` ➔ `/interview` ➔ `/interview/[id]` ➔ `/interview/[id]/feedback`
* **Cómo funciona:**
  1. El usuario configura la entrevista en un formulario (Rol, Seniority, Tech Stack, Enfoque y Cantidad de preguntas).
  2. El backend crea la entrevista y genera las preguntas personalizadas con Gemini Flash.
  3. Al entrar a la sala, el frontend se conecta a **LiveKit Cloud** vía WebRTC.
  4. El **LiveKit Agent** formula las preguntas una por una: escucha con Deepgram Nova-2, razona con Groq LLaMA 3.3 y habla con Cartesia Sonic-2.
  5. Al terminar la llamada, el transcript se envía a `/feedback`: Gemini genera un informe de 5 categorías (0-100) y una **evaluación lingüística CEFR (A1 a C2)** con errores gramaticales y sugerencias léxicas.

### 2. 📄 CV & ATS Intelligence Hub
* **Ruta:** `/cv` (con tabs `?tab=creator` y `?tab=analyzer`)
* **Cómo funciona:**
  - **Pestaña 1 (Constructor & Perfil):** Formulario para registrar experiencia, educación y skills. Permite traducir todo el CV y optimizar los *bullet points* con verbos de acción usando Gemini.
  - **Pestaña 2 (Escáner ATS Multimodal):** Permite subir un PDF o pegar texto contra una oferta de trabajo. La ruta `/api/cv/analyze` envía el PDF a Gemini Multimodal y retorna score ATS global, desglose (*keywords, formato, gramática, impacto*), palabras clave faltantes y mejoras por severidad.

### 3. ⚔️ Retos de Código y Patrones de Diseño (Refactoring Arena)
* **Ruta:** `/code-challenge` ➔ `/code-challenge/[id]`
* **Cómo funciona:**
  - Banco de problemas en `frontend/lib/problems.ts` (Algoritmos clásicos + Retos de **Patrones GoF**: *Strategy*, *Factory Method*, *Adapter Pattern*).
  - Editor interactivo con **Monaco Editor** y ejecución de pruebas unitarias en el navegador en tiempo real.
  - **Pestaña "Código Spaghetti Original":** En los retos de patrones, permite ver el código con malos olores antes de refactorizarlo.
  - **Evaluador de IA (`/api/code/feedback`):** Gemini califica la solución, calcula la complejidad Big-O ($O(n), O(1)$), evalúa principios **SOLID** (*Single Responsibility, Open/Closed*) y lista los *Code Smells* eliminados.
  - El progreso resuelto se persiste en `localStorage`.

### 4. 🧭 Navegación y Shell Moderno
* **Componente:** `AppSidebar.tsx`
* **Cómo funciona:** Sidebar vertical fijo en escritorio y drawer desplegable en móvil. Incluye menú de perfil desplegable hacia arriba (`UserMenu.tsx`) con selector de idioma (ES/EN) y cierre de sesión.

---

## 🚧 5. MÓDULOS PENDIENTES POR CONSTRUIR (Hoja de Ruta)

Estos son los 3 módulos que vamos a desarrollar a continuación. Las rutas base (*shells*) ya están creadas en el frontend:

---

### 💼 Módulo A: Smart Job Portal & 1-Click Match
* **Ruta frontend:** `frontend/app/(root)/jobs/page.tsx`
* **Objetivo:** Permitir al usuario explorar ofertas de empleo tech reales, ver qué tan compatible es su perfil y postularse en segundos con auto-rellenado.
* **Componentes y funcionalidades a construir:**
  1. **Feed de Ofertas:** Listado de vacantes unificadas con filtros (Rol, Remoto, Seniority).
  2. **AI Match Score (%):** Comparar las skills del perfil/CV del usuario contra la vacante y mostrar un badge de coincidencia (ej. *94% Match*).
  3. **Modal de Postulación Inteligente:**
     - *Modo Auto-rellenado:* Completa automáticamente campos personales, experiencia y enlaces desde el CV.
     - *Alerta de Campos Faltantes:* Resalta en naranja si la empresa pide datos que el usuario no tiene en su perfil (ej. *"Pretensión salarial requerida"*).
     - *Generador de Cover Letter con IA:* Botón para redactar una carta de presentación personalizada para esa oferta con Gemini.
  4. **Botón "🎙️ Simular Entrevista para esta Oferta":** Lee los requisitos de la vacante y abre inmediatamente una sesión en el módulo de voz con preguntas enfocadas en esa postulación.
* **🎯 Patrones de software a aplicar:** **Adapter Pattern** (normalizar APIs de empleo externas como LinkedIn/Indeed/Adzuna) y **Facade Pattern** (orquestar autofill y matching).

---

     - Validación del **Teorema CAP** (consistencia vs disponibilidad).
     - Estimación de costos mensuales de infraestructura.
* **🎯 Patrones de software a aplicar:** **Composite Pattern** (árbol de nodos y clusters), **Command Pattern** (Undo/Redo en el canvas), **Strategy Pattern** (estrategias de evaluación de seguridad, costo y escalabilidad).

---

### 📊 Módulo C: Dashboard de Progreso & Analytics
* **Ruta frontend:** `frontend/app/(root)/analytics/page.tsx`
* **Objetivo:** Centralizar todas las estadísticas y métricas de desempeño del candidato en un único panel de control.
* **Componentes y funcionalidades a construir:**
  1. **Developer Readiness Index (0-100):** Algoritmo que pondera Entrevistas de voz (30%), Código & Patrones (25%), Inglés CEFR (25%) y Score ATS de CV (20%).
  2. **Radar de Habilidades (Spider Chart):** Gráfico comparativo de competencias técnicas y blandas.
  3. **Detector de Puntos Ciegos (AI Blindspot Radar):** La IA extrae patrones de error repetitivos de todas las sesiones pasadas.
  4. **Estimador de Rango Salarial (USD):** Proyección salarial según el nivel técnico alcanzado.

---

## ⚡ 6. Puesta en Marcha Local (Local Setup en 3 Pasos)

Para que el equipo trabaje sobre la **misma base de datos compartida** y los mismos datos de prueba, la base de datos de Supabase ya está configurada y las tablas creadas. Los nuevos desarrolladores solo deben seguir estos 3 pasos:

### 1. Clonar el repositorio
```bash
git clone https://github.com/hernangtrz/DevCareer-AI-AWS.git
cd DevCareer-AI-AWS
```

### 2. Configurar los 3 archivos `.env` (con las credenciales del equipo)
Solicita al líder del proyecto las API keys del equipo y colócalas en cada carpeta:

* **`Backend/.env`**:
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

* **`frontend/.env`**:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
  NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
  NEXT_PUBLIC_LIVEKIT_URL=https://tu-proyecto.livekit.cloud
  GOOGLE_GENERATIVE_AI_API_KEY=tu-gemini-api-key
  ```

* **`livekit-agent/.env`**:
  ```env
  LIVEKIT_URL=https://tu-proyecto.livekit.cloud
  LIVEKIT_API_KEY=tu-livekit-key
  LIVEKIT_API_SECRET=tu-livekit-secret
  DEEPGRAM_API_KEY=tu-deepgram-key
  GROQ_API_KEY=tu-groq-key
  CARTESIA_API_KEY=tu-cartesia-key
  BACKEND_URL=http://localhost:3001
  ```

### 4. Levantar los 3 servicios (en 3 terminales)
```bash
# Terminal 1: Backend
cd Backend && npm install && npm run dev

# Terminal 2: Frontend
cd frontend && npm install && npm run dev

# Terminal 3: Agente de Voz LiveKit
cd livekit-agent && npm install && npm run dev
```

Abre **`http://localhost:3000`** en tu navegador.

---

## 🤝 7. Buenas Prácticas y Reglas del Equipo

1. **Diseño y Estilos:** Usar siempre las variables del tema de Tailwind v4 y los componentes existentes de `components/ui` para mantener la estética oscura y moderna (*dark theme with violet/indigo accents*).
2. **Llamadas a IA:** Toda interacción con Gemini debe realizarse del lado del servidor (en rutas de Express o Next.js Server Routes), nunca exponiendo `GOOGLE_GENERATIVE_AI_API_KEY` en el cliente.
3. **Control de Versiones:** Crear ramas por funcionalidad antes de integrar a `main` y verificar que `npm run build` pase con 0 errores antes de hacer push.

---
*¡Con este documento, cualquier desarrollador del equipo podrá comprender la arquitectura e iniciar la construcción de los módulos pendientes sin fricción!*
