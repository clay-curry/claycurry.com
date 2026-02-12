export const SITE_ORIGIN = "https://www.claycurry.com";

export function toSiteUrl(path: string): string {
  return new URL(path, SITE_ORIGIN).toString();
}
