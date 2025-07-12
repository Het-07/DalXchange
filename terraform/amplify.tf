resource "aws_amplify_app" "frontend" {
  name         = "${var.project_name}-frontend"
  repository   = var.github_repository
  access_token = data.aws_ssm_parameter.github_token.value

  build_spec = <<-EOT
    version: 1
    frontend:
      phases:
        preBuild:
          commands:
            - cd frontend
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: frontend/dist
        files:
          - '**/*'
      cache:
        paths:
          - 'frontend/node_modules/**/*'
  EOT

  # Environment variables for Amplify
  environment_variables = {
    VITE_API_ENDPOINT     = ""
    VITE_COGNITO_DOMAIN   = "https://${aws_cognito_user_pool_domain.domain.domain}.auth.${var.aws_region}.amazoncognito.com"
    VITE_COGNITO_CLIENT_ID = aws_cognito_user_pool_client.client.id
    VITE_COGNITO_REDIRECT_URI = "https://${var.environment}.${var.project_name}-frontend.${var.aws_region}.amplifyapp.com/auth/callback"
    VITE_COGNITO_LOGOUT_URI = "https://${var.environment}.${var.project_name}-frontend.${var.aws_region}.amplifyapp.com"
  }

  # Auto branch configuration for main branch
  auto_branch_creation_config {
    enable_auto_build = true
  }

  # Disable basic auth as no credentials are provided
  enable_basic_auth      = false
  enable_branch_auto_build = true
  enable_branch_auto_deletion = true

  # Custom rules for SPA routing
  custom_rule {
    source = "/<*>"
    status = "404"
    target = "/index.html"
  }
}

# Create a branch for the main branch
resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = var.github_branch
  
  framework = "React"
  stage     = "DEVELOPMENT" # Changed from var.environment to a valid stage value
  
  environment_variables = {
    ENV = var.environment
  }
}

# Update Amplify app environment variables after API Gateway is created
# This breaks the circular dependency
resource "null_resource" "update_amplify_env_vars" {
  depends_on = [
    aws_amplify_app.frontend,
    aws_apigatewayv2_stage.api_stage
  ]

  triggers = {
    api_url = aws_apigatewayv2_stage.api_stage.invoke_url
  }

  provisioner "local-exec" {
    command = <<EOT
      aws amplify update-app --app-id ${aws_amplify_app.frontend.id} \
      --environment-variables VITE_API_ENDPOINT=${aws_apigatewayv2_stage.api_stage.invoke_url}
    EOT
  }
}

# Get GitHub token from SSM Parameter Store
data "aws_ssm_parameter" "github_token" {
  name = "/github/token"  # This should match the name of your SSM parameter
}
