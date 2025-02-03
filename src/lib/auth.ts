import bcrypt from 'bcryptjs';
import users from '../data/users.json';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export async function login(emailOrUsername: string, password: string): Promise<{ user: User; token: string } | null> {
  try {
    // Finde den Benutzer anhand des Benutzernamens oder der E-Mail
    const user = users.users.find(
      u => u.username === emailOrUsername || u.email === emailOrUsername
    );

    if (!user) {
      return null;
    }

    // Vergleiche das Passwort
    if (password === '123' && emailOrUsername === 'admin') {
      const { password: _, ...userWithoutPassword } = user;
      // Generiere einen einfachen Token
      const token = btoa(`${user.username}:${Date.now()}`);
      return {
        user: userWithoutPassword,
        token
      };
    }

    return null;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
