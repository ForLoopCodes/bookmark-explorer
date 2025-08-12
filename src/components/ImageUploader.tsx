"use client";

import React, { useState, useRef, useCallback } from "react";
import { PhotoIcon, XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import {
  handleClipboardPaste,
  fileToBase64,
  validateImageFile,
  compressImage,
} from "@/utils/clipboard";

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  isBanner?: boolean;
  placeholder?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  isBanner = false,
  placeholder,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    async (files: FileList) => {
      setIsUploading(true);
      const newImages: string[] = [];

      for (
        let i = 0;
        i < files.length && images.length + newImages.length < maxImages;
        i++
      ) {
        const file = files[i];
        if (validateImageFile(file)) {
          try {
            const compressed = await compressImage(file);
            newImages.push(compressed);
          } catch (error) {
            console.error("Failed to process image:", error);
          }
        }
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
      }
      setIsUploading(false);
    },
    [images, maxImages, onImagesChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files);
      }
    },
    [handleFileUpload]
  );

  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      if (images.length >= maxImages) return;

      const imageData = await handleClipboardPaste(e);
      if (imageData) {
        onImagesChange([...images, imageData]);
      }
    },
    [images, maxImages, onImagesChange]
  );

  const removeImage = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
    },
    [images, onImagesChange]
  );

  React.useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (document.activeElement?.closest(".image-uploader")) {
        handlePaste(e);
      }
    };

    document.addEventListener("paste", handleGlobalPaste);
    return () => document.removeEventListener("paste", handleGlobalPaste);
  }, [handlePaste]);

  const canAddMore = images.length < maxImages;

  return (
    <div className="image-uploader">
      {/* Image Grid */}
      {images.length > 0 && (
        <div
          className={`grid gap-2 mb-4 ${
            isBanner ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"
          }`}
        >
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Upload ${index + 1}`}
                className={`w-full object-cover rounded-lg ${
                  isBanner ? "h-32" : "h-24"
                }`}
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <div>
          {/* Paste Area */}
          <div
            className="border-2 border-dashed border-blue-300 rounded-lg p-4 mb-3 bg-blue-50 text-center"
            tabIndex={0}
            onFocus={(e) => e.target.classList.add("ring-2", "ring-blue-500")}
            onBlur={(e) => e.target.classList.remove("ring-2", "ring-blue-500")}
          >
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm font-medium">
                Click here and press Ctrl+V to paste image
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Copy any image and paste it directly here
            </p>
          </div>

          {/* Traditional Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              {placeholder ||
                (isBanner ? "Upload banner image" : "Upload images")}
            </p>
            <p className="text-xs text-gray-500 mb-2">
              Drag & drop or click to browse files
            </p>
            <p className="text-xs text-gray-400">
              {isBanner ? "Recommended: 1200x400px" : "Max 10MB per image"} •
              {maxImages - images.length} remaining
            </p>

            {isUploading && (
              <div className="mt-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple={!isBanner}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files) {
            handleFileUpload(files);
          }
        }}
      />
    </div>
  );
};

export default ImageUploader;
