"use client";

import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { format } from "date-fns";
import SecureLink from "./SecureLink";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  LinkIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  TagIcon,
  CalendarIcon,
  EyeIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { Bookmark } from "@/types";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { useSelection } from "@/contexts/SelectionContext";
import Link from "next/link";

interface BookmarkCardProps {
  bookmark: Bookmark;
  viewMode: "grid" | "list";
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  viewMode,
  onEdit,
  onDelete,
}) => {
  const { markBookmarkVisited } = useBookmarks();
  const { isSelectionMode, isSelected, selectItem } = useSelection();
  const [showMenu, setShowMenu] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: "bookmark",
    item: { id: bookmark.id, type: "bookmark" },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const selected = isSelected(bookmark.id);

  const handleCardClick = (e: React.MouseEvent) => {
    if (isSelectionMode) {
      e.preventDefault();
      e.stopPropagation();
      selectItem({
        id: bookmark.id,
        type: "bookmark",
        data: bookmark,
      });
    }
  };

  const handleOpenLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    markBookmarkVisited(bookmark.id);
    window.open(bookmark.url, "_blank", "noopener,noreferrer");
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(bookmark);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (window.confirm("Are you sure you want to delete this bookmark?")) {
      onDelete(bookmark.id);
    }
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  };

  const faviconUrl = getFaviconUrl(bookmark.url);

  if (viewMode === "list") {
    return (
      <div
        ref={drag as any}
        onClick={handleCardClick}
        className={`bg-white border rounded-lg p-4 hover:shadow-md transition-all relative cursor-pointer ${
          isDragging ? "opacity-50" : ""
        } ${
          selected
            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
            : "border-gray-200"
        }`}
      >
        {/* Selection indicator */}
        {isSelectionMode && (
          <div className="absolute top-3 left-3 z-10">
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selected
                  ? "bg-blue-500 border-blue-500"
                  : "border-gray-300 bg-white"
              }`}
            >
              {selected && <CheckIcon className="w-3 h-3 text-white" />}
            </div>
          </div>
        )}
        <div className={`flex items-center justify-between ${isSelectionMode ? "ml-8" : ""}`}>
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Favicon or Banner */}
            <div className="flex-shrink-0">
              {bookmark.banner ? (
                <img
                  src={bookmark.banner}
                  alt={`${bookmark.title} banner`}
                  className="w-12 h-8 object-cover rounded"
                />
              ) : faviconUrl ? (
                <img
                  src={faviconUrl}
                  alt=""
                  className="w-6 h-6"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <LinkIcon className="w-6 h-6 text-gray-400" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <SecureLink href={`/bookmark/${bookmark.id}`} className="block">
                <h3 className="text-sm font-medium text-gray-900 truncate hover:text-blue-600 transition-colors">
                  {bookmark.title}
                </h3>
              </SecureLink>
              <p className="text-xs text-gray-500 truncate">{bookmark.url}</p>
              {bookmark.description && (
                <div className="text-xs text-gray-600 line-clamp-2 mt-1 prose prose-xs max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => (
                        <span className="block">{children}</span>
                      ),
                      strong: ({ children }) => <strong>{children}</strong>,
                      em: ({ children }) => <em>{children}</em>,
                      code: ({ children }) => (
                        <code className="bg-gray-100 px-1 rounded text-xs">
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {bookmark.description}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <SecureLink
                href={`/bookmark/${bookmark.id}`}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="View details"
              >
                <EyeIcon className="w-4 h-4 text-gray-600" />
              </SecureLink>

              <button
                onClick={handleOpenLink}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="Open in new tab"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Metadata */}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {bookmark.category && (
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {bookmark.category}
                </span>
              )}

              {bookmark.tags.length > 0 && (
                <div className="flex items-center space-x-1">
                  <TagIcon className="w-3 h-3" />
                  <span>{bookmark.tags.slice(0, 2).join(", ")}</span>
                  {bookmark.tags.length > 2 && (
                    <span>+{bookmark.tags.length - 2}</span>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-1">
                <CalendarIcon className="w-3 h-3" />
                <span>{format(bookmark.createdAt, "MMM d, yyyy")}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-32">
                <Link
                  href={`/bookmark/${bookmark.id}`}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <EyeIcon className="w-4 h-4 mr-2" />
                  View Details
                </Link>
                <button
                  onClick={handleEdit}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleOpenLink}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-2" />
                  Open
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      ref={drag as any}
      onClick={handleCardClick}
      className={`bg-white border rounded-lg overflow-hidden hover:shadow-md transition-all relative cursor-pointer ${
        isDragging ? "opacity-50" : ""
      } ${
        selected
          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
          : "border-gray-200"
      }`}
    >
      {/* Selection indicator */}
      {isSelectionMode && (
        <div className="absolute top-3 left-3 z-10">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selected
                ? "bg-blue-500 border-blue-500"
                : "border-gray-300 bg-white"
            }`}
          >
            {selected && <CheckIcon className="w-3 h-3 text-white" />}
          </div>
        </div>
      )}
      {/* Banner, Favicon, or Default */}
      <SecureLink href={`/bookmark/${bookmark.id}`} className="block">
        <div className="h-24 bg-gray-50 flex items-center justify-center relative hover:bg-gray-100 transition-colors">
          {bookmark.banner ? (
            <img
              src={bookmark.banner}
              alt={`${bookmark.title} banner`}
              className="w-full h-full object-cover"
            />
          ) : faviconUrl ? (
            <img
              src={faviconUrl}
              alt=""
              className="w-8 h-8"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <LinkIcon className="w-8 h-8 text-gray-400" />
          )}
        </div>
      </SecureLink>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <SecureLink href={`/bookmark/${bookmark.id}`} className="block">
              <h3 className="text-sm font-medium text-gray-900 truncate hover:text-blue-600 transition-colors">
                {bookmark.title}
              </h3>
            </SecureLink>
            <p className="text-xs text-gray-500 truncate">
              {(() => {
                try {
                  return new URL(bookmark.url).hostname;
                } catch {
                  return bookmark.url;
                }
              })()}
            </p>
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <EllipsisVerticalIcon className="w-4 h-4 text-gray-400" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-32">
                <Link
                  href={`/bookmark/${bookmark.id}`}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <EyeIcon className="w-4 h-4 mr-2" />
                  View Details
                </Link>
                <button
                  onClick={handleEdit}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleOpenLink}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-2" />
                  Open
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {bookmark.description && (
          <div className="text-sm text-gray-600 line-clamp-3 mb-3 prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="m-0 mb-1 last:mb-0">{children}</p>
                ),
                strong: ({ children }) => <strong>{children}</strong>,
                em: ({ children }) => <em>{children}</em>,
                code: ({ children }) => (
                  <code className="bg-gray-100 px-1 rounded text-xs">
                    {children}
                  </code>
                ),
              }}
            >
              {bookmark.description}
            </ReactMarkdown>
          </div>
        )}

        {/* Tags */}
        {bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {bookmark.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
            {bookmark.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{bookmark.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link
              href={`/bookmark/${bookmark.id}`}
              className="flex items-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              <EyeIcon className="w-3 h-3 mr-1" />
              View
            </Link>

            <button
              onClick={handleOpenLink}
              className="flex items-center px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
            >
              <ArrowTopRightOnSquareIcon className="w-3 h-3 mr-1" />
              Open
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center text-xs text-gray-500">
            {bookmark.category && (
              <span className="bg-gray-100 px-2 py-1 rounded mr-2">
                {bookmark.category}
              </span>
            )}
            <span>{format(bookmark.createdAt, "MMM d")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookmarkCard;
