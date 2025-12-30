"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import FilterIcon from "@/src/lib/components/icons/filter";
import RightArrow from "@/src/lib/components/icons/right-arrow";

export function Posts({
  filterEntries = true,
  pinnedOnly = false,
  nonPinnedOnly = false,
  entries,
}: {
  filterEntries?: boolean;
  pinnedOnly?: boolean;
  nonPinnedOnly?: boolean;
  entries: Array<{
    slug: string;
    pinned?: boolean;
    date: string;
    title: string;
    subtitle: string;
    prefix: string;
    tags: string[];
  }>;
}) {
  const filterTags = extractTags(entries);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <section>
      {filterEntries && (
        <div className="flex justify-end">
          <div className="relative my-4" ref={dropdownRef}>
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
              onClick={toggleDropdown}
              className="flex items-center gap-1 px-4 py-2 rounded-md border border-gray-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white hover:shadow transition"
            >
              <FilterIcon />
              Filter
            </button>
            {isDropdownOpen && (
              <div
                tabIndex={-1}
                className="z-10 absolute right-0 mt-2 min-w-48 max-h-80 overflow-auto rounded-md bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-lg transition"
              >
                <ul className="py-1">
                  {filterTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <li
                        key={tag}
                        className="flex cursor-pointer items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 transition focus:outline-none"
                        onClick={() => {
                          toggleTag(tag);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === " " || e.key === "Enter") {
                            e.preventDefault();
                            toggleTag(tag);
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          tabIndex={-1}
                          className="mr-2"
                          readOnly
                          checked={isSelected}
                          aria-label={`Select tag ${tag}`}
                        />
                        <span>{tag}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-7 grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(400px,1fr))]">
        {entries
          .filter((post) => {
            if (pinnedOnly) {
              return post.pinned === true;
            }
            if (nonPinnedOnly) {
              return post.pinned !== true;
            }
            return true;
          })
          .filter(
            (post) =>
              selectedTags.length === 0 ||
              post.tags.some((tag) => selectedTags.includes(tag)),
          )
          .map((post) => (
            <PostEntry
              key={post.slug}
              slug={post.slug}
              date={post.date}
              title={post.title}
              subtitle={post.subtitle}
              prefix={post.prefix}
              tags={post.tags}
            />
          ))}
      </div>
    </section>
  );
}

function extractTags(posts: Array<{ tags: string[] }>) {
  const tagSet = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet);
}

function PostEntry({
  slug,
  date,
  title,
  subtitle,
  prefix,
  tags,
}: {
  slug: string;
  date: string;
  title: string;
  subtitle: string;
  prefix: string;
  tags: string[];
}) {
  return (
    <div className="group h-full w-full cursor-pointer rounded-sm">
      <Link
        className={
          `relative flex h-full w-full flex-col justify-between rounded-lg border border-gray-200 ` +
          `p-6 transition-shadow duration-300 hover:shadow-md dark:border-neutral-800 ` +
          `dark:bg-background md:p-6`
        }
        href={`/blog/${slug}`}
      >
        <div
          className={
            `absolute top-[-12px] left-4 text-xs text-gray-500 bg-white rounded-full ` +
            `px-2 py-1 dark:bg-neutral-900 dark:text-neutral-200`
          }
        >
          {date}
        </div>
        <div className="flex">
          <div>
            <h3 className="font-semibold text-blue-500 transition-all duration-300 group-hover:text-blue-500 sm:text-black sm:dark:text-white md:text-xl">
              {title}
            </h3>
            <h4 className="md:text-l font-medium text-neutral-500 transition-all duration-300 dark:text-neutral-400">
              {subtitle}
            </h4>
          </div>
        </div>
        <p className="py-4 text-sm transition-all md:text-base">{prefix}</p>
        <div className="flex flex-wrap gap-2 pb-3 transition-all duration-300">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded bg-gray-200 px-2 py-1.5 text-xs font-semibold text-gray-800 transition-all duration-300 dark:bg-neutral-900 dark:text-neutral-200"
            >
              {t}
            </span>
          ))}
        </div>
        <p className="flex cursor-pointer gap-2 text-sm md:text-base">
          Read More
          <span className="pt-px">
            <RightArrow />
          </span>
        </p>
      </Link>
    </div>
  );
}
