# ─────────────────────────────────────────
# NETWORKING
# ─────────────────────────────────────────
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnet_ids
}

# ─────────────────────────────────────────
# LOAD BALANCERS
# ─────────────────────────────────────────
output "frontend_alb_dns" {
  description = "Public DNS of the external ALB (frontend entry point)"
  value       = module.alb.external_alb_dns
}

output "backend_alb_dns" {
  description = "Internal DNS of the internal ALB (backend)"
  value       = module.alb.internal_alb_dns
}

# ─────────────────────────────────────────
# ECS
# ─────────────────────────────────────────
output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

output "frontend_service_name" {
  description = "ECS frontend service name"
  value       = module.ecs.frontend_service_name
}

output "backend_service_name" {
  description = "ECS backend service name"
  value       = module.ecs.backend_service_name
}

# ─────────────────────────────────────────
# DYNAMODB
# ─────────────────────────────────────────
output "dynamo_table_users" {
  description = "Nombre de la tabla DynamoDB de usuarios"
  value       = module.dynamodb.table_users_name
}

output "dynamo_table_interviews" {
  description = "Nombre de la tabla DynamoDB de entrevistas"
  value       = module.dynamodb.table_interviews_name
}

output "dynamo_table_feedback" {
  description = "Nombre de la tabla DynamoDB de feedback"
  value       = module.dynamodb.table_feedback_name
}