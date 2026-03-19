"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const sentiments = [
  { emoji: "😭", value: "terrible" },
  { emoji: "😣", value: "bad" },
  { emoji: "🙂", value: "good" },
  { emoji: "🤩", value: "amazing" },
] as const;

type Sentiment = (typeof sentiments)[number]["value"];

export function PageFeedbackPill({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const [selected, setSelected] = useState<Sentiment | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = async (value: Sentiment) => {
    if (submitted) return;
    setSelected(value);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: pathname, sentiment: value }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      toast.success("Thanks for your feedback!");
    } catch {
      toast.error("Failed to send feedback.");
      setSelected(null);
    }
  };

  return (
    <div className={`flex justify-center ${className}`}>
      <div
        data-section-heading
        className="relative group inline-flex flex-col items-center gap-2 rounded-3xl md:flex-row md:rounded-full border border-border bg-muted/50 px-4 py-2"
      >
        <span
          aria-hidden="true"
          className="absolute left-[-12px] md:left-[-20px] top-1/2 -translate-y-1/2 h-2 w-2 md:h-3 md:w-3 rounded-full bg-accent opacity-0 group-data-[active]:opacity-100 transition-opacity duration-300 pointer-events-none shadow-[0_0_8px_var(--accent)]"
        />
        <span className="text-sm text-muted-foreground text-center">
          {submitted ? "Thanks for your feedback!" : "Was this page helpful?"}
        </span>
        {!submitted && (
          <div className="flex items-center gap-1">
            {sentiments.map((s) => (
              <button
                key={s.value}
                type="button"
                data-click-id={`feedback-pill:${s.value}`}
                onClick={() => handleSelect(s.value)}
                disabled={selected !== null}
                className={`size-8 rounded-full text-base transition-all cursor-pointer ${
                  selected === s.value
                    ? "bg-accent/20 scale-110"
                    : "hover:bg-muted-foreground/10 hover:scale-110"
                } disabled:cursor-default`}
                aria-label={s.value}
              >
                {s.emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
