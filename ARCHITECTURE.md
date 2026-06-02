# 📐 Arquitectura Tecnológica General — DevCareer AI

Este documento describe la arquitectura técnica de **DevCareer AI**, inspirada en el modelo de tres capas (Presentación, Aplicación y Datos) y desplegada en **AWS** mediante **Terraform** y **GitHub Actions**.

---

## 🗺️ Diagrama de Arquitectura (Mermaid)

El siguiente diagrama representa los componentes de la aplicación y cómo interactúan entre sí. GitHub renderizará este bloque de forma interactiva.

```mermaid
graph TB
    %% Definición de Estilos
    classDef Capa1 fill:#d1e8ff,stroke:#0066cc,stroke-width:2px,color:#0b3c5d;
    classDef Capa2 fill:#d4edda,stroke:#28a745,stroke-width:2px,color:#155724;
    classDef Capa3 fill:#fff3cd,stroke:#ffc107,stroke-width:2px,color:#856404;
    classDef Infra fill:#f8d7da,stroke:#dc3545,stroke-width:2px,color:#721c24;
    classDef Ext fill:#e2e3e5,stroke:#383d41,stroke-width:2px,color:#383d41;

    %% Usuarios y Clientes Externos
    subgraph USR ["Usuarios & Servicios Externos"]
        User(["Usuario (Navegador)"]):::Ext
        VapiService(["Servicio de Voz Vapi (Cloud)"]):::Ext
    end

    %% Capa 1: Presentación (Frontend)
    subgraph CAPA1 ["CAPA 1 — PRESENTACIÓN (Frontend)"]
        Frontend["ECS Fargate: Frontend (Next.js SPA)
        --
        • React 18 / TailwindCSS
        • Firebase Client Auth
        • Vapi Web SDK
        • Puerto 3000"]:::Capa1
    end

    %% Capa 2: Aplicación y Computación (Backend & Networking)
    subgraph CAPA2 ["CAPA 2 — APLICACIÓN (Cómputo y Balanceo)"]
        ALB_Ext["AWS ALB Externo (HTTP/80)"]:::Capa2
        ALB_Int["AWS ALB Interno (HTTP/80)"]:::Capa2
        
        subgraph ECS_Cluster ["ECS Cluster & Auto Scaling (Fargate)"]
            Backend["ECS Fargate: Backend (Express.js)
            --
            • Node.js / Express
            • Firebase Admin SDK
            • Puerto 3001"]:::Capa2
            
            AutoScale["Auto Scaling CPU (Min 2 / Max 6)
            --
            • Target: 50% CPU Utilization"]:::Capa2
        end
        
        LocalProxy["proxy.js (Local/Desarrollo)
        --
        Reenvía llamadas HTTPS del túnel
        hacia el ALB Externo"]:::Capa2
        
        Tunnel["nokey@localhost.run (Túnel HTTPS)
        --
        Expone puerto local 8080 a Vapi"]:::Capa2
    end

    %% Capa 3: Persistencia y Terceros
    subgraph CAPA3 ["CAPA 3 — DATOS & SERVICIOS DE TERCEROS"]
        FirebaseAuth["Firebase Auth
        (Autenticación de Usuarios)"]:::Ext
        
        Gemini["Google Gemini AI API
        (Generación de Entrevistas & Feedback)"]:::Ext
        
        subgraph DynamoDB ["Amazon DynamoDB (Multi-AZ)"]
            TableUsers[("Tabla: devcareer_users")]:::Capa3
            TableInterviews[("Tabla: devcareer_interviews")]:::Capa3
            TableFeedback[("Tabla: devcareer_feedback")]:::Capa3
        end
    end

    %% Infraestructura General y Seguridad
    subgraph INFRA ["INFRAESTRUCTURA & SEGURIDAD"]
        VPC["AWS VPC (10.0.0.0/16)
        --
        • 2x Subredes Públicas (ALB)
        • 2x Subredes Privadas (ECS)
        • 2x NAT Gateways"]:::Infra
        IAM["AWS IAM (LabRole)
        --
        Permisos para DynamoDB y ECS"]:::Infra
        CloudWatch["AWS CloudWatch Logs
        --
        Logs del Frontend y Backend"]:::Infra
        Terraform["Terraform HCL
        --
        Infraestructura como Código (IaC)"]:::Infra
        GHActions["GitHub Actions
        --
        CI/CD Pipeline (Deploy & Destroy)"]:::Infra
    end

    %% Flujos y Conexiones (Relaciones)
    User -->|1. HTTP / Web| ALB_Ext
    ALB_Ext -->|2. Reenvía Puerto 3000| Frontend
    Frontend -->|3. Registro/Login| FirebaseAuth
    
    %% Flujo de llamadas de API del Frontend al Backend
    Frontend -->|4. Consultas API /api/proxy| ALB_Int
    ALB_Int -->|5. Reenvía Puerto 3001| Backend
    
    %% Flujo de Voz Vapi
    VapiService -.->|6. Webhook HTTPS| Tunnel
    Tunnel -.->|7. Redirige| LocalProxy
    LocalProxy -.->|8. Reenvía HTTP| ALB_Ext
    
    %% Integraciones del Backend
    Backend -->|9. Consultar/Guardar| DynamoDB
    Backend -->|10. Prompting de Entrevistas| Gemini
    
    %% Relaciones de Infraestructura
    ECS_Cluster -.->|Desplegado en| VPC
    ECS_Cluster -.->|Registra logs en| CloudWatch
    ECS_Cluster --- AutoScale
    
    %% Leyenda / Nota de flujo
    style User fill:#ececff,stroke:#333,stroke-width:1px
    style VapiService fill:#ececff,stroke:#333,stroke-width:1px
```

