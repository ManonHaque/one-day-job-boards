"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, MenuItem, HoveredLink } from "./ui/navbar-menu";
import { cn } from "@/utils/cn";

export default function Navbar({ className }: { className?: string }) {
  const pathname = usePathname();
  const [active, setActive] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const checkAuth = () => {
    const t = localStorage.getItem("token");
    const r = localStorage.getItem("role");
    if (t && r) {
      setLoggedIn(true);
      setRole(r);
    } else {
      setLoggedIn(false);
      setRole(null);
    }
  };

  useEffect(() => {
    // Check auth on mount
    checkAuth();
  }, []);

  useEffect(() => {
    // Check auth whenever route changes (important for after login navigation)
    checkAuth();

    // Listen for storage changes (when login happens in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "role") {
        checkAuth();
      }
    };

    // Listen for custom login event (when login happens in same tab)
    const handleLogin = () => {
      // Small delay to ensure localStorage is updated
      setTimeout(() => {
        checkAuth();
      }, 100);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-changed", handleLogin);

    // Also check on window focus (in case user logged in elsewhere)
    window.addEventListener("focus", checkAuth);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-changed", handleLogin);
      window.removeEventListener("focus", checkAuth);
    };
  }, [pathname]); // Re-run when pathname changes

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setLoggedIn(false);
    setRole(null);
    // Dispatch event to notify other components
    window.dispatchEvent(new Event("auth-changed"));
    // Use router for navigation
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const dashboardLink =
    role === "poster"
      ? "/dashboard/poster"
      : role === "doer"
      ? "/dashboard/doer"
      : "/dashboard/admin";

  return (
    <div
      className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}
    >
      <Menu setActive={setActive}>
        <Link href="/">
          <MenuItem setActive={setActive} active={active} item="Home" />
        </Link>

        

        <Link href="/someworks">
          <MenuItem setActive={setActive} active={active} item="Some Works" />
        </Link>

        <Link href="/reviews">
          <MenuItem
            setActive={setActive}
            active={active}
            item="Student Voices"
          />
        </Link>

        <Link href="/case_studies">Case Studies</Link>

        {!loggedIn && (
          <>
            <Link href="/login">
              <MenuItem setActive={setActive} active={active} item="Login" />
            </Link>
            <Link href="/signup">
              <MenuItem setActive={setActive} active={active} item="Signup" />
            </Link>
          </>
        )}

        {loggedIn && (
          <>
            <Link href={dashboardLink}>
              <MenuItem
                setActive={setActive}
                active={active}
                item="Dashboard"
              />
            </Link>
            <div onClick={logout}>
              <MenuItem setActive={setActive} active={active} item="Logout" />
            </div>
          </>
        )}

        {/* <Link href="/about">
          <MenuItem setActive={setActive} active={active} item="About" />
        </Link> */}
      </Menu>
    </div>
  );
}
