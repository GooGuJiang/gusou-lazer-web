import { api } from './client';
import type {
  OAuthApp,
  CreateOAuthAppRequest,
  CreateOAuthAppResponse,
  UpdateOAuthAppRequest,
  RefreshSecretResponse,
  GenerateCodeRequest,
  GenerateCodeResponse,
} from '../../types/oauth';

/**
 * OAuth 应用管理 API
 */
export const oauthAPI = {
  /**
   * 创建 OAuth 应用
   */
  async create(data: CreateOAuthAppRequest): Promise<CreateOAuthAppResponse> {
    const response = await api.post('/api/private/oauth-app/create', data);
    return response.data;
  },

  /**
   * 获取用户的所有 OAuth 应用
   */
  async list(): Promise<OAuthApp[]> {
    const response = await api.get('/api/private/oauth-apps');
    return response.data;
  },

  /**
   * 获取单个 OAuth 应用信息
   */
  async get(clientId: number): Promise<OAuthApp> {
    const response = await api.get(`/api/private/oauth-apps/${clientId}`);
    return response.data;
  },

  /**
   * 更新 OAuth 应用
   */
  async update(clientId: number, data: UpdateOAuthAppRequest): Promise<OAuthApp> {
    const response = await api.patch(`/api/private/oauth-app/${clientId}`, data);
    return response.data;
  },

  /**
   * 删除 OAuth 应用
   */
  async delete(clientId: number): Promise<void> {
    await api.delete(`/api/private/oauth-app/${clientId}`);
  },

  /**
   * 刷新 OAuth 应用密钥
   */
  async refreshSecret(clientId: number): Promise<RefreshSecretResponse> {
    const response = await api.post(`/api/private/oauth-app/${clientId}/refresh`);
    return response.data;
  },

  /**
   * 生成授权码
   */
  async generateCode(clientId: number, data: GenerateCodeRequest): Promise<GenerateCodeResponse> {
    const response = await api.post(`/api/private/oauth-app/${clientId}/code`, data);
    return response.data;
  },
};
