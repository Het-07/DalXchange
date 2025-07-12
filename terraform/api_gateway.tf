resource "aws_apigatewayv2_api" "api" {
  name          = var.api_gateway_name
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = [
      "https://${var.project_name}-frontend.${var.aws_region}.amplifyapp.com",
      "https://${var.environment}.${var.project_name}-frontend.${var.aws_region}.amplifyapp.com",
      "https://dev.d1q2g4o92yok08.amplifyapp.com",
      "http://localhost:5173"
    ]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization", "X-Amz-Date", "X-Api-Key", "X-Amz-Security-Token"]
    max_age       = 300
  }
}

resource "aws_apigatewayv2_stage" "api_stage" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = var.api_gateway_stage_name
  auto_deploy = true
  
  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_logs.arn
    format          = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
      error          = "$context.error.message"
    })
  }
}

resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "/aws/apigateway/${var.api_gateway_name}"
  retention_in_days = 30
}

# Add Listing Integration
resource "aws_apigatewayv2_integration" "add_listing_integration" {
  api_id             = aws_apigatewayv2_api.api.id
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.add_listing.invoke_arn
}

resource "aws_apigatewayv2_route" "add_listing_route" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /api/add-listing"
  target    = "integrations/${aws_apigatewayv2_integration.add_listing_integration.id}"

  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito_authorizer.id
}

# Get Listings Integration
resource "aws_apigatewayv2_integration" "get_listings_integration" {
  api_id             = aws_apigatewayv2_api.api.id
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.get_listings.invoke_arn
}

resource "aws_apigatewayv2_route" "get_listings_route" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "GET /api/get-listings"
  target    = "integrations/${aws_apigatewayv2_integration.get_listings_integration.id}"
}

# Delete Listing Integration
resource "aws_apigatewayv2_integration" "delete_listing_integration" {
  api_id             = aws_apigatewayv2_api.api.id
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.delete_listing.invoke_arn
}

resource "aws_apigatewayv2_route" "delete_listing_route" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "DELETE /api/delete-listing/{listing_id}"
  target    = "integrations/${aws_apigatewayv2_integration.delete_listing_integration.id}"

  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito_authorizer.id
}

# Update Listing Integration
resource "aws_apigatewayv2_integration" "update_listing_integration" {
  api_id             = aws_apigatewayv2_api.api.id
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.update_listing.invoke_arn
}

resource "aws_apigatewayv2_route" "update_listing_route" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "PUT /api/update-listing/{listing_id}"
  target    = "integrations/${aws_apigatewayv2_integration.update_listing_integration.id}"

  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito_authorizer.id
}

# Set up API Gateway authorizer for Cognito
resource "aws_apigatewayv2_authorizer" "cognito_authorizer" {
  api_id           = aws_apigatewayv2_api.api.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "cognito-authorizer"

  jwt_configuration {
    audience = [aws_cognito_user_pool_client.client.id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.user_pool.id}"
  }
}

# Grant Lambda permissions to be invoked by API Gateway
resource "aws_lambda_permission" "api_add_listing" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.add_listing.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*/api/add-listing"
}

resource "aws_lambda_permission" "api_get_listings" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_listings.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*/api/get-listings"
}

resource "aws_lambda_permission" "api_delete_listing" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_listing.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*/api/delete-listing/*"
}

resource "aws_lambda_permission" "api_update_listing" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.update_listing.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*/api/update-listing/*"
}
