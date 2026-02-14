import type { NormalizedBookmark, XBookmarkFolder } from "./client";

export const FAKE_BOOKMARKS: NormalizedBookmark[] = [
  {
    id: "1893045781234567890",
    text: "Just shipped a new compiler optimization that reduces bundle sizes by 40%. The trick was dead-code elimination at the AST level before any bundler touches it.\n\nThread on how we did it 🧵",
    createdAt: "2026-02-10T14:23:00.000Z",
    author: {
      id: "100001",
      name: "Evan You",
      username: "youyuxi",
      profileImageUrl:
        "https://pbs.twimg.com/profile_images/1234567890/evan_normal.jpg",
      verified: true,
    },
    metrics: {
      likes: 12400,
      retweets: 3200,
      replies: 487,
      impressions: 890000,
    },
    media: [],
  },
  {
    id: "1893045781234567891",
    text: "The best code is the code you don't write. Spent the whole day deleting 3,000 lines and everything still passes.",
    createdAt: "2026-02-09T09:15:00.000Z",
    author: {
      id: "100002",
      name: "Guillermo Rauch",
      username: "raaborern",
      profileImageUrl:
        "https://pbs.twimg.com/profile_images/1234567891/guille_normal.jpg",
      verified: true,
    },
    metrics: { likes: 8700, retweets: 1100, replies: 203, impressions: 540000 },
    media: [],
  },
  {
    id: "1893045781234567892",
    text: 'New research paper: "Attention Is All You Need" was 7 years ago. We\'re now at "Attention Might Not Even Be What You Think It Is."\n\nFascinating results on linear attention variants achieving 98% of transformer quality at 10x throughput.',
    createdAt: "2026-02-08T18:42:00.000Z",
    author: {
      id: "100003",
      name: "Andrej Karpathy",
      username: "kaborernathy",
      profileImageUrl:
        "https://pbs.twimg.com/profile_images/1234567892/andrej_normal.jpg",
      verified: true,
    },
    metrics: {
      likes: 34500,
      retweets: 8900,
      replies: 1200,
      impressions: 2300000,
    },
    media: [],
  },
  {
    id: "1893045781234567893",
    text: 'Unpopular opinion: most "microservices" architectures would be better as a well-structured monolith with clear module boundaries.\n\nThe network boundary doesn\'t give you modularity. Discipline does.',
    createdAt: "2026-02-07T12:30:00.000Z",
    author: {
      id: "100004",
      name: "Kelsey Hightower",
      username: "kelseyhightower",
      profileImageUrl:
        "https://pbs.twimg.com/profile_images/1234567893/kelsey_normal.jpg",
      verified: true,
    },
    metrics: {
      likes: 21300,
      retweets: 5400,
      replies: 876,
      impressions: 1500000,
    },
    media: [],
  },
  {
    id: "1893045781234567894",
    text: "TIL you can use CSS `color-mix()` to create semantic color tokens without preprocessors:\n\n```css\n--muted: color-mix(in oklch, var(--foreground) 60%, transparent);\n```\n\nWorks in all modern browsers now.",
    createdAt: "2026-02-06T21:05:00.000Z",
    author: {
      id: "100005",
      name: "Adam Argyle",
      username: "argaborern",
      profileImageUrl:
        "https://pbs.twimg.com/profile_images/1234567894/adam_normal.jpg",
      verified: true,
    },
    metrics: { likes: 4200, retweets: 980, replies: 145, impressions: 320000 },
    media: [],
  },
  {
    id: "1893045781234567895",
    text: "Deployed a Rust service that handles 1.2M req/s on a single $40/mo instance. The secret? Zero allocations in the hot path and io_uring for async I/O.\n\nMeanwhile our Java service needs 8 pods for 50K req/s 😅",
    createdAt: "2026-02-05T16:18:00.000Z",
    author: {
      id: "100006",
      name: "Fasterthanlime",
      username: "fasterthanlime",
      profileImageUrl:
        "https://pbs.twimg.com/profile_images/1234567895/amos_normal.jpg",
      verified: false,
    },
    metrics: {
      likes: 15800,
      retweets: 4100,
      replies: 623,
      impressions: 1100000,
    },
    media: [],
  },
  {
    id: "1893045781234567896",
    text: "Just open-sourced our internal design system. 47 components, fully accessible, works with any CSS framework.\n\nThe key insight: build for composition, not configuration. Every component is a primitive you combine.",
    createdAt: "2026-02-04T10:45:00.000Z",
    author: {
      id: "100007",
      name: "Pedro Duarte",
      username: "peaborernduarte",
      profileImageUrl:
        "https://pbs.twimg.com/profile_images/1234567896/pedro_normal.jpg",
      verified: true,
    },
    metrics: { likes: 6700, retweets: 1800, replies: 312, impressions: 450000 },
    media: [],
  },
  {
    id: "1893045781234567897",
    text: "PSA: If you're still using `useEffect` for data fetching in 2026, you're doing it wrong.\n\nUse your framework's data loading primitives. They handle:\n- Deduplication\n- Caching\n- Streaming\n- Error boundaries\n- Race conditions\n\nYour useEffect handles none of these.",
    createdAt: "2026-02-03T08:30:00.000Z",
    author: {
      id: "100008",
      name: "Dan Abramov",
      username: "dan_abramov2",
      profileImageUrl:
        "https://pbs.twimg.com/profile_images/1234567897/dan_normal.jpg",
      verified: true,
    },
    metrics: {
      likes: 18200,
      retweets: 4700,
      replies: 934,
      impressions: 1800000,
    },
    media: [],
  },
  {
    id: "1893045781234567898",
    text: "Been learning about CRDTs for the past month. Built a collaborative text editor in 500 lines of code.\n\nThe math is beautiful: convergence without coordination. Every node can edit independently and they'll all reach the same state.",
    createdAt: "2026-02-02T15:12:00.000Z",
    author: {
      id: "100009",
      name: "Martin Kleppmann",
      username: "martinkl",
      profileImageUrl:
        "https://pbs.twimg.com/profile_images/1234567898/martin_normal.jpg",
      verified: false,
    },
    metrics: { likes: 9400, retweets: 2600, replies: 378, impressions: 670000 },
    media: [],
  },
  {
    id: "1893045781234567899",
    text: "Hot take: TypeScript's type system is Turing complete and that's not a feature, it's a bug.\n\nYour types should describe your data, not compute it. If you need a PhD to read your type definitions, you've gone too far.",
    createdAt: "2026-02-01T19:55:00.000Z",
    author: {
      id: "100010",
      name: "Rich Harris",
      username: "rich_harris",
      profileImageUrl:
        "https://pbs.twimg.com/profile_images/1234567899/rich_normal.jpg",
      verified: true,
    },
    metrics: {
      likes: 11600,
      retweets: 2900,
      replies: 1456,
      impressions: 920000,
    },
    media: [],
  },
  {
    id: "1893045781234567900",
    text: "The web platform added 3 major features this week and nobody noticed because everyone's arguing about frameworks.\n\n- CSS anchor positioning\n- View Transitions L2\n- Declarative Shadow DOM streaming\n\nThe platform is winning.",
    createdAt: "2026-01-30T11:20:00.000Z",
    author: {
      id: "100011",
      name: "Una Kravets",
      username: "una",
      profileImageUrl:
        "https://pbs.twimg.com/profile_images/1234567900/una_normal.jpg",
      verified: true,
    },
    metrics: { likes: 7300, retweets: 2100, replies: 289, impressions: 510000 },
    media: [],
  },
  {
    id: "1893045781234567901",
    text: "Debugging tip that saved me hours today:\n\n```\ngit bisect start\ngit bisect bad HEAD\ngit bisect good v2.1.0\n```\n\nGit will binary search through commits to find exactly which one introduced the bug. Automated with `git bisect run npm test`.",
    createdAt: "2026-01-28T14:08:00.000Z",
    author: {
      id: "100012",
      name: "Julia Evans",
      username: "b0rk",
      profileImageUrl:
        "https://pbs.twimg.com/profile_images/1234567901/julia_normal.jpg",
      verified: false,
    },
    metrics: { likes: 5600, retweets: 1500, replies: 167, impressions: 380000 },
    media: [],
  },
];

export const FAKE_FOLDERS: XBookmarkFolder[] = [
  { id: "folder_1", name: "Frontend" },
  { id: "folder_2", name: "Systems" },
  { id: "folder_3", name: "AI/ML" },
];
