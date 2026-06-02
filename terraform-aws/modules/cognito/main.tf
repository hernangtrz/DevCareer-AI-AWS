# ──────────────────────────────────────────────────────────────────────────────
# COGNITO USER POOL
# ──────────────────────────────────────────────────────────────────────────────
resource "aws_cognito_user_pool" "this" {
  name = "${var.project_name}-${var.environment}-user-pool"

  # Verificación y recuperación por email (SMS deshabilitado para AWS Academy)
  auto_verified_attributes = ["email"]
  username_attributes      = ["email"]

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Tu código de verificación - DevCareer AI"
    email_message        = "Tu código de verificación es {####}. Es válido por 24 horas."
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  password_policy {
    minimum_length                   = 8
    require_uppercase                = false
    require_lowercase                = false
    require_numbers                  = false
    require_symbols                  = false
    temporary_password_validity_days = 7
  }

  schema {
    name                = "name"
    attribute_data_type = "String"
    mutable             = true
    required            = true
    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  user_pool_add_ons {
    advanced_security_mode = "OFF"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-user-pool"
    Project     = var.project_name
    Environment = var.environment
  }
}

# ──────────────────────────────────────────────────────────────────────────────
# COGNITO APP CLIENT (sin secret — para aplicaciones web SPA)
# ──────────────────────────────────────────────────────────────────────────────
resource "aws_cognito_user_pool_client" "this" {
  name         = "${var.project_name}-${var.environment}-app-client"
  user_pool_id = aws_cognito_user_pool.this.id

  # Sin client secret: requerido para apps web/SPA
  generate_secret = false

  # Flujos de autenticación habilitados
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
  ]

  # Expiración de tokens
  access_token_validity  = 1  # 1 hora
  id_token_validity      = 1  # 1 hora
  refresh_token_validity = 30 # 30 días

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  prevent_user_existence_errors = "ENABLED"
}
