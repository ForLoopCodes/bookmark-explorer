"use client";

import React, { useState } from "react";
import SecureLink from "./SecureLink";
import { usePathname, useRouter } from "next/navigation";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { getFolderTree } from "@/utils/folders";
import {
  HomeIcon,
  FolderIcon,
  FolderOpenIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  Bars3Icon,
  PlusIcon,
} from "@heroicons/react/24/outline";
// import CreateFolderModal from "./CreateFolderModal";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface FolderTreeItemProps {
  folder: any;
  level: number;
  collapsed: boolean;
  expandedFolders: Set<string>;
  onToggleExpand: (folderId: string) => void;
}

const FolderTreeItem: React.FC<FolderTreeItemProps> = ({
  folder,
  level,
  collapsed,
  expandedFolders,
  onToggleExpand,
}) => {
  const pathname = usePathname();
  const isExpanded = expandedFolders.has(folder.id);
  const hasChildren = folder.children && folder.children.length > 0;
  const isActive = pathname === `/explorer/${folder.id}`;

  const paddingLeft = collapsed ? "pl-2" : `pl-${2 + level * 4}`;

  return (
    <div>
      <div
        className={`flex items-center ${paddingLeft} py-2 px-2 hover:bg-gray-100 cursor-pointer ${
          isActive ? "bg-blue-50 border-r-2 border-blue-500" : ""
        }`}
      >
        {hasChildren && !collapsed && (
          <button
            onClick={() => onToggleExpand(folder.id)}
            className="mr-1 p-0.5 hover:bg-gray-200 rounded"
          >
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            )}
          </button>
        )}

        <SecureLink
          href={`/explorer/${folder.id}`}
          className="flex items-center flex-1 min-w-0"
        >
          {isActive ? (
            <FolderOpenIcon className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
          ) : (
            <FolderIcon className="w-5 h-5 text-gray-600 mr-2 flex-shrink-0" />
          )}

          {!collapsed && (
            <span
              className={`truncate text-sm ${
                isActive ? "text-blue-600 font-medium" : "text-gray-700"
              }`}
            >
              {folder.name}
            </span>
          )}
        </SecureLink>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && !collapsed && (
        <div>
          {folder.children.map((child: any) => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              level={level + 1}
              collapsed={collapsed}
              expandedFolders={expandedFolders}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { folders } = useBookmarks();
  const pathname = usePathname();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  const folderTree = getFolderTree(folders);

  const toggleExpand = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const isHomeActive = pathname === "/" || pathname === "/home";
  const isExplorerActive = pathname === "/explorer";

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bars3Icon className="w-5 h-5 text-gray-600" />
          </button>

          {!collapsed && (
            <button
              onClick={() => setShowCreateFolder(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Create Folder"
            >
              <PlusIcon className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {/* Home */}
          <SecureLink
            href="/home"
            className={`flex items-center px-4 py-2 mx-2 rounded-lg transition-colors ${
              isHomeActive
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <HomeIcon className="w-5 h-5 mr-3 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Home</span>}
          </SecureLink>

          {/* Explorer */}
          <SecureLink
            href="/explorer"
            className={`flex items-center px-4 py-2 mx-2 rounded-lg transition-colors ${
              isExplorerActive
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FolderIcon className="w-5 h-5 mr-3 flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium">All Bookmarks</span>
            )}
          </SecureLink>

          {/* Folders */}
          {!collapsed && (
            <div className="mt-6">
              <div className="px-4 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Folders
                </h3>
              </div>

              <div className="space-y-1">
                {folderTree.map((folder) => (
                  <FolderTreeItem
                    key={folder.id}
                    folder={folder}
                    level={0}
                    collapsed={collapsed}
                    expandedFolders={expandedFolders}
                    onToggleExpand={toggleExpand}
                  />
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Create Folder Modal */}
      {/* {showCreateFolder && (
        <CreateFolderModal
          onClose={() => setShowCreateFolder(false)}
          parentId={undefined}
        />
      )} */}
    </>
  );
};

export default Sidebar;
