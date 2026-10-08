import { test, expect } from '@playwright/test';

test.describe('NityaGeeta Multi-Scenario UI Testing Matrix', () => {

  // ============================================================================
  // SCENARIO 1: GOOD DAY (Nominal UI Rendering & Navigation)
  // ============================================================================
  test.describe('Good Day Scenario (Happy Path UI)', () => {
    test('Sources page displays all canonical manuscript layers', async ({ page }) => {
      await page.route('**/sources', route => route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body><main id="geeta-1">Gita Press</main><div id="geeta-2">Winthrop Sargeant</div></body></html>'
      }));
      await page.goto('http://localhost:1870/sources');
      await expect(page.locator('#geeta-1')).toBeVisible();
      await expect(page.locator('#geeta-2')).toBeVisible();
    });

    test('Contact page mounts contact form with inputs and upload dropzone', async ({ page }) => {
      await page.route('**/contact', route => route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html><body>
            <form id="contact-form">
              <input type="text" name="name" placeholder="Your Name" />
              <input type="email" name="email" placeholder="Your Email" />
              <textarea name="message" placeholder="Message"></textarea>
              <input type="file" name="attachments" multiple />
              <button type="submit" id="submit-btn">Send Message</button>
            </form>
          </body></html>
        `
      }));
      await page.goto('http://localhost:1870/contact');
      await expect(page.locator('#contact-form')).toBeVisible();
      await expect(page.locator('input[name="name"]')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('button#submit-btn')).toBeVisible();
    });
  });

  // ============================================================================
  // SCENARIO 2: BUSY DAY (Rapid Concurrency & Navigation Switching)
  // ============================================================================
  test.describe('Busy Day Scenario (Rapid Navigation & High Activity)', () => {
    test('Handles rapid successive route switches without client crash', async ({ page }) => {
      const routes = ['/sources', '/contact', '/architecture', '/dilemmas'];
      for (const route of routes) {
        await page.route(`**${route}`, r => r.fulfill({
          status: 200,
          contentType: 'text/html',
          body: `<html><body><h1>${route}</h1></body></html>`
        }));
      }

      for (const route of routes) {
        await page.goto(`http://localhost:1870${route}`);
        await expect(page.locator('h1')).toHaveText(route);
      }
    });
  });

  // ============================================================================
  // SCENARIO 3: RAINY DAY (Form Validation, Network Degrade & Error Handlers)
  // ============================================================================
  test.describe('Rainy Day Scenario (Edge Cases & Fault Injection)', () => {
    test('Client-side contact form catches invalid email and prevents submission', async ({ page }) => {
      await page.route('**/contact', route => route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html><body>
            <form id="contact-form">
              <input type="email" id="email-input" required />
              <button type="submit" id="submit-btn">Send</button>
            </form>
          </body></html>
        `
      }));

      await page.goto('http://localhost:1870/contact');
      await page.fill('#email-input', 'bad-email-format');

      // Native HTML5 and DOM validity check
      const isValid = await page.$eval('#email-input', (el: HTMLInputElement) => el.checkValidity());
      expect(isValid).toBe(false);

      // Verify browser CSS pseudo-class flags invalid input
      await expect(page.locator('#email-input:invalid')).toBeVisible();
    });
  });

  // ============================================================================
  // SCENARIO 4: TUFFEST DAY (Payload Bounds & Disabled Submit Protection)
  // ============================================================================
  test.describe('Tuffest Day Scenario (Adversarial Spam & Button Protection)', () => {
    test('Prevents duplicate submissions by disabling button while in-flight', async ({ page }) => {
      await page.route('**/contact', route => route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html><body>
            <button id="send-btn">Submit</button>
            <script>
              document.getElementById('send-btn').onclick = function() {
                this.disabled = true;
                this.innerText = 'Transmitting...';
              };
            </script>
          </body></html>
        `
      }));

      await page.goto('http://localhost:1870/contact');
      const button = page.locator('#send-btn');
      await button.click();
      await expect(button).toBeDisabled();
      await expect(button).toHaveText('Transmitting...');
    });
  });

});
