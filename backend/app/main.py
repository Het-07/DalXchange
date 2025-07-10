from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.api_handler import router as api_router
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="DalXchange Local Backend API",
    description="Local FastAPI server for DalXchange listings.",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    # Add production URL when deployed
    "https://dalxchange.example.com",
    # Allow development environment with different ports
    "*localhost*",
    "*127.0.0.1*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the API router
app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "DalXchange Backend is running locally!"}

