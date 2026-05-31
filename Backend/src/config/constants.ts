import { z } from "zod";

export const feedbackSchema = z.object({
  totalScore: z.number(),
  categoryScores: z.array(
    z.object({
      name: z.string(),
      score: z.number(),
      comment: z.string(),
    })
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

export const getRandomInterviewCover = (): string => {
  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  return interviewCovers[randomIndex];
};

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
