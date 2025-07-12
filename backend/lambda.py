"""
AWS Lambda handler for DalXchange API endpoints
This file serves as the entry point for AWS Lambda functions
"""
import json
import boto3
import base64
import os
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional

# Initialize AWS services
dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')
cognito = boto3.client('cognito-idp')

# Get environment variables
TABLE_NAME = os.environ.get('TABLE_NAME')
BUCKET_NAME = os.environ.get('BUCKET_NAME')
USER_POOL_ID = os.environ.get('USER_POOL_ID')
CLIENT_ID = os.environ.get('CLIENT_ID')

# Initialize DynamoDB table
table = dynamodb.Table(TABLE_NAME)

def add_listing_handler(event, context):
    """
    Lambda handler for adding a new listing.
    
    Args:
        event: API Gateway event
        context: Lambda context
    
    Returns:
        API Gateway response object
    """
    try:
        # Extract the request body
        body = json.loads(event['body'])
        
        # Extract token from Authorization header
        auth_header = event['headers'].get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return response(401, {"error": "Unauthorized. Missing or invalid token."})
            
        token = auth_header.replace('Bearer ', '')
        
        # Get user info from token
        try:
            user_info = cognito.get_user(AccessToken=token)
            user_email = next((attr['Value'] for attr in user_info['UserAttributes'] if attr['Name'] == 'email'), None)
            
            if not user_email:
                return response(401, {"error": "Unable to identify user from token."})
        except Exception as e:
            print(f"Error validating token: {str(e)}")
            return response(401, {"error": "Invalid token."})
        
        # Validate required fields
        required_fields = ['title', 'description', 'category', 'price', 'image_base64']
        for field in required_fields:
            if field not in body:
                return response(400, {"error": f"Missing required field: {field}"})
        
        # Generate a unique listing ID
        listing_id = str(uuid.uuid4())
        
        # Upload image to S3
        image_data = base64.b64decode(body['image_base64'])
        image_key = f"listings/{listing_id}-{datetime.now().strftime('%Y%m%d%H%M%S')}.jpg"
        
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=image_key,
            Body=image_data,
            ContentType='image/jpeg',
            ACL='private'
        )
        
        # Generate a pre-signed URL for the image (valid for 1 hour)
        image_url = s3.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': BUCKET_NAME,
                'Key': image_key
            },
            ExpiresIn=3600
        )
        
        # Create DynamoDB item
        timestamp = datetime.now().isoformat()
        item = {
            "listing_id": listing_id,
            "title": body['title'],
            "description": body['description'],
            "category": body['category'],
            "price": str(body['price']),  # Store as string to avoid precision issues
            "posted_by": user_email,
            "image_key": image_key,  # Store S3 key instead of base64 data
            "created_at": timestamp,
            "updated_at": timestamp
        }
        
        # Save to DynamoDB
        table.put_item(Item=item)
        
        # Return success response with listing ID and presigned URL
        return response(201, {
            "message": "Listing created successfully!",
            "listing_id": listing_id,
            "image_url": image_url
        })
        
    except Exception as e:
        print(f"Error in add_listing_handler: {str(e)}")
        return response(500, {"error": f"Internal server error: {str(e)}"})


def get_listings_handler(event, context):
    """
    Lambda handler for retrieving all listings.
    
    Args:
        event: API Gateway event
        context: Lambda context
    
    Returns:
        API Gateway response object with listings
    """
    try:
        # Query parameters for filtering
        query_params = event.get('queryStringParameters', {}) or {}
        category_filter = query_params.get('category')
        user_filter = query_params.get('user')
        
        scan_params = {}
        
        # If category filter is provided
        if category_filter:
            scan_params = {
                'IndexName': 'CategoryIndex',
                'KeyConditionExpression': '#cat = :category_val',
                'ExpressionAttributeNames': {
                    '#cat': 'category'
                },
                'ExpressionAttributeValues': {
                    ':category_val': category_filter
                }
            }
            result = table.query(**scan_params)
        # If user filter is provided
        elif user_filter:
            scan_params = {
                'IndexName': 'UserIndex',
                'KeyConditionExpression': '#user = :user_val',
                'ExpressionAttributeNames': {
                    '#user': 'posted_by'
                },
                'ExpressionAttributeValues': {
                    ':user_val': user_filter
                }
            }
            result = table.query(**scan_params)
        # No filters, get all listings
        else:
            result = table.scan()
        
        items = result.get('Items', [])
        
        # Generate presigned URLs for all images
        for item in items:
            if 'image_key' in item:
                item['image_url'] = s3.generate_presigned_url(
                    'get_object',
                    Params={
                        'Bucket': BUCKET_NAME,
                        'Key': item['image_key']
                    },
                    ExpiresIn=3600
                )
        
        return response(200, items)
        
    except Exception as e:
        print(f"Error in get_listings_handler: {str(e)}")
        return response(500, {"error": f"Internal server error: {str(e)}"})


