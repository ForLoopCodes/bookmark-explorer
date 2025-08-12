import Fuse from 'fuse.js';
import { Bookmark } from '@/types';

const searchOptions = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'url', weight: 0.3 },
    { name: 'description', weight: 0.2 },
    { name: 'tags', weight: 0.1 },
  ],
  threshold: 0.3, // Lower = more strict matching
  includeScore: true,
  includeMatches: true,
};

export const searchBookmarks = (bookmarks: Bookmark[], query: string): Bookmark[] => {
  if (!query.trim()) {
    return bookmarks;
  }

  const fuse = new Fuse(bookmarks, searchOptions);
  const results = fuse.search(query);
  
  return results.map(result => result.item);
};

export const filterBookmarksByCategory = (bookmarks: Bookmark[], category: string): Bookmark[] => {
  if (!category) return bookmarks;
  return bookmarks.filter(bookmark => bookmark.category === category);
};

export const filterBookmarksByTags = (bookmarks: Bookmark[], tags: string[]): Bookmark[] => {
  if (tags.length === 0) return bookmarks;
  return bookmarks.filter(bookmark => 
    tags.some(tag => bookmark.tags.includes(tag))
  );
};

export const filterBookmarksByFolder = (bookmarks: Bookmark[], folderId?: string): Bookmark[] => {
  return bookmarks.filter(bookmark => bookmark.folderId === folderId);
};

export const getRecentBookmarks = (bookmarks: Bookmark[], limit: number = 10): Bookmark[] => {
  return [...bookmarks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

export const getSuggestedBookmarks = (bookmarks: Bookmark[], limit: number = 10): Bookmark[] => {
  return [...bookmarks]
    .filter(bookmark => bookmark.lastVisited)
    .sort((a, b) => {
      const aTime = a.lastVisited ? new Date(a.lastVisited).getTime() : 0;
      const bTime = b.lastVisited ? new Date(b.lastVisited).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, limit);
};

export const getAllCategories = (bookmarks: Bookmark[]): string[] => {
  const categories = new Set<string>();
  bookmarks.forEach(bookmark => {
    if (bookmark.category) {
      categories.add(bookmark.category);
    }
  });
  return Array.from(categories).sort();
};

export const getAllTags = (bookmarks: Bookmark[]): string[] => {
  const tags = new Set<string>();
  bookmarks.forEach(bookmark => {
    bookmark.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
};
