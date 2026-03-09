import { test, expect } from '@playwright/test';

test('Send a message and receive a response', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const prompt = 'hi';

    await page.locator('textarea').fill(prompt);
    await page.getByRole('button', { name: 'Send' }).click();
  
    // User message should appear
    await expect(page.locator('.message.user .message-content').last()).toContainText(prompt);

    // Assistant message should appear and should not contain error
    const assistant = page.locator('.message.assistant .message-content').last();
    await expect(assistant).toBeVisible();
    await expect(assistant).not.toContainText('Error:');
});