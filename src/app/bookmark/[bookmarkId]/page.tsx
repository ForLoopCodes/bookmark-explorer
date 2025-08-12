"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { Bookmark } from "@/types";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  LinkIcon,
  TagIcon,
  CalendarIcon,
  FolderIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/solid";
import BookmarkModal from "@/components/BookmarkModal";

const BookmarkDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { bookmarks, folders, deleteBookmark } = useBookmarks();
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const bookmarkId = params.bookmarkId as string;

  useEffect(() => {
    if (bookmarkId && bookmarks.length > 0) {
      const foundBookmark = bookmarks.find((b) => b.id === bookmarkId);
      setBookmark(foundBookmark || null);
    }
  }, [bookmarkId, bookmarks]);

  const handleBack = () => {
    router.replace(
      bookmark?.folderId ? `/explorer/${bookmark.folderId}` : "/explorer"
    );
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = () => {
    if (
      bookmark &&
      window.confirm("Are you sure you want to delete this bookmark?")
    ) {
      deleteBookmark(bookmark.id);
      handleBack();
    }
  };

  const handleVisit = () => {
    if (bookmark) {
      window.open(bookmark.url, "_blank", "noopener,noreferrer");
    }
  };

  if (!bookmark) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <LinkIcon className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Bookmark not found
          </h2>
          <p className="text-gray-600 mb-6">
            The bookmark you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={handleBack}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const folder = bookmark.folderId
    ? folders.find((f) => f.id === bookmark.folderId)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 truncate">
                  {bookmark.title}
                </h1>
                {folder && (
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <FolderIcon className="w-4 h-4 mr-1" />
                    {folder.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleVisit}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <LinkIcon className="w-4 h-4" />
                <span>Visit</span>
              </button>
              <button
                onClick={handleEdit}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <PencilIcon className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <TrashIcon className="w-5 h-5 text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner */}
        {bookmark.banner && (
          <div className="mb-8">
            <img
              src={bookmark.banner}
              alt="Bookmark banner"
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Main Content */}
          <div className="p-6">
            {/* URL */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL
              </label>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 break-all"
              >
                {bookmark.url}
              </a>
            </div>

            {/* Description */}
            {bookmark.description && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {bookmark.description}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Tags */}
            {bookmark.tags.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {bookmark.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      <TagIcon className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Category */}
            {bookmark.category && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {bookmark.category}
                </span>
              </div>
            )}

            {/* Gallery */}
            {bookmark.gallery && bookmark.gallery.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gallery
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {bookmark.gallery.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(image)}
                      className="group relative"
                    >
                      <img
                        src={image}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg group-hover:opacity-75 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-25 rounded-lg transition-all flex items-center justify-center">
                        <PhotoIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <span>
                    Created: {new Date(bookmark.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {bookmark.lastVisited && (
                  <div className="flex items-center">
                    <HeartIcon className="w-4 h-4 mr-2" />
                    <span>
                      Last visited:{" "}
                      {new Date(bookmark.lastVisited).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full p-4">
            <img
              src={selectedImage}
              alt="Gallery image"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <BookmarkModal
          onClose={() => setShowEditModal(false)}
          editBookmark={bookmark}
          defaultFolderId={bookmark.folderId}
        />
      )}
    </div>
  );
};

export default BookmarkDetailPage;
