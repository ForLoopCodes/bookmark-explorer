"use client";

import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useSearchParams } from "next/navigation";
import MainLayout from "@/components/MainLayout";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { useSelection } from "@/contexts/SelectionContext";
import { filterBookmarksByFolder } from "@/utils/search";
import { getFolderPath, getFolderChildren } from "@/utils/folders";
import BookmarkCard from "@/components/BookmarkCard";
import FolderCard from "@/components/FolderCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import SearchBar from "@/components/SearchBar";
import BookmarkModal from "@/components/BookmarkModal";
import CreateFolderModal from "@/components/CreateFolderModal";
import MultiSelectToolbar from "@/components/MultiSelectToolbar";
import MoveToFolderModal from "@/components/MoveToFolderModal";
import {
  PlusIcon,
  FolderPlusIcon,
  Squares2X2Icon,
  ListBulletIcon,
  Square3Stack3DIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Bookmark, ViewMode, Folder } from "@/types";

interface ExplorerPageProps {
  params: {
    folderId?: string[];
  };
}

const ExplorerPage: React.FC<ExplorerPageProps> = ({ params }) => {
  const {
    bookmarks,
    folders,
    deleteBookmark,
    deleteFolder,
    updateBookmark,
    updateFolder,
    setCurrentFolder,
  } = useBookmarks();

  const {
    isSelectionMode,
    setSelectionMode,
    selectAll,
    clearSelection,
    selectedItems,
  } = useSelection();

  const searchParams = useSearchParams();
  const folderId = params?.folderId?.[0]; // Get first segment or undefined

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<
    Bookmark | undefined
  >();
  const [editingFolder, setEditingFolder] = useState<
    { id: string; name: string; description?: string } | undefined
  >();
  const [searchResults, setSearchResults] = useState<{
    bookmarks: Bookmark[];
    folders: Folder[];
  } | null>(null);

  useEffect(() => {
    setCurrentFolder(folderId);
  }, [folderId, setCurrentFolder]);

  useEffect(() => {
    // Check if we should open the add bookmark modal
    if (searchParams.get("add") === "true") {
      setShowBookmarkModal(true);
    }
  }, [searchParams]);

  const currentFolderBookmarks = filterBookmarksByFolder(bookmarks, folderId);
  const currentFolderSubfolders = getFolderChildren(folderId, folders);
  const breadcrumbs = getFolderPath(folderId, folders);

  const displayBookmarks =
    searchResults !== null ? searchResults.bookmarks : currentFolderBookmarks;
  const displayFolders =
    searchResults !== null ? searchResults.folders : currentFolderSubfolders;

  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setShowBookmarkModal(true);
  };

  const handleEditFolder = (folder: {
    id: string;
    name: string;
    description?: string;
  }) => {
    setEditingFolder(folder);
    setShowFolderModal(true);
  };

  const handleCloseBookmarkModal = () => {
    setShowBookmarkModal(false);
    setEditingBookmark(undefined);
  };

  const handleCloseFolderModal = () => {
    setShowFolderModal(false);
    setEditingFolder(undefined);
  };

  const handleDrop = (
    itemId: string,
    itemType: "bookmark" | "folder",
    targetFolderId: string
  ) => {
    if (itemType === "bookmark") {
      updateBookmark(itemId, { folderId: targetFolderId });
    } else if (itemType === "folder") {
      updateFolder(itemId, { parentId: targetFolderId });
    }
  };

  const handleSearchResults = (results: {
    bookmarks: Bookmark[];
    folders: Folder[];
  }) => {
    setSearchResults(results);
  };

  const handleClearSearch = () => {
    setSearchResults(null);
  };

  const handleToggleSelectionMode = () => {
    if (isSelectionMode) {
      clearSelection();
      setSelectionMode(false);
    } else {
      setSelectionMode(true);
    }
  };

  const handleSelectAll = () => {
    selectAll(displayBookmarks, displayFolders);
  };

  const handleMoveToFolder = () => {
    setShowMoveModal(true);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <MainLayout>
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <Breadcrumbs items={breadcrumbs} />

              <div className="flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "grid"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    title="Grid View"
                  >
                    <Squares2X2Icon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "list"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    title="List View"
                  >
                    <ListBulletIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  {/* Multi-select toggle */}
                  <button
                    onClick={handleToggleSelectionMode}
                    className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                      isSelectionMode
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {isSelectionMode ? (
                      <>
                        <XMarkIcon className="w-4 h-4 mr-2" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Square3Stack3DIcon className="w-4 h-4 mr-2" />
                        Select
                      </>
                    )}
                  </button>

                  {/* Select All button (only show in selection mode) */}
                  {isSelectionMode && (
                    <button
                      onClick={handleSelectAll}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                    >
                      Select All
                    </button>
                  )}

                  {!isSelectionMode && (
                    <>
                      <button
                        onClick={() => setShowFolderModal(true)}
                        className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <FolderPlusIcon className="w-4 h-4 mr-2" />
                        New Folder
                      </button>

                      <button
                        onClick={() => setShowBookmarkModal(true)}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add Bookmark
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <SearchBar
              onResults={handleSearchResults}
              onClear={handleClearSearch}
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {/* Folders */}
            {((searchResults === null && currentFolderSubfolders.length > 0) ||
              (searchResults !== null && displayFolders.length > 0)) && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  {searchResults !== null
                    ? `Folders (${displayFolders.length})`
                    : "Folders"}
                </h3>
                <div
                  className={`grid gap-4 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
                      : "grid-cols-1"
                  }`}
                >
                  {displayFolders.map((folder: Folder) => (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      viewMode={viewMode}
                      onEdit={handleEditFolder}
                      onDelete={deleteFolder}
                      onDrop={handleDrop}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Bookmarks and Search Results */}
            {displayBookmarks.length > 0 ||
            (searchResults !== null && displayFolders.length > 0) ? (
              <div>
                {searchResults === null && (
                  <h3 className="text-sm font-medium text-gray-700 mb-4">
                    Bookmarks ({displayBookmarks.length})
                  </h3>
                )}
                {searchResults !== null && (
                  <h3 className="text-sm font-medium text-gray-700 mb-4">
                    Bookmarks ({displayBookmarks.length})
                  </h3>
                )}
                <div
                  className={`grid gap-4 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                      : "grid-cols-1"
                  }`}
                >
                  {displayBookmarks.map((bookmark) => (
                    <BookmarkCard
                      key={bookmark.id}
                      bookmark={bookmark}
                      viewMode={viewMode}
                      onEdit={handleEditBookmark}
                      onDelete={deleteBookmark}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {/* Empty State */}
            {displayBookmarks.length === 0 && displayFolders.length === 0 && (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  {searchResults !== null ? (
                    <>
                      <div className="text-gray-400 mb-4">
                        <Squares2X2Icon className="w-12 h-12 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No results found
                      </h3>
                      <p className="text-gray-600">
                        Try adjusting your search terms or filters.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-gray-400 mb-4">
                        <PlusIcon className="w-12 h-12 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        This folder is empty
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Add your first bookmark or create a subfolder to get
                        started.
                      </p>
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={() => setShowBookmarkModal(true)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Add Bookmark
                        </button>
                        <button
                          onClick={() => setShowFolderModal(true)}
                          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          Create Folder
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {showBookmarkModal && (
          <BookmarkModal
            onClose={handleCloseBookmarkModal}
            editBookmark={editingBookmark}
            defaultFolderId={folderId}
          />
        )}

        {showFolderModal && (
          <CreateFolderModal
            onClose={handleCloseFolderModal}
            parentId={folderId}
            editFolder={editingFolder}
          />
        )}

        {/* Multi-select toolbar */}
        <MultiSelectToolbar onMoveToFolder={handleMoveToFolder} />

        {/* Move to folder modal */}
        {showMoveModal && (
          <MoveToFolderModal
            isOpen={showMoveModal}
            onClose={() => setShowMoveModal(false)}
          />
        )}
      </MainLayout>
    </DndProvider>
  );
};

export default ExplorerPage;
