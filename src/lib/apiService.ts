import axios from 'axios';
import dummyData from '../data/prompts.json';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

class ApiService {
  private static instance: ApiService;
  private isBackendAvailable: boolean = false;
  private hasCheckedBackend: boolean = false;
  private checkingBackend: Promise<void> | null = null;

  private constructor() {}

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
        const response = await axios.get(`${BACKEND_URL}/api/health`);
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
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json'
    };
  }

  public async getPrompts() {
    await this.checkBackendAvailability();

    try {
      if (this.isBackendAvailable) {
        const response = await axios.get(`${BACKEND_URL}/api/prompts`, {
          headers: this.getAuthHeaders()
        });
        if (response.data?.success) {
          return response.data.data;
        }
      }
      return { prompts: dummyData.prompts, total: dummyData.prompts.length };
    } catch (error) {
      console.error('Error fetching prompts:', error);
      return { prompts: dummyData.prompts, total: dummyData.prompts.length };
    }
  }

  public async generateMetadata(imagesPath: string, outputPath: string) {
    try {
      if (!this.isBackendAvailable) {
        throw new Error('Backend ist nicht verfügbar');
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/meta/generate`,
        { imagesPath, outputPath },
        { headers: this.getAuthHeaders() }
      );

      if (response.data?.success) {
        return response.data;
      }
      throw new Error('Fehler beim Generieren der Metadaten');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error('Nicht autorisiert. Bitte melden Sie sich erneut an.');
      }
      console.error('Error generating metadata:', error);
      throw error;
    }
  }

  public async createPrompt(promptData: any) {
    try {
      if (this.isBackendAvailable) {
        const response = await axios.post(`${BACKEND_URL}/api/prompts`, promptData, {
          headers: this.getAuthHeaders()
        });
        if (response.data?.success) {
          return response.data.data;
        }
      }
      const newPrompt = {
        id: String(dummyData.prompts.length + 1),
        ...promptData,
        expected_runs: "10",
        successful_runs: "0"
      };
      dummyData.prompts.push(newPrompt);
      return newPrompt;
    } catch (error) {
      console.error('Error creating prompt:', error);
      throw error;
    }
  }

  public async updatePrompt(id: string, promptData: any) {
    try {
      if (this.isBackendAvailable) {
        const response = await axios.put(`${BACKEND_URL}/api/prompts/${id}`, promptData, {
          headers: this.getAuthHeaders()
        });
        if (response.data?.success) {
          return response.data.data;
        }
      }
      const index = dummyData.prompts.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Prompt not found');

      const updatedPrompt = {
        ...dummyData.prompts[index],
        ...promptData
      };
      dummyData.prompts[index] = updatedPrompt;
      return updatedPrompt;
    } catch (error) {
      console.error('Error updating prompt:', error);
      throw error;
    }
  }

  public async setPromptSuccessful(id: string) {
    try {
      if (this.isBackendAvailable) {
        const response = await axios.put(`${BACKEND_URL}/api/prompts/${id}`, {
          successful_runs: "10"
        }, {
          headers: this.getAuthHeaders()
        });
        if (response.data?.success) {
          return response.data.data;
        }
      }
      const index = dummyData.prompts.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Prompt not found');

      dummyData.prompts[index].successful_runs = "10";
      return dummyData.prompts[index];
    } catch (error) {
      console.error('Error setting prompt successful:', error);
      throw error;
    }
  }

  public async deletePrompt(id: string) {
    try {
      if (this.isBackendAvailable) {
        const response = await axios.delete(`${BACKEND_URL}/api/prompts/${id}`, {
          headers: this.getAuthHeaders()
        });
        if (response.data?.success) {
          return true;
        }
      }
      const index = dummyData.prompts.findIndex(p => p.id === id);
      if (index === -1) return false;
      dummyData.prompts.splice(index, 1);
      return true;
    } catch (error) {
      console.error('Error deleting prompt:', error);
      throw error;
    }
  }

  public async getServerStatus() {
    await this.checkBackendAvailability();
    return this.isBackendAvailable;
  }
}

export const apiService = ApiService.getInstance();
