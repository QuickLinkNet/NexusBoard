import { apiService } from './apiService';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export async function login(username: string, password: string): Promise<{ user: User; token: string } | null> {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      localStorage.setItem('token', data.data.token);
      return {
        user: data.data.user,
        token: data.data.token
      };
    }

    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}