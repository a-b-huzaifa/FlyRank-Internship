# Polite Web Scraper - Assignment 5

This is a standalone, polite web scraper designed to crawl the first 3 catalogue pages of the public practice sandbox, extract details of all 60 books, validate them against a strict schema, and compile clean JSON records.

---

## Target Classification
- **Target Site**: [Books to Scrape](https://books.toscrape.com/)
- **Why Appropriate**: The site is a public, sandbox-styled environment built specifically for developer scraping practice.
- **Scope**: Exactly the first 3 catalogue pages (discovering 60 unique book URLs) followed by crawling those 60 detail pages.
- **Collected Fields**: Book titles, absolute page URLs, raw prices, decimal parsed prices, availability text, star ratings, descriptions (or null), source catalogue page URL, and fetch timestamps.
- **Robots.txt Assessment**: The target host has no `robots.txt` configuration (returns HTTP 404). Our scraper attempts to read it at runtime and handles it gracefully.

> **I will not reuse this code on another site without checking its rules and terms first.**

---

## How to Run the Scraper

Ensure you have Node.js version 20+ installed.

1. Open your terminal and navigate to the project directory:
   ```bash
   cd "Assignment 5"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the scraper:
   ```bash
   npm start
   ```

*Outputs will be saved in `output/books.json`, `output/errors.json`, and `output/run-report.json`.*

---

## Record Schema

We define the book record schema using **Zod** as follows:

| Field Name | Type | Validation Rules | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | Non-empty | Raw book title |
| `product_url` | `string` | Valid URL | Canonical absolute URL of the book detail page |
| `price_text` | `string` | Non-empty | Original currency price string (e.g. `£51.77`) |
| `price_gbp` | `number` | Non-negative float | Normalised decimal price value (e.g. `51.77`) |
| `availability_text` | `string` | Non-empty | Stock quantity status |
| `rating_text` | `string` | Non-empty | Star rating string (e.g. `"Three"`) |
| `description` | `string` or `null` | Nullable | Product description paragraph (null if empty) |
| `source_page` | `string` | Valid URL | Catalogue index page absolute URL where discovered |
| `fetched_at` | `string` | ISO 8601 DateTime | Precise UTC timestamp of the network request |

---

## Politeness Rules Followed

1. **User-Agent Identification**: Every request identifies itself with an honest user-agent header:
   `ScraperInternshipA9/1.0 (+https://github.com/a-b-huzaifa)`
2. **Rate Limiting**: The engine enforces a minimum delay of **500ms** between real network requests to avoid hammer loads.
3. **Timeouts**: Every request has a **5000ms** timeout threshold configured using Node's `AbortController` to prevent hanging processes.
4. **Caching Layer**: Fetched HTML pages are cached in the `cache/` directory. Subrun requests read from cache files instantly, eliminating duplicate server hits.
5. **Failures and Retries**: Timeout or server 5xx errors trigger exactly **one automatic retry** after a 1-second pause. Client errors like 403 and 404 are not retried.

---

## Limitations

- **Dynamic JavaScript Content**: This scraper uses plain HTTP requests and Cheerio. It does not parse or execute clientside JavaScript (e.g. single page react/vue applications). If a website renders data dynamically after page load, this scraper will fail to locate the elements.
- **Dynamic Session Handling**: Captchas, session rotation, and IP rotation are not supported natively.

---

## Ethics Note

1. **Official APIs**: Always prioritize public/official API endpoints for data acquisition rather than scraping raw HTML when they exist.
2. **Access Controls**: Never bypass logins, cookies, paywalls, or rate-limit protections (like Cloudflare wrappers) to scrape data.
3. **Minimization**: Scraping should target only the narrow, required scope of fields and pages. Always store data securely and abide by terms of service.
