"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { Bookmark, Folder } from "@/types";
import { getAllCategories, getAllTags } from "@/utils/search";
import ImageUploader from "./ImageUploader";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface BookmarkModalProps {
  onClose: () => void;
  editBookmark?: Bookmark;
  defaultFolderId?: string;
}

const BookmarkModal: React.FC<BookmarkModalProps> = ({
  onClose,
  editBookmark,
  defaultFolderId,
}) => {
  const { addBookmark, updateBookmark, folders, bookmarks } = useBookmarks();

  const [title, setTitle] = useState(editBookmark?.title || "");
  const [url, setUrl] = useState(editBookmark?.url || "");
  const [description, setDescription] = useState(
    editBookmark?.description || ""
  );
  const [category, setCategory] = useState(editBookmark?.category || "");
  const [folderId, setFolderId] = useState(
    editBookmark?.folderId || defaultFolderId || ""
  );
  const [tags, setTags] = useState<string[]>(editBookmark?.tags || []);
  const [banner, setBanner] = useState<string[]>(
    editBookmark?.banner ? [editBookmark.banner] : []
  );
  const [gallery, setGallery] = useState<string[]>(editBookmark?.gallery || []);
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const existingCategories = getAllCategories(bookmarks);
  const existingTags = getAllTags(bookmarks);

  useEffect(() => {
    // Auto-fetch title from URL if it's a new bookmark
    if (!editBookmark && url && !title) {
      fetchTitle(url);
    }
  }, [url, editBookmark, title]);

  const fetchTitle = async (urlToFetch: string) => {
    try {
      // This is a simple approach - in a real app you'd need a backend service
      // For now, we'll just use the domain as title
      const domain = new URL(urlToFetch).hostname.replace("www.", "");
      setTitle(domain);
    } catch {
      // Invalid URL, do nothing
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!url.trim()) {
      setError("URL is required");
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    const bookmarkData = {
      title: title.trim(),
      url: url.trim(),
      description: description.trim(),
      category: category.trim(),
      folderId: folderId || undefined,
      tags: tags.filter((tag) => tag.trim()),
      banner: banner.length > 0 ? banner[0] : undefined,
      gallery: gallery.length > 0 ? gallery : undefined,
    };

    if (editBookmark) {
      updateBookmark(editBookmark.id, bookmarkData);
    } else {
      addBookmark(bookmarkData);
    }

    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">
              {editBookmark ? "Edit Bookmark" : "Add New Bookmark"}
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title and URL Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter bookmark title"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="url"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  URL *
                </label>
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="https://example.com"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <div className="relative">
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Add a description (supports Markdown)"
                />
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="absolute top-2 right-2 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 bg-gray-100 rounded"
                >
                  {showPreview ? "Edit" : "Preview"}
                </button>
              </div>
              {showPreview && description && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                  <div className="text-sm prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {description}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

            {/* Category and Folder Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  list="categories"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., Work, Personal, Learning"
                />
                <datalist id="categories">
                  {existingCategories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div>
                <label
                  htmlFor="folder"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Folder
                </label>
                <select
                  id="folder"
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
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
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tags
              </label>

              {/* Existing tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add new tag */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  list="existingTags"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
              <datalist id="existingTags">
                {existingTags.map((tag) => (
                  <option key={tag} value={tag} />
                ))}
              </datalist>
            </div>

            {/* Image Uploads */}
            <div className="space-y-4">
              {/* Banner */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image
                </label>
                <ImageUploader
                  images={banner}
                  onImagesChange={setBanner}
                  maxImages={1}
                  isBanner={true}
                  placeholder="Upload a banner image for this bookmark"
                />
              </div>

              {/* Gallery */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gallery
                </label>
                <ImageUploader
                  images={gallery}
                  onImagesChange={setGallery}
                  maxImages={10}
                  isBanner={false}
                  placeholder="Upload images to create a gallery"
                />
              </div>
            </div>

            {/* Footer with Actions */}
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium shadow-lg"
              >
                {editBookmark ? "Update" : "Save"} Bookmark
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookmarkModal;
