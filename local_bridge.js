
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

/**
 * local_bridge.js
 * Antigravity 브라우저의 전역 제한을 우회하여 사용자의 로컬 환경에서 
 * Suno.com 자동화를 직접 수행하는 스크립트입니다.
 */

async function runBridge(title, style, lyrics) {
    console.log('🚀 Starting Local Suno Bridge...');

    // 사용자의 브라우저 데이터를 유지하려면 channel: 'msedge' 또는 특정 userDataDir 사용 권장
    const browser = await chromium.launch({
        headless: false,
        channel: 'msedge' // Edge 브라우저 사용 (사용자의 요청 반영)
    });

    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 }
    });

    const page = await context.newPage();

    try {
        console.log('🌐 Navigating to Suno.com...');
        await page.goto('https://suno.com/create', { waitUntil: 'networkidle' });

        // 로그인 체크 (수동 로그인이 필요할 수 있음)
        const isLoggedIn = await page.isVisible('button:has-text("Create")');
        if (!isLoggedIn) {
            console.log('⚠️ Please log in to Suno.com in the opened browser window.');
            // 사용자가 로그인할 때까지 대기 (최대 2분)
            await page.waitForSelector('button:has-text("Create")', { timeout: 120000 });
        }

        console.log('⚙️ Toggling Custom Mode...');
        // Custom 모드 토글 찾기 (Suno의 현재 UI 기반)
        const customToggle = await page.getByRole('switch', { name: /custom/i }).or(page.locator('button:has-text("Custom")'));
        if (await customToggle.isVisible()) {
            await customToggle.click();
        }

        console.log('📝 Injecting Data...');
        // 가사 입력
        await page.locator('textarea[placeholder*="lyrics"]').fill(lyrics);
        // 스타일 입력
        await page.locator('input[placeholder*="style"], textarea[placeholder*="style"]').first().fill(style);
        // 제목 입력
        await page.locator('input[placeholder*="title"]').fill(title);

        console.log('✅ Data injected! Please review and click "Create" manually for safety.');
        console.log('   (Automation completed up to the final step)');

        // 브라우저를 닫지 않고 사용자가 확인할 수 있게 유지
        // await browser.close(); 
    } catch (error) {
        console.error('❌ Bridge Error:', error);
    }
}

// 명령행 인자 처리 (JSON 형태나 환경변수로 데이터 전달 가능)
const args = process.argv.slice(2);
if (args.length >= 3) {
    runBridge(args[0], args[1], args[2]);
} else {
    console.log('Usage: node local_bridge.js "Title" "Style" "Lyrics"');
}
