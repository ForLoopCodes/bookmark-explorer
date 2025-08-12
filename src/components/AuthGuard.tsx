"use client";

import { useBookmarks } from "@/contexts/BookmarkContext";
import useSecureNavigation from "@/hooks/useSecureNavigation";
import { useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { isPageRefresh } from "@/utils/pageSession";
import { hasActiveSession } from "@/utils/storage";

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isInitialized, hasPassword } = useBookmarks();
  const router = useSecureNavigation();
  const pathname = usePathname();

  useEffect(() => {
    if (!isInitialized) return;

    // Skip auth guard for login page and home page
    if (pathname === "/login" || pathname === "/") return;

    const wasPageRefreshed = isPageRefresh();
    const hasActiveAuth = hasActiveSession();

    console.log("AuthGuard check:", {
      pathname,
      wasPageRefreshed,
      hasActiveAuth,
      isAuthenticated,
      hasPassword: hasPassword(),
    });

    // If user has a password set but no active session, redirect to login
    if (hasPassword() && !isAuthenticated) {
      if (wasPageRefreshed || !hasActiveAuth) {
        // Store the current path for redirect after login
        sessionStorage.setItem("bookmark_explorer_redirect", pathname);
        console.log(
          "Redirecting to login due to page refresh or no active session"
        );
        router.replace("/login");
      }
    }
  }, [isInitialized, isAuthenticated, pathname, router, hasPassword]);

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and trying to access protected routes, show loading (will redirect)
  if (
    !isAuthenticated &&
    pathname !== "/login" &&
    pathname !== "/" &&
    hasPassword()
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
