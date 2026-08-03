export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  rememberMe?: boolean;
}

export interface JwtRefreshPayload extends JwtPayload {
  refreshToken: string;
}
