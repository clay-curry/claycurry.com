const THEME_COLORS: Record<string, string> = {
  cyan: "#38BDF8",
  orange: "#F97316",
  red: "#EF4444",
  green: "#4FE3C2",
  gray: "#94A3B8",
};

export function getFaviconSvg(theme: string): string {
  const color = THEME_COLORS[theme] ?? THEME_COLORS.green;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="30" fill="%230F172A" stroke="${encodeURIComponent(color)}" stroke-width="2"/><text x="32" y="38" text-anchor="middle" font-family="system-ui,sans-serif" font-size="22" font-weight="700" fill="%23E2E8F0" letter-spacing="0.5">CC</text></svg>`;
}

export function updateFavicon(theme: string): void {
  const svg = getFaviconSvg(theme);
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = `data:image/svg+xml,${svg}`;
}
