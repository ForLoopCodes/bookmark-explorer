"use client";

import React, { useState } from "react";
import { XMarkIcon, FolderIcon } from "@heroicons/react/24/outline";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { useSelection } from "@/contexts/SelectionContext";

interface MoveToFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MoveToFolderModal: React.FC<MoveToFolderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { folders, updateBookmark, updateFolder } = useBookmarks();
  const { getSelectedBookmarks, getSelectedFolders, clearSelection, setSelectionMode } = useSelection();
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");

  const selectedBookmarks = getSelectedBookmarks();
  const selectedFolders = getSelectedFolders();
  const totalSelected = selectedBookmarks.length + selectedFolders.length;

  const handleMove = () => {
    // Move selected bookmarks
    selectedBookmarks.forEach((bookmark) => {
      updateBookmark(bookmark.id, {
        folderId: selectedFolderId || undefined,
      });
    });

    // Move selected folders
    selectedFolders.forEach((folder) => {
      updateFolder(folder.id, {
        parentId: selectedFolderId || undefined,
      });
    });

    clearSelection();
    setSelectionMode(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">
              Move {totalSelected} Item{totalSelected > 1 ? "s" : ""}
            </h3>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-600 text-sm mb-4">
              Choose a destination folder for the selected items:
            </p>

            {/* Selected items preview */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="text-sm text-gray-700">
                <span className="font-medium">Selected items:</span>
                {selectedBookmarks.length > 0 && (
                  <span className="ml-2">
                    {selectedBookmarks.length} bookmark{selectedBookmarks.length > 1 ? "s" : ""}
                  </span>
                )}
                {selectedFolders.length > 0 && (
                  <span className="ml-2">
                    {selectedFolders.length} folder{selectedFolders.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>

            <label
              htmlFor="folder-select"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Destination Folder
            </label>
            <select
              id="folder-select"
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Root (No folder)</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleMove}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium shadow-lg"
            >
              Move Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoveToFolderModal;
