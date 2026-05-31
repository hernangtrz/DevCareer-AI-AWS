# DevCareer AI — Backend

API REST construida con **Express + TypeScript** que reemplaza los Server Actions de Next.js.  
Usa **Firebase Admin** para verificar tokens de autenticación y **AWS DynamoDB** como base de datos.

---

## Endpoints disponibles

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/auth/signup` | Registra usuario en DynamoDB (Firebase Auth lo crea en el cliente) |
| `POST` | `/auth/signin` | Verifica idToken y devuelve sessionCookie |
| `GET`  | `/auth/me` | Retorna el usuario autenticado (requiere Bearer token) |
| `POST` | `/auth/verify-session` | Verifica un sessionCookie y retorna el usuario |

### Entrevistas
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET`  | `/interviews/mine` | Entrevistas del usuario autenticado |
| `GET`  | `/interviews/latest?limit=20` | Entrevistas finalizadas de otros usuarios |
| `GET`  | `/interviews/:id` | Entrevista por ID |
| `POST` | `/interviews/from-template` | Crea entrevista desde plantilla predefinida |

### Feedback
| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/feedback` | Genera feedback con Gemini y lo guarda |
| `GET`  | `/feedback/:interviewId` | Obtiene el feedback de una entrevista |

### Vapi Webhook
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET`  | `/api/vapi/generate` | Health check para Vapi |
| `POST` | `/api/vapi/generate` | Webhook: genera preguntas y guarda la entrevista |

---

## Configuración local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus credenciales reales
```

### 3. Crear tablas en DynamoDB (solo la primera vez)
```bash
node scripts/create-tables.js
```

### 4. Iniciar en modo desarrollo
```bash
npm run dev
```

---

## Tablas DynamoDB

El script `scripts/create-tables.js` crea automáticamente las 3 tablas con sus índices:

| Tabla | PK | Índices GSI |
|-------|----|-------------|
| `devcareer_users` | `id` (Firebase UID) | `email-index` |
| `devcareer_interviews` | `id` (UUID) | `userId-createdAt-index` |
| `devcareer_feedback` | `id` (UUID) | `interviewId-userId-index` |

---

## Docker

### Build de la imagen
```bash
docker build -t tu-usuario/devcareer-backend:latest .
```

### Correr localmente con Docker
```bash
docker run -p 3001:3001 --env-file .env tu-usuario/devcareer-backend:latest
```

### Push a DockerHub
```bash
docker login
docker push tu-usuario/devcareer-backend:latest
```

---

## Autenticación entre servicios

El backend verifica tokens de Firebase en cada request protegido:

```
Frontend → obtiene idToken de Firebase Auth
         → envía: Authorization: Bearer <idToken>
Backend  → verifica con Firebase Admin SDK
         → extrae userId y continúa
```
