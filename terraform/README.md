# DalXchange AWS Infrastructure Deployment

This directory contains the Terraform configuration files to deploy the DalXchange application to AWS.

## AWS Services Used

- AWS Lambda - Backend (serverless)
- AWS Amplify - Frontend (provision when commit)
- AWS Cognito - Authentication flow
- S3 Bucket - Image storage
- DynamoDB - Database
- Secrets Manager - Secure storage for API keys
- API Gateway - API endpoint management
- VPC - Network isolation

## Prerequisites

1. [Terraform](https://www.terraform.io/downloads.html) (v1.0.0 or higher)
2. [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate credentials
3. [Python](https://www.python.org/downloads/) (3.9 or higher)
4. [GitHub personal access token](https://github.com/settings/tokens) with `repo` access

## Deployment Steps

1. Update the GitHub token in Secrets Manager:

   ```bash
   aws secretsmanager create-secret \
     --name dalxchange/github-token \
     --secret-string "your-github-token-here"
   ```

2. Update the `terraform.tfvars` file with your specific configuration:

   - Update the `github_repository` URL
   - Update the `aws_region` if needed
   - Update other variables as required

3. Initialize Terraform:

   ```bash
   cd terraform
   terraform init
   ```

4. Plan the deployment:

   ```bash
   terraform plan
   ```

5. Apply the configuration:

   ```bash
   terraform apply
   ```

6. After deployment, note the outputs for:
   - API Gateway URL
   - Cognito domain
   - Frontend URL

## Post-Deployment Configuration

1. Update your frontend environment variables if needed:

   - Log in to the AWS Amplify Console
   - Navigate to your app > Environment variables
   - Verify that all variables match the outputs from Terraform

2. Test the authentication flow:
   - Navigate to your frontend URL
   - Attempt to sign in using Cognito

## Clean Up

To destroy all resources:

```bash
terraform destroy
```

## Troubleshooting

- If the Lambda functions fail to deploy, check the CloudWatch logs
- If Amplify build fails, check the build logs in the Amplify Console
- For authentication issues, verify the Cognito configuration in the AWS Console
