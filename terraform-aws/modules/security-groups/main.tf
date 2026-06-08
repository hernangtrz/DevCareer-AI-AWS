# ──────────────────────────────────────────────────────────────────────────────
# SECURITY GROUP: ALB EXTERNO  (acceso público al frontend)
# ──────────────────────────────────────────────────────────────────────────────
resource "aws_security_group" "alb_external" {
  name        = "${var.project_name}-${var.environment}-sg-alb-external"
  description = "Allow HTTP/HTTPS from Internet to external ALB"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTP from Internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from Internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-sg-alb-external"
    Project     = var.project_name
    Environment = var.environment
  }
}

# ──────────────────────────────────────────────────────────────────────────────
# SECURITY GROUP: ALB INTERNO
# Escucha en puerto 80 (el frontend le habla en 80)
# ──────────────────────────────────────────────────────────────────────────────
resource "aws_security_group" "alb_internal" {
  name        = "${var.project_name}-${var.environment}-sg-alb-internal"
  description = "Allow port 80 from frontend tasks to internal ALB"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTP desde tasks del frontend"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-sg-alb-internal"
    Project     = var.project_name
    Environment = var.environment
  }
}

# ──────────────────────────────────────────────────────────────────────────────
# SECURITY GROUP: FRONTEND ECS TASKS
# Recibe tráfico del ALB externo en puerto 80
# ──────────────────────────────────────────────────────────────────────────────
resource "aws_security_group" "frontend" {
  name        = "${var.project_name}-${var.environment}-sg-frontend"
  description = "Allow port 80 from external ALB to frontend tasks"
  vpc_id      = var.vpc_id

  ingress {
    description     = "HTTP desde ALB externo"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_external.id]
  }

  egress {
    description = "All outbound (pull images, reach internal ALB)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-sg-frontend"
    Project     = var.project_name
    Environment = var.environment
  }
}

# ──────────────────────────────────────────────────────────────────────────────
# SECURITY GROUP: BACKEND ECS TASKS
# Recibe tráfico del ALB interno en puerto 3000
# ──────────────────────────────────────────────────────────────────────────────
resource "aws_security_group" "backend" {
  name        = "${var.project_name}-${var.environment}-sg-backend"
  description = "Allow port 3000 from internal ALB to backend tasks"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Backend API desde ALB interno"
    from_port       = 3001
    to_port         = 3001
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_internal.id]
  }

  egress {
    description = "All outbound (pull images, reach RDS)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-sg-backend"
    Project     = var.project_name
    Environment = var.environment
  }
}

# ──────────────────────────────────────────────────────────────────────────────
# SECURITY GROUP: RDS PostgreSQL
# Solo acepta conexiones desde las tasks del backend (puerto 5432)
# ──────────────────────────────────────────────────────────────────────────────
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-${var.environment}-sg-rds"
  description = "Allow PostgreSQL (5432) only from backend tasks"
  vpc_id      = var.vpc_id

  ingress {
    description     = "PostgreSQL desde backend tasks"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.backend.id]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-sg-rds"
    Project     = var.project_name
    Environment = var.environment
  }
}

# ──────────────────────────────────────────────────────────────────────────────
# SECURITY GROUP: LIVEKIT AGENT (worker saliente)
# Sin ingress: el agente nunca recibe tráfico entrante.
# Solo hace conexiones salientes a LiveKit Cloud, Deepgram, Cartesia y Groq.
# ──────────────────────────────────────────────────────────────────────────────
resource "aws_security_group" "livekit_agent" {
  name        = "${var.project_name}-${var.environment}-sg-livekit-agent"
  description = "LiveKit voice agent worker - outbound only"
  vpc_id      = var.vpc_id

  egress {
    description = "All outbound (LiveKit Cloud, Deepgram, Cartesia, Groq, Backend internal)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-sg-livekit-agent"
    Project     = var.project_name
    Environment = var.environment
  }
}
