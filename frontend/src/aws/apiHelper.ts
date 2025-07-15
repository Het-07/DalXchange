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
 * Helper function for making authenticated API requests
 */
export const makeAuthenticatedRequest = async <T = unknown>(
  endpoint: string,
  method: string = 'GET',
  body: Record<string, unknown> | null = null
): Promise<T> => {
  // Build headers with authentication
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeader()
  };
  
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
    
    // If unauthorized, try to refresh token
    if (response.status === 401) {
      const refreshed = await refreshToken();
      
      if (refreshed) {
        // Update auth header with new token
        Object.assign(headers, getAuthHeader());
        options.headers = headers;
        
        // Retry request with new token
        response = await fetch(`${API_URL}${endpoint}`, options);
      } else {
        // If refresh failed, redirect to login
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
 * Note: API Gateway routes include the /api prefix which needs to be included in our endpoints
 * to match the routes defined in API Gateway
 */
export const listingsApi = {
  getListings: () => makeAuthenticatedRequest<ApiResponse<Listing>>('/api/get-listings'),
  addListing: (data: ListingInput) => makeAuthenticatedRequest<ApiResponse<Listing>>('/api/add-listing', 'POST', data),
  updateListing: (id: string, data: ListingInput) => makeAuthenticatedRequest<ApiResponse<Listing>>(`/api/update-listing/${id}`, 'PUT', data),
  deleteListing: (id: string) => makeAuthenticatedRequest<ApiResponse<unknown>>(`/api/delete-listing/${id}`, 'DELETE')
};
