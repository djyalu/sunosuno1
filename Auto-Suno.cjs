
const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const path = require('path');
chromium.use(stealth);

async function run(title, style, lyrics) {
    const userDataDir = path.join(process.env.LOCALAPPDATA, 'Playwright-Suno-Final');

    console.log('🛡️ Starting Semi-Auto Bridge (V10-User-Assisted)...');

    let context;
    try {
        context = await chromium.launchPersistentContext(userDataDir, {
            channel: 'msedge',
            headless: false,
            viewport: { width: 1280, height: 950 },
            args: ['--disable-blink-features=AutomationControlled']
        });
    } catch (err) {
        console.error('❌ Browser Launch Failed.');
        process.exit(1);
    }

    const page = await context.newPage();

    try {
        console.log('🌐 Navigating to Suno...');
        await page.goto('https://suno.com/create', { waitUntil: 'load', timeout: 120000 });
        await page.waitForTimeout(5000);

        // Force Custom Mode
        const customBtn = page.locator('button').filter({ hasText: /^Custom$/i }).first();
        if (await customBtn.isVisible()) {
            const isChecked = await customBtn.getAttribute('aria-checked') === 'true';
            if (!isChecked) await customBtn.click();
            await page.waitForTimeout(1500);
        }

        // Human-like mouse movement
        const humanMove = async (element) => {
            const box = await element.boundingBox();
            if (box) {
                const x = box.x + box.width / 2 + (Math.random() * 10 - 5);
                const y = box.y + box.height / 2 + (Math.random() * 10 - 5);
                await page.mouse.move(x, y, { steps: 10 });
                await page.waitForTimeout(200 + Math.random() * 300);
            }
        };

        const stealthFill = async (label, value, selectors) => {
            console.log(`🎯 Stealth Injecting ${label}...`);
            for (const sel of selectors) {
                try {
                    const field = page.locator(sel).filter({ visible: true }).first();
                    if (await field.isVisible({ timeout: 4000 })) {
                        await field.scrollIntoViewIfNeeded();
                        await humanMove(field);
                        await field.hover();
                        await field.click({ focus: true });

                        await page.keyboard.press('Control+A');
                        await page.keyboard.press('Backspace');
                        await page.waitForTimeout(100 + Math.random() * 200);

                        await page.keyboard.insertText(value);
                        console.log(`✅ ${label} Ready.`);
                        await page.waitForTimeout(2000 + Math.random() * 1500); // Randomized gap
                        return true;
                    }
                } catch (e) { }
            }
            return false;
        };

        // Randomized Injection Order to confuse bot detection
        const tasks = [
            { l: "Lyrics", v: lyrics, s: ['textarea[placeholder*="lyrics" i]', 'textarea:below(button:has-text("Lyrics"))'] },
            { l: "Style", v: style, s: ['textarea[placeholder*="garage punk" i]', 'textarea:below(:text("Styles"))'] },
            { l: "Title", v: title, s: ['input[placeholder*="title" i]', 'input:below(:text("Title"))'] }
        ].sort(() => Math.random() - 0.5);

        for (const task of tasks) {
            await stealthFill(task.l, task.v, task.s);
        }

        console.log('✨ Stealth Injection Complete!');

        // Final Action: Scroll to Create button to make it easy for user
        const createBtn = page.locator('button').filter({ hasText: /^Create$/i }).filter({ visible: true }).first();
        if (await createBtn.isVisible()) {
            await createBtn.scrollIntoViewIfNeeded();
            console.log('👀 [Create] button is ready for you to click!');
        }

        console.log('💎 Waiting for your final click/captcha solving...');
        // Wait for a very long time
        await page.waitForTimeout(300000); // 5분 대기

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await context.close();
    }
}

const [, , t, s, l] = process.argv;
// Clean up escaped newlines from shell arguments
const cleanLyrics = (l || "").replace(/\\n/g, '\n');
run(t, s, cleanLyrics);
