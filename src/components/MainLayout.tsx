"use client";

import React, { useState } from "react";
import { useBookmarks } from "@/contexts/BookmarkContext";
import useSecureNavigation from "@/hooks/useSecureNavigation";
import Sidebar from "./Sidebar";
import SaveStatus from "./SaveStatus";
import NotificationCenter from "./NotificationCenter";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { logout } = useBookmarks();
  const router = useSecureNavigation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarCollapsed ? "w-16" : "w-64"
        } transition-all duration-300 bg-white shadow-lg`}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Bookmark Explorer
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <SaveStatus />
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>

      {/* Notification Center */}
      <NotificationCenter />
    </div>
  );
};

export default MainLayout;
