import axios, { AxiosResponse } from 'axios';
import { 
  Profile, 
  Stats, 
  SearchResults, 
  ProjectFilter, 
  SkillsResponse,
  Project,
  WorkExperience
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Test API connectivity on startup
const testApiConnection = async () => {
  try {
    const response = await fetch(`${API_BASE.replace('/api', '')}/api/health`);
    console.log('API Health Check:', response.status);
  } catch (error) {
    console.error('API Health Check Failed:', error);
  }
};

// Run health check
testApiConnection();

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Handle completely empty error objects
    if (!error || Object.keys(error).length === 0) {
      console.error('API Error: Empty error object received');
      return Promise.reject(new Error('Unknown API error occurred'));
    }

    // Handle different types of errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('API Connection Error: Backend server is not running or unreachable');
    } else if (error.code === 'ERR_CANCELED') {
      console.error('API Request Canceled');
    } else if (error.response) {
      // Server responded with error status
      console.error('API Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('API Request Error: No response received', {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.code === 'ECONNABORTED'
      });
    } else {
      // Something else happened
      console.error('API Error:', {
        message: error.message,
        code: error.code,
        url: error.config?.url,
        method: error.config?.method,
        fullError: error
      });
    }
    return Promise.reject(error);
  }
);

// API functions
export const profileApi = {
  // Get all profiles
  getAll: async (): Promise<Profile[]> => {
    const response = await api.get<Profile[]>('/profile');
    return response.data;
  },
  
  // Get single profile (for backward compatibility)
  get: async (): Promise<Profile> => {
    const response = await api.get<Profile[]>('/profile');
    return response.data[0]; // Return the first (most recent) profile
  },

  // Create profile
  create: async (profileData: Partial<Profile>): Promise<{ message: string; profileId: number }> => {
    const response = await api.post<{ message: string; profileId: number }>('/profile', profileData);
    return response.data;
  },

  // Update profile
  update: async (profileData: Partial<Profile>): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>('/profile', profileData);
    return response.data;
  },

  // Delete profile
  delete: async (): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>('/profile');
    return response.data;
  },

  // Add project
  addProject: async (projectData: Omit<Project, 'id' | 'created_at'>): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/profile/projects', projectData);
    return response.data;
  },

  // Delete project
  deleteProject: async (projectId: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/profile/projects/${projectId}`);
    return response.data;
  },

  // Add work experience
  addWorkExperience: async (workData: Omit<WorkExperience, 'id'>): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/profile/work-experience', workData);
    return response.data;
  },

  // Delete work experience
  deleteWorkExperience: async (workId: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/profile/work-experience/${workId}`);
    return response.data;
  },
};

export const searchApi = {
  // General search
  search: async (query: string, type: string = 'all', page: number = 1, limit: number = 20): Promise<SearchResults> => {
    const offset = (page - 1) * limit;
    const response = await api.get<SearchResults>('/search', {
      params: { q: query, type, limit, offset }
    });
    return response.data;
  },

  // Filter projects by skill
  filterProjectsBySkill: async (skill: string, page: number = 1, limit: number = 10): Promise<ProjectFilter> => {
    const offset = (page - 1) * limit;
    const response = await api.get<ProjectFilter>('/projects', {
      params: { skill, limit, offset }
    });
    return response.data;
  },

  // Get top skills
  getTopSkills: async (limit: number = 10): Promise<SkillsResponse> => {
    const response = await api.get<SkillsResponse>('/skills/top', {
      params: { limit }
    });
    return response.data;
  },

  // Get all skills
  getAllSkills: async (): Promise<SkillsResponse> => {
    const response = await api.get<SkillsResponse>('/skills');
    return response.data;
  },
};

export const statsApi = {
  // Get statistics
  get: async (): Promise<Stats> => {
    const response = await api.get<Stats>('/stats');
    return response.data;
  },
};

export const healthApi = {
  // Health check
  check: async (): Promise<{ status: string; timestamp: string; uptime: number; environment: string; version: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
