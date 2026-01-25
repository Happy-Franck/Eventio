const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

class AuthAPI {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private removeToken(): void {
    localStorage.removeItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers as Record<string, string>),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  }

  async register(name: string, email: string, password: string, password_confirmation: string): Promise<AuthResponse> {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, password_confirmation }),
    });

    this.setToken(data.access_token);
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.setToken(data.access_token);
    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/logout', { method: 'POST' });
    } finally {
      this.removeToken();
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, email: string, password: string, password_confirmation: string): Promise<{ message: string }> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, email, password, password_confirmation }),
    });
  }

  async getUser(): Promise<User> {
    return this.request('/user');
  }

  async getProfile(): Promise<User> {
    return this.request('/profile');
  }

  async updateProfile(data: { name?: string; email?: string }): Promise<{ message: string; user: User }> {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updatePassword(data: { current_password: string; password: string; password_confirmation: string }): Promise<{ message: string }> {
    return this.request('/profile/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAccount(password: string): Promise<{ message: string }> {
    const result = await this.request('/profile', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
    this.removeToken();
    return result;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getOAuthUrl(provider: 'google' | 'facebook'): string {
    return `${API_URL}/api/auth/${provider}`;
  }
}

export const authAPI = new AuthAPI();

// Export convenience functions
export const register = (name: string, email: string, password: string, password_confirmation: string) => 
  authAPI.register(name, email, password, password_confirmation);

export const login = (email: string, password: string) => 
  authAPI.login(email, password);

export const logout = () => 
  authAPI.logout();

export const forgotPassword = (email: string) => 
  authAPI.forgotPassword(email);

export const resetPassword = (token: string, email: string, password: string, password_confirmation: string) => 
  authAPI.resetPassword(token, email, password, password_confirmation);

export const getUser = () => 
  authAPI.getUser();

export const getProfile = () => 
  authAPI.getProfile();

export const updateProfile = (data: { name?: string; email?: string }) => 
  authAPI.updateProfile(data);

export const updatePassword = (data: { current_password: string; password: string; password_confirmation: string }) => 
  authAPI.updatePassword(data);

export const deleteAccount = (password: string) => 
  authAPI.deleteAccount(password);

export const isAuthenticated = () => 
  authAPI.isAuthenticated();

export const getOAuthUrl = (provider: 'google' | 'facebook') => 
  authAPI.getOAuthUrl(provider);
