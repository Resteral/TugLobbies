/**
 * Webhook endpoint: accepts pasted CSV of end-game results and returns parsed matches.
 * Supports Content-Type: text/csv or application/json with { csvText }.
 * Designed for simple integration where the frontend updates markets and leaderboards.
 */

export const config = {
  runtime: 'edge',
};

interface CSVMatchData {
  player1Name: string;
  player2Name: string;
  winner: string;
  date?: string;
  duration?: string | number;
  map?: string;
  gameType?: string;
}

/**
 * Parse CSV lines into objects (naive parser; no quoted fields handling).
 */
function parseCSV(csvText: string): { matches: CSVMatchData[]; errors: string[] } {
  const errors: string[] = [];
  if (!csvText || !csvText.trim()) {
    errors.push('CSV is empty');
    return { matches: [], errors };
  }

  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length &lt; 2) {
    errors.push('CSV must include headers and at least one row');
    return { matches: [], errors };
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const required = ['player1name', 'player2name', 'winner'];

  required.forEach((req) =&gt; {
    if (!headers.includes(req)) errors.push(`Missing required header: ${req}`);
  });

  const matches: CSVMatchData[] = [];
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const values = line.split(',').map((v) =&gt; v.trim());
    const row: Record&lt;string, string&gt; = {};
    headers.forEach((h, i) =&gt; (row[h] = values[i] ?? ''));

    matches.push({
      player1Name: row['player1name'] || row['player1'] || row['p1'] || '',
      player2Name: row['player2name'] || row['player2'] || row['p2'] || '',
      winner: row['winner'] || '',
      date: row['date'],
      duration: row['duration'],
      map: row['map'],
      gameType: row['gametype'] || 'zealot-hockey',
    });
  }

  return { matches, errors };
}

/**
 * Group winners for a quick summary
 */
function summarize(matches: CSVMatchData[]) {
  const winners: Record&lt;string, number&gt; = {};
  for (const m of matches) {
    const w = (m.winner || '').trim();
    if (!w) continue;
    winners[w] = (winners[w] || 0) + 1;
  }
  return {
    count: matches.length,
    winners,
  };
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    let csvText = '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      csvText = body.csvText || body.csv || '';
    } else {
      // Accept raw text/csv
      csvText = await req.text();
    }

    const { matches, errors } = parseCSV(csvText);
    if (errors.length) {
      return new Response(JSON.stringify({ ok: false, errors }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const summary = summarize(matches);

    return new Response(JSON.stringify({ ok: true, matches, summary }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, error: err?.message || 'Unexpected error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
