"use client";

import React from "react";
import {
  XMarkIcon,
  TrashIcon,
  CheckIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { useSelection } from "@/contexts/SelectionContext";
import { useBookmarks } from "@/contexts/BookmarkContext";

interface MultiSelectToolbarProps {
  onMoveToFolder?: () => void;
}

const MultiSelectToolbar: React.FC<MultiSelectToolbarProps> = ({
  onMoveToFolder,
}) => {
  const {
    selectedItems,
    isSelectionMode,
    setSelectionMode,
    clearSelection,
    getSelectedBookmarks,
    getSelectedFolders,
  } = useSelection();
  
  const { deleteBookmark, deleteFolder } = useBookmarks();

  const selectedBookmarks = getSelectedBookmarks();
  const selectedFolders = getSelectedFolders();
  const totalSelected = selectedItems.length;

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${totalSelected} selected item${
          totalSelected > 1 ? "s" : ""
        }?`
      )
    ) {
      // Delete bookmarks
      selectedBookmarks.forEach((bookmark) => {
        deleteBookmark(bookmark.id);
      });

      // Delete folders
      selectedFolders.forEach((folder) => {
        deleteFolder(folder.id);
      });

      clearSelection();
      setSelectionMode(false);
    }
  };

  const handleCancel = () => {
    clearSelection();
    setSelectionMode(false);
  };

  if (!isSelectionMode || totalSelected === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center space-x-4">
        {/* Selection count */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <CheckIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-900">
            {totalSelected} item{totalSelected > 1 ? "s" : ""} selected
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {onMoveToFolder && (
            <button
              onClick={onMoveToFolder}
              className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              <FolderIcon className="w-4 h-4 mr-2" />
              Move to Folder
            </button>
          )}

          <button
            onClick={handleDelete}
            className="flex items-center px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Delete
          </button>

          <button
            onClick={handleCancel}
            className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <XMarkIcon className="w-4 h-4 mr-2" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiSelectToolbar;
