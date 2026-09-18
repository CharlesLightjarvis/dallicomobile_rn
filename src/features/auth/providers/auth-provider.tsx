import { queryClient } from "@/config/query-client";
import { authService } from "@/features/auth/services/auth-service";
import { tokenStorage } from "@/features/auth/services/token-storage";
import type {
  AuthUser,
  LoginInput,
  RegisterInput,
} from "@/features/auth/types/auth";
import { setUnauthorizedHandler } from "@/lib/api";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type AuthContextValue = {
  user: AuthUser | null;
  isReady: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  const clearSession = useCallback(async () => {
    await tokenStorage.remove();
    setUser(null);
    queryClient.clear();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    void (async () => {
      const token = await tokenStorage.get();
      if (!token) {
        setIsReady(true);
        return;
      }

      try {
        const response = await authService.me();
        setUser(response.data);
      } catch {
        await clearSession();
      } finally {
        setIsReady(true);
      }
    })();
  }, [clearSession]);

  const login = useCallback(async (input: LoginInput) => {
    const response = await authService.login(input);
    await tokenStorage.set(response.data.token);
    setUser(response.data.user);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const response = await authService.register(input);
    await tokenStorage.set(response.data.token);
    setUser(response.data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      await clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, isReady, login, register, logout }),
    [isReady, login, logout, register, user],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
