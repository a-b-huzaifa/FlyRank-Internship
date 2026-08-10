const fs = require('fs');
const path = require('path');
const { fetchWithCache, fetchRobotsTxt, getStats } = require('./fetch');
const { parseCatalogue, parseBookDetail } = require('./extract');
const { normalizePrice, resolveUrl } = require('./normalize');
const { validateBookRecord } = require('./schema');

const START_URL = 'https://books.toscrape.com/index.html';
const OUTPUT_DIR = path.join(__dirname, '../output');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function run() {
  const startTime = Date.now();
  console.log('=== Starting Web Scraper ===\n');

  console.log('Fetching robots.txt...');
  const robotsText = await fetchRobotsTxt();
  console.log('--- robots.txt content ---');
  console.log(robotsText);
  console.log('--------------------------\n');

  const bookUrlToSourceMap = new Map();
  let currentCatalogueUrl = START_URL;
  let cataloguePageCount = 0;
  let totalDiscovered = 0;

  console.log('Discovering catalogue pages...');
  while (currentCatalogueUrl && cataloguePageCount < 3) {
    cataloguePageCount++;
    console.log(`Processing catalogue page ${cataloguePageCount}: ${currentCatalogueUrl}`);
    
    try {
      const html = await fetchWithCache(currentCatalogueUrl);
      const { bookHrefs, nextHref } = parseCatalogue(html);

      totalDiscovered += bookHrefs.length;
      bookHrefs.forEach(href => {
        const absoluteBookUrl = resolveUrl(href, currentCatalogueUrl);
        if (!bookUrlToSourceMap.has(absoluteBookUrl)) {
          bookUrlToSourceMap.set(absoluteBookUrl, currentCatalogueUrl);
        }
      });

      if (nextHref && cataloguePageCount < 3) {
        currentCatalogueUrl = resolveUrl(nextHref, currentCatalogueUrl);
      } else {
        currentCatalogueUrl = null;
      }
    } catch (err) {
      console.error(`Failed to process catalogue page ${currentCatalogueUrl}:`, err.message);
      break;
    }
  }

  const uniqueBookUrls = Array.from(bookUrlToSourceMap.keys());
  console.log('\n--- Discovery Stats ---');
  console.log(`catalogue_pages=${cataloguePageCount}`);
  console.log(`discovered=${totalDiscovered}`);
  console.log(`unique_urls=${uniqueBookUrls.length}`);
  console.log('-----------------------\n');

  const validRecords = [];
  const invalidRecords = [];
  const failedPages = [];

  console.log('Extracting books detail data...');
  for (const bookUrl of uniqueBookUrls) {
    const sourcePage = bookUrlToSourceMap.get(bookUrl);
    const fetchedAt = new Date().toISOString();

    try {
      const html = await fetchWithCache(bookUrl);
      const rawData = parseBookDetail(html);

      const record = {
        title: rawData.title,
        product_url: bookUrl,
        price_text: rawData.price_text,
        price_gbp: normalizePrice(rawData.price_text),
        availability_text: rawData.availability_text,
        rating_text: rawData.rating_text,
        description: rawData.description,
        source_page: sourcePage,
        fetched_at: fetchedAt
      };

      const validation = validateBookRecord(record);
      if (validation.success) {
        validRecords.push(validation.data);
      } else {
        console.warn(`Validation failed for book: ${bookUrl}`);
        invalidRecords.push({
          url: bookUrl,
          record: record,
          errors: validation.errors
        });
      }
    } catch (err) {
      console.error(`Error processing book page ${bookUrl}:`, err.message);
      failedPages.push({
        url: bookUrl,
        reason: err.message
      });
    }
  }

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'books.json'),
    JSON.stringify(validRecords, null, 2),
    'utf8'
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'errors.json'),
    JSON.stringify(invalidRecords, null, 2),
    'utf8'
  );

  const durationMs = Date.now() - startTime;
  const stats = getStats();
  const runReport = {
    start_time: new Date(startTime).toISOString(),
    duration_ms: durationMs,
    pages_fetched: stats.pagesFetched,
    cache_hits: stats.cacheHits,
    valid_records: validRecords.length,
    invalid_records: invalidRecords.length,
    failed_pages: {
      count: failedPages.length,
      details: failedPages
    }
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'run-report.json'),
    JSON.stringify(runReport, null, 2),
    'utf8'
  );

  console.log('\n=== Scraper Run Finished ===');
  console.log(`Duration: ${durationMs}ms`);
  console.log(`Pages Fetched: ${stats.pagesFetched}`);
  console.log(`Cache Hits: ${stats.cacheHits}`);
  console.log(`Valid Books Saved: ${validRecords.length}`);
  console.log(`Invalid Books Count: ${invalidRecords.length}`);
  console.log(`Failed Pages Count: ${failedPages.length}`);
  console.log('============================\n');
}

run().catch(err => {
  console.error('Fatal crash in scraper runtime:', err);
  process.exit(1);
});
