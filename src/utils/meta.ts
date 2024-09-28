/* eslint-disable no-template-curly-in-string */
import jsonata from 'jsonata';

import dayjs from '@/utils/dayjs';

import { ContentType, ReactionType, ShareType } from '@/utils/types';

type TContentMeta = {
  slug: string;
  views: number;
  shares: { source: ShareType; count: number }[];
  reactions: { reaction: ReactionType; count: number }[];
};

export const getAllContentMeta = async (): Promise<
  Record<string, TContentMeta>
> => {
  // Fetch views and reactions concurrently
  const [views, shares, reactions] = await Promise.all([getViewsCount(), getShareCounts(), getReactionCounts()]);

  // Initialize a record to store the merged content metadata by slug
  const contentMeta: Record<string, TContentMeta> = {};

  // Process views and store them in the record
  views.forEach(({ slug, count }) => {
    contentMeta[slug] = {
      slug,
      views: count,
      shares: [],
      reactions: [], // Initialize reactions as an empty array, will fill it later
    };
  });

  // Process reactions and merge them into the existing content meta
  shares.forEach(({ slug, count, source }) => {
    if (!contentMeta[slug]) {
      // If the slug doesn't exist yet (if there's a reaction but no view), initialize it
      contentMeta[slug] = {
        slug,
        views: 0, // Default views to 0 if there's no corresponding view count
        shares: [],
        reactions: [],
      };
    }

    // Add reactions to the corresponding slug
    contentMeta[slug].shares.push({ source, count });
  });


  // Process reactions and merge them into the existing content meta
  reactions.forEach(({ slug, count, reaction }) => {
    if (!contentMeta[slug]) {
      // If the slug doesn't exist yet (if there's a reaction but no view), initialize it
      contentMeta[slug] = {
        slug,
        views: 0, // Default views to 0 if there's no corresponding view count
        shares: [],
        reactions: [],
      };
    }

    // Add reactions to the corresponding slug
    contentMeta[slug].reactions.push({ reaction, count });
  });

  return contentMeta;
};


export const getContentMeta = async (
  slug: string
): Promise<{ shares: number; views: number }> => {
  const content = await getAllContentMeta();

  // Ensure the slug exists in the content object before accessing its properties
  const result = content[slug];

  if (!result) {
    // Return default values if no metadata is found for the given slug
    return { shares: 0, views: 0 };
  }

  // If shares is an object with different share types, sum the values
  const totalShares = result.shares
    ? Object.values(result.shares).reduce((acc, { count }) => acc + count, 0)
    : 0;

  return {
    shares: totalShares,  // Sum of all share types
    views: result.views || 0,  // Return views from the content or default to 0
  };
};



