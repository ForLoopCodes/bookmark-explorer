import CryptoJS from "crypto-js";
import { BookmarkData } from "@/types";

const STORAGE_KEYS = {
  PASSWORD_HASH: "bookmark_explorer_password",
  ENCRYPTED_DATA: "bookmark_explorer_data",
  SESSION_TOKEN: "bookmark_explorer_session",
  NAVIGATION_TOKEN: "bookmark_explorer_nav", // For tracking navigation vs refresh
};

// Cookie utilities
const setCookie = (name: string, value: string, days: number = 1): void => {
  if (typeof window === "undefined") return;

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  document.cookie = `${name}=${encodeURIComponent(
    value
  )};expires=${expires.toUTCString()};path=/;SameSite=Strict;Secure=${
    window.location.protocol === "https:"
  }`;
};

const getCookie = (name: string): string | null => {
  if (typeof window === "undefined") return null;

  const nameEQ = name + "=";
  const ca = document.cookie.split(";");

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
};

const deleteCookie = (name: string): void => {
  if (typeof window === "undefined") return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Enhanced storage functions that use both localStorage and cookies
export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString();
};

export const encryptData = (data: BookmarkData, password: string): string => {
  const jsonString = JSON.stringify(data, null, 2);
  return CryptoJS.AES.encrypt(jsonString, password).toString();
};

export const decryptData = (
  encryptedData: string,
  password: string
): BookmarkData | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, password);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedString) {
      return null;
    }

    const parsed = JSON.parse(decryptedString);

    // Convert date strings back to Date objects
    const bookmarks = parsed.bookmarks.map((bookmark: any) => ({
      ...bookmark,
      createdAt: new Date(bookmark.createdAt),
      lastVisited: bookmark.lastVisited
        ? new Date(bookmark.lastVisited)
        : undefined,
    }));

    const folders = parsed.folders.map((folder: any) => ({
      ...folder,
      createdAt: new Date(folder.createdAt),
    }));

    return { bookmarks, folders };
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};

// Enhanced password hash storage with cookie fallback
export const savePasswordHash = (passwordHash: string): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEYS.PASSWORD_HASH, passwordHash);
  } catch (error) {
    console.warn("localStorage unavailable, using cookies:", error);
  }

  // Also save in cookies as fallback
  setCookie(STORAGE_KEYS.PASSWORD_HASH, passwordHash, 30); // 30 days
};

export const getPasswordHash = (): string | null => {
  if (typeof window === "undefined") return null;

  try {
    const fromLocalStorage = localStorage.getItem(STORAGE_KEYS.PASSWORD_HASH);
    if (fromLocalStorage) return fromLocalStorage;
  } catch (error) {
    console.warn("localStorage unavailable, trying cookies:", error);
  }

  // Fallback to cookies
  return getCookie(STORAGE_KEYS.PASSWORD_HASH);
};

// Enhanced encrypted data storage with cookie fallback for smaller data
export const saveEncryptedData = (encryptedData: string): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEYS.ENCRYPTED_DATA, encryptedData);
  } catch (error) {
    console.warn("localStorage unavailable for data storage:", error);
    // For cookies, we can only store smaller amounts of data
    // In this case, we'll still try but it might fail for large datasets
    if (encryptedData.length < 3000) {
      // Rough cookie size limit
      setCookie(STORAGE_KEYS.ENCRYPTED_DATA, encryptedData, 30);
    }
  }
};

export const getEncryptedData = (): string | null => {
  if (typeof window === "undefined") return null;

  try {
    const fromLocalStorage = localStorage.getItem(STORAGE_KEYS.ENCRYPTED_DATA);
    if (fromLocalStorage) return fromLocalStorage;
  } catch (error) {
    console.warn("localStorage unavailable, trying cookies:", error);
  }

  // Fallback to cookies
  return getCookie(STORAGE_KEYS.ENCRYPTED_DATA);
};

// Session management for maintaining login state ONLY during navigation
export const createNavigationToken = (): string => {
  const timestamp = Date.now().toString();
  const randomData = Math.random().toString(36);
  return CryptoJS.SHA256(timestamp + randomData).toString();
};

export const saveNavigationToken = (token: string): void => {
  if (typeof window === "undefined") return;

  // Only save in sessionStorage - this will be cleared on page refresh
  try {
    sessionStorage.setItem(STORAGE_KEYS.NAVIGATION_TOKEN, token);
  } catch (error) {
    console.warn("SessionStorage unavailable for navigation token:", error);
  }
};

