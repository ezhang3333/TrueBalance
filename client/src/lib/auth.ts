import { apiRequest } from './queryClient';

export interface LoginResponse {
  user: {
    id: string;
    email: string;
  };
  token: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

class AuthService {
  private token: string | null = null;
  private user: AuthUser | null = null;

  constructor() {
    // Load from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        this.user = JSON.parse(savedUser);
      } catch {
        localStorage.removeItem('auth_user');
      }
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiRequest('POST', '/api/auth/login', { email, password });
    const data: LoginResponse = await response.json();
    this.setAuth(data.user, data.token);
    return data;
  }

  async register(email: string, password: string): Promise<LoginResponse> {
    const response = await apiRequest('POST', '/api/auth/register', { email, password });
    const data: LoginResponse = await response.json();
    this.setAuth(data.user, data.token);
    return data;
  }

  async logout(): Promise<void> {
    if (this.token) {
      try {
        // Now we can use apiRequest since it supports authorization headers
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (!response.ok) {
          console.error('Logout failed:', await response.text());
        }
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    this.clearAuth();
  }

  private setAuth(user: AuthUser, token: string): void {
    this.user = user;
    this.token = token;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  private clearAuth(): void {
    this.user = null;
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): AuthUser | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return this.token !== null && this.user !== null;
  }

  getAuthHeaders(): Record<string, string> {
    if (!this.token) {
      throw new Error('No authentication token available');
    }
    return {
      'Authorization': `Bearer ${this.token}`,
    };
  }
}

export const authService = new AuthService();