"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { Bookmark, Folder, BookmarkData } from "@/types";
import {
  savePasswordHash,
  hashPassword,
  encryptData,
  decryptData,
  saveEncryptedData,
  getEncryptedData,
  clearAllData,
  isPasswordSet,
  verifyPassword,
  createSessionToken,
  saveSessionToken,
  clearSessionToken,
  hasExistingSession,
  hasActiveSession,
  createNavigationToken,
  saveNavigationToken,
} from "@/utils/storage";
import {
  isPageRefresh,
  markPageLoaded,
  markNavigation,
  createTemporaryBackup,
  getTemporaryBackup,
  clearTemporaryBackup,
} from "@/utils/pageSession";

interface BookmarkContextType {
  isAuthenticated: boolean;
  bookmarks: Bookmark[];
  folders: Folder[];
  currentFolderId?: string;
  isInitialized: boolean;
  shouldShowLogin: boolean;
  isSaving: boolean;
  lastSaved?: Date;

  // Authentication
  login: (password: string) => boolean;
  setPassword: (password: string) => void;
  logout: () => void;
  reset: () => void;
  hasPassword: () => boolean;

  // Bookmark operations
  addBookmark: (bookmark: Omit<Bookmark, "id" | "createdAt">) => void;
  updateBookmark: (id: string, updates: Partial<Bookmark>) => void;
  deleteBookmark: (id: string) => void;
  markBookmarkVisited: (id: string) => void;

  // Folder operations
  addFolder: (folder: Omit<Folder, "id" | "createdAt">) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;

  // Navigation
  setCurrentFolder: (folderId?: string) => void;

  // Data management
  saveData: () => void;
  loadData: (password: string) => boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(
  undefined
);

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error("useBookmarks must be used within a BookmarkProvider");
  }
  return context;
};

interface BookmarkProviderProps {
  children: ReactNode;
}

