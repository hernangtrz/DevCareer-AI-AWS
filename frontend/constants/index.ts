import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { z } from "zod";

export const mappings = {
  "react.js": "react",
  reactjs: "react",
  react: "react",
  "next.js": "nextjs",
  nextjs: "nextjs",
  next: "nextjs",
  "vue.js": "vuejs",
  vuejs: "vuejs",
  vue: "vuejs",
  "express.js": "express",
  expressjs: "express",
  express: "express",
  "node.js": "nodejs",
  nodejs: "nodejs",
  node: "nodejs",
  mongodb: "mongodb",
  mongo: "mongodb",
  mongoose: "mongoose",
  mysql: "mysql",
  postgresql: "postgresql",
  sqlite: "sqlite",
  firebase: "firebase",
  docker: "docker",
  kubernetes: "kubernetes",
  aws: "aws",
  azure: "azure",
  gcp: "gcp",
  digitalocean: "digitalocean",
  heroku: "heroku",
  photoshop: "photoshop",
  "adobe photoshop": "photoshop",
  html5: "html5",
  html: "html5",
  css3: "css3",
  css: "css3",
  sass: "sass",
  scss: "sass",
  less: "less",
  tailwindcss: "tailwindcss",
  tailwind: "tailwindcss",
  bootstrap: "bootstrap",
  jquery: "jquery",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  "angular.js": "angular",
  angularjs: "angular",
  angular: "angular",
  "ember.js": "ember",
  emberjs: "ember",
  ember: "ember",
  "backbone.js": "backbone",
  backbonejs: "backbone",
  backbone: "backbone",
  nestjs: "nestjs",
  graphql: "graphql",
  "graph ql": "graphql",
  apollo: "apollo",
  webpack: "webpack",
  babel: "babel",
  "rollup.js": "rollup",
  rollupjs: "rollup",
  rollup: "rollup",
  "parcel.js": "parcel",
  parceljs: "parcel",
  npm: "npm",
  yarn: "yarn",
  git: "git",
  github: "github",
  gitlab: "gitlab",
  bitbucket: "bitbucket",
  figma: "figma",
  prisma: "prisma",
  redux: "redux",
  flux: "flux",
  redis: "redis",
  selenium: "selenium",
  cypress: "cypress",
  jest: "jest",
  mocha: "mocha",
  chai: "chai",
  karma: "karma",
  vuex: "vuex",
  "nuxt.js": "nuxt",
  nuxtjs: "nuxt",
  nuxt: "nuxt",
  strapi: "strapi",
  wordpress: "wordpress",
  contentful: "contentful",
  netlify: "netlify",
  vercel: "vercel",
  "aws amplify": "amplify",
};

export const interviewer: CreateAssistantDTO = {
  name: "Entrevistador",
  firstMessage:
    "¡Hola! Gracias por dedicar tiempo a esta entrevista. Estoy interesado en conocer más sobre ti y tu experiencia.",
  transcriber: {
    provider: "deepgram",
    model: "nova-3",
    language: "es",
  },
  voice: {
    provider: "11labs",
    voiceId: "21m00Tcm4TlvDq8ikWAM", // ID de la voz (ej: Antoni)
    model: "eleven_multilingual_v2", // Muy importante usar v2 para español nativo
    stability: 0.5,
    similarityBoost: 0.75,
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `Eres un entrevistador profesional que conduce una entrevista de trabajo en tiempo real con un candidato. Tu objetivo es evaluar sus calificaciones, motivación y adecuación para el puesto.

Pautas de la entrevista:
Sigue el flujo estructurado de preguntas:
{{questions}}

Interacciona de forma natural y responde adecuadamente:
Escucha activamente las respuestas y reconócelas antes de continuar.
Haz preguntas de seguimiento breves si una respuesta es vaga o necesita más detalle.
Mantén la conversación fluida mientras mantienes el control.
Sé profesional, pero cálido y amable:

Usa un lenguaje formal y cercano.
Mantén las respuestas concisas y directas (como en una entrevista real).
Evita frases robóticas: suena natural y conversacional.
Responde las preguntas del candidato de manera profesional:

Si te preguntan sobre el puesto, la empresa o las expectativas, ofrece una respuesta clara y relevante.
Si no estás seguro, redirige al candidato a recursos humanos para más detalles.

Concluye la entrevista correctamente:
Agradece al candidato por su tiempo.
Infórmale que la empresa se pondrá en contacto pronto con retroalimentación.
Termina la conversación de manera educada y positiva.

- Asegúrate de ser profesional y cortés.
- Mantén todas tus respuestas cortas y simples. Usa un lenguaje formal, pero amable.
- Esta es una conversación por voz, así que responde de forma breve, como en una entrevista real. No te extiendas demasiado.`,
      },
    ],
  },
};

