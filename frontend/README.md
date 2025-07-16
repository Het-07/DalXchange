# DalXchange Frontend

This folder contains the frontend for DalXchange, built with React and TypeScript, and hosted on AWS Amplify.

## Features

- Modern, responsive UI for item listings and user interactions
- Authentication via AWS Cognito
- Image upload and display using AWS S3
- API integration with backend (FastAPI Lambda functions)

## Structure

- `src/`: Main source code
  - `components/`: Reusable UI components
  - `pages/`: Application pages
  - `aws/`: AWS integration helpers
  - `data/`: Data models and utilities
- `public/`: Static assets
- `index.html`, `App.tsx`: Entry points
- `vite.config.ts`: Vite configuration

## Setup & Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run locally:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

## Environment Variables

- `VITE_API_BASE_URL`: Backend API URL
- `VITE_COGNITO_DOMAIN`, `VITE_COGNITO_CLIENT_ID`: Cognito details
- `VITE_S3_BUCKET_NAME`: S3 bucket name
