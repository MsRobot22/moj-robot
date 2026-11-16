import puppeteer from 'puppeteer';

const PRICE_SELECTOR = '[data-qa*="price"]';

export async function fetchPrice(url) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Poczekaj na pojawienie się elementu ceny
    await page.waitForSelector(PRICE_SELECTOR, { timeout: 15000 }).catch(() => {});

    const priceText = await page.evaluate((selector) => {
      const el = document.querySelector(selector);
      return el ? el.textContent.trim() : null;
    }, PRICE_SELECTOR);

    if (!priceText) return null;

    // Wyodrębnij liczbę, np. "134,00 zł" → 134.00
    const match = priceText.replace(/\s/g, '').match(/([\d]+[.,]?[\d]*)/);
    if (!match) return null;

    return parseFloat(match[1].replace(',', '.'));
  } finally {
    await browser.close();
  }
}
