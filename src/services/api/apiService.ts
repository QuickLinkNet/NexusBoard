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

  // File Management Methods
  public async uploadFiles(formData: FormData) {
    const response = await axios.post(`${BACKEND_URL}/files/upload`, formData, {
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  public async getFiles() {
    const response = await axios.get(`${BACKEND_URL}/files`, {
      headers: this.getAuthHeaders()
    });
    return response.data.data;
  }

  public async getFileContent(fileId: string) {
    const response = await axios.get(`${BACKEND_URL}/files/${fileId}/content`, {
      headers: this.getAuthHeaders()
    });
    return response.data.data;
  }

  public async getFileDownloadUrl(fileId: string): Promise<string> {
    return `${BACKEND_URL}/files/${fileId}/download`;
  }

  public async deleteFile(fileId: string): Promise<boolean> {
    const response = await axios.delete(`${BACKEND_URL}/files/${fileId}`, {
      headers: this.getAuthHeaders()
    });
    return response.data.success;
  }

  public async getPrompts() {
    try {
      const response = await axios.get(`${BACKEND_URL}/prompts`, {
        headers: this.getAuthHeaders()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching prompts:', error);
      return {prompts: []};
    }
  }

  public async createPrompt(promptData: any) {
    const response = await axios.post(`${BACKEND_URL}/prompts`, promptData, {
      headers: this.getAuthHeaders()
    });
    return response.data.data;
  }

  public async updatePrompt(id: string, promptData: any) {
    const response = await axios.put(`${BACKEND_URL}/prompts/${id}`, promptData, {
      headers: this.getAuthHeaders()
    });
    return response.data.data;
  }

  public async deletePrompt(id: string) {
    const response = await axios.delete(`${BACKEND_URL}/prompts/${id}`, {
      headers: this.getAuthHeaders()
    });
    return response.data.success;
  }
}

export const apiService = ApiService.getInstance();