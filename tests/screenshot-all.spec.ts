import { test } from '@playwright/test';

const PAGES = [
  { path: '/', name: '01-home' },
  { path: '/welcome', name: '02-welcome' },
  { path: '/onboarding', name: '03-onboarding' },
  { path: '/login', name: '04-login' },
  { path: '/search', name: '05-search' },
  { path: '/search/map', name: '06-search-map' },
  { path: '/community', name: '07-community' },
  { path: '/events', name: '08-events' },
  { path: '/roommates', name: '09-roommates' },
  { path: '/city/c0000001-0000-4000-a000-000000000001', name: '10-city-istanbul' },
  { path: '/budget', name: '11-budget' },
  { path: '/mentors', name: '12-mentors' },
  { path: '/forgot-password', name: '13-forgot-password' },
];

for (const page of PAGES) {
  test(`Screenshot: ${page.name}`, async ({ page: p }) => {
    await p.goto(page.path);
    await p.waitForTimeout(2000);
    await p.screenshot({ path: `tests/screenshots/${page.name}.png`, fullPage: true });
  });
}
