import { NextApiRequest, NextApiResponse } from 'next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    let response;
    const url = `${API_BASE_URL}/api/sermon/drafts`;

    switch (method) {
      case 'GET':
        const { search, status, difficulty, limit = 20, offset = 0 } = req.query;
        const params = new URLSearchParams();
        if (search) params.append('search', search as string);
        if (status) params.append('status', status as string);
        if (difficulty) params.append('difficulty', difficulty as string);
        params.append('limit', limit as string);
        params.append('offset', offset as string);

        response = await fetch(`${url}?${params}`, {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
          },
        });
        break;

      case 'POST':
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(req.body),
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('API route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}