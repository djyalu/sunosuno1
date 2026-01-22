
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * server.js (ES Module)
 * Frontend(React)에서 보내온 요청을 받아 로컬 자동화 스크립트(Full-Stealth-Bridge.js)를 실행하는
 * 중계 서버입니다.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/automate', (req, res) => {
    const { title, style, lyrics } = req.body;

    if (!title || !style || !lyrics) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    console.log(`🤖 Received automation request for: "${title}"`);

    // 특수 문자 이스케이프 처리 (간단한 버전)
    const safeTitle = JSON.stringify(title);
    const safeStyle = JSON.stringify(style);
    const safeLyrics = JSON.stringify(lyrics);

    // Automation Script 실행
    // Auto-Suno.cjs가 프로젝트 루트에 있다고 가정
    const scriptPath = path.join(__dirname, 'Auto-Suno.cjs');

    // 이전 프로세스가 있다면 강제 종료 (포트 및 프로필 락 해제)
    const killCommand = `taskkill /F /IM node.exe /FI "WINDOWTITLE eq Suno | AI Music" /T`;
    // 실제로는 스크립트 이름을 식별하는 게 좋지만, 윈도우에서는 커맨드라인 검색으로 죽임
    const robustKill = `wmic process where "commandline like '%Auto-Suno.cjs%'" get processid | findstr /v "ProcessId"`;

    console.log(`🚀 Killing previous automation sessions if any...`);

    // 1. 기존 자동화 프로세스 정리 후 2. 새 작업 시작
    exec(`powershell "Get-WmiObject Win32_Process | Where-Object { $_.CommandLine -like '*Auto-Suno.cjs*' } | ForEach-Object { Stop-Process $_.ProcessId -Force }"`, (killErr) => {
        const command = `node "${scriptPath}" ${safeTitle} ${safeStyle} ${safeLyrics}`;
        console.log(`🚀 Executing: node Auto-Suno.cjs ...`);

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Execution Error: ${error}`);
                return res.status(500).json({ success: false, message: 'Automation script failed. Make sure to close the previous Edge window.', error: error.message });
            }

            console.log(`✅ Automation Output: ${stdout}`);
            if (stderr) console.warn(`⚠️ Script Stderr: ${stderr}`);

            res.json({ success: true, message: 'Automation started successfully', output: stdout });
        });
    });
});

app.listen(PORT, () => {
    console.log(`🔌 SonicForge Automation Server running on http://localhost:${PORT}`);
});
