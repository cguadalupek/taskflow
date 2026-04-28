"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { roleLabels } from "@/lib/constants";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
    setBusy(true);
    try {
      await logout();
      router.replace("/login");
    } finally {
      setBusy(false);
    }
  };

  const showNavigation = pathname !== "/login" && pathname !== "/";

  return (
    <>
      {showNavigation && user ? (
        <nav className="navbar navbar-expand-lg border-bottom bg-white sticky-top">
          <div className="container py-2">
            <Link href="/dashboard" className="navbar-brand fw-semibold text-primary">
              TaskFlow Pro
            </Link>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <Link href="/dashboard" className={`nav-link ${pathname.startsWith("/dashboard") ? "active" : ""}`}>
                Dashboard
              </Link>
              <Link href="/projects" className={`nav-link ${pathname.startsWith("/projects") ? "active" : ""}`}>
                Projects
              </Link>
              <Link href="/tasks" className={`nav-link ${pathname.startsWith("/tasks") ? "active" : ""}`}>
                Tasks
              </Link>
              {user.role === "ADMIN" ? (
                <Link href="/users" className={`nav-link ${pathname.startsWith("/users") ? "active" : ""}`}>
                  Users
                </Link>
              ) : null}
              <Link href="/profile" className={`nav-link ${pathname.startsWith("/profile") ? "active" : ""}`}>
                Profile
              </Link>
              <span className="badge text-bg-light border">{roleLabels[user.role]}</span>
              <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout} disabled={busy}>
                {busy ? "Cerrando..." : "Logout"}
              </button>
            </div>
          </div>
        </nav>
      ) : null}
      <main className={showNavigation ? "container py-4" : "min-vh-100"}>{children}</main>
    </>
  );
}
