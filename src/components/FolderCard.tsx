"use client";

import React, { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { format } from "date-fns";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  FolderIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { Folder } from "@/types";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { useSelection } from "@/contexts/SelectionContext";

interface FolderCardProps {
  folder: Folder;
  viewMode: "grid" | "list";
  onEdit: (folder: Folder) => void;
  onDelete: (id: string) => void;
  onDrop: (
    itemId: string,
    itemType: "bookmark" | "folder",
    targetFolderId: string
  ) => void;
}

const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  viewMode,
  onEdit,
  onDelete,
  onDrop,
}) => {
  const { bookmarks, folders } = useBookmarks();
  const { isSelectionMode, isSelected, selectItem } = useSelection();
  const [showMenu, setShowMenu] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: "folder",
    item: { id: folder.id, type: "folder" },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const selected = isSelected(folder.id);

  const handleCardClick = (e: React.MouseEvent) => {
    if (isSelectionMode) {
      e.preventDefault();
      e.stopPropagation();
      selectItem({
        id: folder.id,
        type: "folder",
        data: folder,
      });
    }
  };

  const [{ isOver }, drop] = useDrop({
    accept: ["bookmark", "folder"],
    drop: (item: { id: string; type: "bookmark" | "folder" }) => {
      if (item.id !== folder.id) {
        onDrop(item.id, item.type, folder.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    onEdit(folder);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);

    const bookmarkCount = bookmarks.filter(
      (b) => b.folderId === folder.id
    ).length;
    const subfolderCount = folders.filter(
      (f) => f.parentId === folder.id
    ).length;

    let message = "Are you sure you want to delete this folder?";
    if (bookmarkCount > 0 || subfolderCount > 0) {
      message += ` This will also delete ${bookmarkCount} bookmark(s) and ${subfolderCount} subfolder(s).`;
    }

    if (window.confirm(message)) {
      onDelete(folder.id);
    }
  };

  const bookmarkCount = bookmarks.filter(
    (b) => b.folderId === folder.id
  ).length;
  const subfolderCount = folders.filter((f) => f.parentId === folder.id).length;

  if (viewMode === "list") {
    return (
      <div
        ref={(node) => {
          (drag as any)(node);
          (drop as any)(node);
        }}
        onClick={handleCardClick}
        className={`bg-white border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer relative ${
          isDragging ? "opacity-50" : ""
        } ${isOver ? "border-blue-400 bg-blue-50" : ""} ${
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

        <Link href={`/explorer/${folder.id}`} className={isSelectionMode ? "pointer-events-none" : ""}>
          <div className={`flex items-center justify-between ${isSelectionMode ? "ml-8" : ""}`}>
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {folder.banner ? (
                <img
                  src={folder.banner}
                  alt={`${folder.name} banner`}
                  className="w-12 h-8 object-cover rounded flex-shrink-0"
                />
              ) : (
                <FolderIcon className="w-6 h-6 text-blue-600 flex-shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {folder.name}
                </h3>
                {folder.description && (
                  <div className="text-xs text-gray-600 line-clamp-2 prose prose-xs max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <span>{children}</span>,
                        strong: ({ children }) => <strong>{children}</strong>,
                        em: ({ children }) => <em>{children}</em>,
                        code: ({ children }) => (
                          <code className="bg-gray-100 px-1 rounded text-xs">
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {folder.description}
                    </ReactMarkdown>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  {bookmarkCount} bookmark(s), {subfolderCount} folder(s)
                </p>
              </div>

              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <CalendarIcon className="w-3 h-3" />
                <span>{format(folder.createdAt, "MMM d, yyyy")}</span>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-32">
                  <button
                    onClick={handleEdit}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Rename
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
        </Link>
      </div>
    );
  }

  // Grid view
  return (
    <div
      ref={(node) => {
        (drag as any)(node);
        (drop as any)(node);
      }}
      onClick={handleCardClick}
      className={`bg-white border rounded-lg overflow-hidden hover:shadow-md transition-all cursor-pointer ${
        isDragging ? "opacity-50" : ""
      } ${isOver ? "border-blue-400 bg-blue-50" : ""} ${
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

      <Link href={`/explorer/${folder.id}`} className={isSelectionMode ? "pointer-events-none" : ""}>
        {/* Banner or Icon */}
        <div className="h-24 bg-gray-50 flex items-center justify-center relative">
          {folder.banner ? (
            <img
              src={folder.banner}
              alt={`${folder.name} banner`}
              className="w-full h-full object-cover"
            />
          ) : (
            <FolderIcon className="w-12 h-12 text-blue-600" />
          )}
        </div>

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {folder.name}
              </h3>
            </div>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <EllipsisVerticalIcon className="w-4 h-4 text-gray-400" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-32">
                  <button
                    onClick={handleEdit}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Rename
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

          {/* Content Info */}
          <div className="text-sm text-gray-600 mb-3">
            {folder.description && (
              <div className="text-sm text-gray-600 line-clamp-3 mb-2 prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="m-0">{children}</p>,
                    strong: ({ children }) => <strong>{children}</strong>,
                    em: ({ children }) => <em>{children}</em>,
                    code: ({ children }) => (
                      <code className="bg-gray-100 px-1 rounded text-xs">
                        {children}
                      </code>
                    ),
                  }}
                >
                  {folder.description}
                </ReactMarkdown>
              </div>
            )}
            <p>{bookmarkCount} bookmark(s)</p>
            <p>{subfolderCount} folder(s)</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Folder</span>
            <span>{format(folder.createdAt, "MMM d")}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default FolderCard;
