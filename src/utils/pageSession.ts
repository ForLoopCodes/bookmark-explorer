/**
 * Utility functions for detecting page refreshes vs navigation and managing secure authentication
 */

const SESSION_STORAGE_KEY = "bookmark_explorer_page_session";
const NAVIGATION_MARKER_KEY = "bookmark_explorer_navigation";

export const isPageRefresh = (): boolean => {
  if (typeof window === "undefined") return false;

  try {
    // Check if this is a page refresh by looking at sessionStorage
    // If navigation marker exists, it means user is navigating within the app
    const hasNavigationMarker =
      sessionStorage.getItem(NAVIGATION_MARKER_KEY) !== null;
    const hasPageSession = sessionStorage.getItem(SESSION_STORAGE_KEY) !== null;

    if (!hasPageSession) {
      // First time loading the page
      sessionStorage.setItem(SESSION_STORAGE_KEY, "loaded");
      return false; // First visit
    }

    if (hasNavigationMarker) {
      // User is navigating within the app
      return false; // Internal navigation
    }

    return true; // Page refresh detected
  } catch (error) {
    console.warn("SessionStorage not available:", error);
    return true; // Default to requiring authentication
  }
};

export const markNavigation = (): void => {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(NAVIGATION_MARKER_KEY, "navigating");
    // Clear the marker after a short delay to allow for navigation
    setTimeout(() => {
      try {
        sessionStorage.removeItem(NAVIGATION_MARKER_KEY);
      } catch (error) {
        console.warn("SessionStorage not available:", error);
      }
    }, 1000);
  } catch (error) {
    console.warn("SessionStorage not available:", error);
  }
};

export const markPageLoaded = (): void => {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, "loaded");
  } catch (error) {
    console.warn("SessionStorage not available:", error);
  }
};

export const clearPageSession = (): void => {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(NAVIGATION_MARKER_KEY);
  } catch (error) {
    console.warn("SessionStorage not available:", error);
  }
};

/**
 * Additional data persistence helpers
 */

// Store a temporary backup of critical data in sessionStorage during operations
export const createTemporaryBackup = (
  bookmarks: any[],
  folders: any[]
): void => {
  if (typeof window === "undefined") return;

  try {
    const backup = {
      bookmarks,
      folders,
      timestamp: Date.now(),
    };
    sessionStorage.setItem("bookmark_explorer_backup", JSON.stringify(backup));
  } catch (error) {
    console.warn("Could not create temporary backup:", error);
  }
};

export const getTemporaryBackup = (): {
  bookmarks: any[];
  folders: any[];
} | null => {
  if (typeof window === "undefined") return null;

  try {
    const backupData = sessionStorage.getItem("bookmark_explorer_backup");
    if (!backupData) return null;

    const backup = JSON.parse(backupData);

    // Only return backup if it's less than 1 hour old
    if (Date.now() - backup.timestamp > 60 * 60 * 1000) {
      sessionStorage.removeItem("bookmark_explorer_backup");
      return null;
    }

    return {
      bookmarks: backup.bookmarks || [],
      folders: backup.folders || [],
    };
  } catch (error) {
    console.warn("Could not retrieve temporary backup:", error);
    return null;
  }
};

export const clearTemporaryBackup = (): void => {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem("bookmark_explorer_backup");
  } catch (error) {
    console.warn("SessionStorage not available:", error);
  }
};
