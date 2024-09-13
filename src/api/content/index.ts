import { getAllContentMeta } from '@/app/_lib/meta';

import type { TApiResponse, TContentMeta } from '@/app/_utils/types';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Record<string, TContentMeta> | TApiResponse>
) {
  try {
    if (req.method === 'GET') {
      const result = await getAllContentMeta();

      res.status(200).json(result);
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);

    res.status(500).json({ message: 'Internal Server Error' });
  }
}
