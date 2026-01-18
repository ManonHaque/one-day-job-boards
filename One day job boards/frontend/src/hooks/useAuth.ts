/**
 * Custom hook for authentication state management
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types/api";

export function useAuth(requiredRole?: "poster" | "doer" | "admin") {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      setLoading(false);
      setIsAuthenticated(false);
      if (requiredRole) {
        router.push("/login");
      }
      return;
    }

    // If role is required, check it
    if (requiredRole && role !== requiredRole && role !== "admin") {
      setLoading(false);
      setIsAuthenticated(false);
      router.push("/login");
      return;
    }

    setIsAuthenticated(true);
    setLoading(false);
  }, [router, requiredRole]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
    setIsAuthenticated(false);
    router.push("/login");
  };

  return {
    user,
    isAuthenticated,
    loading,
    logout,
  };
}

