# AWS Hybrid Architecture — ECS & DynamoDB con Terraform

Infraestructura completa en AWS que replica el diagrama de referencia:  
**VPC → ALB externo → ECS Frontend → ALB interno → ECS Backend → DynamoDB**

---

## Estructura del proyecto

```
terraform-aws/
├── main.tf                    # Orquestación de módulos
├── variables.tf               # Variables raíz
├── outputs.tf                 # Salidas principales
├── terraform.tfvars.example   # Plantilla de valores (copia y renombra)
└── modules/
    ├── vpc/                   # VPC, subredes, IGW, NAT GW, route tables
    ├── security-groups/       # 4 security groups (ALBs, frontend, backend)
    ├── alb/                   # ALB externo (público) + ALB interno
    ├── dynamodb/              # Tablas de DynamoDB
    └── ecs/                   # Cluster, task definitions, servicios Fargate
```

---

## Arquitectura desplegada

```
Internet
   │
   ▼
Route 53 / DNS (opcional)
   │
   ▼
ALB Externo (público, subredes públicas)
   │  puerto 80
   ▼
ECS Frontend Tasks  ──── puerto 80 ──── imagen: casn205/frontend:v3
(subredes privadas)
   │
   │  BACKEND_URL → http://alb-interno:3000
   ▼
ALB Interno (privado, subredes privadas)
   │  puerto 3000
   ▼
ECS Backend Tasks   ──── puerto 3000 ── imagen: casn205/backend:v3
(subredes privadas)
   │
   │  HTTPS / AWS SDK (DynamoDB APIs)
   ▼
Amazon DynamoDB
(Tablas NoSQL administradas de AWS)
```

### Security Groups (flujo unidireccional)

| SG | Permite entrada desde | Puerto |
|---|---|---|
| `sg-alb-external` | 0.0.0.0/0 (Internet) | 80, 443 |
| `sg-frontend` | sg-alb-external | 80 |
| `sg-alb-internal` | VPC CIDR | 3000 |
| `sg-backend` | sg-alb-internal | 3000 |

---

## Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| Terraform | >= 1.5.0 |
| AWS CLI | >= 2.x |
| Cuenta AWS | con permisos suficientes (ver abajo) |

### Permisos IAM necesarios
- `ec2:*` (VPC, subnets, SGs, IGW, NAT, EIPs)
- `elasticloadbalancing:*`
- `ecs:*`
- `dynamodb:*`
- `iam:CreateRole`, `iam:AttachRolePolicy`, `iam:PassRole`
- `logs:*` (CloudWatch)

---

## Despliegue paso a paso

### 1. Clonar y configurar variables

```bash
# Copia el archivo de ejemplo
cp terraform.tfvars.example terraform.tfvars

# Edita con tus valores reales
nano terraform.tfvars
```

Campos **obligatorios** a cambiar:
```hcl
aws_region                   = "us-east-1"
project_name                 = "myapp"
google_generative_ai_api_key = "tu-api-key-de-gemini"
firebase_project_id          = "tu-project-id"
firebase_client_email        = "tu-client-email"
firebase_private_key         = "tu-private-key"
# ... rellena también el resto de variables de Firebase SDK Client y Vapi en terraform.tfvars
```

### 2. Inicializar Terraform

```bash
terraform init
```

### 3. Ver el plan de recursos

```bash
terraform plan
```

Terraform creará aproximadamente **~35 recursos**.

### 4. Aplicar la infraestructura

```bash
terraform apply
```

El despliegue completo toma entre **5–10 minutos**.

### 5. Verificar los outputs

```bash
terraform output frontend_alb_dns
# → myapp-dev-alb-ext-XXXXXXX.us-east-1.elb.amazonaws.com
```

Abre esa URL en el navegador para acceder al frontend.

---

## Variables más relevantes

| Variable | Default | Descripción |
|---|---|---|
| `aws_region` | `us-east-1` | Región AWS |
| `project_name` | `myapp` | Prefijo de todos los recursos |
| `environment` | `dev` | Entorno (dev/staging/prod) |
| `frontend_image` | `casn205/frontend:v3` | Imagen Docker Hub frontend |
| `backend_image` | `casn205/backend:v3` | Imagen Docker Hub backend |
| `frontend_desired_count` | `2` | Réplicas del frontend |
| `backend_desired_count` | `2` | Réplicas del backend |

---

## Variables de entorno inyectadas en los contenedores

### Backend
```
AWS_REGION                   → valor de var.aws_region
FIREBASE_PROJECT_ID          → valor de var.firebase_project_id
FIREBASE_CLIENT_EMAIL        → valor de var.firebase_client_email
FIREBASE_PRIVATE_KEY         → valor de var.firebase_private_key
AWS_ACCESS_KEY_ID            → valor de var.aws_access_key_id
AWS_SECRET_ACCESS_KEY        → valor de var.aws_secret_access_key
DYNAMO_TABLE_USERS           → nombre de la tabla de usuarios
DYNAMO_TABLE_INTERVIEWS      → nombre de la tabla de entrevistas
DYNAMO_TABLE_FEEDBACK        → nombre de la tabla de feedback
GOOGLE_GENERATIVE_AI_API_KEY → api key de Google Gemini
NODE_ENV                     → valor de var.environment
```

### Frontend
```
NEXT_PUBLIC_API_URL          → URL del ALB público
NEXT_PUBLIC_FIREBASE_API_KEY → credenciales públicas de Firebase Client
NEXT_PUBLIC_VAPI_WEB_TOKEN   → token público de Vapi
... (resto de variables NEXT_PUBLIC_*)
```

> Ajusta los nombres de las variables según lo que espere tu aplicación.

---

## Destruir la infraestructura

```bash
terraform destroy
```

> **Importante**: Las tablas de DynamoDB y recursos asociados se borrarán al ejecutar destroy. En producción asegúrate de habilitar copias de seguridad continuas (PITR) y protección de borrado en recursos críticos.

---

## Notas de producción

- [ ] Habilitar HTTPS en el ALB externo (certificado ACM + listener 443)
- [ ] Usar AWS Secrets Manager en lugar de variables de entorno para credenciales sensibles
- [ ] Habilitar Point-in-Time Recovery (PITR) en las tablas de DynamoDB
- [ ] Configurar Auto Scaling para los servicios ECS
- [ ] Añadir WAF al ALB externo
- [ ] Usar backend remoto de Terraform (S3 + DynamoDB) para estado compartido
