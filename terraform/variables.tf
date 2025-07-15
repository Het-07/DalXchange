variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "dalxchange"
}

variable "vpc_cidr_block" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_1_cidr" {
  description = "CIDR block for the first public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "public_subnet_2_cidr" {
  description = "CIDR block for the second public subnet"
  type        = string
  default     = "10.0.2.0/24"
}

variable "cognito_user_pool_name" {
  description = "Name of the Cognito user pool"
  type        = string
  default     = "dalxchange-users"
}

variable "cognito_callback_url" {
  description = "Callback URL for Cognito authentication"
  type        = string
  default     = "https://dev.d1q2g4o92yok08.amplifyapp.com/auth/callback"
}

variable "cognito_logout_url" {
  description = "Logout URL for Cognito authentication"
  type        = string
  default     = "https://dev.d1q2g4o92yok08.amplifyapp.com"
}

variable "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  type        = string
  default     = "dalxchange-listings"
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
  default     = "dalxchange-images"
}

variable "lambda_timeout" {
  description = "Timeout for Lambda functions (seconds)"
  type        = number
  default     = 30
}

variable "lambda_memory_size" {
  description = "Memory size for Lambda functions (MB)"
  type        = number
  default     = 128
}

variable "github_repository" {
  description = "GitHub repository URL"
  type        = string
  default     = "https://github.com/yourusername/dalxchange"
}

variable "github_branch" {
  description = "GitHub branch to deploy from"
  type        = string
  default     = "main"
}

variable "github_token" {
  description = "GitHub personal access token for Amplify"
  type        = string
  sensitive   = true
  # Don't set a default for sensitive values
}

variable "api_gateway_name" {
  description = "Name of the API Gateway"
  type        = string
  default     = "dalxchange-api"
}

variable "api_gateway_stage_name" {
  description = "Name of the API Gateway stage"
  type        = string
  default     = "api"
}
