# DevCareer AI — Backend API

REST API construida con **Express + TypeScript** para dar soporte a la autenticación, gestión de entrevistas, generación de feedback con IA, endpoints para agentes de voz LiveKit y optimización de CVs.

---

## 🛠️ Tecnologías y Modelos

- **Framework**: Express.js & TypeScript
- **Autenticación**: AWS Cognito (Producción) / Supabase Auth (Desarrollo local)
- **Base de Datos**: AWS DynamoDB (Producción) / Supabase PostgreSQL (Desarrollo local)
- **IA Generativa**: Google Gemini Flash (`gemini-3.1-flash-lite`) para generación de preguntas, feedback de entrevistas y optimización de CV
- **WebRTC / Voz**: LiveKit Server SDK

---

## 📡 Endpoints disponibles

### Autenticación (`/auth`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/auth/signup` | Registra el usuario en la base de datos tras la confirmación de email |
| `POST` | `/auth/signin` | Valida el token (Cognito / Supabase) e inicia sesión |
| `GET`  | `/auth/me` | Retorna el usuario autenticado (requiere Bearer Token) |
| `POST` | `/auth/verify-session` | Valida un `sessionCookie` existente |

### Entrevistas (`/interviews`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET`  | `/interviews/mine` | Lista de entrevistas del usuario autenticado |
| `GET`  | `/interviews/latest?limit=20` | Entrevistas públicas recientes de otros usuarios |
| `GET`  | `/interviews/:id` | Obtener detalles de una entrevista por ID |
| `POST` | `/interviews/from-template` | Crea una entrevista a partir de una plantilla |

### Feedback de Entrevista (`/feedback`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/feedback` | Analiza transcripción con Gemini y genera reporte + nivel CEFR |
| `GET`  | `/feedback/:interviewId` | Obtiene el reporte de feedback de una entrevista |

### Integración LiveKit Voice Agent (`/api/livekit`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET`  | `/api/livekit/token` | Genera token de acceso para la sala de LiveKit |
| `GET`  | `/api/livekit/interview-details` | Consulta preguntas y datos para el agente de voz |
| `POST` | `/api/livekit/generate` | Genera preguntas en segundo plano vía agente de voz |

### Optimización de CV (`/api/cv`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/cv/improve` | Optimiza secciones y bullets del CV para filtros ATS con Gemini |
| `POST` | `/api/cv/improve-profile` | Perfecciona el perfil profesional ("Acerca de mí") con Gemini |

---

## 💻 Configuración Local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno (`.env`)
```env
PORT=3001
FRONTEND_URL=http://localhost:3000

# Base de datos y Auth (Local: Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# LiveKit WebRTC
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
LIVEKIT_URL=https://your-project.livekit.cloud

# Google Gemini API
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key

# Opcional (Producción AWS):
# AWS_REGION=us-east-1
# COGNITO_USER_POOL_ID=
# COGNITO_CLIENT_ID=
```

### 3. Iniciar en modo desarrollo
```bash
npm run dev
```
