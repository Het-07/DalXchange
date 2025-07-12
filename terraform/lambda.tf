resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Attach policies to Lambda role
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_vpc_access" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_dynamodb_access" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_dynamodb_policy.arn
}

resource "aws_iam_role_policy_attachment" "lambda_s3_access" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_s3_policy.arn
}

resource "aws_iam_role_policy_attachment" "lambda_cognito_access" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_cognito_policy.arn
}

resource "aws_iam_role_policy_attachment" "lambda_secrets_manager_access" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_secrets_manager_policy.arn
}

# Use the security group defined in main.tf instead of creating a duplicate one
# This comment is kept as a reminder of the consolidation

# Install Python dependencies before packaging
resource "null_resource" "install_dependencies" {
  triggers = {
    requirements = filemd5("../backend/requirements.txt")
    lambda_code = filemd5("../backend/lambda.py")
  }

  provisioner "local-exec" {
    command = <<EOF
      rm -rf ${path.module}/lambda_dependencies
      mkdir -p ${path.module}/lambda_dependencies
      pip install -r ../backend/requirements.txt -t ${path.module}/lambda_dependencies
      cp ../backend/lambda.py ${path.module}/lambda_dependencies/
      cp -r ../backend/app ${path.module}/lambda_dependencies/
    EOF
  }
}

# Create a zip file for Lambda deployment
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/lambda_dependencies"
  output_path = "${path.module}/lambda_package.zip"

  excludes = [
    "__pycache__",
    "*.pyc",
    "*.pyo",
    "*.dist-info"
  ]
  
  depends_on = [
    null_resource.install_dependencies
  ]
}

# Lambda function for Add Listing
resource "aws_lambda_function" "add_listing" {
  function_name    = "${var.project_name}-add-listing"
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  handler          = "lambda.add_listing_handler"
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
      TABLE_NAME = aws_dynamodb_table.listings_table.name
      BUCKET_NAME = aws_s3_bucket.images_bucket.bucket
      ENV = var.environment
      USER_POOL_ID = aws_cognito_user_pool.user_pool.id
      CLIENT_ID = aws_cognito_user_pool_client.client.id
    }
  }
}

# Lambda function for Get Listings
resource "aws_lambda_function" "get_listings" {
  function_name    = "${var.project_name}-get-listings"
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  handler          = "lambda.get_listings_handler"
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
      TABLE_NAME = aws_dynamodb_table.listings_table.name
      BUCKET_NAME = aws_s3_bucket.images_bucket.bucket
      ENV = var.environment
      USER_POOL_ID = aws_cognito_user_pool.user_pool.id
      CLIENT_ID = aws_cognito_user_pool_client.client.id
    }
  }
}

# Lambda function for Delete Listing
resource "aws_lambda_function" "delete_listing" {
  function_name    = "${var.project_name}-delete-listing"
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  handler          = "lambda.delete_listing_handler"
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
      TABLE_NAME = aws_dynamodb_table.listings_table.name
      BUCKET_NAME = aws_s3_bucket.images_bucket.bucket
      ENV = var.environment
      USER_POOL_ID = aws_cognito_user_pool.user_pool.id
      CLIENT_ID = aws_cognito_user_pool_client.client.id
    }
  }
}

# Lambda function for Update Listing
resource "aws_lambda_function" "update_listing" {
  function_name    = "${var.project_name}-update-listing"
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  handler          = "lambda.update_listing_handler"
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
      TABLE_NAME = aws_dynamodb_table.listings_table.name
      BUCKET_NAME = aws_s3_bucket.images_bucket.bucket
      ENV = var.environment
      USER_POOL_ID = aws_cognito_user_pool.user_pool.id
      CLIENT_ID = aws_cognito_user_pool_client.client.id
    }
  }
}
