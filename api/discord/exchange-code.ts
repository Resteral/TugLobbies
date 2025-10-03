/**
 * Discord OAuth Code Exchange (Serverless API)
 * Exchanges an authorization code for an access token using Discord's OAuth2 token endpoint.
 * Deployment target: Vercel (api route). No extra dependencies required.
 */

import type { IncomingMessage, ServerResponse } from 'http';

/**
 * Type for the expected request body
 */
interface ExchangeBody {
  /** OAuth2 authorization code provided by Discord */
  code?: string;
  /** Redirect URI used during the authorization request */
  redirectUri?: string;
}

/**
 * Sends a JSON response with proper headers.
 */
function sendJson(res: ServerResponse, status: number, data: unknown) {
  const payload = JSON.stringify(data);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  // Basic CORS for local development and generic production (tighten as needed)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(payload);
}

/**
 * Handle preflight requests.
 */
function handleOptions(req: IncomingMessage, res: ServerResponse) {
  res.statusCode = 204;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end();
}

/**
 * Exchanges an OAuth2 code for tokens via Discord API.
 */
async function exchangeCodeForToken(params: {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
}) {
  const form = new URLSearchParams();
  form.set('client_id', params.clientId);
  form.set('client_secret', params.clientSecret);
  form.set('grant_type', 'authorization_code');
  form.set('code', params.code);
  form.set('redirect_uri', params.redirectUri);

  const resp = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  });

  const json = await resp.json();
  if (!resp.ok) {
    const message = typeof json?.error_description === 'string' ? json.error_description : 'Discord token exchange failed';
    throw new Error(message);
  }
  return json;
}

/**
 * API handler: POST /api/discord/exchange-code
 * Body: { code: string, redirectUri?: string }
 */
export default async function handler(req: IncomingMessage & { method?: string }, res: ServerResponse) {
  try {
    if (req.method === 'OPTIONS') {
      return handleOptions(req, res);
    }

    if (req.method !== 'POST') {
      return sendJson(res, 405, { error: 'Method Not Allowed' });
    }

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve) => {
      req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
      req.on('end', () => resolve());
    });

    const raw = Buffer.concat(chunks).toString('utf-8') || '{}';
    const body: ExchangeBody = JSON.parse(raw);

    const clientId = process.env.DISCORD_CLIENT_ID || '';
    const clientSecret = process.env.DISCORD_CLIENT_SECRET || '';
    const redirectUri = (body.redirectUri || process.env.DISCORD_REDIRECT_URI || '').trim();
    const code = (body.code || '').trim();

    if (!clientId || !clientSecret || !redirectUri) {
      return sendJson(res, 500, {
        error: 'Server misconfiguration',
        details: 'Missing DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, or DISCORD_REDIRECT_URI',
      });
    }
    if (!code) {
      return sendJson(res, 400, { error: 'Missing code' });
    }

    const tokenData = await exchangeCodeForToken({
      clientId,
      clientSecret,
      code,
      redirectUri,
    });

    // Return the essential token data; in production consider setting httpOnly cookie instead
    return sendJson(res, 200, {
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      refresh_token: tokenData.refresh_token,
      scope: tokenData.scope,
      received_at: Date.now(),
    });
  } catch (err: any) {
    return sendJson(res, 400, {
      error: 'exchange_failed',
      message: err?.message || 'Unknown error',
    });
  }
}
