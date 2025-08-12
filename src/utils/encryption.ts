import CryptoJS from "crypto-js";
import { BookmarkData, PasswordData } from "@/types";

const STORAGE_KEYS = {
  PASSWORD_HASH: "bookmark_explorer_password",
  ENCRYPTED_DATA: "bookmark_explorer_data",
};

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

export const savePasswordHash = (passwordHash: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.PASSWORD_HASH, passwordHash);
};

export const getPasswordHash = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.PASSWORD_HASH);
};

export const saveEncryptedData = (encryptedData: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.ENCRYPTED_DATA, encryptedData);
};

export const getEncryptedData = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.ENCRYPTED_DATA);
};

export const clearAllData = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.PASSWORD_HASH);
  localStorage.removeItem(STORAGE_KEYS.ENCRYPTED_DATA);
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
