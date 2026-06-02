resource "aws_dynamodb_table" "users" {
  name         = var.table_users
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  global_secondary_index {
    name            = "email-index"
    hash_key        = "email"
    projection_type = "ALL"
  }

  tags = {
    Name        = var.table_users
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_dynamodb_table" "interviews" {
  name         = var.table_interviews
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  global_secondary_index {
    name            = "userId-createdAt-index"
    hash_key        = "userId"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  tags = {
    Name        = var.table_interviews
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_dynamodb_table" "feedback" {
  name         = var.table_feedback
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "interviewId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  global_secondary_index {
    name            = "interviewId-userId-index"
    hash_key        = "interviewId"
    range_key       = "userId"
    projection_type = "ALL"
  }

  tags = {
    Name        = var.table_feedback
    Project     = var.project_name
    Environment = var.environment
  }
}