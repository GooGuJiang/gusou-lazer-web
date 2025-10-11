import axios from 'axios';

import { API_BASE_URL } from './client';
import { getDeviceUUID } from '../deviceUUID';

export const authAPI = {
  login: async (username: string, password: string, clientId: number, clientSecret: string, turnstileToken?: string) => {
    console.log('Login attempt with:', { username, clientId });

    const formData = new FormData();
    formData.append('grant_type', 'password');
    formData.append('client_id', clientId.toString());
    formData.append('client_secret', clientSecret);
    formData.append('username', username);
    formData.append('password', password);
    formData.append('scope', '*');
    if (turnstileToken) {
      formData.append('cf_turnstile_response', turnstileToken);
    }

    // 获取设备UUID（异步）
    const deviceUUID = await getDeviceUUID();

    try {
      const response = await axios.post(`${API_BASE_URL}/oauth/token`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-api-version': '20250913',
          'X-UUID': deviceUUID,
        },
      });
      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: unknown }; message?: string };
      console.error('Login error:', err.response?.data || err.message);
      throw err;
    }
  },

  register: async (username: string, email: string, password: string, turnstileToken?: string) => {
    console.log('Register attempt with:', { username, email });

    const formData = new URLSearchParams();
    formData.append('user[username]', username);
    formData.append('user[user_email]', email);
    formData.append('user[password]', password);
    if (turnstileToken) {
      formData.append('cf_turnstile_response', turnstileToken);
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/users`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-api-version': '20250913',
        },
      });
      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: unknown }; message?: string };
      console.error('Register error:', err.response?.data || err.message);
      throw err;
    }
  },

  refreshToken: async (refreshToken: string, clientId: number, clientSecret: string) => {
    const formData = new FormData();
    formData.append('grant_type', 'refresh_token');
    formData.append('client_id', clientId.toString());
    formData.append('client_secret', clientSecret);
    formData.append('refresh_token', refreshToken);

    // 获取设备UUID（异步）
    const deviceUUID = await getDeviceUUID();

    const response = await axios.post(`${API_BASE_URL}/oauth/token`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-api-version': '20250913',
        'X-UUID': deviceUUID,
      },
    });
    return response.data;
  },

  // Password reset - Request reset code
  requestPasswordReset: async (email: string, turnstileToken?: string) => {
    console.log('Password reset request for:', email);

    const formData = new URLSearchParams();
    formData.append('email', email);
    if (turnstileToken) {
      formData.append('cf_turnstile_response', turnstileToken);
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/password-reset/request`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-api-version': '20250913',
        },
      });
      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: unknown }; message?: string };
      console.error('Password reset request error:', err.response?.data || err.message);
      throw err;
    }
  },

  // Password reset - Reset password with code
  resetPassword: async (email: string, resetCode: string, newPassword: string, turnstileToken?: string) => {
    console.log('Password reset with code for:', email);

    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('reset_code', resetCode);
    formData.append('new_password', newPassword);
    if (turnstileToken) {
      formData.append('cf_turnstile_response', turnstileToken);
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/password-reset/reset`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-api-version': '20250913',
        },
      });
      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: unknown }; message?: string };
      console.error('Password reset error:', err.response?.data || err.message);
      throw err;
    }
  },
};
