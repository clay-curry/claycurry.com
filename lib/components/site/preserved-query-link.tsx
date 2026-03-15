"use client";

import Link, { type LinkProps } from "next/link";
import {
  type AnchorHTMLAttributes,
  forwardRef,
  useSyncExternalStore,
} from "react";
import {
  isTrackingHrefEligible,
  mergeTrackingQueryIntoHref,
  PRESERVE_TRACKING_ATTRIBUTE,
} from "@/lib/tracking-query";
import {
  getTrackingSearchServerSnapshot,
  getTrackingSearchSnapshot,
  subscribeToTrackingSearch,
} from "@/lib/tracking-query-store";

const SITE_ORIGIN = "https://www.claycurry.com";

type PreservedQueryLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> &
  Pick<LinkProps, "prefetch" | "replace" | "scroll"> & {
    href: string;
    preserveTracking?: boolean;
  };

export const PreservedQueryLink = forwardRef<
  HTMLAnchorElement,
  PreservedQueryLinkProps
>(function PreservedQueryLink(
  { href, preserveTracking = true, prefetch, replace, scroll, ...anchorProps },
  ref,
) {
  const currentSearch = useSyncExternalStore(
    subscribeToTrackingSearch,
    getTrackingSearchSnapshot,
    getTrackingSearchServerSnapshot,
  );
  const baseOrigin =
    typeof window === "undefined" ? SITE_ORIGIN : window.location.origin;
  const isInternalPageHref = isTrackingHrefEligible(href, baseOrigin);

  if (!isInternalPageHref) {
    return <a ref={ref} href={href} {...anchorProps} />;
  }

  const nextHref = preserveTracking
    ? mergeTrackingQueryIntoHref(href, currentSearch, baseOrigin)
    : href;

  return (
    <Link
      ref={ref}
      href={nextHref}
      prefetch={prefetch}
      replace={replace}
      scroll={scroll}
      {...anchorProps}
      {...(preserveTracking ? {} : { [PRESERVE_TRACKING_ATTRIBUTE]: "false" })}
    />
  );
});

PreservedQueryLink.displayName = "PreservedQueryLink";
