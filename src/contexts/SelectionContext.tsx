"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Bookmark, Folder } from "@/types";

interface SelectedItem {
  id: string;
  type: "bookmark" | "folder";
  data: Bookmark | Folder;
}

interface SelectionContextType {
  selectedItems: SelectedItem[];
  isSelectionMode: boolean;
  setSelectionMode: (enabled: boolean) => void;
  selectItem: (item: SelectedItem) => void;
  deselectItem: (id: string) => void;
  isSelected: (id: string) => boolean;
  clearSelection: () => void;
  selectAll: (bookmarks: Bookmark[], folders: Folder[]) => void;
  getSelectedBookmarks: () => Bookmark[];
  getSelectedFolders: () => Folder[];
}

const SelectionContext = createContext<SelectionContextType | undefined>(
  undefined
);

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error("useSelection must be used within a SelectionProvider");
  }
  return context;
};

interface SelectionProviderProps {
  children: ReactNode;
}

export const SelectionProvider: React.FC<SelectionProviderProps> = ({
  children,
}) => {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const setSelectionMode = (enabled: boolean) => {
    setIsSelectionMode(enabled);
    if (!enabled) {
      setSelectedItems([]);
    }
  };

  const selectItem = (item: SelectedItem) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.filter((i) => i.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const deselectItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const isSelected = (id: string) => {
    return selectedItems.some((item) => item.id === id);
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const selectAll = (bookmarks: Bookmark[], folders: Folder[]) => {
    const allItems: SelectedItem[] = [
      ...bookmarks.map((bookmark) => ({
        id: bookmark.id,
        type: "bookmark" as const,
        data: bookmark,
      })),
      ...folders.map((folder) => ({
        id: folder.id,
        type: "folder" as const,
        data: folder,
      })),
    ];
    setSelectedItems(allItems);
  };

  const getSelectedBookmarks = (): Bookmark[] => {
    return selectedItems
      .filter((item) => item.type === "bookmark")
      .map((item) => item.data as Bookmark);
  };

  const getSelectedFolders = (): Folder[] => {
    return selectedItems
      .filter((item) => item.type === "folder")
      .map((item) => item.data as Folder);
  };

  const value: SelectionContextType = {
    selectedItems,
    isSelectionMode,
    setSelectionMode,
    selectItem,
    deselectItem,
    isSelected,
    clearSelection,
    selectAll,
    getSelectedBookmarks,
    getSelectedFolders,
  };

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
};
