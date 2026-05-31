# ──────────────────────────────────────────────────────────────────────────────
# GENERAL
# ──────────────────────────────────────────────────────────────────────────────
variable "project_name" { type = string }
variable "environment"  { type = string }
variable "aws_region"   { type = string }

# ──────────────────────────────────────────────────────────────────────────────
# NETWORKING
# ──────────────────────────────────────────────────────────────────────────────
variable "private_subnet_ids" { type = list(string) }
variable "frontend_sg_id"     { type = string }
variable "backend_sg_id"      { type = string }

# ──────────────────────────────────────────────────────────────────────────────
# IMAGES
# ──────────────────────────────────────────────────────────────────────────────
variable "frontend_image" { type = string }
variable "backend_image"  { type = string }

# ──────────────────────────────────────────────────────────────────────────────
# ALB TARGET GROUPS
# ──────────────────────────────────────────────────────────────────────────────
variable "frontend_target_group_arn" { type = string }
variable "backend_target_group_arn"  { type = string }

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
# FIREBASE ADMIN (backend)
# ──────────────────────────────────────────────────────────────────────────────
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
# FIREBASE CLIENT SDK — NEXT_PUBLIC_* (frontend, inyectadas en runtime)
# ──────────────────────────────────────────────────────────────────────────────
variable "next_public_api_url" {
  type    = string
  default = ""
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
variable "frontend_cpu"           { type = number }
variable "frontend_memory"        { type = number }
variable "backend_cpu"            { type = number }
variable "backend_memory"         { type = number }
variable "frontend_desired_count" { type = number }
variable "backend_desired_count"  { type = number }