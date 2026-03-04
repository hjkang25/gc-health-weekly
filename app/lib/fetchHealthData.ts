export const dynamic = 'force-dynamic';

export type Keyword = {
  rank: number;
  kw: string;
  trend: 'up' | 'down' | 'new' | 'same';
  related: string[];
};

export type NaverCategory = {
  label: string;
  ratio: number;
};

export type PageData = {
  week: string;
  vol: string;
  date: string;
  topKeyword: string;
  keywords: Keyword[];
  naverCategories: NaverCategory[];
};

// Quoted-field-aware CSV parser
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/^\uFEFF/, '').trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const values: string[] = [];
    let cur = '';
    let inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { values.push(cur); cur = ''; }
      else { cur += ch; }
    }
    values.push(cur);
    return Object.fromEntries(
      headers.map((h, i) => [h, (values[i] ?? '').trim().replace(/^"|"$/g, '')])
    );
  });
}

async function fetchWithTimeout(url: string, options: RequestInit, ms = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Step 1: List files in a repo's /data folder via GitHub API (no token — repos are public)
async function listDataFiles(repo: string): Promise<Array<{ name: string }>> {
  const url = `https://api.github.com/repos/hjkang25/${repo}/contents/data`;
  console.log(`[listDataFiles] Fetching file list from GitHub API: ${url}`);
  const res = await fetchWithTimeout(
    url,
    { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store' }
  );
  if (!res.ok) {
    console.log(`[listDataFiles] Failed for ${repo}: ${res.status} ${res.statusText}`);
    return [];
  }
  const files = await res.json();
  console.log(`[listDataFiles] Found ${files.length} files in ${repo}/data`);
  return files;
}

// Step 2: Get latest filename via API, then fetch CSV content via raw.githubusercontent.com (no auth needed)
async function fetchCSV(repo: string, prefix: string, skip = 0): Promise<string> {
  console.log(`[fetchCSV] repo=${repo} prefix="${prefix}" skip=${skip}`);

  const files = await listDataFiles(repo);
  const sorted = files
    .filter(f => f.name.startsWith(prefix) && f.name.endsWith('.csv'))
    .sort((a, b) => b.name.localeCompare(a.name));
  const target = sorted[skip];
  if (!target) {
    console.log(`[fetchCSV] No matching file for prefix="${prefix}" skip=${skip}`);
    return '';
  }
  console.log(`[fetchCSV] Selected file: ${target.name}`);

  const rawUrl = `https://raw.githubusercontent.com/hjkang25/${repo}/main/data/${target.name}`;
  console.log(`[fetchCSV] Fetching CSV content from: ${rawUrl}`);
  const res = await fetchWithTimeout(rawUrl, { cache: 'no-store' });
  if (!res.ok) {
    console.log(`[fetchCSV] Failed to fetch ${rawUrl}: ${res.status} ${res.statusText}`);
    return '';
  }
  const text = await res.text();
  console.log(`[fetchCSV] Received ${text.length} chars for ${target.name}`);
  return text;
}

function getWeekLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((d.getTime() - startOfYear.getTime()) / 86400000);
  const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${year}년 ${month}월 ${day}일 · ${week}주차`;
}

export async function fetchHealthData(): Promise<PageData> {
  const t0 = Date.now();
  console.log('[fetchHealthData] start', new Date().toISOString());
  console.log('[fetchHealthData] Fetching all CSVs in parallel...');

  const [top20LatestText, top20PrevText, relatedText, naverText] = await Promise.all([
    fetchCSV('health-trend-report-v3', 'top20_', 0),
    fetchCSV('health-trend-report-v3', 'top20_', 1),
    fetchCSV('health-trend-report-v3', 'related_', 0),
    fetchCSV('health-trend-report', 'naver_trends_', 0),
  ]);

  console.log('[fetchHealthData] All CSVs fetched, parsing...');
  const top20 = parseCSV(top20LatestText);
  const top20Prev = parseCSV(top20PrevText);
  const related = parseCSV(relatedText);
  const naver = parseCSV(naverText);

  // prev rank map: keyword → rank
  const prevRankMap = new Map(top20Prev.map(r => [r.keyword, parseInt(r.rank)]));

  // related map: seed_keyword → [related_keyword, ...]  (up to 4)
  const relatedMap = new Map<string, string[]>();
  for (const row of related) {
    if (!relatedMap.has(row.seed_keyword)) relatedMap.set(row.seed_keyword, []);
    const arr = relatedMap.get(row.seed_keyword)!;
    if (arr.length < 4) arr.push(row.related_keyword);
  }

  // Build top-8 keywords with trend
  const top8 = top20.slice(0, 8);
  const latestDate = top8[0]?.date ?? '';

  const keywords: Keyword[] = top8.map(row => {
    const rank = parseInt(row.rank);
    const kw = row.keyword;
    const prevRank = prevRankMap.get(kw);

    const trend: Keyword['trend'] =
      prevRank === undefined ? 'new' :
      rank < prevRank       ? 'up'  :
      rank > prevRank       ? 'down' : 'same';

    // Related lookup: exact match → partial match → empty
    let rels = relatedMap.get(kw) ?? [];
    if (!rels.length) {
      for (const [seed, kws] of relatedMap) {
        if (kw.includes(seed) || seed.includes(kw)) {
          rels = kws;
          break;
        }
      }
    }

    return { rank, kw, trend, related: rels.slice(0, 4) };
  });

  // naverCategories: most recent period ratio per keyword_group, top 5
  const groupMap = new Map<string, { ratio: number; period: string }>();
  for (const row of naver) {
    const existing = groupMap.get(row.keyword_group);
    if (!existing || row.period > existing.period) {
      groupMap.set(row.keyword_group, {
        ratio: parseFloat(row.ratio),
        period: row.period,
      });
    }
  }

  const naverCategories: NaverCategory[] = Array.from(groupMap.entries())
    .map(([label, { ratio }]) => ({ label, ratio: Math.round(ratio * 10) / 10 }))
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 5);

  const displayDate = latestDate
    ? latestDate.replace(/-/g, '.').slice(0, 10)
    : new Date().toISOString().slice(0, 10).replace(/-/g, '.');

  console.log(`[fetchHealthData] done in ${Date.now() - t0}ms — ${keywords.length} keywords, ${naverCategories.length} categories`);

  return {
    date: displayDate,
    week: latestDate ? getWeekLabel(latestDate) : '',
    vol: 'VOL.10',
    topKeyword: keywords[0]?.kw ?? '',
    keywords,
    naverCategories,
  };
}
