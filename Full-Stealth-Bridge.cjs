
const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const path = require('path');
chromium.use(stealth);

/**
 * Full-Stealth-Bridge.cjs
 * Suno.com의 보안을 우회하여 프롬프트 입력부터 생성까지 전과정을 자동화합니다.
 */

async function startFullAutomation(title, style, lyrics) {
    console.log('🛡️ Starting Stealth Bridge for Suno...');

    let browser;
    try {
        browser = await chromium.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const context = await browser.newContext({
            viewport: { width: 1280, height: 800 }
        });

        const page = await context.newPage();

        console.log('🎭 Navigating with Stealth mode...');
        await page.goto('https://suno.com/create', { waitUntil: 'load', timeout: 60000 });

        const waitRandom = (min, max) => new Promise(res => setTimeout(res, Math.floor(Math.random() * (max - min + 1) + min)));

        console.log('✨ Checking for Custom Mode...');
        // Wait for page load and look for custom toggle
        await page.waitForTimeout(5000);

        // Try to find the custom toggle
        const customToggle = page.locator('button:has-text("Custom"), [role="switch"]:has-text("Custom")').first();
        if (await customToggle.isVisible()) {
            await customToggle.click();
            console.log('✅ Custom Mode Enabled.');
            await waitRandom(1000, 2000);
        }

        console.log('✍️ Typing Lyrics...');
        const lyricsArea = page.locator('textarea[placeholder*="lyrics"], textarea[name="lyrics"]').first();
        await lyricsArea.click();
        await page.keyboard.insertText(lyrics);
        await waitRandom(500, 1500);

        console.log('✍️ Typing Style...');
        const styleInput = page.locator('input[placeholder*="style"], textarea[placeholder*="style"], [name="tags"]').first();
        await styleInput.click();
        await page.keyboard.type(style, { delay: 50 });
        await waitRandom(500, 1000);

        console.log('✍️ Typing Title...');
        const titleInput = page.locator('input[placeholder*="title"], [name="title"]').first();
        await titleInput.click();
        await page.keyboard.type(title, { delay: 100 });

        console.log('🚀 Ready to Create! Performing final check...');
        await waitRandom(2000, 3000);

        const createBtn = page.locator('button:has-text("Create"), button[aria-label="Create"]').first();

        if (await createBtn.isVisible()) {
            console.log('🔥 Triggering Song Creation!');
            await createBtn.click();
            await waitRandom(5000, 10000); // Wait long enough to see the creation start
            console.log('✅ Create button clicked. Your song is being generated!');
        } else {
            console.error('❌ Could not find the Create button. Please check the screen.');
        }

        console.log('🎉 Automation Sequence Completed.');
        // Don't close immediately so the user can see it
        await page.waitForTimeout(5000);

    } catch (err) {
        console.error('❌ Stealth Bridge Failed:', err);
    } finally {
        if (browser) {
            // await browser.close(); // For testing, keep it open or close based on preference
        }
    }
}

const args = process.argv.slice(2);
if (args.length >= 3) {
    startFullAutomation(args[0], args[1], args[2]);
} else {
    console.log('Usage: node Full-Stealth-Bridge.cjs "Title" "Style" "Lyrics"');
}
