resource "aws_cognito_user_pool" "user_pool" {
  name = var.cognito_user_pool_name

  username_attributes      = ["email"]
  mfa_configuration        = "OFF"
  
  # Handle email verification through email_configuration
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }
  
  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Your verification code for DalXchange"
    email_message        = "Your verification code is {####}"
  }

  schema {
    attribute_data_type      = "String"
    name                     = "email"
    required                 = true
    mutable                  = true
  }

  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  tags = {
    Name = "${var.project_name}-user-pool"
  }
}

resource "aws_cognito_user_pool_client" "client" {
  name                                 = "${var.project_name}-client"
  user_pool_id                         = aws_cognito_user_pool.user_pool.id
  
  # Using the default Cognito hosted UI as requested
  generate_secret                      = false
  callback_urls                        = [var.cognito_callback_url]
  logout_urls                          = [var.cognito_logout_url]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["phone", "email", "openid", "profile", "aws.cognito.signin.user.admin"]
  supported_identity_providers         = ["COGNITO"]

  # Prevent client from accessing token endpoint without authorization code
  prevent_user_existence_errors        = "ENABLED"
}

resource "aws_cognito_user_pool_domain" "domain" {
  domain       = "${var.project_name}-${var.environment}"
  user_pool_id = aws_cognito_user_pool.user_pool.id
}

# IAM policy for Lambda to verify Cognito tokens
resource "aws_iam_policy" "lambda_cognito_policy" {
  name        = "${var.project_name}-lambda-cognito-policy"
  description = "Policy for Lambda to verify Cognito tokens"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "cognito-idp:GetUser",
          "cognito-idp:AdminGetUser"
        ]
        Effect   = "Allow"
        Resource = aws_cognito_user_pool.user_pool.arn
      }
    ]
  })
}
