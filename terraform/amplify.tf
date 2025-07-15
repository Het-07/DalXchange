resource "aws_amplify_app" "frontend" {
  name         = "${var.project_name}-frontend"
  repository   = var.github_repository
  # Using a placeholder token - update with your actual GitHub token value when running
  access_token = var.github_token

  build_spec = <<-EOT
    version: 1
    frontend:
      phases:
        preBuild:
          commands:
            - cd frontend
            - npm ci
            - npm install terser --save-dev
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
    VITE_API_BASE_URL     = ""
    VITE_COGNITO_DOMAIN   = "${aws_cognito_user_pool_domain.domain.domain}.auth.${var.aws_region}.amazoncognito.com"
    VITE_COGNITO_CLIENT_ID = aws_cognito_user_pool_client.client.id
    VITE_COGNITO_REDIRECT_URI = var.cognito_callback_url
    VITE_COGNITO_LOGOUT_URI = var.cognito_logout_url
    VITE_S3_BUCKET_NAME = aws_s3_bucket.images_bucket.id
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
  stage     = "DEVELOPMENT" 
  
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
      --environment-variables VITE_API_BASE_URL=${aws_apigatewayv2_stage.api_stage.invoke_url}
    EOT
  }
}