export const getContentActivity = async (): Promise<TContentActivity[]> => {
  // last 24 hours
  const date = dayjs().subtract(24, 'hours').toDate();

  const result = await prisma.contentMeta.findMany({
    include: {
      reactions: {
        select: {
          type: true,
          count: true,
          createdAt: true,
          content: {
            select: { slug: true, title: true, type: true },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
        where: {
          createdAt: {
            gte: date,
          },
        },
        take: 5,
      },
      shares: {
        select: {
          type: true,
          createdAt: true,
          content: {
            select: { slug: true, title: true, type: true },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
        where: {
          createdAt: {
            gte: date,
          },
        },
        take: 5,
      },
    },
  });

  const expression = `
    $sort([
      $.reactions.{
        'activityType': 'REACTION',
        'type': type,
        'count': count,
        'createdAt': createdAt,
        'slug': content.slug,
        'contentTitle': content.title,
        'contentType': content.type
      }, 
      $.shares.{
        'activityType': 'SHARE',
        'type': type,
        'createdAt': createdAt,
        'slug': content.slug,
        'contentTitle': content.title,
        'contentType': content.type
      }
    ], function($l, $r) {
      $string($l.createdAt) < $string($r.createdAt)
    })[[0..4]]
  `;

  // transform result
  const transformed = await jsonata(expression).evaluate(result);

  return transformed;
};

export const getNewPosts = async (): Promise<
  {
    slug: string;
    title: string;
    createdAt: Date;
  }[]
> => {
  // last 8 days
  const date = dayjs().subtract(8, 'days').toDate();

  const result = await prisma.contentMeta.findMany({
    where: {
      type: 'POST',
      AND: {
        createdAt: {
          gte: date,
        },
      },
    },
    select: {
      slug: true,
      title: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 1,
  });

  return result;
};

export const getReactions = async (slug: string): Promise<TReaction> => {
  const result = await prisma.reaction.groupBy({
    by: ['type'],
    _sum: {
      count: true,
    },
    where: {
      content: {
        slug,
      },
    },
  });

  const expression = `$merge([
    {
      'CLAPPING': 0,
      'THINKING': 0,
      'AMAZED': 0
    },
    $.{
      type: _sum.count
    }
  ])`;

  // transform result
  const transformed = await jsonata(expression).evaluate(result);

  return transformed;
};

export const getSectionMeta = async (
  slug: string
): Promise<
  Record<
    string,
    {
      reactionsDetail: TReaction;
    }
  >
> => {
  const result = await prisma.reaction.groupBy({
    by: ['section', 'type'],
    _sum: {
      count: true,
    },
    where: {
      section: {
        not: null,
      },
      content: {
        slug,
      },
    },
    orderBy: {
      section: 'asc',
    },
  });

  const expression = `$\
    {
      section: {
        'reactionsDetail': $merge([
          {
            'CLAPPING': 0,
            'THINKING': 0,
            'AMAZED': 0
          },
          {
            type: _sum.count
          }
        ])
      }
    }`;

  // transform result
  const transformed = await jsonata(expression).evaluate(result);

  return transformed;
};

export const getReactionsBy = async (
  slug: string,
  sessionId: string
): Promise<TReaction> => {
  const result = await prisma.reaction.groupBy({
    by: ['type'],
    _sum: {
      count: true,
    },
    where: {
      sessionId,
      content: {
        slug,
      },
    },
  });

  const expression = `$merge([
    {
      'CLAPPING': 0,
      'THINKING': 0,
      'AMAZED': 0
    },
    $.{
      type: _sum.count
    }
  ])`;

  // transform result
  const transformed = await jsonata(expression).evaluate(result);

  return transformed;
};

export const setReaction = async ({
  slug,
  contentType,
  contentTitle,
  count,
  section,
  sessionId,
  type,
}: {
  slug: string;
  contentType: ContentType;
  contentTitle: string;
  count: number;
  section: string;
  sessionId: string;
  type: ReactionType;
}) => {
  const result = await prisma.reaction.create({
    data: {
      count,
      type,
      section,
      sessionId,
      content: {
        connectOrCreate: {
          where: {
            slug,
          },
          create: {
            slug,
            type: contentType,
            title: contentTitle,
          },
        },
      },
    },
  });

  return result;
};

export const getSharesBy = async (
  slug: string,
  sessionId: string
): Promise<number> => {
  const result = await prisma.share.count({
    where: {
      sessionId,
      content: {
        slug,
      },
    },
  });

  return result || 0;
};

export const setShare = async ({
  slug,
  contentType,
  contentTitle,
  type,
  sessionId,
}: {
  slug: string;
  contentType: ContentType;
  contentTitle: string;
  type: ShareType;
  sessionId: string;
}) => {
  const result = await prisma.share.create({
    data: {
      type,
      sessionId,
      content: {
        connectOrCreate: {
          where: {
            slug,
          },
          create: {
            slug,
            type: contentType,
            title: contentTitle,
          },
        },
      },
    },
  });

  return result;
};

export const getViewsBy = async (
  slug: string,
  sessionId: string
): Promise<number> => {
  const result = await prisma.view.count({
    where: {
      sessionId,
      content: {
        slug,
      },
    },
  });

  return result || 0;
};

export const setView = async ({
  slug,
  contentType,
  contentTitle,
  sessionId,
}: {
  slug: string;
  contentType: ContentType;
  contentTitle: string;
  sessionId: string;
}) => {
  const result = await prisma.view.create({
    data: {
      sessionId,
      content: {
        connectOrCreate: {
          where: {
            slug,
          },
          create: {
            slug,
            type: contentType,
            title: contentTitle,
          },
        },
      },
    },
  });

  return result;
};
