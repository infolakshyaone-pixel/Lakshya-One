"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Bookmark, Loader2 } from "lucide-react";

type Props = {
  schoolId: string;
  initialFavourited: boolean;
  /** "dark" = used on dark hero/cover backgrounds, "light" = used on white cards */
  variant?: "light" | "dark";
};

type ApiErrorBody = {
  message?: string;
};

export default function FavouriteButton({
  schoolId,
  initialFavourited,
  variant = "light",
}: Props) {
  const { data: session, status } = useSession();
  const [favourited, setFavourited] = useState(initialFavourited);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

  if (status === "authenticated") {
    const role = session?.user?.role;
    if (role === "SCHOOL_ADMIN" || role === "ADMIN") {
      return null;
    }
  }

  function showMessage(text: string, type: "success" | "error" | "info") {
    setMessage(text);
    setMessageType(type);
    window.setTimeout(() => setMessage(null), 3000);
  }

  async function handleToggle() {
    setMessage(null);

    if (status === "loading") return;

    if (!session?.user) {
      showMessage("Please log in to save schools", "info");
      return;
    }

    if (session.user.role !== "PARENT") return;

    setLoading(true);

    try {
      const isRemoving = favourited;

      const response = await fetch(
        isRemoving
          ? `/api/parent/favourites?schoolId=${encodeURIComponent(schoolId)}`
          : "/api/parent/favourites",
        {
          method: isRemoving ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: isRemoving ? undefined : JSON.stringify({ schoolId }),
        }
      );

      if (response.status === 401) {
        showMessage("Session expired. Please sign out and sign in again.", "error");
        return;
      }

      const body = (await response.json().catch(() => ({}))) as ApiErrorBody;

      if (!response.ok) {
        showMessage(
          typeof body.message === "string"
            ? body.message
            : "Failed to update saved schools. Please try again.",
          "error"
        );
        return;
      }

      setFavourited(!isRemoving);
      showMessage(
        isRemoving ? "Removed from saved schools" : "School saved successfully",
        "success"
      );
    } catch {
      showMessage("Unable to reach the server. Please try again later.", "error");
    } finally {
      setLoading(false);
    }
  }

  const messageClassName =
    messageType === "success"
      ? "text-success-text bg-white"
      : messageType === "error"
        ? "text-danger-text bg-white"
        : "text-gray-600 bg-white";

  const buttonClassName =
    variant === "dark"
      ? "flex items-center justify-center h-10 w-10 rounded-full bg-white/15 border border-white/30 text-white hover:bg-white/25 transition-colors flex-shrink-0"
      : "flex items-center justify-center h-10 w-10 rounded-full bg-white border border-gray-200 text-blue-600 hover:text-blue-800 hover:border-blue-200 transition-colors flex-shrink-0";

  return (
    // relative wrapper so the toast message floats instead of pushing layout
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading || status === "loading"}
        aria-pressed={favourited}
        aria-label={favourited ? "Remove from saved schools" : "Save school"}
        className={buttonClassName}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Bookmark className={`h-4 w-4 ${favourited ? "fill-current" : ""}`} />
        )}
      </button>

      {message && (
        <p
          className={`absolute top-full right-0 mt-2 whitespace-nowrap rounded-lg px-2.5 py-1 shadow-md font-body text-meta z-20 ${messageClassName}`}
        >
          {message}
        </p>
      )}
    </div>
  );
} 