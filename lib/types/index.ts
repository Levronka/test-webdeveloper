export interface JWTPayload {
  id: string;
  email: string;
  username: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      username: string;
    };
    token?: string;
  };
  error?: string;
}
