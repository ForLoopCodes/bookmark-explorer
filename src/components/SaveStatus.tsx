"use client";

import React from "react";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { CheckCircleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";

const SaveStatus: React.FC = () => {
  const { isSaving, lastSaved } = useBookmarks();

  if (isSaving) {
    return (
      <div className="flex items-center text-sm text-gray-600">
        <ArrowPathIcon className="w-4 h-4 mr-1 animate-spin" />
        Saving...
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center text-sm text-gray-500">
        <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" />
        Saved {format(lastSaved, "HH:mm:ss")}
      </div>
    );
  }

  return null;
};

export default SaveStatus;
