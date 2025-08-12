import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BookmarkProvider } from "@/contexts/BookmarkContext";
import { SelectionProvider } from "@/contexts/SelectionContext";
import AuthGuard from "@/components/AuthGuard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bookmark Explorer",
  description: "A secure, local bookmark management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BookmarkProvider>
          <SelectionProvider>
            <AuthGuard>{children}</AuthGuard>
          </SelectionProvider>
        </BookmarkProvider>
      </body>
    </html>
  );
}
