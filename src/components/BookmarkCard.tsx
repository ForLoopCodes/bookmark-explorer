'use client';

import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { format } from 'date-fns';
import { 
  LinkIcon, 
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  TagIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { Bookmark } from '@/types';
import { useBookmarks } from '@/contexts/BookmarkContext';

interface BookmarkCardProps {
  bookmark: Bookmark;
  viewMode: 'grid' | 'list';
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({ 
  bookmark, 
  viewMode, 
  onEdit, 
  onDelete 
}) => {
  const { markBookmarkVisited } = useBookmarks();
  const [showMenu, setShowMenu] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: 'bookmark',
    item: { id: bookmark.id, type: 'bookmark' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleOpenLink = (e: React.MouseEvent) => {
    e.preventDefault();
    markBookmarkVisited(bookmark.id);
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(bookmark);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (window.confirm('Are you sure you want to delete this bookmark?')) {
      onDelete(bookmark.id);
    }
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const faviconUrl = getFaviconUrl(bookmark.url);

  if (viewMode === 'list') {
    return (
      <div
        ref={drag as any}
        className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer relative ${
          isDragging ? 'opacity-50' : ''
        }`}
        onClick={handleOpenLink}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Favicon */}
            <div className="flex-shrink-0">
              {faviconUrl ? (
                <img 
                  src={faviconUrl} 
                  alt="" 
                  className="w-6 h-6"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <LinkIcon className="w-6 h-6 text-gray-400" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {bookmark.title}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {bookmark.url}
              </p>
              {bookmark.description && (
                <p className="text-xs text-gray-600 truncate mt-1">
                  {bookmark.description}
                </p>
              )}
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
                  <span>{bookmark.tags.slice(0, 2).join(', ')}</span>
                  {bookmark.tags.length > 2 && <span>+{bookmark.tags.length - 2}</span>}
                </div>
              )}

              <div className="flex items-center space-x-1">
                <CalendarIcon className="w-3 h-3" />
                <span>{format(bookmark.createdAt, 'MMM d, yyyy')}</span>
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
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-32">
                <button
                  onClick={handleEdit}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenLink(e);
                  }}
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
      className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer relative ${
        isDragging ? 'opacity-50' : ''
      }`}
      onClick={handleOpenLink}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {faviconUrl ? (
            <img 
              src={faviconUrl} 
              alt="" 
              className="w-6 h-6 flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <LinkIcon className="w-6 h-6 text-gray-400 flex-shrink-0" />
          )}
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {bookmark.title}
          </h3>
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
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-32">
              <button
                onClick={handleEdit}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenLink(e);
                }}
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

      {/* URL */}
      <p className="text-xs text-gray-500 truncate mb-2">
        {bookmark.url}
      </p>

      {/* Description */}
      {bookmark.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {bookmark.description}
        </p>
      )}

      {/* Tags */}
      {bookmark.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {bookmark.tags.slice(0, 3).map(tag => (
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

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        {bookmark.category && (
          <span className="bg-gray-100 px-2 py-1 rounded">
            {bookmark.category}
          </span>
        )}
        <span>{format(bookmark.createdAt, 'MMM d')}</span>
      </div>
    </div>
  );
};

export default BookmarkCard;
