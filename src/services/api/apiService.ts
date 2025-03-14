import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

class ApiService {
  private static instance: ApiService;
  private isBackendAvailable: boolean = false;
  private hasCheckedBackend: boolean = false;
  private checkingBackend: Promise<void> | null = null;

  private constructor() {
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async checkBackendAvailability(): Promise<void> {
    if (this.checkingBackend) {
      return this.checkingBackend;
    }

    this.checkingBackend = (async () => {
      if (this.hasCheckedBackend) return;

      try {
        const response = await axios.get(`${BACKEND_URL}/health`);
        this.isBackendAvailable = response.data?.success === true;
      } catch (error) {
        this.isBackendAvailable = false;
      } finally {
        this.hasCheckedBackend = true;
        this.checkingBackend = null;
      }
    })();

    return this.checkingBackend;
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? {Authorization: `Bearer ${token}`} : {};
  }

  public async getServerStatus(): Promise<boolean> {
    await this.checkBackendAvailability();
    return this.isBackendAvailable;
  }

  public async getPrompts() {
    await this.checkBackendAvailability();

    try {
      if (this.isBackendAvailable) {
        const response = await axios.get(`${BACKEND_URL}/prompts`, {
          headers: this.getAuthHeaders()
        });
        if (response.data?.success) {
          return response.data.data;
        }
      }
      return {prompts: []}; // Empty array as fallback instead of dummy data
    } catch (error) {
      console.error('Error fetching prompts:', error);
      return {prompts: []};
    }
  }

  // API methods with proper error handling and no dummy data
  public async createPrompt(promptData: any) {
    if (!this.isBackendAvailable) {
      throw new Error('Backend is not available');
    }

    const response = await axios.post(`${BACKEND_URL}/prompts`, promptData, {
      headers: this.getAuthHeaders()
    });

    if (response.data?.success) {
      return response.data.data;
    }
    throw new Error('Failed to create prompt');
  }

  public async updatePrompt(id: string, promptData: any) {
    if (!this.isBackendAvailable) {
      throw new Error('Backend is not available');
    }

    const response = await axios.put(`${BACKEND_URL}/prompts/${id}`, promptData, {
      headers: this.getAuthHeaders()
    });

    if (response.data?.success) {
      return response.data.data;
    }
    throw new Error('Failed to update prompt');
  }

  public async deletePrompt(id: string) {
    if (!this.isBackendAvailable) {
      throw new Error('Backend is not available');
    }

    const response = await axios.delete(`${BACKEND_URL}/prompts/${id}`, {
      headers: this.getAuthHeaders()
    });

    return response.data?.success ?? false;
  }
}

export const apiService = ApiService.getInstance();