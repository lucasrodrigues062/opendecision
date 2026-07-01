import type { StrategyPayload, StrategyResponse, ExecutionResult, ApiError } from '../types';

// In the embedded build the frontend and API share the same origin.
// During local development the Vite dev server needs to proxy to the backend.
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8080' : '');

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`);
    if (!response.ok) {
      const error = await response.json() as ApiError;
      throw new Error(error.error || 'API request failed');
    }
    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json() as ApiError;
      throw new Error(error.error || 'API request failed');
    }
    return response.json();
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json() as ApiError;
      throw new Error(error.error || 'API request failed');
    }
    return response.json();
  }

  async delete(endpoint: string): Promise<void> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json() as ApiError;
      throw new Error(error.error || 'API request failed');
    }
  }
}

const client = new ApiClient(API_BASE);

export const api = {
  // Get health check
  async health() {
    return client.get('/health');
  },

  // List all strategies
  async listStrategies(): Promise<StrategyResponse[]> {
    return client.get('/pipelines');
  },

  // Get a specific strategy
  async getStrategy(id: string): Promise<StrategyResponse> {
    return client.get(`/pipelines/${id}`);
  },

  // Publish (create) a new strategy
  async publishStrategy(payload: StrategyPayload): Promise<StrategyResponse> {
    return client.post('/pipelines', payload);
  },

  // Update a strategy
  async updateStrategy(id: string, payload: StrategyPayload): Promise<StrategyResponse> {
    return client.put(`/pipelines/${id}`, payload);
  },

  // Delete a strategy
  async deleteStrategy(id: string): Promise<void> {
    return client.delete(`/pipelines/${id}`);
  },

  // Execute a strategy (ad-hoc or saved)
  async executeStrategy(steps: any[], data: any[]): Promise<ExecutionResult> {
    return client.post('/execute', { steps, data });
  },

  // Execute a saved strategy with data
  async executeSavedStrategy(id: string, data: any[]): Promise<ExecutionResult> {
    return client.post(`/pipelines/${id}/execute`, { data });
  },
};