---

## 🏢 Desglose de las Capas

### 1. Capa de Presentación (Frontend)
* **Tecnología:** Next.js (React), empaquetado en contenedores Docker y ejecutado en **AWS ECS Fargate**.
* **Responsabilidades:**
  * Servir la interfaz de usuario para que los candidatos se registren, inicien sesión y revisen su historial de entrevistas.
  * Iniciar la videollamada interactiva con el Vapi Web SDK.
  * Enrutar todas las llamadas al backend a través de `/api/proxy` (para evitar CORS y simplificar la conectividad).
* **Escalado:** Configurado con un mínimo de **2 tareas** y escalado automático de hasta **6 tareas** si el uso medio de CPU supera el **50%**.

### 2. Capa de Aplicación (Backend y APIs)
* **Tecnología:** Node.js + Express.js ejecutado en **AWS ECS Fargate**.
* **Responsabilidades:**
  * Gestionar la lógica de negocio y las llamadas a la base de datos.
  * Autenticar las sesiones utilizando el SDK de Firebase Admin.
  * Actuar como el Webhook de **Vapi** para procesar la información del usuario en tiempo real y enviar los prompts del bot.
  * Conectarse con la API de **Google Gemini** para la generación dinámica de preguntas de entrevistas y análisis/feedback del resultado.
* **Escalado:** Al igual que el frontend, cuenta con un mínimo de **2 tareas** y máximo de **6 tareas** con escalado dinámico por CPU.

### 3. Capa de Datos (Persistencia)
* **Tecnología:** Amazon DynamoDB (NoSQL).
* **Tablas:**
  * `devcareer_users`: Almacena el perfil del candidato.
  * `devcareer_interviews`: Registra las sesiones de entrevistas iniciadas y completadas.
  * `devcareer_feedback`: Contiene los análisis detallados generados por Gemini.

### 4. Infraestructura y Seguridad
* **Red Aislada (VPC):** Creada con subredes públicas y privadas en múltiples zonas de disponibilidad para alta disponibilidad. Los contenedores Fargate se ejecutan en subredes privadas sin IP pública directa, accediendo al exterior a través de **NAT Gateways**.
* **Seguridad (IAM):** Usa el rol predefinido `LabRole` para otorgar permisos a los contenedores Fargate sin quemar claves.
* **Automatización:**
  * **Terraform:** Define la infraestructura completa como código.
  * **GitHub Actions:** Ejecuta los despliegues limpios y compilaciones cuando se hace push en `main`.

---

## 🎨 ¿Cómo puedes exportar o generar este diagrama en imagen?

Si necesitas el diagrama en formato de imagen (PNG/SVG) para una presentación o documento:
1. **GitHub:** GitHub renderiza el diagrama automáticamente en la página web de este repositorio. Puedes tomar una captura de pantalla directamente.
2. **Mermaid Live Editor:** 
   * Copia todo el código que está dentro del bloque ` ```mermaid ` arriba.
   * Pégalo en [Mermaid Live Editor](https://mermaid.live).
   * Desde allí puedes personalizar colores, tipografías y descargarlo en formato **PNG**, **SVG** o **PDF** con alta calidad de manera inmediata.
