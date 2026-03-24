import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
await page.goto('http://localhost:3336/login', { waitUntil: 'networkidle', timeout: 15000 });
await page.screenshot({ path: 'tests/screenshots/sentinel-c2-login.png', fullPage: true });
const html = await page.content();
// Find all inputs and buttons
const inputs = await page.$$eval('input', els => els.map(e => ({ type: e.type, name: e.name, placeholder: e.placeholder, id: e.id })));
const buttons = await page.$$eval('button', els => els.map(e => ({ type: e.type, text: e.textContent.trim(), class: e.className })));
console.log('INPUTS:', JSON.stringify(inputs, null, 2));
console.log('BUTTONS:', JSON.stringify(buttons, null, 2));
console.log('URL:', page.url());
await browser.close();
