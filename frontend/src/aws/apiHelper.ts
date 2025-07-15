// filepath: /Users/apple/Documents/Portfolio/DalXchange/frontend/src/aws/apiHelper.ts
import { getAuthHeader, refreshToken, login } from './auth';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Define interfaces for API data structures
export interface Listing {
  listing_id: string;
  title: string;
  description: string;
  category: string;
  price: number | string;
  posted_by: string;
  image_url: string;
}

export interface ListingInput extends Record<string, unknown> {
  title: string;
  description: string;
  category: string;
  price: number;
  posted_by: string;
  image_url?: string;
  image_base64?: string;
}

export interface ApiResponse<T> {
  statusCode?: number;
  body?: string;
  Items?: T[];
  Item?: T;
  message?: string;
  [key: string]: unknown;
}

/**
 * Helper function for making API requests with optional authentication
 */
export const makeAuthenticatedRequest = async <T = unknown>(
  endpoint: string,
  method: string = 'GET',
  body: Record<string, unknown> | null = null,
  requireAuth: boolean = false
): Promise<T> => {
  // Build headers with authentication if available
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Add auth headers if token exists
  const authHeaders = getAuthHeader();
  if (Object.keys(authHeaders).length > 0) {
    Object.assign(headers, authHeaders);
  }
  
  // Build request options
  const options: RequestInit = {
    method,
    headers,
    cache: 'no-store' // Prevent caching
  };
  
  // Add body for non-GET requests
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    // Make the API request
    let response = await fetch(`${API_URL}${endpoint}`, options);
    
    // If unauthorized and auth is required, try to refresh token
    if (response.status === 401 && requireAuth) {
      const refreshed = await refreshToken();
      
      if (refreshed) {
        // Update auth header with new token
        Object.assign(headers, getAuthHeader());
        options.headers = headers;
        
        // Retry request with new token
        response = await fetch(`${API_URL}${endpoint}`, options);
      } else if (requireAuth) {
        // If refresh failed and auth is required, redirect to login
        login();
        throw new Error('Authentication required. Redirecting to login...');
      }
    }
    
    // Handle other error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as Record<string, unknown>));
      const errorMessage = typeof errorData.detail === 'string' 
        ? errorData.detail 
        : `HTTP error! Status: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    // Parse and return JSON response
    return await response.json() as T;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

/**
 * Helper functions for common API operations
 * 
 * API structure:
 * Base URL: https://bcsj2oef85.execute-api.us-east-1.amazonaws.com
 * API Stage: /api
 * Endpoints: /get-listings, /add-listing, etc.
 * 
 * Full URL example: https://bcsj2oef85.execute-api.us-east-1.amazonaws.com/api/get-listings
 */
export const listingsApi = {
  // Public endpoints - no auth required
  getListings: () => makeAuthenticatedRequest<ApiResponse<Listing>>('/api/get-listings'),
  addListing: (data: ListingInput) => makeAuthenticatedRequest<ApiResponse<Listing>>('/api/add-listing', 'POST', data),
  
  // Protected endpoints - auth required
  updateListing: (id: string, data: ListingInput) => makeAuthenticatedRequest<ApiResponse<Listing>>(`/api/update-listing/${id}`, 'PUT', data, true),
  deleteListing: (id: string) => makeAuthenticatedRequest<ApiResponse<unknown>>(`/api/delete-listing/${id}`, 'DELETE', null, true)
};
