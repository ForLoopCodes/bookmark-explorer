export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  tags: string[];
  category?: string;
  folderId?: string;
  banner?: string;
  gallery?: string[];
  createdAt: Date;
  lastVisited?: Date;
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  banner?: string;
  parentId?: string;
  createdAt: Date;
}

export interface BookmarkData {
  bookmarks: Bookmark[];
  folders: Folder[];
}

export interface PasswordData {
  hash: string;
}

export type ViewMode = "grid" | "list";

export interface BreadcrumbItem {
  id?: string;
  name: string;
  path: string;
}
