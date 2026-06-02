# ──────────────────────────────────────────────────────────────────────────────
# ALB EXTERNO  —  Frontera pública (recibe tráfico del usuario)
# ──────────────────────────────────────────────────────────────────────────────
resource "aws_lb" "external" {
  name               = "${var.project_name}-${var.environment}-alb-ext"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_external_sg_id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = false

  tags = {
    Name        = "${var.project_name}-${var.environment}-alb-external"
    Project     = var.project_name
    Environment = var.environment
  }
}

# Target Group — Frontend (containers en puerto 80)
resource "aws_lb_target_group" "frontend" {
  name        = "${var.project_name}-${var.environment}-tg-frontend"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip" # requerido para ECS Fargate

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/"
    matcher             = "200-299"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-tg-frontend"
    Project     = var.project_name
    Environment = var.environment
  }
}

# Listener externo: HTTP 80 → Target Group frontend
resource "aws_lb_listener" "frontend_http" {
  load_balancer_arn = aws_lb.external.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

# ──────────────────────────────────────────────────────────────────────────────
# ALB INTERNO  —  frontend → backend
# Escucha en puerto 80  →  reenvía al puerto 3000 de los containers backend
# ──────────────────────────────────────────────────────────────────────────────
resource "aws_lb" "internal" {
  name               = "${var.project_name}-${var.environment}-alb-int"
  internal           = true
  load_balancer_type = "application"
  security_groups    = [var.alb_internal_sg_id]
  subnets            = var.private_subnet_ids

  enable_deletion_protection = false

  tags = {
    Name        = "${var.project_name}-${var.environment}-alb-internal"
    Project     = var.project_name
    Environment = var.environment
  }
}

# Target Group — Backend (containers escuchan en puerto 3000)
resource "aws_lb_target_group" "backend" {
  name        = "${var.project_name}-${var.environment}-tg-backend"
  port        = 3001 # puerto real del contenedor backend
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/"
    matcher             = "200-499" # amplio para no fallar si /health no existe
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-tg-backend"
    Project     = var.project_name
    Environment = var.environment
  }
}

# Listener interno: HTTP 80 → Target Group backend (port 3000)
resource "aws_lb_listener" "backend_http" {
  load_balancer_arn = aws_lb.internal.arn
  port              = 80 # el frontend llama al ALB en el 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}
