import { getValidAccessToken } from "./tokens";

// --- Types ---

export interface XMedia {
  media_key: string;
  type: "photo" | "video" | "animated_gif";
  url?: string;
  preview_image_url?: string;
  width?: number;
  height?: number;
}

export interface XUser {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
  verified?: boolean;
}

export interface XTweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics?: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
    impression_count: number;
  };
  attachments?: {
    media_keys?: string[];
  };
}

export interface NormalizedBookmark {
  id: string;
  text: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    username: string;
    profileImageUrl?: string;
    verified?: boolean;
  };
  metrics: {
    likes: number;
    retweets: number;
    replies: number;
    impressions: number;
  };
  media: Array<{
    type: "photo" | "video" | "animated_gif";
    url: string;
    width?: number;
    height?: number;
  }>;
}

export interface XBookmarkFolder {
  id: string;
  name: string;
}

interface XBookmarksResponse {
  data?: XTweet[];
  includes?: {
    users?: XUser[];
    media?: XMedia[];
  };
  meta?: {
    next_token?: string;
    result_count: number;
  };
}

// --- Helpers ---

const BOOKMARKS_FIELDS = [
  "tweet.fields=created_at,public_metrics,author_id,attachments",
  "expansions=author_id,attachments.media_keys",
  "user.fields=name,username,profile_image_url,verified",
  "media.fields=url,preview_image_url,type,width,height",
  "max_results=100",
].join("&");

function normalizeTweets(response: XBookmarksResponse): NormalizedBookmark[] {
  if (!response.data) return [];

  const usersMap = new Map<string, XUser>();
  for (const user of response.includes?.users ?? []) {
    usersMap.set(user.id, user);
  }

  const mediaMap = new Map<string, XMedia>();
  for (const m of response.includes?.media ?? []) {
    mediaMap.set(m.media_key, m);
  }

  return response.data.map((tweet) => {
    const author = usersMap.get(tweet.author_id);
    const tweetMedia = (tweet.attachments?.media_keys ?? [])
      .map((key) => mediaMap.get(key))
      .filter((m): m is XMedia => !!m)
      .map((m) => ({
        type: m.type,
        url: m.url || m.preview_image_url || "",
        width: m.width,
        height: m.height,
      }));

    return {
      id: tweet.id,
      text: tweet.text,
      createdAt: tweet.created_at,
      author: {
        id: author?.id ?? tweet.author_id,
        name: author?.name ?? "Unknown",
        username: author?.username ?? "unknown",
        profileImageUrl: author?.profile_image_url,
        verified: author?.verified,
      },
      metrics: {
        likes: tweet.public_metrics?.like_count ?? 0,
        retweets: tweet.public_metrics?.retweet_count ?? 0,
        replies: tweet.public_metrics?.reply_count ?? 0,
        impressions: tweet.public_metrics?.impression_count ?? 0,
      },
      media: tweetMedia,
    };
  });
}

// --- API functions ---

export async function fetchAllBookmarks(): Promise<NormalizedBookmark[]> {
  const userId = process.env.X_OWNER_USER_ID;
  if (!userId) throw new Error("X_OWNER_USER_ID not configured");

  const token = await getValidAccessToken();
  const all: NormalizedBookmark[] = [];
  let paginationToken: string | undefined;

  do {
    const url = `https://api.x.com/2/users/${userId}/bookmarks?${BOOKMARKS_FIELDS}${paginationToken ? `&pagination_token=${paginationToken}` : ""}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`X API error (${res.status}): ${text}`);
    }

    const data: XBookmarksResponse = await res.json();
    all.push(...normalizeTweets(data));
    paginationToken = data.meta?.next_token;
  } while (paginationToken);

  return all;
}

export async function fetchBookmarkFolders(): Promise<XBookmarkFolder[]> {
  const userId = process.env.X_OWNER_USER_ID;
  if (!userId) throw new Error("X_OWNER_USER_ID not configured");

  const token = await getValidAccessToken();
  const res = await fetch(
    `https://api.x.com/2/users/${userId}/bookmarks/folders`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok) {
    // Folders endpoint may not be available — return empty
    return [];
  }

  const data = await res.json();
  return (data.data ?? []) as XBookmarkFolder[];
}

export async function fetchBookmarksByFolder(
  folderId: string,
): Promise<NormalizedBookmark[]> {
  const userId = process.env.X_OWNER_USER_ID;
  if (!userId) throw new Error("X_OWNER_USER_ID not configured");

  const token = await getValidAccessToken();
  const all: NormalizedBookmark[] = [];
  let paginationToken: string | undefined;

  do {
    const url = `https://api.x.com/2/users/${userId}/bookmarks/folders/${folderId}/tweets?${BOOKMARKS_FIELDS}${paginationToken ? `&pagination_token=${paginationToken}` : ""}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`X API folder error (${res.status}): ${text}`);
    }

    const data: XBookmarksResponse = await res.json();
    all.push(...normalizeTweets(data));
    paginationToken = data.meta?.next_token;
  } while (paginationToken);

  return all;
}
