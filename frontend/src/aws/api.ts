// AWS API utilities for DalXchange
import { getAuthHeader, refreshToken } from './auth';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

// API request helper with authentication and refresh token support
export const apiRequest = async <T = Record<string, unknown>>(
  endpoint: string,
  method: string = 'GET',
  body: Record<string, unknown> | null = null,
  requiresAuth: boolean = true
): Promise<T> => {
  const url = `${API_ENDPOINT}${endpoint}`;
  
  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Add auth header if required
  if (requiresAuth) {
    Object.assign(headers, getAuthHeader());
  }
  
  // Build request options
  const options: RequestInit = {
    method,
    headers,
  };
  
  // Add body for non-GET requests
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }
  
  try {
    // Make the API request
    let response = await fetch(url, options);
    
    // If unauthorized and we have a refresh token, try to refresh
    if (response.status === 401 && requiresAuth) {
      const refreshed = await refreshToken();
      if (refreshed) {
        // Update auth header with new token
        Object.assign(headers, getAuthHeader());
        options.headers = headers;
        
        // Retry request with new token
        response = await fetch(url, options);
      }
    }
    
    const data = await response.json() as T;
    
    if (!response.ok) {
      throw {
        status: response.status,
        message: (data as Record<string, unknown>).error as string || 'An error occurred',
        details: data
      };
    }
    
    return data;
  } catch (error) {
    console.error(`API request error (${url}):`, error);
    throw error;
  }
};

// API endpoints
export const Listings = {
  getAll: async (category?: string) => {
    const endpoint = category ? 
      `/api/get-listings?category=${encodeURIComponent(category)}` : 
      '/api/get-listings';
    return apiRequest(endpoint, 'GET', null, false);
  },
  
  getByUser: async (user: string) => {
    return apiRequest(`/api/get-listings?user=${encodeURIComponent(user)}`, 'GET', null, true);
  },
  
  add: async (listing: {
    title: string;
    description: string;
    category: string;
    price: number;
    image_base64: string;
  }) => {
    return apiRequest('/api/add-listing', 'POST', listing, true);
  },
  
  update: async (
    listing_id: string,
    updates: {
      title?: string;
      description?: string;
      category?: string;
      price?: number;
      image_base64?: string;
    }
  ) => {
    return apiRequest(`/api/update-listing/${listing_id}`, 'PUT', updates, true);
  },
  
  delete: async (listing_id: string) => {
    return apiRequest(`/api/delete-listing/${listing_id}`, 'DELETE', null, true);
  }
};
