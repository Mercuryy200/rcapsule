"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import * as Sentry from "@sentry/nextjs";

interface UserContextType {
  user: any;
  refreshUser: () => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  refreshUser: () => {},
  loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);
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
        const data = await response.json();
        setUser(data);
        Sentry.setUser({
          id: data.id,
          email: data.email,
          username: data.name,
        });
      } else {
        setUser(session.user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(session.user);
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

  return (
    <UserContext.Provider value={{ user, refreshUser: fetchUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
