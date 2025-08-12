"use client";

import { useBookmarks } from "@/contexts/BookmarkContext";
import PasswordAuth from "@/components/PasswordAuth";
import useSecureNavigation from "@/hooks/useSecureNavigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { isAuthenticated, isInitialized } = useBookmarks();
  const router = useSecureNavigation();

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to the page they were trying to access, or home if no redirect path
      const redirectPath =
        sessionStorage.getItem("bookmark_explorer_redirect") || "/home";
      sessionStorage.removeItem("bookmark_explorer_redirect");
      router.replace(redirectPath);
    }
  }, [isAuthenticated, router]);

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Bookmark Explorer...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return <PasswordAuth showWelcomeBack={true} />;
}
