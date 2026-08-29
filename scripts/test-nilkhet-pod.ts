import { chromium } from 'playwright';

async function testNilkhetPod() {
  console.log('📚 TESTING LIVE NILKHET PRINT-ON-DEMAND & STEADFAST BOOKING FLOW...\n');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Visit Book Detail Page
  console.log('▶ 1. Navigating to http://localhost:5000/books/amar-ekushey-novel...');
  await page.goto('http://localhost:5000/books/amar-ekushey-novel', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid="button-order-nilkhet-pod"]', { timeout: 10000 });

  const title = await page.locator('h1').first().textContent();
  console.log('   Book Title Displayed:', title?.trim());

  // 2. Click Order Physical Book
  console.log('▶ 2. Clicking "Order Physical Book (Nilkhet POD)" button...');
  const orderBtn = page.locator('[data-testid="button-order-nilkhet-pod"]');
  await orderBtn.click();
  await page.waitForSelector('text=Nilkhet Print-on-Demand (POD) Order', { timeout: 5000 });

  // 4. Fill in order details
  console.log('▶ 3. Filling in recipient shipping credentials...');
  await page.fill('input[placeholder*="Rahim"]', 'Rahim Chowdhury (Author Customer)');
  await page.fill('input[placeholder*="017"]', '01812345678');
  await page.fill('input[placeholder*="Dhanmondi"]', 'House 24, Road 7/A, Dhanmondi, Dhaka-1209');

  await page.waitForTimeout(600);

  // 5. Submit Order
  console.log('▶ 4. Submitting physical printing order to Nilkhet Hub & Steadfast Courier...');
  const submitBtn = page.locator('button[type="submit"]:has-text("Confirm & Order Book")');
  await submitBtn.click();

  await page.waitForSelector('text=Order Successfully Placed!', { timeout: 10000 });

  // 6. Verify confirmation screen
  const successTitle = await page.isVisible('text=Order Successfully Placed!');
  const invoiceText = await page.locator('text=NLK_INV_').textContent();
  const trackingText = await page.locator('text=BD_').first().textContent();

  console.log('   Order Placement Success:', successTitle);
  console.log('   Invoice Number:', invoiceText?.trim());
  console.log('   Steadfast Tracking Code:', trackingText?.trim());

  await page.screenshot({ path: 'nilkhet_order_verified.png', fullPage: false });
  await browser.close();

  console.log('\n✅ NILKHET POD PHYSICAL PRINTING & COURIER ORDERING FULLY VERIFIED!');
}

testNilkhetPod().catch(console.error);
