"use client";

import React, { useState } from "react";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ImageUploader from "./ImageUploader";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface CreateFolderModalProps {
  onClose: () => void;
  parentId?: string;
  editFolder?: {
    id: string;
    name: string;
    description?: string;
    banner?: string;
  };
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  onClose,
  parentId,
  editFolder,
}) => {
  const { addFolder, updateFolder } = useBookmarks();
  const [name, setName] = useState(editFolder?.name || "");
  const [description, setDescription] = useState(editFolder?.description || "");
  const [banner, setBanner] = useState<string[]>(
    editFolder?.banner ? [editFolder.banner] : []
  );
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Folder name is required");
      return;
    }

    if (editFolder) {
      updateFolder(editFolder.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        banner: banner.length > 0 ? banner[0] : undefined,
      });
    } else {
      addFolder({
        name: name.trim(),
        description: description.trim() || undefined,
        banner: banner.length > 0 ? banner[0] : undefined,
        parentId,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {editFolder ? "Rename Folder" : "Create New Folder"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="folderName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Folder Name
            </label>
            <input
              type="text"
              id="folderName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter folder name"
              autoFocus
              required
            />
          </div>

          <div>
            <label
              htmlFor="folderDescription"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description (Optional)
            </label>
            <textarea
              id="folderDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter folder description (supports Markdown)"
            />
          </div>

          {/* Banner */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banner Image (Optional)
            </label>
            <ImageUploader
              images={banner}
              onImagesChange={setBanner}
              maxImages={1}
              isBanner={true}
              placeholder="Upload a banner image for this folder"
            />
          </div>

          {/* Description Preview */}
          {description.trim() && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description Preview
                </label>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-blue-600 text-sm hover:text-blue-800"
                >
                  {showPreview ? "Hide" : "Show"} Preview
                </button>
              </div>
              {showPreview && (
                <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {description}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded-md">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {editFolder ? "Rename" : "Create"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal;
