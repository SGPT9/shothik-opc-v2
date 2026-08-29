import { chromium } from 'playwright';

async function debugPage() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:5000/books/amar-ekushey-novel', { waitUntil: 'networkidle' });
  const content = await page.textContent('body');
  console.log('BODY SAMPLE:', content?.slice(0, 300));
  await browser.close();
}
debugPage();
