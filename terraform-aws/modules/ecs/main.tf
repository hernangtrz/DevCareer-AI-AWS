# ──────────────────────────────────────────────────────────────────────────────
# ECS CLUSTER
# ──────────────────────────────────────────────────────────────────────────────
resource "aws_ecs_cluster" "this" {
  name = "${var.project_name}-${var.environment}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-cluster"
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_ecs_cluster_capacity_providers" "this" {
  cluster_name = aws_ecs_cluster.this.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = "FARGATE"
  }
}

# ──────────────────────────────────────────────────────────────────────────────
# IAM — Usar LabRole existente (sin crear ni modificar roles)
# ──────────────────────────────────────────────────────────────────────────────
data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

# ──────────────────────────────────────────────────────────────────────────────
# CLOUDWATCH LOG GROUPS
# ──────────────────────────────────────────────────────────────────────────────
resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/ecs/${var.project_name}-${var.environment}/frontend"
  retention_in_days = 7

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.project_name}-${var.environment}/backend"
  retention_in_days = 7

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# ──────────────────────────────────────────────────────────────────────────────
# TASK DEFINITION — FRONTEND
# ──────────────────────────────────────────────────────────────────────────────
resource "aws_ecs_task_definition" "frontend" {
  family                   = "${var.project_name}-${var.environment}-frontend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.frontend_cpu
  memory                   = var.frontend_memory
  execution_role_arn       = data.aws_iam_role.lab_role.arn
  task_role_arn            = data.aws_iam_role.lab_role.arn

  container_definitions = jsonencode([
    {
      name      = "frontend"
      image     = var.frontend_image
      essential = true

      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]

      # BACKEND_URL apunta al ALB interno en puerto 80
      # El ALB interno escucha en 80 y reenvía al puerto 3000 del backend
      environment = [
        { name = "INTERNAL_API_URL",                           value = "http://${var.backend_alb_dns}" },
        { name = "NEXT_PUBLIC_API_URL",                        value = var.next_public_api_url },
        { name = "NEXT_PUBLIC_FIREBASE_API_KEY",               value = var.next_public_firebase_api_key },
        { name = "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",           value = var.next_public_firebase_auth_domain },
        { name = "NEXT_PUBLIC_FIREBASE_PROJECT_ID",            value = var.next_public_firebase_project_id },
        { name = "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",        value = var.next_public_firebase_storage_bucket },
        { name = "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",   value = var.next_public_firebase_messaging_sender_id },
        { name = "NEXT_PUBLIC_FIREBASE_APP_ID",                value = var.next_public_firebase_app_id },
        { name = "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",        value = var.next_public_firebase_measurement_id },
        { name = "NEXT_PUBLIC_VAPI_WEB_TOKEN",                 value = var.next_public_vapi_web_token },
        { name = "NEXT_PUBLIC_VAPI_WORKFLOW_ID",               value = var.next_public_vapi_workflow_id }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.frontend.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "frontend"
        }
      }
    }
  ])

  tags = {
    Name        = "${var.project_name}-${var.environment}-td-frontend"
    Project     = var.project_name
    Environment = var.environment
  }
}

# ──────────────────────────────────────────────────────────────────────────────
# TASK DEFINITION — BACKEND
# ──────────────────────────────────────────────────────────────────────────────
resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_name}-${var.environment}-backend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.backend_cpu
  memory                   = var.backend_memory
  execution_role_arn       = data.aws_iam_role.lab_role.arn
  task_role_arn            = data.aws_iam_role.lab_role.arn

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = var.backend_image
      essential = true

      portMappings = [
        {
          containerPort = 3001
          hostPort      = 3001
          protocol      = "tcp"
        }
      ]

      # Variables de entorno exactas que consume la app
      environment = [
        { name = "PORT",          value = var.port },
        { name = "NODE_ENV",      value = var.node_env },
        { name = "FRONTEND_URL",  value = var.frontend_url },
        { name = "FIREBASE_PROJECT_ID",    value = var.firebase_project_id },
        { name = "FIREBASE_CLIENT_EMAIL",  value = var.firebase_client_email },
        { name = "FIREBASE_PRIVATE_KEY",   value = var.firebase_private_key },
        { name = "AWS_REGION",             value = var.aws_region },
        # NO pasar AWS_ACCESS_KEY_ID/SECRET/SESSION_TOKEN aquí —
        # el SDK usa automáticamente el LabRole (task_role_arn) via
        # container metadata, que no expira con el lab.
        { name = "DYNAMO_TABLE_USERS",       value = var.dynamo_table_users },
        { name = "DYNAMO_TABLE_INTERVIEWS",  value = var.dynamo_table_interviews },
        { name = "DYNAMO_TABLE_FEEDBACK",    value = var.dynamo_table_feedback },
        { name = "GOOGLE_GENERATIVE_AI_API_KEY", value = var.google_generative_ai_api_key }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "backend"
        }
      }
    }
  ])

  tags = {
    Name        = "${var.project_name}-${var.environment}-td-backend"
    Project     = var.project_name
    Environment = var.environment
  }
}

# ──────────────────────────────────────────────────────────────────────────────
# ECS SERVICE — FRONTEND
# ──────────────────────────────────────────────────────────────────────────────
resource "aws_ecs_service" "frontend" {
  name            = "${var.project_name}-${var.environment}-service-frontend"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = var.frontend_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.frontend_sg_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.frontend_target_group_arn
    container_name   = "frontend"
    container_port   = 3000
  }

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  force_new_deployment = true

  lifecycle {
    ignore_changes = [desired_count]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-service-frontend"
    Project     = var.project_name
    Environment = var.environment
  }
}

# ──────────────────────────────────────────────────────────────────────────────
# ECS SERVICE — BACKEND
# ──────────────────────────────────────────────────────────────────────────────
resource "aws_ecs_service" "backend" {
  name            = "${var.project_name}-${var.environment}-service-backend"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = var.backend_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.backend_sg_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.backend_target_group_arn
    container_name   = "backend"
    container_port   = 3001
  }

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  force_new_deployment = true

  lifecycle {
    ignore_changes = [desired_count]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-service-backend"
    Project     = var.project_name
    Environment = var.environment
  }
}

# ──────────────────────────────────────────────────────────────────────────────
# AUTO SCALING
# ──────────────────────────────────────────────────────────────────────────────

resource "aws_appautoscaling_target" "frontend" {
  max_capacity       = 6
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.this.name}/${aws_ecs_service.frontend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "frontend_cpu" {
  name               = "${var.project_name}-${var.environment}-frontend-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.frontend.resource_id
  scalable_dimension = aws_appautoscaling_target.frontend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.frontend.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 50.0
    scale_in_cooldown  = 60
    scale_out_cooldown = 60
  }
}

resource "aws_appautoscaling_target" "backend" {
  max_capacity       = 6
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.this.name}/${aws_ecs_service.backend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "backend_cpu" {
  name               = "${var.project_name}-${var.environment}-backend-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.backend.resource_id
  scalable_dimension = aws_appautoscaling_target.backend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 50.0
    scale_in_cooldown  = 60
    scale_out_cooldown = 60
  }
}

