import os
import json
import base64
from pydantic import BaseModel
from typing import Optional

# Pydantic Models (moved from listing_model.py)
class ListingIn(BaseModel):
    title: str
    description: str
    category: str
    price: float
    posted_by: Optional[str] = ""  # Modified to be optional with empty string default
    image_base64: str

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    posted_by: Optional[str] = None
    image_url: Optional[str] = None

# Environment variables (will be passed from Lambda configuration)
TABLE_NAME = os.environ.get("TABLE_NAME", "ListingsTable")
BUCKET_NAME = os.environ.get("BUCKET_NAME", "dalxchange-images-a1e1914a")
SES_SENDER_EMAIL = os.environ.get("SES_SENDER_EMAIL", "dalxchange01@gmail.com")

# --- Local in-memory storage for listings (for local dev only) ---
LISTINGS = []

def add_listing_logic(body: dict):
    """Logic for adding a new listing (local only)."""
    from uuid import uuid4
    listing_data = ListingIn(**body)
    listing_id = str(uuid4())
    
    # Use empty string if posted_by is None or empty
    posted_by = listing_data.posted_by or ""
    
    item = {
        "listing_id": listing_id,
        "title": listing_data.title,
        "description": listing_data.description,
        "category": listing_data.category,
        "price": str(listing_data.price),
        "posted_by": posted_by,
        "image_url": f"data:image/jpeg;base64,{listing_data.image_base64}",  # Store the full base64 image
    }
    LISTINGS.append(item)
    return {"message": "Listing created successfully!", "listing_id": listing_id, "image_url": item["image_url"]}

def get_listings_logic():
    """Logic for retrieving all listings (local only)."""
    return LISTINGS

def delete_listing_logic(listing_id: str):
    """Logic for deleting a listing (local only)."""
    global LISTINGS
    LISTINGS = [l for l in LISTINGS if l["listing_id"] != listing_id]
    return {"message": "Listing deleted successfully."}

def update_listing_logic(listing_id: str, body: dict):
    """Logic for updating an existing listing (local only)."""
    for l in LISTINGS:
        if l["listing_id"] == listing_id:
            for k, v in body.items():
                if v is not None:
                    if k == "price":
                        v = str(v)
                    if k == "image_url" and v.startswith("data:image"):
                        l[k] = v
                    else:
                        l[k] = v
            return {"message": "Listing updated successfully.", "updated_attributes": body}
    return {"message": "Listing not found."}
