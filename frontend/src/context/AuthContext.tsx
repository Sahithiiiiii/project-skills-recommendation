import {
  useState,
  type ReactNode,
} from "react";
import { login as loginRequest } from "../services/api";
import type { AuthUser } from "../types/api";
import { AuthContext } from "./auth-context";

const getStoredUser = (): AuthUser | null => {
  const storedUser = localStorage.getItem("pathforge_user");
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    localStorage.removeItem("pathforge_user");
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("pathforge_token")
  );
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);

  const login = async (email: string, password: string) => {
    const response = await loginRequest(email, password);
    localStorage.setItem("pathforge_token", response.token);
    localStorage.setItem("pathforge_user", JSON.stringify(response.user));
    setToken(response.token);
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem("pathforge_token");
    localStorage.removeItem("pathforge_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated: Boolean(token),
        loading: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
