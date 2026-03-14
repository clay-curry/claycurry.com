"use client";

import { type ReactNode, useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/lib/components/ui/tabs";
import { cn } from "@/lib/utils";

type DiagramTabsProps = {
  children: ReactNode;
  className?: string;
};

export function DiagramTabs({ children, className }: DiagramTabsProps) {
  const [mounted, setMounted] = useState(false);

  // Delay rendering of Radix Tabs to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("my-6", className)}>
        <div className="flex flex-col py-2 overflow-hidden rounded-xl border bg-sidebar w-full border-b">
          <div className="px-4 flex gap-2 border-b border-border pb-2">
            <span className="text-sm px-3 py-1.5 rounded-lg bg-accent text-accent-foreground">
              Diagram
            </span>
            <span className="text-sm px-3 py-1.5 rounded-lg text-muted-foreground">
              Mermaid
            </span>
            <span className="text-sm px-3 py-1.5 rounded-lg text-muted-foreground">
              ASCII
            </span>
          </div>
          <div className="p-4 bg-background rounded-2xl animate-pulse h-48" />
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="diagram" className={cn("my-6", className)}>
      <div className="flex flex-col py-2 overflow-hidden rounded-xl border bg-sidebar w-full border-b">
        <TabsList variant="line" className="px-4">
          <TabsTrigger
            value="diagram"
            className="text-sm rounded-lg hover:bg-accent"
          >
            Diagram
          </TabsTrigger>
          <TabsTrigger
            value="mermaid"
            className="text-sm rounded-lg hover:bg-accent"
          >
            Mermaid
          </TabsTrigger>
          <TabsTrigger
            value="ascii"
            className="text-sm rounded-lg hover:bg-accent"
          >
            ASCII
          </TabsTrigger>
        </TabsList>
        {children}
      </div>
    </Tabs>
  );
}

type DiagramTabProps = {
  children: ReactNode;
  className?: string;
};

export function DiagramTab({ children, className }: DiagramTabProps) {
  return (
    <div className={cn("p-4 bg-background rounded-2xl", className)}>
      {children}
    </div>
  );
}

export function DiagramContent({ children }: { children: ReactNode }) {
  return (
    <TabsContent value="diagram" className="mt-0">
      <DiagramTab>{children}</DiagramTab>
    </TabsContent>
  );
}

export function MermaidContent({ children }: { children: ReactNode }) {
  return (
    <TabsContent value="mermaid" className="mt-0">
      <DiagramTab>{children}</DiagramTab>
    </TabsContent>
  );
}

export function AsciiContent({ children }: { children: ReactNode }) {
  return (
    <TabsContent value="ascii" className="mt-0">
      <DiagramTab>{children}</DiagramTab>
    </TabsContent>
  );
}
