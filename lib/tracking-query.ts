// Allowlisted params that should survive internal navigation. This includes
// attribution keys plus the URL-based debug session state.
export const TRACKING_QUERY_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "ref",
  "debug",
  "mock",
] as const;

export const PRESERVE_TRACKING_ATTRIBUTE = "data-preserve-tracking";

const DEFAULT_BASE_ORIGIN = "https://tracking.invalid";
const HTTP_PROTOCOLS = new Set(["http:", "https:"]);
const PROTOCOL_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/;
const FILE_EXTENSION_PATTERN = /\.[^/]+$/;

function getBaseOrigin(baseOrigin?: string): string {
  return baseOrigin ?? DEFAULT_BASE_ORIGIN;
}

function hasExplicitOrigin(href: string): boolean {
  return href.startsWith("//") || PROTOCOL_PATTERN.test(href);
}

function isSpecialProtocol(href: string): boolean {
  return (
    PROTOCOL_PATTERN.test(href) &&
    !href.startsWith("http://") &&
    !href.startsWith("https://")
  );
}

function toTrackingSearchParams(search: string): URLSearchParams {
  const source = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  const preserved = new URLSearchParams();

  for (const key of TRACKING_QUERY_KEYS) {
    const value = source.get(key);
    if (value !== null) {
      preserved.set(key, value);
    }
  }

  return preserved;
}

function isAssetLikePath(pathname: string): boolean {
  const lastSegment = pathname.split("/").pop() ?? "";
  return lastSegment.length > 0 && FILE_EXTENSION_PATTERN.test(lastSegment);
}

export function getTrackingSearch(search: string): string {
  const params = toTrackingSearchParams(search);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function isTrackingHrefEligible(
  href: string,
  baseOrigin?: string,
): boolean {
  const trimmedHref = href.trim();

  if (
    !trimmedHref ||
    trimmedHref.startsWith("#") ||
    isSpecialProtocol(trimmedHref)
  ) {
    return false;
  }

  if (hasExplicitOrigin(trimmedHref) && !baseOrigin) {
    return false;
  }

  let resolvedUrl: URL;

  try {
    resolvedUrl = new URL(trimmedHref, getBaseOrigin(baseOrigin));
  } catch {
    return false;
  }

  if (!HTTP_PROTOCOLS.has(resolvedUrl.protocol)) {
    return false;
  }

  if (baseOrigin && resolvedUrl.origin !== new URL(baseOrigin).origin) {
    return false;
  }

  if (isAssetLikePath(resolvedUrl.pathname)) {
    return false;
  }

  return true;
}

export function mergeTrackingQueryIntoHref(
  href: string,
  currentSearch: string,
  baseOrigin?: string,
): string {
  const trackingSearch = getTrackingSearch(currentSearch);

  if (!trackingSearch || !isTrackingHrefEligible(href, baseOrigin)) {
    return href;
  }

  const resolvedUrl = new URL(href, getBaseOrigin(baseOrigin));
  const trackingParams = new URLSearchParams(trackingSearch.slice(1));

  for (const key of TRACKING_QUERY_KEYS) {
    if (resolvedUrl.searchParams.has(key)) {
      continue;
    }

    const value = trackingParams.get(key);
    if (value !== null) {
      resolvedUrl.searchParams.set(key, value);
    }
  }

  return `${resolvedUrl.pathname}${resolvedUrl.search}${resolvedUrl.hash}`;
}

export function getTrackingQueryCaptureScript(): string {
  const keys = JSON.stringify(TRACKING_QUERY_KEYS);
  const preserveTrackingAttribute = JSON.stringify(PRESERVE_TRACKING_ATTRIBUTE);
  const protocolPattern = JSON.stringify(PROTOCOL_PATTERN.source);
  const fileExtensionPattern = JSON.stringify(FILE_EXTENSION_PATTERN.source);

  return `(function(){var TRACKING_QUERY_KEYS=${keys};var PRESERVE_TRACKING_ATTRIBUTE=${preserveTrackingAttribute};var PROTOCOL_PATTERN=new RegExp(${protocolPattern});var FILE_EXTENSION_PATTERN=new RegExp(${fileExtensionPattern});function hasExplicitOrigin(href){return href.startsWith("//")||PROTOCOL_PATTERN.test(href)}function isSpecialProtocol(href){return PROTOCOL_PATTERN.test(href)&&!href.startsWith("http://")&&!href.startsWith("https://")}function getTrackingSearch(search){var source=new URLSearchParams(search.charAt(0)==="?"?search.slice(1):search);var preserved=new URLSearchParams();for(var i=0;i<TRACKING_QUERY_KEYS.length;i++){var key=TRACKING_QUERY_KEYS[i];var value=source.get(key);if(value!==null){preserved.set(key,value)}}var query=preserved.toString();return query?"?"+query:""}function isAssetLikePath(pathname){var segments=pathname.split("/");var lastSegment=segments[segments.length-1]||"";return lastSegment.length>0&&FILE_EXTENSION_PATTERN.test(lastSegment)}function isTrackingHrefEligible(href,baseOrigin){var trimmedHref=href.trim();if(!trimmedHref||trimmedHref.charAt(0)==="#"||isSpecialProtocol(trimmedHref)){return false}if(hasExplicitOrigin(trimmedHref)&&!baseOrigin){return false}var resolvedUrl;try{resolvedUrl=new URL(trimmedHref,baseOrigin||"https://tracking.invalid")}catch{return false}if((resolvedUrl.protocol!=="http:")&&(resolvedUrl.protocol!=="https:")){return false}if(baseOrigin&&resolvedUrl.origin!==new URL(baseOrigin).origin){return false}if(isAssetLikePath(resolvedUrl.pathname)){return false}return true}function mergeTrackingQueryIntoHref(href,currentSearch,baseOrigin){var trackingSearch=getTrackingSearch(currentSearch);if(!trackingSearch||!isTrackingHrefEligible(href,baseOrigin)){return href}var resolvedUrl=new URL(href,baseOrigin||"https://tracking.invalid");var trackingParams=new URLSearchParams(trackingSearch.slice(1));for(var i=0;i<TRACKING_QUERY_KEYS.length;i++){var key=TRACKING_QUERY_KEYS[i];if(resolvedUrl.searchParams.has(key)){continue}var value=trackingParams.get(key);if(value!==null){resolvedUrl.searchParams.set(key,value)}}return resolvedUrl.pathname+resolvedUrl.search+resolvedUrl.hash}document.addEventListener("click",function(event){if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey){return}var target=event.target;if(!(target instanceof Element)){return}var anchor=target.closest("a[href]");if(!anchor||anchor.getAttribute(PRESERVE_TRACKING_ATTRIBUTE)==="false"){return}if(anchor.target&&anchor.target!=="_self"){return}var rawHref=anchor.getAttribute("href");if(!rawHref){return}var nextHref=mergeTrackingQueryIntoHref(rawHref,window.location.search,window.location.origin);if(nextHref!==rawHref){anchor.setAttribute("href",nextHref)}},true)})();`;
}
