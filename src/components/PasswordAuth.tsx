"use client";

import React, { useState, useEffect } from "react";
import { useBookmarks } from "@/contexts/BookmarkContext";

interface PasswordAuthProps {
  showWelcomeBack?: boolean;
}

const PasswordAuth: React.FC<PasswordAuthProps> = ({
  showWelcomeBack = false,
}) => {
  const { login, setPassword, reset, hasPassword } = useBookmarks();
  const [password, setPasswordInput] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if password is set only on client side
    setIsSettingPassword(!hasPassword());
    setIsLoading(false);
  }, [hasPassword]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isSettingPassword) {
      // Setting new password
      if (password.length < 8) {
        setError("Password must be at least 8 characters long");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      setPassword(password);
    } else {
      // Logging in
      const success = login(password);
      if (!success) {
        setError("Invalid password");
        return;
      }
    }
  };

  const handleReset = () => {
    reset();
    setShowResetConfirm(false);
    setIsSettingPassword(true);
    setPasswordInput("");
    setConfirmPassword("");
    setError("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bookmark Explorer
          </h1>
          <p className="text-gray-600">
            {isSettingPassword
              ? "Set a password to secure your bookmarks"
              : showWelcomeBack
              ? "For security, please re-enter your password after page refresh"
              : "Enter your password to access your bookmarks"}
          </p>
          {showWelcomeBack && !isSettingPassword && (
            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-800">
                <span className="font-medium">🔒 Security Notice:</span> For
                your protection, we require password re-entry after page
                refresh, but not during normal navigation within the app.
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>

          {isSettingPassword && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm your password"
                required
              />
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            {isSettingPassword ? "Set Password" : "Login"}
          </button>
        </form>

        {!isSettingPassword && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
            >
              Reset All Data
            </button>
          </div>
        )}

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirm Reset
              </h3>
              <p className="text-gray-600 mb-4">
                This will permanently delete all your bookmarks and folders.
                This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleReset}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordAuth;
