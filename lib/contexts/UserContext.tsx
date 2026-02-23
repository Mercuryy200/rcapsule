"use client";
import type { User } from "@/lib/database.type";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import * as Sentry from "@sentry/nextjs";

interface UserContextType {
  user: User | null;
  refreshUser: () => void;
  loading: boolean;
  isPremium: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  refreshUser: () => {},
  loading: true,
  isPremium: false,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    if (status !== "authenticated" || !session?.user?.id) {
      setUser(null);
      Sentry.setUser(null);
      setLoading(false);

      return;
    }

    try {
      const response = await fetch("/api/user/me");

      if (response.ok) {
        const data: User = await response.json();

        setUser(data);
        Sentry.setUser({
          id: data.id,
          email: data.email,
          username: data.name,
        });
      } else {
        // Fallback with default free status
        setUser({
          ...session.user,
          subscription_status: "free",
        } as User);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser({
        ...session.user,
        subscription_status: "free",
      } as User);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [status, session?.user?.id]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchUser();
    };

    window.addEventListener("refreshUser", handleRefresh);

    return () => window.removeEventListener("refreshUser", handleRefresh);
  }, [status, session?.user?.id]);

  const isPremium = user?.subscription_status === "premium";

  return (
    <UserContext.Provider
      value={{ user, refreshUser: fetchUser, loading, isPremium }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
