terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region     = var.aws_region
  access_key = var.aws_access_key_id
  secret_key = var.aws_secret_access_key
  token      = var.aws_session_token
}

# ─────────────────────────────────────────
# VPC
# ─────────────────────────────────────────
module "vpc" {
  source = "./modules/vpc"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  public_subnets     = var.public_subnets
  private_subnets    = var.private_subnets
  database_subnets   = var.database_subnets
}

# ─────────────────────────────────────────
# SECURITY GROUPS
# ─────────────────────────────────────────
module "security_groups" {
  source = "./modules/security-groups"

  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id
  vpc_cidr     = var.vpc_cidr
}

# ─────────────────────────────────────────
# LOAD BALANCERS
# ─────────────────────────────────────────
module "alb" {
  source = "./modules/alb"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  public_subnet_ids  = module.vpc.public_subnet_ids
  private_subnet_ids = module.vpc.private_subnet_ids
  alb_external_sg_id = module.security_groups.alb_external_sg_id
  alb_internal_sg_id = module.security_groups.alb_internal_sg_id
}

# ─────────────────────────────────────────
# COGNITO — AUTH
# ─────────────────────────────────────────
module "cognito" {
  source = "./modules/cognito"

  project_name = var.project_name
  environment  = var.environment
}

# ─────────────────────────────────────────
# ECS CLUSTER + SERVICES
# ─────────────────────────────────────────
module "ecs" {
  source = "./modules/ecs"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region

  # Networking
  private_subnet_ids = module.vpc.private_subnet_ids
  frontend_sg_id     = module.security_groups.frontend_sg_id
  backend_sg_id      = module.security_groups.backend_sg_id

  # Images (Docker Hub)
  frontend_image = var.frontend_image
  backend_image  = var.backend_image

  # ALB Target Groups
  frontend_target_group_arn = module.alb.frontend_tg_arn
  backend_target_group_arn  = module.alb.backend_tg_arn

  backend_alb_dns = module.alb.internal_alb_dns

  # Backend runtime
  port         = var.port
  node_env     = var.node_env
  frontend_url = "http://${module.alb.external_alb_dns}"

  # AWS credentials / DynamoDB (backend)
  aws_access_key_id     = var.aws_access_key_id
  aws_secret_access_key = var.aws_secret_access_key
  aws_session_token     = var.aws_session_token

  dynamo_table_users      = module.dynamodb.table_users_name
  dynamo_table_interviews = module.dynamodb.table_interviews_name
  dynamo_table_feedback   = module.dynamodb.table_feedback_name

  depends_on = [module.dynamodb, module.cognito]

  # Google Gemini (backend)
  google_generative_ai_api_key = var.google_generative_ai_api_key

  # Cognito Auth + Vapi (frontend — runtime inject)
  next_public_api_url          = "http://${module.alb.external_alb_dns}"
  cognito_user_pool_id         = module.cognito.user_pool_id
  cognito_client_id            = module.cognito.client_id
  next_public_vapi_web_token   = var.next_public_vapi_web_token
  next_public_vapi_workflow_id = var.next_public_vapi_workflow_id

  # Task sizing
  frontend_cpu           = var.frontend_cpu
  frontend_memory        = var.frontend_memory
  backend_cpu            = var.backend_cpu
  backend_memory         = var.backend_memory
  frontend_desired_count = var.frontend_desired_count
  backend_desired_count  = var.backend_desired_count
}
# ─────────────────────────────────────────
# DYNAMODB TABLES
# ─────────────────────────────────────────
module "dynamodb" {
  source = "./modules/dynamodb"

  project_name     = var.project_name
  environment      = var.environment
  table_users      = var.dynamo_table_users
  table_interviews = var.dynamo_table_interviews
  table_feedback   = var.dynamo_table_feedback
}
