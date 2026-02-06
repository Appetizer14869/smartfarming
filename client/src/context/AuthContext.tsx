/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../lib/api";

/**
 * Minimal app-level User type (similar role to Supabase User)
 */
export type AppUser = {
  id?: string;        // from /api/me (sub)
  username?: string;  // from /api/login + /api/me
  email: string;
};

type AuthError = { message: string };

interface AuthContextType {
  user: AppUser | null;
  session: { token: string } | null; // keep "session" concept
  loading: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function extractErrorMessage(err: any): string {
  // Flask responses: { message: "...", errors?: {...} }
  const msg = err?.response?.data?.message;
  if (msg) return msg;

  // Validation errors may come as { errors: { field: "msg" } }
  const errors = err?.response?.data?.errors;
  if (errors && typeof errors === "object") {
    const first = Object.values(errors)[0];
    if (typeof first === "string") return first;
  }

  return err?.message || "Request failed";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<{ token: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // On load: if token exists, validate it by calling /api/me
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setSession({ token });
        const res = await api.get("/me"); // Authorization header injected by interceptor
        setUser(res.data.user);
      } catch {
        // Token invalid/expired -> clear it
        localStorage.removeItem("token");
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      // Your Flask register expects username. If your UI doesn’t collect it,
      // we fallback to the email prefix (you can change this).
      const derivedUsername = username?.trim() || email.split("@")[0];

      await api.post("/register", {
        username: derivedUsername,
        email,
        password,
      });

      // Optional convenience: auto-login after signup
      const loginRes = await api.post("/login", { email, password });

      const token = loginRes.data.token as string;
      const loginUser = loginRes.data.user as { email: string; username?: string };

      localStorage.setItem("token", token);
      setSession({ token });

      // Fetch /me to get id too
      const meRes = await api.get("/me");
      setUser(meRes.data.user ?? loginUser);

      return { error: null };
    } catch (err: any) {
      return { error: { message: extractErrorMessage(err) } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await api.post("/login", { email, password });

      const token = res.data.token as string;
      localStorage.setItem("token", token);
      setSession({ token });

      // Validate & hydrate user using /me
      const meRes = await api.get("/me");
      setUser(meRes.data.user);

      return { error: null };
    } catch (err: any) {
      return { error: { message: extractErrorMessage(err) } };
    }
  };

  const signOut = async () => {
    try {
      // Stateless logout on backend; still call it for consistency
      await api.post("/logout");
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("token");
      setSession(null);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
