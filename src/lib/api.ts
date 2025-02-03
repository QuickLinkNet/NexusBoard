import prompts from '../data/prompts.json';

interface ApiResponse<T> {
  data: T;
  source: 'json';
}

class ApiService {
  private static instance: ApiService;

  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Prompts
  public async getPrompts(): Promise<ApiResponse<any[]>> {
    return { data: prompts.prompts, source: 'json' };
  }

  public async createPrompt(prompt: any): Promise<ApiResponse<any>> {
    const newPrompt = {
      id: String(prompts.prompts.length + 1),
      ...prompt,
      expected_runs: "10",
      successful_runs: "0"
    };
    prompts.prompts.push(newPrompt);
    return { data: newPrompt, source: 'json' };
  }

  public async updatePrompt(id: string, promptData: any): Promise<ApiResponse<any>> {
    const index = prompts.prompts.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Prompt not found');
    }
    
    const updatedPrompt = {
      ...prompts.prompts[index],
      ...promptData
    };
    prompts.prompts[index] = updatedPrompt;
    return { data: updatedPrompt, source: 'json' };
  }

  public async deletePrompt(id: string): Promise<ApiResponse<boolean>> {
    const index = prompts.prompts.findIndex(p => p.id === id);
    if (index === -1) {
      return { data: false, source: 'json' };
    }
    
    prompts.prompts.splice(index, 1);
    return { data: true, source: 'json' };
  }
}

export const api = ApiService.getInstance();