export const getNavigationToken = (): string | null => {
  if (typeof window === "undefined") return null;

  try {
    return sessionStorage.getItem(STORAGE_KEYS.NAVIGATION_TOKEN);
  } catch (error) {
    console.warn("SessionStorage unavailable:", error);
    return null;
  }
};

export const clearNavigationToken = (): void => {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(STORAGE_KEYS.NAVIGATION_TOKEN);
  } catch (error) {
    console.warn("SessionStorage unavailable:", error);
  }
};

// Enhanced session token that works with navigation tokens
export const createSessionToken = (password: string): string => {
  const timestamp = Date.now().toString();
  const sessionData = { timestamp, hash: hashPassword(password + timestamp) };
  return CryptoJS.AES.encrypt(JSON.stringify(sessionData), password).toString();
};

export const saveSessionToken = (sessionToken: string): void => {
  if (typeof window === "undefined") return;

  // IMPORTANT: Only save in sessionStorage for navigation persistence
  // Do NOT save in localStorage or cookies to force re-authentication on page refresh
  try {
    sessionStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, sessionToken);
  } catch (error) {
    console.warn("SessionStorage unavailable for session:", error);
  }

  // DO NOT save in cookies - we want to require password on page refresh
  // setCookie(STORAGE_KEYS.SESSION_TOKEN, sessionToken, 1); // Removed for security
};

export const getSessionToken = (): string | null => {
  if (typeof window === "undefined") return null;

  // Only check sessionStorage - no persistent session across page refresh
  try {
    return sessionStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
  } catch (error) {
    console.warn("SessionStorage unavailable:", error);
    return null;
  }
};

export const validateSessionToken = (
  sessionToken: string,
  password: string
): boolean => {
  try {
    const bytes = CryptoJS.AES.decrypt(sessionToken, password);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedString) return false;

    const sessionData = JSON.parse(decryptedString);
    const { timestamp, hash } = sessionData;

    // Check if session is not older than 24 hours
    const sessionAge = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (sessionAge > maxAge) return false;

    // Validate hash
    const expectedHash = hashPassword(password + timestamp);
    return hash === expectedHash;
  } catch (error) {
    console.error("Session validation failed:", error);
    return false;
  }
};

export const clearSessionToken = (): void => {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
  } catch (error) {
    console.warn("SessionStorage unavailable:", error);
  }

  // Also clear navigation token
  clearNavigationToken();
};

// Enhanced clear all data function
export const clearAllData = (): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEYS.PASSWORD_HASH);
    localStorage.removeItem(STORAGE_KEYS.ENCRYPTED_DATA);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.NAVIGATION_TOKEN);
  } catch (error) {
    console.warn("Storage unavailable:", error);
  }

  // Clear cookies
  deleteCookie(STORAGE_KEYS.PASSWORD_HASH);
  deleteCookie(STORAGE_KEYS.ENCRYPTED_DATA);
};

export const isPasswordSet = (): boolean => {
  return getPasswordHash() !== null;
};

export const verifyPassword = (password: string): boolean => {
  const savedHash = getPasswordHash();
  if (!savedHash) return false;

  const inputHash = hashPassword(password);
  return inputHash === savedHash;
};

// Function to attempt automatic login restoration
export const attemptSessionRestore = (): {
  success: boolean;
  password?: string;
} => {
  const sessionToken = getSessionToken();
  if (!sessionToken) return { success: false };

  const passwordHash = getPasswordHash();
  if (!passwordHash) return { success: false };

  // We need to try different approaches since we can't directly recover the password
  // This is a limitation of secure password handling - we'll need user to re-enter password
  // But we can at least detect that there was a valid session

  return { success: false }; // For security, we'll require re-authentication
};

// Check if there's existing data that suggests user should log back in
export const hasExistingSession = (): boolean => {
  const hasPassword = isPasswordSet();
  const hasData = getEncryptedData() !== null;

  // We deliberately DON'T check for active session token here
  // This function should return true if user has data but is not currently authenticated
  return hasPassword && hasData;
};

// Check if user is currently authenticated (has valid session for navigation)
export const hasActiveSession = (): boolean => {
  const sessionToken = getSessionToken();
  const navigationToken = getNavigationToken();

  // User is considered authenticated if they have both tokens in sessionStorage
  return sessionToken !== null && navigationToken !== null;
};
