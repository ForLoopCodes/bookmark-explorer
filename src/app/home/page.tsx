"use client";

import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import MainLayout from "@/components/MainLayout";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { getRecentBookmarks, getSuggestedBookmarks } from "@/utils/search";
import BookmarkCard from "@/components/BookmarkCard";
import SecureLink from "@/components/SecureLink";
import { ClockIcon, StarIcon, PlusIcon } from "@heroicons/react/24/outline";

const HomePage: React.FC = () => {
  const { bookmarks } = useBookmarks();

  const recentBookmarks = getRecentBookmarks(bookmarks, 8);
  const suggestedBookmarks = getSuggestedBookmarks(bookmarks, 8);

  return (
    <DndProvider backend={HTML5Backend}>
      <MainLayout>
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to Bookmark Explorer
              </h1>
              <p className="text-gray-600 mb-4">
                Manage your bookmarks with security and ease. All data is
                encrypted and stored locally in your browser.
              </p>
              <div className="flex space-x-4">
                <SecureLink
                  href="/explorer"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Browse All Bookmarks
                </SecureLink>
                <SecureLink
                  href="/explorer?add=true"
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Bookmark
                </SecureLink>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <PlusIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {bookmarks.length}
                    </p>
                    <p className="text-sm text-gray-600">Total Bookmarks</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {recentBookmarks.length}
                    </p>
                    <p className="text-sm text-gray-600">Recent Bookmarks</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <StarIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {suggestedBookmarks.length}
                    </p>
                    <p className="text-sm text-gray-600">Frequently Visited</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookmarks */}
            {recentBookmarks.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ClockIcon className="w-5 h-5 text-gray-400 mr-2" />
                      <h2 className="text-lg font-semibold text-gray-900">
                        Recent Bookmarks
                      </h2>
                    </div>
                    <SecureLink
                      href="/explorer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View All
                    </SecureLink>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {recentBookmarks.map((bookmark) => (
                      <BookmarkCard
                        key={bookmark.id}
                        bookmark={bookmark}
                        viewMode="grid"
                        onEdit={() => {}}
                        onDelete={() => {}}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Suggested Bookmarks */}
            {suggestedBookmarks.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <StarIcon className="w-5 h-5 text-gray-400 mr-2" />
                      <h2 className="text-lg font-semibold text-gray-900">
                        Frequently Visited
                      </h2>
                    </div>
                    <SecureLink
                      href="/explorer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View All
                    </SecureLink>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {suggestedBookmarks.map((bookmark) => (
                      <BookmarkCard
                        key={bookmark.id}
                        bookmark={bookmark}
                        viewMode="grid"
                        onEdit={() => {}}
                        onDelete={() => {}}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {bookmarks.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <PlusIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No bookmarks yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start building your bookmark collection by adding your first
                    bookmark.
                  </p>
                  <SecureLink
                    href="/explorer?add=true"
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Your First Bookmark
                  </SecureLink>
                </div>
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    </DndProvider>
  );
};

export default HomePage;
