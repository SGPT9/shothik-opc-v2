export function extractBearerToken(req: Request | Headers | any): string | null {
  if (!req) return null;
  const headers = req instanceof Headers ? req : (req.headers || req);
  const getHeader = (name: string) => {
    if (typeof headers.get === 'function') return headers.get(name);
    return headers[name] || headers[name.toLowerCase()] || null;
  };

  const authHeader = getHeader('authorization');
  if (authHeader && typeof authHeader === 'string') {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match) return match[1].trim();
    return authHeader.trim();
  }

  const xAccessToken = getHeader('x-access-token');
  if (xAccessToken && typeof xAccessToken === 'string') {
    return xAccessToken.trim();
  }

  return null;
}

export async function getAuthToken(req: Request | Headers | any): Promise<string | null> {
  return extractBearerToken(req);
}

export default {
  extractBearerToken,
  getAuthToken,
};
