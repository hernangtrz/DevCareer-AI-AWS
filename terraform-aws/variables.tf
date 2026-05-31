# ─────────────────────────────────────────
# GENERAL
# ─────────────────────────────────────────
variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used as prefix for all resources"
  type        = string
  default     = "myapp"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

# ─────────────────────────────────────────
# NETWORKING
# ─────────────────────────────────────────
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones (exactly 2)"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "public_subnets" {
  description = "CIDR blocks for public subnets (frontend / ALB)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnets" {
  description = "CIDR blocks for private subnets (ECS tasks)"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "database_subnets" {
  description = "CIDR blocks for isolated database subnets"
  type        = list(string)
  default     = ["10.0.20.0/24", "10.0.21.0/24"]
}

# ─────────────────────────────────────────
# ECS — IMAGES
# ─────────────────────────────────────────
variable "frontend_image" {
  description = "Docker Hub image for the frontend"
  type        = string
  default     = "hernang09/frontend:v3"
}

variable "backend_image" {
  description = "Docker Hub image for the backend"
  type        = string
  default     = "hernang09/backend:v3"
}

# ─────────────────────────────────────────
# ECS — TASK SIZING
# ─────────────────────────────────────────
variable "frontend_cpu" {
  description = "CPU units for the frontend task (1 vCPU = 1024)"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Memory (MiB) for the frontend task"
  type        = number
  default     = 512
}

variable "backend_cpu" {
  description = "CPU units for the backend task"
  type        = number
  default     = 256
}

variable "backend_memory" {
  description = "Memory (MiB) for the backend task"
  type        = number
  default     = 512
}

variable "frontend_desired_count" {
  description = "Number of frontend task replicas"
  type        = number
  default     = 2
}

variable "backend_desired_count" {
  description = "Number of backend task replicas"
  type        = number
  default     = 2
}

# ─────────────────────────────────────────
# BACKEND — Runtime
# ─────────────────────────────────────────
variable "port" {
  description = "Puerto del backend"
  type        = string
  default     = "3001"
}

variable "node_env" {
  type    = string
  default = "production"
}

variable "frontend_url" {
  description = "URL del frontend (se puede dejar vacío si se calcula en main.tf)"
  type        = string
  default     = ""
}

# ─────────────────────────────────────────
# FIREBASE ADMIN (backend)
# ─────────────────────────────────────────
variable "firebase_project_id" {
  type      = string
  sensitive = true
}

variable "firebase_client_email" {
  type      = string
  sensitive = true
}

variable "firebase_private_key" {
  type      = string
  sensitive = true
}

# ─────────────────────────────────────────
# AWS / DYNAMODB
# ─────────────────────────────────────────
variable "aws_access_key_id" {
  type      = string
  sensitive = true
  default   = ""
}

variable "aws_secret_access_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "aws_session_token" {
  description = "Token de sesión temporal para credenciales AWS Academy (ASIA*)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "dynamo_table_users" {
  type    = string
  default = "devcareer_users"
}

variable "dynamo_table_interviews" {
  type    = string
  default = "devcareer_interviews"
}

variable "dynamo_table_feedback" {
  type    = string
  default = "devcareer_feedback"
}

# ─────────────────────────────────────────
# GOOGLE GEMINI
# ─────────────────────────────────────────
variable "google_generative_ai_api_key" {
  type      = string
  sensitive = true
}

# ─────────────────────────────────────────
# FIREBASE CLIENT SDK (frontend — NEXT_PUBLIC_*)
# ─────────────────────────────────────────
variable "next_public_api_url" {
  type    = string
  default = "" # ← agregado (se calcula en main.tf)
}

variable "next_public_firebase_api_key" {
  type      = string
  sensitive = true
}

variable "next_public_firebase_auth_domain" {
  type = string
}

variable "next_public_firebase_project_id" {
  type = string
}

variable "next_public_firebase_storage_bucket" {
  type = string
}

variable "next_public_firebase_messaging_sender_id" {
  type = string
}

variable "next_public_firebase_app_id" {
  type      = string
  sensitive = true
}

variable "next_public_firebase_measurement_id" {
  type    = string
  default = ""
}
# ─────────────────────────────────────────
# VAPI (frontend)
# ─────────────────────────────────────────
variable "next_public_vapi_web_token" {
  type      = string
  sensitive = true
}

variable "next_public_vapi_workflow_id" {
  type = string
}
