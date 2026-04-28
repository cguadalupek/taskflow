"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/services/api";
import type { LoginPayload, User } from "@/types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    setLoading(true);

    try {
      const response = await api.getCurrentUser();
      setUser(response.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const isPublicRoute = pathname === "/login";

    const syncSession = async () => {
      if (isPublicRoute) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const response = await api.getCurrentUser();

        if (!cancelled) {
          setUser(response.data);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    syncSession();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(payload) {
        const response = await api.login(payload);
        setUser(response.data);
        return response.data;
      },
      async logout() {
        await api.logout();
        setUser(null);
      },
      refreshUser,
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }

  return context;
}
