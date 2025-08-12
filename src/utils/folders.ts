import { Folder, BreadcrumbItem } from "@/types";

export const getFolderPath = (
  folderId: string | undefined,
  folders: Folder[]
): BreadcrumbItem[] => {
  if (!folderId) {
    return [{ name: "Home", path: "/" }];
  }

  const path: BreadcrumbItem[] = [];
  let currentFolderId: string | undefined = folderId;

  while (currentFolderId) {
    const folder = folders.find((f) => f.id === currentFolderId);
    if (!folder) break;

    path.unshift({
      id: folder.id,
      name: folder.name,
      path: `/explorer/${folder.id}`,
    });

    currentFolderId = folder.parentId;
  }

  path.unshift({ name: "Home", path: "/explorer" });

  return path;
};

export const getFolderChildren = (
  parentId: string | undefined,
  folders: Folder[]
): Folder[] => {
  return folders.filter((folder) => folder.parentId === parentId);
};

export const getFolderHierarchy = (folders: Folder[]): Folder[] => {
  // Get root folders (no parent)
  const rootFolders = folders.filter((folder) => !folder.parentId);

  // Sort by name
  return rootFolders.sort((a, b) => a.name.localeCompare(b.name));
};

export const getFolderTree = (folders: Folder[], parentId?: string): any[] => {
  const children = folders
    .filter((folder) => folder.parentId === parentId)
    .sort((a, b) => a.name.localeCompare(b.name));

  return children.map((folder) => ({
    ...folder,
    children: getFolderTree(folders, folder.id),
  }));
};

export const canDeleteFolder = (
  folderId: string,
  folders: Folder[]
): boolean => {
  // Check if folder has any subfolders
  const hasSubfolders = folders.some((folder) => folder.parentId === folderId);
  return !hasSubfolders;
};

export const deleteFolderRecursive = (
  folderId: string,
  folders: Folder[]
): string[] => {
  const deletedIds: string[] = [];

  // Find all subfolders
  const subfolders = folders.filter((folder) => folder.parentId === folderId);

  // Recursively delete subfolders
  subfolders.forEach((subfolder) => {
    const subDeletedIds = deleteFolderRecursive(subfolder.id, folders);
    deletedIds.push(...subDeletedIds);
  });

  // Add current folder to deletion list
  deletedIds.push(folderId);

  return deletedIds;
};
