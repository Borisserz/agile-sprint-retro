/**
 * External tips API + localStorage cache (Lab 6 Liber pattern).
 * Advice Slip: https://api.adviceslip.com/advice
 */

const CACHE_KEY = 'sprint-retro_tips_cache_v1';
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes
const FALLBACK_TIPS = [
  'Start the retro with one concrete win from the sprint.',
  'Ask: what slowed us down that we can change next week?',
  'Keep action items small enough to finish in one sprint.',
  'Vote with your feet: focus on the top two pain points.',
  'End with owners and dates for every action item.',
];

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.tip || !parsed?.timestamp) return null;
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(tip, source) {
  const payload = { tip, source, timestamp: Date.now() };
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
  return payload;
}

export async function fetchRetroTip({ force = false } = {}) {
  if (!force) {
    const cached = readCache();
    if (cached) return { ...cached, fromCache: true };
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    const tip = FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
    return writeCache(tip, 'offline-fallback');
  }

  try {
    const response = await fetch('https://api.adviceslip.com/advice', {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`tips http ${response.status}`);
    const data = await response.json();
    const tip = data?.slip?.advice?.trim();
    if (!tip) throw new Error('empty tip');
    return { ...writeCache(tip, 'adviceslip'), fromCache: false };
  } catch {
    const tip = FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
    return { ...writeCache(tip, 'fallback'), fromCache: false };
  }
}
