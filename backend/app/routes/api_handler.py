from fastapi import APIRouter, Request, Response, HTTPException, status
from pydantic import ValidationError
import json
import os
from app.models.lambda_functions import (
    add_listing_logic,
    get_listings_logic,
    delete_listing_logic,
    update_listing_logic,
    ListingIn,
    ListingUpdate
)

router = APIRouter()

# Helper function to handle common logic and error responses
async def _handle_api_call(logic_function, request_body=None, path_param=None):
    try:
        # Debug logging
        print(f"Calling function: {logic_function.__name__}")
        if request_body:
            print(f"With request body: {json.dumps({**request_body, 'image_base64': '...[truncated]...' if 'image_base64' in request_body else None})}")
            result = logic_function(request_body)
        elif path_param:
            print(f"With path param: {path_param}")
            result = logic_function(path_param)
        else:
            result = logic_function()
        return result
    except ValidationError as ve:
        print(f"Validation Error: {ve}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=json.loads(ve.json()) 
        )
    except ValueError as ve:
        print(f"Value Error: {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Bad Request", "message": str(ve)}
        )
    except boto3.exceptions.Boto3Error as be:
        print(f"AWS Boto3 Error: {be}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "AWS Service Error", "message": str(be)}
        )
    except Exception as e:
        import traceback
        print(f"Internal Server Error: {e}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "Internal Server Error", "message": str(e)}
        )

@router.post("/api/add-listing")
async def add_listing(listing_data: ListingIn): 
    return await _handle_api_call(add_listing_logic, request_body=listing_data.dict())

@router.get("/api/get-listings")
async def get_listings():
    return await _handle_api_call(get_listings_logic)

@router.delete("/api/delete-listing/{listing_id}")
async def delete_listing(listing_id: str):
    return await _handle_api_call(delete_listing_logic, path_param=listing_id)

@router.put("/api/update-listing/{listing_id}")
async def update_listing(listing_id: str, update_data: ListingUpdate):
    return await _handle_api_call(update_listing_logic, request_body=update_data.dict(exclude_unset=True), path_param=listing_id)

