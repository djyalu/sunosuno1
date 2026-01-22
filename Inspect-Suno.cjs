
const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const path = require('path');
const fs = require('fs');
chromium.use(stealth);

async function inspect() {
    const userDataDir = path.join(process.env.LOCALAPPDATA, 'Playwright-Suno-Final');
    console.log('🔍 Inspecting Suno UI in Edge...');

    const context = await chromium.launchPersistentContext(userDataDir, {
        channel: 'msedge',
        headless: false,
        viewport: { width: 1280, height: 900 }
    });

    const page = await context.newPage();
    try {
        await page.goto('https://suno.com/create', { waitUntil: 'load' });
        await page.waitForTimeout(3000);

        // Analyze all textareas and inputs
        const elements = await page.evaluate(() => {
            const inputs = Array.from(document.querySelectorAll('input, textarea, [contenteditable="true"]'));
            return inputs.map((el, i) => ({
                index: i,
                tag: el.tagName,
                placeholder: el.getAttribute('placeholder') || '',
                ariaLabel: el.getAttribute('aria-label') || '',
                id: el.id,
                className: el.className,
                isVisible: el.offsetWidth > 0 && el.offsetHeight > 0,
                rect: el.getBoundingClientRect()
            }));
        });

        fs.writeFileSync('suno_ui_report.json', JSON.stringify(elements, null, 2));
        console.log('✅ UI Report saved to suno_ui_report.json');

        await page.screenshot({ path: 'suno_layout_check.png' });
        console.log('📸 Layout screenshot saved.');

    } catch (e) {
        console.error('❌ Error during inspection:', e.message);
    } finally {
        await context.close();
    }
}

inspect();