def delete_listing_handler(event, context):
    """
    Lambda handler for deleting a listing.
    
    Args:
        event: API Gateway event
        context: Lambda context
    
    Returns:
        API Gateway response object
    """
    try:
        # Get listing ID from path parameter
        listing_id = event['pathParameters']['listing_id']
        
        # Extract token from Authorization header
        auth_header = event['headers'].get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return response(401, {"error": "Unauthorized. Missing or invalid token."})
            
        token = auth_header.replace('Bearer ', '')
        
        # Get user info from token
        try:
            user_info = cognito.get_user(AccessToken=token)
            user_email = next((attr['Value'] for attr in user_info['UserAttributes'] if attr['Name'] == 'email'), None)
            
            if not user_email:
                return response(401, {"error": "Unable to identify user from token."})
        except Exception as e:
            print(f"Error validating token: {str(e)}")
            return response(401, {"error": "Invalid token."})
        
        # First get the listing to check permissions and get the image key
        get_response = table.get_item(
            Key={
                'listing_id': listing_id
            }
        )
        
        if 'Item' not in get_response:
            return response(404, {"error": "Listing not found."})
            
        listing = get_response['Item']
        
        # Check if the user owns the listing
        if listing.get('posted_by') != user_email:
            return response(403, {"error": "You don't have permission to delete this listing."})
            
        # Delete image from S3 if it exists
        if 'image_key' in listing:
            try:
                s3.delete_object(
                    Bucket=BUCKET_NAME,
                    Key=listing['image_key']
                )
            except Exception as e:
                print(f"Warning: Failed to delete S3 object: {str(e)}")
        
        # Delete from DynamoDB
        table.delete_item(
            Key={
                'listing_id': listing_id
            }
        )
        
        return response(200, {"message": "Listing deleted successfully."})
        
    except Exception as e:
        print(f"Error in delete_listing_handler: {str(e)}")
        return response(500, {"error": f"Internal server error: {str(e)}"})


def update_listing_handler(event, context):
    """
    Lambda handler for updating a listing.
    
    Args:
        event: API Gateway event
        context: Lambda context
    
    Returns:
        API Gateway response object
    """
    try:
        # Get listing ID from path parameter
        listing_id = event['pathParameters']['listing_id']
        
        # Extract the request body
        body = json.loads(event['body'])
        
        # Extract token from Authorization header
        auth_header = event['headers'].get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return response(401, {"error": "Unauthorized. Missing or invalid token."})
            
        token = auth_header.replace('Bearer ', '')
        
        # Get user info from token
        try:
            user_info = cognito.get_user(AccessToken=token)
            user_email = next((attr['Value'] for attr in user_info['UserAttributes'] if attr['Name'] == 'email'), None)
            
            if not user_email:
                return response(401, {"error": "Unable to identify user from token."})
        except Exception as e:
            print(f"Error validating token: {str(e)}")
            return response(401, {"error": "Invalid token."})
        
        # Get the listing to check permissions
        get_response = table.get_item(
            Key={
                'listing_id': listing_id
            }
        )
        
        if 'Item' not in get_response:
            return response(404, {"error": "Listing not found."})
            
        listing = get_response['Item']
        
        # Check if the user owns the listing
        if listing.get('posted_by') != user_email:
            return response(403, {"error": "You don't have permission to update this listing."})
            
        # Prepare update expressions
        update_expression_parts = ["SET #updated_at = :updated_at"]
        expression_attr_names = {'#updated_at': 'updated_at'}
        expression_attr_values = {':updated_at': datetime.now().isoformat()}
        
        # Handle image separately if provided
        image_url = None
        if 'image_base64' in body and body['image_base64']:
            # Upload new image
            image_data = base64.b64decode(body['image_base64'])
            image_key = f"listings/{listing_id}-{datetime.now().strftime('%Y%m%d%H%M%S')}.jpg"
            
            s3.put_object(
                Bucket=BUCKET_NAME,
                Key=image_key,
                Body=image_data,
                ContentType='image/jpeg',
                ACL='private'
            )
            
            # Delete old image if exists
            if 'image_key' in listing:
                try:
                    s3.delete_object(
                        Bucket=BUCKET_NAME,
                        Key=listing['image_key']
                    )
                except Exception as e:
                    print(f"Warning: Failed to delete old S3 object: {str(e)}")
            
            # Generate a pre-signed URL for the image
            image_url = s3.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': BUCKET_NAME,
                    'Key': image_key
                },
                ExpiresIn=3600
            )
            
            # Add to update expression
            update_expression_parts.append("#image_key = :image_key")
            expression_attr_names['#image_key'] = 'image_key'
            expression_attr_values[':image_key'] = image_key
        
        # Add other fields to update expression
        fields = ['title', 'description', 'category', 'price']
        for field in fields:
            if field in body and body[field] is not None:
                update_expression_parts.append(f"#{field} = :{field}")
                expression_attr_names[f"#{field}"] = field
                
                # Convert price to string if it's provided
                if field == 'price':
                    expression_attr_values[f":{field}"] = str(body[field])
                else:
                    expression_attr_values[f":{field}"] = body[field]
        
        # Execute update
        update_expression = " ".join(update_expression_parts)
        table.update_item(
            Key={
                'listing_id': listing_id
            },
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attr_names,
            ExpressionAttributeValues=expression_attr_values,
            ReturnValues="UPDATED_NEW"
        )
        
        # Return success response
        result = {"message": "Listing updated successfully."}
        if image_url:
            result["image_url"] = image_url
            
        return response(200, result)
        
    except Exception as e:
        print(f"Error in update_listing_handler: {str(e)}")
        return response(500, {"error": f"Internal server error: {str(e)}"})


def response(status_code: int, body: Any) -> Dict[str, Any]:
    """
    Helper function to create a standardized API Gateway response.
    
    Args:
        status_code: HTTP status code
        body: Response body (will be converted to JSON)
    
    Returns:
        API Gateway response object
    """
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE"
        },
        "body": json.dumps(body)
    }
