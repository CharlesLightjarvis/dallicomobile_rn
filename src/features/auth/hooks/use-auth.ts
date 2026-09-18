import { AuthContext } from "@/features/auth/providers/auth-provider";
import { use } from "react";

export function useAuth() {
  const value = use(AuthContext);
  if (!value) throw new Error("useAuth doit être utilisé dans AuthProvider.");
  return value;
}
