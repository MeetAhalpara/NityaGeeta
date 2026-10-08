import { test, expect } from '@playwright/test';

test.describe('NityaGeeta Production Multi-Scenario UI Matrix', () => {

  // ============================================================================
  // SCENARIO 1: GOOD DAY (Real Application Page Rendering & Navigation)
  // ============================================================================
  test.describe('Good Day Scenario (Happy Path UI)', () => {
    test('Sources page displays authentic headers, search bar, and manuscript sections', async ({ page }) => {
      await page.goto('/sources');

      // Assert real H1 and subheading
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
      await expect(heading).toContainText('Verifiable');
      await expect(heading).toContainText('Sources & Manuscripts');

      // Assert real interactive search bar
      const searchInput = page.locator('input[placeholder*="Search books"]');
      await expect(searchInput).toBeVisible();
      await searchInput.fill('Sanskrit grammar');
      await expect(searchInput).toHaveValue('Sanskrit grammar');
    });

    test('Contact page mounts all real form controls, inputs, and screenshot dropzone', async ({ page }) => {
      await page.goto('/contact');

      // Assert real form controls
      const nameInput = page.locator('input[placeholder="Enter your name"]');
      const emailInput = page.locator('input[placeholder="name@gmail.com"]');
      const messageTextarea = page.locator('textarea[placeholder*="Describe your issue"]');
      const fileInput = page.locator('#contact-page-images');
      const submitBtn = page.locator('button[type="submit"]');

      await expect(nameInput).toBeVisible();
      await expect(emailInput).toBeVisible();
      await expect(messageTextarea).toBeVisible();
      await expect(fileInput).toBeAttached();
      await expect(submitBtn).toBeVisible();
      await expect(submitBtn).toContainText('Submit Feedback');
    });
  });

  // ============================================================================
  // SCENARIO 2: BUSY DAY (Rapid Navigation & Route Switching)
  // ============================================================================
  test.describe('Busy Day Scenario (Rapid Route Switching)', () => {
    test('Navigates across multiple actual routes without client hydration crash', async ({ page }) => {
      const routes = ['/sources', '/architecture', '/dilemmas', '/privacy', '/contact'];

      for (const route of routes) {
        await page.goto(route);
        await expect(page).toHaveURL(new RegExp(route));
        // Verify persistent header brand navigation is mounted
        await expect(page.locator('header')).toBeVisible();
      }
    });
  });

  // ============================================================================
  // SCENARIO 3: RAINY DAY (Form Validation, Domain Suggestions & Error States)
  // ============================================================================
  test.describe('Rainy Day Scenario (Real Form Validation)', () => {
    test('Catches invalid email format and suggests domain typos on contact page', async ({ page }) => {
      await page.goto('/contact');

      const emailInput = page.locator('input[placeholder="name@gmail.com"]');
      await expect(emailInput).toBeVisible();

      // Test typo domain trigger (e.g. gmial.com -> gmail.com suggestion)
      await emailInput.fill('arjuna@gmial.com');
      await emailInput.blur();

      // Verify smart domain suggestion banner appears
      const suggestionBanner = page.locator('text=Did you mean');
      await expect(suggestionBanner).toBeVisible();
      await expect(page.locator('text=arjuna@gmail.com')).toBeVisible();

      // Test "Apply Fix" button
      const applyFixBtn = page.locator('button:has-text("Apply Fix")');
      await expect(applyFixBtn).toBeVisible();
      await applyFixBtn.click();
      await expect(emailInput).toHaveValue('arjuna@gmail.com');
    });
  });

  // ============================================================================
  // SCENARIO 4: TUFFEST DAY (In-Flight Duplicate Submission Protection)
  // ============================================================================
  test.describe('Tuffest Day Scenario (In-Flight Protection)', () => {
    test('Disables submit button while contact dispatch is in-flight', async ({ page }) => {
      // Mock only the backend API route with artificial delay to test in-flight UI state
      await page.route('**/api/contact', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            ticketId: 'NG-TEST-TICKET',
            deliveryStatus: 'simulated_success',
            message: 'Inquiry recorded.',
            timestamp: new Date().toUTCString(),
          }),
        });
      });

      await page.goto('/contact');

      const nameInput = page.locator('input[placeholder="Enter your name"]');
      const emailInput = page.locator('input[placeholder="name@gmail.com"]');
      const messageTextarea = page.locator('textarea[placeholder*="Describe your issue"]');
      const submitBtn = page.locator('button[type="submit"]');

      await nameInput.fill('Arjuna Pandava');
      await emailInput.fill('arjuna@kurukshetra.org');
      await messageTextarea.fill('Requesting philosophical clarity on verse 2.47 duty.');

      // Click submit
      await submitBtn.click();

      // Assert button enters in-flight state and is disabled
      await expect(submitBtn).toBeDisabled();
      await expect(submitBtn).toContainText('Sending Notification...');

      // Wait for mock API response to complete and success view to render
      await expect(page.locator('text=Feedback Received')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=NG-TEST-TICKET')).toBeVisible();
    });
  });

});
