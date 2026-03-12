"use client";

import { useEffect } from "react";

export default function BlogPostError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Blog post error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-8">
      <h2 className="text-xl font-semibold text-foreground">
        Failed to load article
      </h2>
      <p className="text-muted-foreground text-sm text-center max-w-md">
        {error.message || "This article could not be loaded."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity text-sm"
      >
        Try again
      </button>
    </div>
  );
}
