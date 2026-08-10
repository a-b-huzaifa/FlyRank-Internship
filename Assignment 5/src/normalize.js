function normalizePrice(priceText) {
  if (!priceText) return 0;
  const match = priceText.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

function resolveUrl(relativeHref, baseUrl) {
  return new URL(relativeHref, baseUrl).href;
}

module.exports = {
  normalizePrice,
  resolveUrl
};
