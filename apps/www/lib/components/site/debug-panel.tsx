"use client";

import { Bug, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/lib/components/ui/badge";
import { MOCK_SCENARIOS } from "@/lib/x/mock-bookmarks";

function getParam(key: string): string | null {
  return new URLSearchParams(window.location.search).get(key);
}

function setParam(key: string, value: string | null) {
  const url = new URL(window.location.href);
  if (value) {
    url.searchParams.set(key, value);
  } else {
    url.searchParams.delete(key);
  }
  window.history.replaceState({}, "", url.toString());
}

export function DebugPanel() {
  const [visible, setVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mockMode, setMockMode] = useState<string>("");

  useEffect(() => {
    const show = getParam("debug") === "1";
    setVisible(show);
    if (show) {
      setMockMode(getParam("mock") || "");
    }
  }, []);

  if (!visible) return null;

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className="fixed top-3 left-3 z-[9999] flex items-center gap-1.5 rounded-md bg-amber-500/90 px-2 py-1 text-xs font-medium text-black shadow-lg hover:bg-amber-400 transition-colors"
      >
        <Bug className="size-3.5" />
        DEBUG
        {mockMode && (
          <Badge
            variant="outline"
            className="ml-1 border-black/30 text-black text-[10px] px-1 py-0"
          >
            {mockMode}
          </Badge>
        )}
      </button>
    );
  }

  const handleMockChange = (scenario: string) => {
    setMockMode(scenario);
    setParam("mock", scenario || null);
    window.dispatchEvent(new Event("debug-mock-change"));
  };

  return (
    <div className="fixed top-3 left-3 z-[9999] w-72 rounded-lg border border-amber-500/50 bg-background/95 shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-500/30 px-3 py-2">
        <div className="flex items-center gap-2">
          <Bug className="size-4 text-amber-500" />
          <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
            Debug Panel
          </span>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
            title="Collapse"
          >
            <span className="text-xs">&#x2015;</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setParam("debug", null);
              setParam("mock", null);
              setVisible(false);
              window.dispatchEvent(new Event("debug-mock-change"));
            }}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
            title="Close"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Bookmarks mock section */}
      <div className="p-3">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Bookmarks data source
        </p>
        <div className="space-y-1">
          <label className="flex items-start gap-2 rounded px-2 py-1.5 cursor-pointer hover:bg-secondary/60 transition-colors">
            <input
              type="radio"
              name="mock"
              value=""
              checked={mockMode === ""}
              onChange={() => handleMockChange("")}
              className="mt-0.5 accent-amber-500"
            />
            <div>
              <p className="text-xs font-medium text-foreground">Default</p>
              <p className="text-[10px] text-muted-foreground">
                Normal service behavior (live or dev mock)
              </p>
            </div>
          </label>

          {MOCK_SCENARIOS.map((s) => (
            <label
              key={s.value}
              className="flex items-start gap-2 rounded px-2 py-1.5 cursor-pointer hover:bg-secondary/60 transition-colors"
            >
              <input
                type="radio"
                name="mock"
                value={s.value}
                checked={mockMode === s.value}
                onChange={() => handleMockChange(s.value)}
                className="mt-0.5 accent-amber-500"
              />
              <div>
                <p className="text-xs font-medium text-foreground">{s.label}</p>
                <p className="text-[10px] text-muted-foreground">
                  {s.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
