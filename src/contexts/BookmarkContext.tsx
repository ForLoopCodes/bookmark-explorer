'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Bookmark, Folder, BookmarkData } from '@/types';
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
} from '@/utils/encryption';

interface BookmarkContextType {
  isAuthenticated: boolean;
  bookmarks: Bookmark[];
  folders: Folder[];
  currentFolderId?: string;
  
  // Authentication
  login: (password: string) => boolean;
  setPassword: (password: string) => void;
  logout: () => void;
  reset: () => void;
  hasPassword: () => boolean;
  
  // Bookmark operations
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  updateBookmark: (id: string, updates: Partial<Bookmark>) => void;
  deleteBookmark: (id: string) => void;
  markBookmarkVisited: (id: string) => void;
  
  // Folder operations
  addFolder: (folder: Omit<Folder, 'id' | 'createdAt'>) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  
  // Navigation
  setCurrentFolder: (folderId?: string) => void;
  
  // Data management
  saveData: () => void;
  loadData: (password: string) => boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};

interface BookmarkProviderProps {
  children: ReactNode;
}

export const BookmarkProvider: React.FC<BookmarkProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>();
  const [currentPassword, setCurrentPassword] = useState<string>('');

  const saveData = () => {
    if (!currentPassword) return;
    
    const data: BookmarkData = { bookmarks, folders };
    const encrypted = encryptData(data, currentPassword);
    saveEncryptedData(encrypted);
  };

  const loadData = (password: string): boolean => {
    const encryptedData = getEncryptedData();
    if (!encryptedData) {
      // No data exists, initialize empty
      setBookmarks([]);
      setFolders([]);
      return true;
    }

    const data = decryptData(encryptedData, password);
    if (!data) {
      return false; // Wrong password
    }

    setBookmarks(data.bookmarks);
    setFolders(data.folders);
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
    }
    return success;
  };

  const setPassword = (password: string): void => {
    const hash = hashPassword(password);
    savePasswordHash(hash);
    setCurrentPassword(password);
    setIsAuthenticated(true);
    
    // Initialize with empty data
    setBookmarks([]);
    setFolders([]);
    saveData();
  };

  const logout = (): void => {
    setIsAuthenticated(false);
    setCurrentPassword('');
    setBookmarks([]);
    setFolders([]);
    setCurrentFolderId(undefined);
  };

  const reset = (): void => {
    clearAllData();
    logout();
  };

  const hasPassword = (): boolean => {
    return isPasswordSet();
  };

  const addBookmark = (bookmarkData: Omit<Bookmark, 'id' | 'createdAt'>): void => {
    const newBookmark: Bookmark = {
      ...bookmarkData,
      id: uuidv4(),
      createdAt: new Date(),
    };
    
    setBookmarks(prev => [...prev, newBookmark]);
  };

  const updateBookmark = (id: string, updates: Partial<Bookmark>): void => {
    setBookmarks(prev => 
      prev.map(bookmark => 
        bookmark.id === id ? { ...bookmark, ...updates } : bookmark
      )
    );
  };

  const deleteBookmark = (id: string): void => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
  };

  const markBookmarkVisited = (id: string): void => {
    updateBookmark(id, { lastVisited: new Date() });
  };

  const addFolder = (folderData: Omit<Folder, 'id' | 'createdAt'>): void => {
    const newFolder: Folder = {
      ...folderData,
      id: uuidv4(),
      createdAt: new Date(),
    };
    
    setFolders(prev => [...prev, newFolder]);
  };

  const updateFolder = (id: string, updates: Partial<Folder>): void => {
    setFolders(prev => 
      prev.map(folder => 
        folder.id === id ? { ...folder, ...updates } : folder
      )
    );
  };

  const deleteFolder = (id: string): void => {
    // Delete the folder and all its subfolders
    const deleteFolderRecursive = (folderId: string) => {
      // Delete all bookmarks in this folder
      setBookmarks(prev => prev.filter(bookmark => bookmark.folderId !== folderId));
      
      // Find and delete all subfolders
      const subfolders = folders.filter(folder => folder.parentId === folderId);
      subfolders.forEach(subfolder => deleteFolderRecursive(subfolder.id));
      
      // Delete the folder itself
      setFolders(prev => prev.filter(folder => folder.id !== folderId));
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

  const value: BookmarkContextType = {
    isAuthenticated,
    bookmarks,
    folders,
    currentFolderId,
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
