# ──────────────────────────────────────────────────────────────────────────────
# GENERAL
# ──────────────────────────────────────────────────────────────────────────────
variable "project_name" { type = string }
variable "environment" { type = string }
variable "aws_region" { type = string }

# ──────────────────────────────────────────────────────────────────────────────
# NETWORKING
# ──────────────────────────────────────────────────────────────────────────────
variable "private_subnet_ids" { type = list(string) }
variable "frontend_sg_id" { type = string }
variable "backend_sg_id" { type = string }

# ──────────────────────────────────────────────────────────────────────────────
# IMAGES
# ──────────────────────────────────────────────────────────────────────────────
variable "frontend_image" { type = string }
variable "backend_image" { type = string }

# ──────────────────────────────────────────────────────────────────────────────
# ALB TARGET GROUPS
# ──────────────────────────────────────────────────────────────────────────────
variable "frontend_target_group_arn" { type = string }
variable "backend_target_group_arn" { type = string }

variable "backend_alb_dns" {
  type    = string
  default = ""
}

# ──────────────────────────────────────────────────────────────────────────────
# BACKEND — RUNTIME
# ──────────────────────────────────────────────────────────────────────────────
variable "port" {
  type    = string
  default = "3001"
}

variable "node_env" {
  type    = string
  default = "production"
}

variable "frontend_url" {
  type    = string
  default = ""
}

# ──────────────────────────────────────────────────────────────────────────────
# COGNITO AUTH
# ──────────────────────────────────────────────────────────────────────────────
variable "cognito_user_pool_id" { type = string }
variable "cognito_client_id" { type = string }

variable "next_public_api_url" {
  description = "URL pública del ALB externo (inyectada en el frontend en runtime)"
  type        = string
  default     = ""
}

# ──────────────────────────────────────────────────────────────────────────────
# AWS CREDENTIALS / DYNAMODB (backend)
# ──────────────────────────────────────────────────────────────────────────────
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
  description = "Token de sesión temporal AWS Academy (ASIA*)"
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

# ──────────────────────────────────────────────────────────────────────────────
# GOOGLE GEMINI (backend)
# ──────────────────────────────────────────────────────────────────────────────
variable "google_generative_ai_api_key" {
  type      = string
  sensitive = true
}

# ──────────────────────────────────────────────────────────────────────────────
# VAPI (frontend)
# ──────────────────────────────────────────────────────────────────────────────
variable "next_public_vapi_web_token" {
  type      = string
  sensitive = true
}

variable "next_public_vapi_workflow_id" {
  type = string
}

# ──────────────────────────────────────────────────────────────────────────────
# TASK SIZING
# ──────────────────────────────────────────────────────────────────────────────
variable "frontend_cpu" { type = number }
variable "frontend_memory" { type = number }
variable "backend_cpu" { type = number }
variable "backend_memory" { type = number }
variable "frontend_desired_count" { type = number }
variable "backend_desired_count" { type = number }

# ──────────────────────────────────────────────────────────────────────────────
# LIVEKIT (backend — generación de tokens)
# ──────────────────────────────────────────────────────────────────────────────
variable "livekit_url" {
  type      = string
  sensitive = true
  default   = ""
}

variable "livekit_api_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "livekit_api_secret" {
  type      = string
  sensitive = true
  default   = ""
}

# ──────────────────────────────────────────────────────────────────────────────
# LIVEKIT AGENT PROVIDERS (para referencia futura del agente)
# ──────────────────────────────────────────────────────────────────────────────
variable "deepgram_api_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "cartesia_api_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "groq_api_key" {
  type      = string
  sensitive = true
  default   = ""
}