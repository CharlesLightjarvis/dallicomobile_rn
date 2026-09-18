export type AuthUser = {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
};

export type AuthPayload = {
  user: AuthUser;
  token: string;
};

export type LoginInput = { email: string; password: string };

export type RegisterInput = LoginInput & {
  name: string;
  password_confirmation: string;
};
