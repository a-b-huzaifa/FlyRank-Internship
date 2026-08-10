const cheerio = require('cheerio');

function parseCatalogue(html) {
  const $ = cheerio.load(html);
  
  const bookHrefs = [];
  $('.product_pod h3 a').each((_, el) => {
    const href = $(el).attr('href');
    if (href) {
      bookHrefs.push(href.trim());
    }
  });
  
  const nextHref = $('li.next a').attr('href');
  
  return {
    bookHrefs,
    nextHref: nextHref ? nextHref.trim() : null
  };
}

function parseBookDetail(html) {
  const $ = cheerio.load(html);
  
  const productMain = $('.product_main');
  if (!productMain.length) {
    throw new Error('Not a valid book detail page structure');
  }

  const title = productMain.find('h1').text().trim();
  const price_text = productMain.find('.price_color').text().trim();
  
  const availability_text = productMain
    .find('.availability')
    .text()
    .trim()
    .replace(/\s+/g, ' ');
  
  const ratingClass = productMain.find('.star-rating').attr('class') || '';
  const rating_text = ratingClass.replace('star-rating', '').trim();
  
  const descEl = $('#product_description').next('p');
  const description = descEl.length ? descEl.text().trim() : null;
  
  return {
    title,
    price_text,
    availability_text,
    rating_text,
    description
  };
}

module.exports = {
  parseCatalogue,
  parseBookDetail
};
