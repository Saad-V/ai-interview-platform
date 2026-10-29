export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: 'bearer';
  user: AuthUser;
}

export interface Credentials {
  email: string;
  password: string;
}
