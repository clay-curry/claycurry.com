"use client";

import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { InitialsAvatar } from "@/lib/components/ui/initials-avatar";

interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function Guestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const cooldownRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    let cancelled = false;
    async function fetchEntries() {
      try {
        const res = await fetch("/api/guestbook");
        if (res.ok && !cancelled) {
          setEntries(await res.json());
        }
      } catch {
        // silent fail on load
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchEntries();
    return () => {
      cancelled = true;
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown || submitting) return;

    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName || !trimmedMessage) return;

    setSubmitting(true);

    // Optimistic entry
    const optimistic: GuestbookEntry = {
      id: crypto.randomUUID(),
      name: trimmedName,
      message: trimmedMessage,
      createdAt: new Date().toISOString(),
    };
    setEntries((prev) => [optimistic, ...prev]);
    setName("");
    setMessage("");

    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, message: trimmedMessage }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to sign guestbook");
      }

      const { entry } = await res.json();
      // Replace optimistic entry with real one
      setEntries((prev) =>
        prev.map((e) => (e.id === optimistic.id ? entry : e)),
      );
      toast.success("Thanks for signing the guestbook!");

      // 10s cooldown
      setCooldown(true);
      cooldownRef.current = setTimeout(() => setCooldown(false), 10_000);
    } catch (err) {
      // Revert optimistic update
      setEntries((prev) => prev.filter((e) => e.id !== optimistic.id));
      toast.error(
        err instanceof Error ? err.message : "Failed to sign guestbook",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="gb-name"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Name
          </label>
          <input
            type="text"
            id="gb-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            className="w-full px-4 md:px-5 py-3 md:py-3.5 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all text-sm md:text-base"
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label
            htmlFor="gb-message"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Message
          </label>
          <textarea
            id="gb-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={280}
            rows={3}
            className="w-full px-4 md:px-5 py-3 md:py-3.5 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all resize-none text-sm md:text-base"
            placeholder="Leave a message..."
            required
          />
          <div className="text-xs text-muted-foreground mt-1 text-right">
            {message.length}/280
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            data-click-id="guestbook:submit"
            disabled={submitting || cooldown}
            className="flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-3.5 bg-secondary text-secondary-foreground border border-input rounded-xl font-medium hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5 transition-all text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {cooldown ? "Wait..." : submitting ? "Signing..." : "Sign"}
          </button>
        </div>
      </form>

      {/* Entries */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
              key={i}
              className="flex gap-3 animate-pulse"
            >
              <div className="w-8 h-8 rounded-full bg-secondary shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-secondary rounded w-1/4" />
                <div className="h-3 bg-secondary rounded w-3/4" />
              </div>
            </div>
          ))
        ) : entries.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No entries yet. Be the first to sign!
          </p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="flex gap-3">
              <InitialsAvatar
                name={entry.name}
                size={32}
                className="shrink-0 mt-0.5"
              />
              <div className="min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-foreground">
                    {entry.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {relativeTime(entry.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 mt-0.5 break-words">
                  {entry.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