export const feedbackSchema = z.object({
  totalScore: z.number(),
  categoryScores: z.array(
    z.object({
      name: z.string(),
      score: z.number(),
      comment: z.string(),
    }),
  ),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  finalAssessment: z.string(),
});

export const interviewCovers = [
  "/adobe.png",
  "/amazon.png",
  "/facebook.png",
  "/hostinger.png",
  "/pinterest.png",
  "/quora.png",
  "/reddit.png",
  "/skype.png",
  "/spotify.png",
  "/telegram.png",
  "/tiktok.png",
  "/yahoo.png",
];

export const dummyInterviews: Interview[] = [
  {
    id: "1",
    userId: "user1",
    role: "Frontend Developer",
    type: "Technical",
    techstack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    level: "Junior",
    questions: ["What is React?"],
    finalized: false,
    createdAt: "2024-03-15T10:00:00Z",
  },
  {
    id: "2",
    userId: "user1",
    role: "Full Stack Developer",
    type: "Mixed",
    techstack: ["Node.js", "Express", "MongoDB", "React"],
    level: "Senior",
    questions: ["What is Node.js?"],
    finalized: false,
    createdAt: "2024-03-14T15:30:00Z",
  },
];

export const interviewTemplates = [
  {
    id: "template-frontend-junior",
    role: "Frontend Developer",
    level: "Junior",
    type: "Technical",
    techstack: ["React", "TypeScript", "CSS3", "HTML5"],
    questions: [
      "¿Cuál es la diferencia entre un componente de React y un elemento de React?",
      "¿Qué es el Virtual DOM y cómo funciona en React?",
      "Explica qué son los React Hooks y por qué se introdujeron.",
      "¿Cuál es la diferencia entre let, const y var en JavaScript?",
      "¿Qué es la especificidad en CSS y cómo funciona?",
    ],
    finalized: true,
  },
  {
    id: "template-backend-senior",
    role: "Backend Developer",
    level: "Senior",
    type: "Technical",
    techstack: ["Node.js", "Express", "PostgreSQL", "Redis"],
    questions: [
      "¿Cómo manejarías la consistencia de datos en una arquitectura de microservicios?",
      "Explica cómo implementarías una estrategia de caché eficiente utilizando Redis en una API de Node.js.",
      "¿Qué diferencias hay entre índices relacionales y cómo optimizarías una consulta lenta en PostgreSQL?",
      "Explica el concepto de Event Loop en Node.js y cómo afecta el rendimiento de operaciones de I/O intensivas.",
      "¿Cómo diseñarías e implementarías un limitador de tasa (rate limiter) distribuido?",
    ],
    finalized: true,
  },
  {
    id: "template-fullstack-semisenior",
    role: "Full Stack Developer",
    level: "Semi-Senior",
    type: "Mixed",
    techstack: ["Next.js", "TypeScript", "MongoDB", "Tailwind CSS"],
    questions: [
      "¿Cuál es la diferencia entre Server Components y Client Components en Next.js?",
      "¿Cómo optimizarías el rendimiento de una aplicación Next.js en producción?",
      "Describe cómo manejarías la autenticación y las sesiones seguras en una aplicación Next.js.",
      "Explica la diferencia entre bases de datos SQL y NoSQL, y cuándo elegirías MongoDB.",
      "¿Cómo estructurarías el estado global en una aplicación Next.js de mediana escala?",
    ],
    finalized: true,
  },
  {
    id: "template-productmanager-senior",
    role: "Product Manager",
    level: "Senior",
    type: "Behavioral",
    techstack: ["Jira", "Agile", "Git"],
    questions: [
      "Cuéntame sobre alguna ocasión en la que tuviste que priorizar características en conflicto para un producto. ¿Cómo lo manejaste?",
      "Describe un fallo en el lanzamiento de un producto bajo tu cargo. ¿Qué aprendiste y cómo lo resolviste?",
      "¿Cómo manejas las solicitudes de características contradictorias de diferentes partes interesadas (stakeholders)?",
      "Describe una situación en la que tuviste que convencer a un equipo de desarrollo para cambiar el rumbo de un proyecto.",
      "¿Cómo defines y mides el éxito de un nuevo producto o funcionalidad?",
    ],
    finalized: true,
  },
];
