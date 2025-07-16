# DalXchange Backend

This folder contains the backend for DalXchange, built with Python and FastAPI, and designed to run as AWS Lambda functions.

## Features

- RESTful API for item listings (CRUD operations)
- User authentication via AWS Cognito
- Image storage integration with AWS S3
- Data storage in AWS DynamoDB

## Structure

- `lambda.py`: Main Lambda handler functions
- `app/`: FastAPI application code
  - `models/`: Data models
  - `routes/`: API routes
- `requirements.txt`: Python dependencies

## Setup & Development

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run locally for development:
   ```bash
   uvicorn app.main:app --reload
   ```
3. For AWS Lambda deployment, dependencies are packaged automatically via Terraform.

## API Endpoints

- `/listings` — CRUD for item listings
- `/auth` — User authentication endpoints

## Environment Variables

- `TABLE_NAME`: DynamoDB table name
- `BUCKET_NAME`: S3 bucket name
- `USER_POOL_ID`, `CLIENT_ID`: Cognito details
