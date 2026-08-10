const fs = require('fs');
const path = require('path');

const USER_AGENT = "ScraperInternshipA9/1.0 (+https://github.com/a-b-huzaifa)";
const TIMEOUT_MS = 5000;
const CACHE_DIR = path.join(__dirname, '../cache');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

let lastRequestTime = 0;
let cacheHits = 0;
let pagesFetched = 0;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function enforceRateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < 500) {
    const waitTime = 500 - timeSinceLastRequest;
    await delay(waitTime);
  }
  lastRequestTime = Date.now();
}

function getCacheFilename(url) {
  const safeName = url.replace(/[^a-zA-Z0-9]/g, '_');
  return path.join(CACHE_DIR, `${safeName}.html`);
}

async function fetchWithTimeout(url, options = {}, timeout = TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        ...options.headers
      }
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function fetchWithCache(url, options = {}) {
  const cachePath = getCacheFilename(url);

  if (fs.existsSync(cachePath)) {
    const html = fs.readFileSync(cachePath, 'utf8');
    const size = Buffer.byteLength(html, 'utf8');
    console.log(`CACHE HIT: ${url} (${size} bytes)`);
    cacheHits++;
    return html;
  }

  let attempts = 0;
  while (attempts < 2) {
    attempts++;
    await enforceRateLimit();

    try {
      console.log(`FETCH: ${url}`);
      const response = await fetchWithTimeout(url, options);
      pagesFetched++;

      if (response.status === 200) {
        const html = await response.text();
        const size = Buffer.byteLength(html, 'utf8');
        fs.writeFileSync(cachePath, html, 'utf8');
        console.log(`FETCH SUCCESS: ${url} (${size} bytes)`);
        return html;
      }

      if (response.status >= 500 && response.status < 600) {
        console.warn(`Server error ${response.status} on ${url}. Attempt ${attempts} of 2.`);
        if (attempts < 2) {
          await delay(1000);
          continue;
        }
      }

      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);

    } catch (err) {
      const isTimeout = err.name === 'AbortError' || err.message.toLowerCase().includes('timeout');
      const isRetryable = isTimeout || err.message.includes('HTTP Error 5');

      if (isRetryable && attempts < 2) {
        console.warn(`Request failed on ${url} (${err.message}). Retrying in 1s...`);
        await delay(1000);
        continue;
      }
      throw err;
    }
  }

  throw new Error(`Failed to fetch ${url} after 2 attempts.`);
}

async function fetchRobotsTxt() {
  const url = 'https://books.toscrape.com/robots.txt';
  try {
    const response = await fetchWithTimeout(url);
    if (response.status === 200) {
      return await response.text();
    }
    return "no robots file found";
  } catch (err) {
    return "no robots file found";
  }
}

module.exports = {
  fetchWithCache,
  fetchRobotsTxt,
  getStats: () => ({ cacheHits, pagesFetched })
};
