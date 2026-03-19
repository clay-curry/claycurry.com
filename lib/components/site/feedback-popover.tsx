"use client";

import { MessageSquare } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/lib/components/ui/popover";

const sentiments = [
  { emoji: "😭", value: "terrible" },
  { emoji: "😣", value: "bad" },
  { emoji: "🙂", value: "good" },
  { emoji: "🤩", value: "amazing" },
] as const;

type Sentiment = (typeof sentiments)[number]["value"];

export function FeedbackPopover() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sentiment, setSentiment] = useState<Sentiment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setEmail("");
    setMessage("");
    setSentiment(null);
  };

  const handleSubmit = async () => {
    if (!sentiment) {
      toast.error("Please select a sentiment");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: pathname,
          sentiment,
          message: message || undefined,
          email: email || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to send");
      toast.success("Thanks for your feedback!");
      reset();
      setOpen(false);
    } catch {
      toast.error("Failed to send feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        data-click-id="nav:feedback"
        aria-label="Give feedback"
        className="inline-flex items-center justify-center h-8 gap-1.5 px-3 text-sm font-medium rounded-xl border border-border/40 text-foreground/80 bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
      >
        <MessageSquare className="size-3.5" />
        <span className="hidden sm:inline">Feedback</span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-4">
        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email Address (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <div>
            <textarea
              placeholder="Your feedback..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            />
            <p className="text-[11px] text-muted-foreground text-right mt-0.5">
              M↓ supported.
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {sentiments.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSentiment(s.value)}
                  className={`size-8 rounded-md text-base transition-colors cursor-pointer ${
                    sentiment === s.value
                      ? "bg-accent/20 ring-1 ring-accent"
                      : "hover:bg-muted"
                  }`}
                  aria-label={s.value}
                >
                  {s.emoji}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="inline-flex items-center justify-center h-8 px-4 text-sm font-medium rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
