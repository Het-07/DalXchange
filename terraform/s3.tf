resource "aws_s3_bucket" "images_bucket" {
  bucket        = "${var.s3_bucket_name}-${random_id.s3_suffix.hex}"
  force_destroy = var.environment != "prod"

  tags = {
    Name = "${var.project_name}-images-bucket"
  }
}

resource "aws_s3_bucket_public_access_block" "images_bucket_block_public" {
  bucket = aws_s3_bucket.images_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "images_bucket_cors" {
  bucket = aws_s3_bucket.images_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = [
      "https://${var.project_name}-frontend.${var.aws_region}.amplifyapp.com",
      "https://${var.environment}.${var.project_name}-frontend.${var.aws_region}.amplifyapp.com",
      "http://localhost:5173"
    ]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "images_bucket_lifecycle" {
  bucket = aws_s3_bucket.images_bucket.id

  rule {
    id     = "cleanup-old-images"
    status = "Enabled"
    
    # Add filter with an empty prefix (applies to all objects)
    filter {
      prefix = ""
    }

    # Only apply to old versions
    noncurrent_version_expiration {
      noncurrent_days = 90
    }

    # Move unused images to cheaper storage after 30 days
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    # Move unused images to glacier after 90 days
    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    # Expire unused files after 365 days
    expiration {
      days = 365
    }
  }
}

# IAM policy for Lambda to access S3
resource "aws_iam_policy" "lambda_s3_policy" {
  name        = "${var.project_name}-lambda-s3-policy"
  description = "Policy for Lambda to access S3"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Effect   = "Allow"
        Resource = [
          aws_s3_bucket.images_bucket.arn,
          "${aws_s3_bucket.images_bucket.arn}/*"
        ]
      }
    ]
  })
}
