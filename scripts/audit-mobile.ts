import { chromium, devices } from 'playwright';

async function auditMobile() {
  console.log('📱 STARTING MOBILE UI/UX AUDIT (Header, Footer, Bottom Nav, Touch Targets)...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices['iPhone 14'],
    locale: 'en-US',
  });
  const page = await context.newPage();

  // 1. Homepage Mobile Audit
  console.log('▶ Auditing Homepage (http://localhost:5000/)...');
  await page.goto('http://localhost:5000/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'mobile_home_top.png' });

  // Check header elements
  const headerVisible = await page.isVisible('header');
  const headerBounding = await page.locator('header').first().boundingBox();
  console.log('  Header Visible:', headerVisible, '| BoundingBox:', headerBounding);

  // Check buttons in header
  const headerButtons = await page.locator('header button').allTextContents();
  console.log('  Header Buttons:', headerButtons);

  // Open mobile menu by clicking hamburger button
  const hamburgerBtn = page.locator('[data-testid="button-mobile-menu"]').first();
  if (await hamburgerBtn.count() > 0) {
    console.log('  Clicking mobile menu toggle [data-testid="button-mobile-menu"]...');
    await hamburgerBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'mobile_menu_open.png' });
    // Close the drawer
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  // 2. Secondary Layout (Public Marketing) Mobile Audit on /pricing
  console.log('▶ Auditing /pricing (Secondary Layout with Marketing Header & Footer)...');
  await page.goto('http://localhost:5000/pricing', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'mobile_pricing_top.png' });

  // Scroll to Footer on Pricing Page
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'mobile_pricing_footer.png' });

  const footerExists = await page.isVisible('footer');
  const footerLinks = await page.locator('footer a').evaluateAll(els => els.map(e => ({ text: e.textContent?.trim(), href: e.getAttribute('href') })).filter(e => e.text));
  console.log('  Pricing Footer Visible:', footerExists, '| Link Count:', footerLinks.length);
  console.log('  Pricing Footer Links Sample:', footerLinks.slice(0, 10));

  // 3. Check for any horizontal overflow (horizontal scrollbar bug)
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  console.log('  Horizontal scroll overflow on /pricing:', hasHorizontalScroll);

  // 4. Chat & Studios Mobile Audit
  console.log('▶ Auditing Mobile Studio / Chat (/agents/chat)...');
  await page.goto('http://localhost:5000/agents/chat', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'mobile_studio_chat.png' });

  // Check bottom navigation bar
  const bottomNavExists = await page.locator('nav[aria-label="Mobile navigation bar"]').isVisible();
  console.log('  Mobile Bottom Nav Visible on /agents/chat:', bottomNavExists);

  // 5. Twin AI Mobile Audit
  console.log('▶ Auditing Twin AI (/twin)...');
  await page.goto('http://localhost:5000/twin', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'mobile_twin.png' });

  await browser.close();
  console.log('✅ MOBILE AUDIT SCREENSHOTS CAPTURED & AUDIT COMPLETE!');
}
auditMobile().catch(console.error);
