resource "aws_secretsmanager_secret" "api_keys" {
  name                    = "${var.project_name}/api-keys-v2"
  description             = "API Keys for DalXchange"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "api_keys_version" {
  secret_id     = aws_secretsmanager_secret.api_keys.id
  secret_string = jsonencode({
    cognito_client_id     = aws_cognito_user_pool_client.client.id,
    cognito_user_pool_id  = aws_cognito_user_pool.user_pool.id,
    cognito_domain        = aws_cognito_user_pool_domain.domain.domain,
    # Initialize with empty value, will be updated later
    api_gateway_endpoint  = ""
  })
}

# Update API keys secret after API Gateway is created
resource "null_resource" "update_api_keys_secret" {
  depends_on = [
    aws_secretsmanager_secret_version.api_keys_version,
    aws_apigatewayv2_stage.api_stage
  ]

  triggers = {
    api_url = aws_apigatewayv2_stage.api_stage.invoke_url
  }

  provisioner "local-exec" {
    command = <<EOT
      aws secretsmanager update-secret --secret-id ${aws_secretsmanager_secret.api_keys.id} \
      --secret-string '{
        "cognito_client_id": "${aws_cognito_user_pool_client.client.id}",
        "cognito_user_pool_id": "${aws_cognito_user_pool.user_pool.id}",
        "cognito_domain": "${aws_cognito_user_pool_domain.domain.domain}",
        "api_gateway_endpoint": "${aws_apigatewayv2_stage.api_stage.invoke_url}"
      }'
    EOT
  }
}

resource "aws_secretsmanager_secret_rotation" "api_keys_rotation" {
  secret_id           = aws_secretsmanager_secret.api_keys.id
  rotation_lambda_arn = aws_lambda_function.secrets_rotation.arn
  
  rotation_rules {
    automatically_after_days = var.secret_manager_rotation_days
  }
}

# Lambda function for rotating secrets
resource "aws_lambda_function" "secrets_rotation" {
  function_name    = "${var.project_name}-secrets-rotation"
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  handler          = "lambda.rotate_secrets_handler"
  runtime          = "python3.11"
  role             = aws_iam_role.lambda_role.arn
  timeout          = var.lambda_timeout
  memory_size      = var.lambda_memory_size

  vpc_config {
    subnet_ids         = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]
    security_group_ids = [aws_security_group.lambda_sg.id]
  }

  environment {
    variables = {
      SECRETS_ARN = aws_secretsmanager_secret.api_keys.arn
      ENV = var.environment
    }
  }
}

# Permission for Secrets Manager to invoke the Lambda function
resource "aws_lambda_permission" "allow_secrets_manager" {
  statement_id  = "AllowExecutionFromSecretsManager"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.secrets_rotation.function_name
  principal     = "secretsmanager.amazonaws.com"
}

# IAM policy for Lambda to access Secrets Manager
resource "aws_iam_policy" "lambda_secrets_manager_policy" {
  name        = "${var.project_name}-lambda-secrets-manager-policy"
  description = "Policy for Lambda to access Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret",
          "secretsmanager:PutSecretValue",
          "secretsmanager:UpdateSecretVersionStage",
          "secretsmanager:RotateSecret"
        ]
        Effect   = "Allow"
        Resource = aws_secretsmanager_secret.api_keys.arn
      }
    ]
  })
}