export const BookmarkProvider: React.FC<BookmarkProviderProps> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>();
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [shouldShowLogin, setShouldShowLogin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | undefined>();

  // Check for existing session on mount
  useEffect(() => {
    const initializeApp = () => {
      const wasPageRefreshed = isPageRefresh();
      const hasActiveAuth = hasActiveSession();

      markPageLoaded();

      console.log("App initialization:", {
        wasPageRefreshed,
        hasActiveAuth,
        hasExistingData: hasExistingSession(),
      });

      // We no longer set shouldShowLogin here since AuthGuard handles redirects
      // Just mark as initialized
      setIsInitialized(true);
    };

    // Small delay to ensure proper hydration and sessionStorage availability
    const timer = setTimeout(initializeApp, 100);
    return () => clearTimeout(timer);
  }, []);

  const saveData = async () => {
    if (!currentPassword) return;

    setIsSaving(true);
    const data: BookmarkData = { bookmarks, folders };

    try {
      // Create temporary backup in sessionStorage
      createTemporaryBackup(bookmarks, folders);

      // Encrypt and save to persistent storage
      const encrypted = encryptData(data, currentPassword);
      saveEncryptedData(encrypted);

      setLastSaved(new Date());
      console.log("Data saved successfully");
    } catch (error) {
      console.error("Failed to save data:", error);
      // Even if main save fails, temporary backup might still work
    } finally {
      setIsSaving(false);
    }
  };

  const loadData = (password: string): boolean => {
    const encryptedData = getEncryptedData();

    if (!encryptedData) {
      // No persistent data exists, check for temporary backup
      const backup = getTemporaryBackup();
      if (backup) {
        console.log("Loading from temporary backup");
        setBookmarks(backup.bookmarks);
        setFolders(backup.folders);
        return true;
      }

      // No data exists, initialize empty
      setBookmarks([]);
      setFolders([]);
      return true;
    }

    const data = decryptData(encryptedData, password);
    if (!data) {
      // Wrong password, but check if we can load from temporary backup
      const backup = getTemporaryBackup();
      if (backup) {
        console.warn("Main data decryption failed, using temporary backup");
        setBookmarks(backup.bookmarks);
        setFolders(backup.folders);
        return true;
      }
      return false; // Wrong password and no backup
    }

    setBookmarks(data.bookmarks);
    setFolders(data.folders);

    // Clear temporary backup since we loaded from persistent storage
    clearTemporaryBackup();

    return true;
  };

  const login = (password: string): boolean => {
    if (!verifyPassword(password)) {
      return false;
    }

    const success = loadData(password);
    if (success) {
      setCurrentPassword(password);
      setIsAuthenticated(true);
      setShouldShowLogin(false);

      // Create session token for this login session (sessionStorage only)
      const sessionToken = createSessionToken(password);
      saveSessionToken(sessionToken);

      // Create navigation token to distinguish between refresh and navigation
      const navigationToken = createNavigationToken();
      saveNavigationToken(navigationToken);

      console.log("User authenticated successfully - session tokens created");
    }
    return success;
  };

  const setPassword = (password: string): void => {
    const hash = hashPassword(password);
    savePasswordHash(hash);
    setCurrentPassword(password);
    setIsAuthenticated(true);
    setShouldShowLogin(false);

    // Initialize with empty data
    setBookmarks([]);
    setFolders([]);
    saveData();

    // Create session tokens for this new account
    const sessionToken = createSessionToken(password);
    saveSessionToken(sessionToken);

    const navigationToken = createNavigationToken();
    saveNavigationToken(navigationToken);

    console.log("New password set - session tokens created");
  };

  const logout = (): void => {
    setIsAuthenticated(false);
    setCurrentPassword("");
    setBookmarks([]);
    setFolders([]);
    setCurrentFolderId(undefined);
    setShouldShowLogin(false);

    // Clear session token
    clearSessionToken();
  };

  const reset = (): void => {
    clearAllData();
    logout();
  };

  const hasPassword = (): boolean => {
    return isPasswordSet();
  };

  const addBookmark = (
    bookmarkData: Omit<Bookmark, "id" | "createdAt">
  ): void => {
    const newBookmark: Bookmark = {
      ...bookmarkData,
      id: uuidv4(),
      createdAt: new Date(),
    };

    setBookmarks((prev) => [...prev, newBookmark]);
  };

  const updateBookmark = (id: string, updates: Partial<Bookmark>): void => {
    setBookmarks((prev) =>
      prev.map((bookmark) =>
        bookmark.id === id ? { ...bookmark, ...updates } : bookmark
      )
    );
  };

  const deleteBookmark = (id: string): void => {
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id));
  };

  const markBookmarkVisited = (id: string): void => {
    updateBookmark(id, { lastVisited: new Date() });
  };

  const addFolder = (folderData: Omit<Folder, "id" | "createdAt">): void => {
    const newFolder: Folder = {
      ...folderData,
      id: uuidv4(),
      createdAt: new Date(),
    };

    setFolders((prev) => [...prev, newFolder]);
  };

  const updateFolder = (id: string, updates: Partial<Folder>): void => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === id ? { ...folder, ...updates } : folder
      )
    );
  };

  const deleteFolder = (id: string): void => {
    // Delete the folder and all its subfolders
    const deleteFolderRecursive = (folderId: string) => {
      // Delete all bookmarks in this folder
      setBookmarks((prev) =>
        prev.filter((bookmark) => bookmark.folderId !== folderId)
      );

      // Find and delete all subfolders
      const subfolders = folders.filter(
        (folder) => folder.parentId === folderId
      );
      subfolders.forEach((subfolder) => deleteFolderRecursive(subfolder.id));

      // Delete the folder itself
      setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
    };

    deleteFolderRecursive(id);
  };

  const setCurrentFolder = (folderId?: string): void => {
    setCurrentFolderId(folderId);
  };

  // Auto-save data when bookmarks or folders change
  useEffect(() => {
    if (isAuthenticated && currentPassword) {
      saveData();
    }
  }, [bookmarks, folders, isAuthenticated, currentPassword]);

  // Periodic backup to sessionStorage while user is active
  useEffect(() => {
    if (!isAuthenticated || !currentPassword) return;

    const interval = setInterval(() => {
      createTemporaryBackup(bookmarks, folders);
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, currentPassword, bookmarks, folders]);

  // Save data before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isAuthenticated && currentPassword) {
        saveData();
        createTemporaryBackup(bookmarks, folders);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isAuthenticated, currentPassword, bookmarks, folders]);

  const value: BookmarkContextType = {
    isAuthenticated,
    bookmarks,
    folders,
    currentFolderId,
    isInitialized,
    shouldShowLogin,
    isSaving,
    lastSaved,
    login,
    setPassword,
    logout,
    reset,
    hasPassword,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    markBookmarkVisited,
    addFolder,
    updateFolder,
    deleteFolder,
    setCurrentFolder,
    saveData,
    loadData,
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};
