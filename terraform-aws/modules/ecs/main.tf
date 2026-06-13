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
        { name = "INTERNAL_API_URL", value = "http://${var.backend_alb_dns}" },
        { name = "NEXT_PUBLIC_API_URL", value = var.next_public_api_url },
        { name = "NEXT_PUBLIC_COGNITO_USER_POOL_ID", value = var.cognito_user_pool_id },
        { name = "NEXT_PUBLIC_COGNITO_CLIENT_ID", value = var.cognito_client_id },
        { name = "NEXT_PUBLIC_AWS_REGION", value = var.aws_region },
        { name = "GOOGLE_GENERATIVE_AI_API_KEY", value = var.google_generative_ai_api_key }
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
        { name = "PORT", value = var.port },
        { name = "NODE_ENV", value = var.node_env },
        { name = "FRONTEND_URL", value = var.frontend_url },
        { name = "COGNITO_USER_POOL_ID", value = var.cognito_user_pool_id },
        { name = "COGNITO_CLIENT_ID", value = var.cognito_client_id },
        { name = "AWS_REGION", value = var.aws_region },
        { name = "DYNAMO_TABLE_USERS", value = var.dynamo_table_users },
        { name = "DYNAMO_TABLE_INTERVIEWS", value = var.dynamo_table_interviews },
        { name = "DYNAMO_TABLE_FEEDBACK", value = var.dynamo_table_feedback },
        { name = "GOOGLE_GENERATIVE_AI_API_KEY", value = var.google_generative_ai_api_key },
        { name = "LIVEKIT_URL", value = var.livekit_url },
        { name = "LIVEKIT_API_KEY", value = var.livekit_api_key },
        { name = "LIVEKIT_API_SECRET", value = var.livekit_api_secret }
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
  wait_for_steady_state = false

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
  wait_for_steady_state = false

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

# ──────────────────────────────────────────────────────────────────────────────
# CLOUDWATCH LOG GROUP — LIVEKIT AGENT
# ──────────────────────────────────────────────────────────────────────────────
resource "aws_cloudwatch_log_group" "livekit_agent" {
  name              = "/ecs/${var.project_name}-${var.environment}-livekit-agent"
  retention_in_days = 7

  tags = {
    Name        = "${var.project_name}-${var.environment}-logs-livekit-agent"
    Project     = var.project_name
    Environment = var.environment
  }
}

# ──────────────────────────────────────────────────────────────────────────────
# ECS TASK DEFINITION — LIVEKIT AGENT
# Worker saliente: conecta a LiveKit Cloud y a las APIs de STT/TTS/LLM
# ──────────────────────────────────────────────────────────────────────────────
resource "aws_ecs_task_definition" "livekit_agent" {
  family                   = "${var.project_name}-${var.environment}-td-livekit-agent"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "1024"
  memory                   = "2048"
  execution_role_arn       = data.aws_iam_role.lab_role.arn
  task_role_arn            = data.aws_iam_role.lab_role.arn

  container_definitions = jsonencode([
    {
      name      = "livekit-agent"
      image     = var.livekit_agent_image
      essential = true

      environment = [
        { name = "LIVEKIT_URL",        value = var.livekit_url },
        { name = "LIVEKIT_API_KEY",    value = var.livekit_api_key },
        { name = "LIVEKIT_API_SECRET", value = var.livekit_api_secret },
        { name = "DEEPGRAM_API_KEY",   value = var.deepgram_api_key },
        { name = "CARTESIA_API_KEY",   value = var.cartesia_api_key },
        { name = "GROQ_API_KEY",       value = var.groq_api_key },
        { name = "BACKEND_URL",        value = var.backend_internal_url }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.livekit_agent.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "livekit-agent"
        }
      }
    }
  ])

  tags = {
    Name        = "${var.project_name}-${var.environment}-td-livekit-agent"
    Project     = var.project_name
    Environment = var.environment
  }
}

# ──────────────────────────────────────────────────────────────────────────────
# ECS SERVICE — LIVEKIT AGENT
# Sin load balancer: es un worker que solo hace conexiones salientes
# ──────────────────────────────────────────────────────────────────────────────
resource "aws_ecs_service" "livekit_agent" {
  name            = "${var.project_name}-${var.environment}-service-livekit-agent"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.livekit_agent.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.livekit_agent_sg_id]
    assign_public_ip = false
  }

  force_new_deployment = true
  wait_for_steady_state = false

  lifecycle {
    ignore_changes = [desired_count]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-service-livekit-agent"
    Project     = var.project_name
    Environment = var.environment
  }
}
