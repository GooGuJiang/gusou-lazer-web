// OAuth 应用类型定义

export interface OAuthApp {
  client_id: number;
  name: string;
  description: string;
  redirect_uris: string[];
  created_at: string;
  updated_at?: string;
}

export interface CreateOAuthAppRequest {
  name: string;
  redirect_uris: string[];
  description?: string;
}

export interface UpdateOAuthAppRequest {
  name?: string;
  redirect_uris?: string[];
  description?: string;
}

export interface CreateOAuthAppResponse {
  client_id: number;
  client_secret: string;
  name: string;
  description: string;
  redirect_uris: string[];
  created_at: string;
}

export interface RefreshSecretResponse {
  client_id: number;
  client_secret: string;
}

export interface GenerateCodeRequest {
  redirect_uri: string;
  scopes: string[];
}

export interface GenerateCodeResponse {
  code: string;
  expires_at: string;
}
