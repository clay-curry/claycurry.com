import { getTrackingSearch } from "@/lib/tracking-query";

type Listener = () => void;

const listeners = new Set<Listener>();

let trackingSearchSnapshot = "";

export function subscribeToTrackingSearch(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getTrackingSearchSnapshot(): string {
  return trackingSearchSnapshot;
}

export function getTrackingSearchServerSnapshot(): string {
  return "";
}

export function syncTrackingSearch(search: string): void {
  const nextSnapshot = getTrackingSearch(search);

  if (nextSnapshot === trackingSearchSnapshot) {
    return;
  }

  trackingSearchSnapshot = nextSnapshot;

  for (const listener of listeners) {
    listener();
  }
}
