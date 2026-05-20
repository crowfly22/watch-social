const campaignEnd = new Date('2026-05-27T16:00:00Z').getTime();
const tokenStart = 100_000_000_000_000;
const tokenBurnPerSecond = 18_420_000;

const copy = {
    id: {
        pitch: 'Orbit 100T adalah landing page interaktif untuk campaign token AI: countdown, token vault, creator scoring, dan generator pitch dalam satu proyek GitHub ringan.',
        copied: 'Pitch disalin',
        lang: 'ID'
    },
    en: {
        pitch: 'Orbit 100T is an interactive AI token campaign landing page: countdown, live token vault, creator scoring, and pitch generation in one lightweight GitHub project.',
        copied: 'Pitch copied',
        lang: 'EN'
    }
};

let activeLanguage = 'id';

const weights = {
    creatorType: {
        developer: 20,
        researcher: 18,
        startup: 23,
        community: 17
    },
    toolChoice: {
        coding: 23,
        multimodal: 20,
        voice: 18,
        api: 24
    },
    proofLevel: {
        idea: 12,
        prototype: 25,
        users: 34,
        revenue: 39
    }
};

const labels = {
    creatorType: {
        developer: 'developer yang membangun produk',
        researcher: 'researcher/educator',
        startup: 'tim startup',
        community: 'penggerak komunitas'
    },
    toolChoice: {
        coding: 'coding agent seperti Claude Code, Cursor, atau OpenClaw',
        multimodal: 'workflow multimodal',
        voice: 'voice agent dan TTS pipeline',
        api: 'integrasi API kustom'
    },
    proofLevel: {
        idea: 'masih berada di tahap ide',
        prototype: 'sudah memiliki prototype berjalan',
        users: 'sudah punya pengguna aktif',
        revenue: 'sudah dipakai bisnis atau klien'
    }
};

const formatNumber = new Intl.NumberFormat('en-US');

function updateCountdown() {
    const remaining = Math.max(campaignEnd - Date.now(), 0);
    const seconds = Math.floor(remaining / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    setText('days', pad(days));
    setText('hours', pad(hours));
    setText('minutes', pad(minutes));
    setText('seconds', pad(secs));
}

function updateTokenVault() {
    const elapsedSeconds = Math.floor((Date.now() - new Date('2026-04-27T16:00:00Z').getTime()) / 1000);
    const naturalBurn = Math.max(elapsedSeconds, 0) * tokenBurnPerSecond;
    const pulseBurn = Math.floor(Math.sin(Date.now() / 1500) * 1_200_000_000);
    const current = Math.max(tokenStart - naturalBurn - pulseBurn, 8_000_000_000_000);
    setText('token-count', formatNumber.format(current));
}

function calculateScore(event) {
    event?.preventDefault();

    const projectName = document.getElementById('project-name').value.trim() || 'AI Creator Project';
    const creatorType = document.getElementById('creator-type').value;
    const toolChoice = document.getElementById('tool-choice').value;
    const proofLevel = document.getElementById('proof-level').value;
    const projectFocus = document.getElementById('project-focus').value.trim();
    const detailBonus = Math.min(Math.floor(projectFocus.length / 18), 10);
    const score = Math.min(
        weights.creatorType[creatorType] + weights.toolChoice[toolChoice] + weights.proofLevel[proofLevel] + detailBonus,
        100
    );

    const tier = getTier(score);
    setText('score-value', score);
    setText('tier-value', tier.name);
    setText('token-estimate', tier.tokens);
    setText('priority-value', tier.priority);
    setText('advice-value', tier.advice);
    document.getElementById('score-meter').style.width = `${score}%`;
    setText('pitch-output', buildPitch(projectName, creatorType, toolChoice, proofLevel, projectFocus, tier.name));
}

function getTier(score) {
    if (score >= 88) {
        return {
            name: 'Orbit Elite',
            tokens: '5.0T+',
            priority: 'Sangat tinggi',
            advice: 'Siapkan demo publik, repo GitHub, dan metrik dampak agar proposal sulit diabaikan.'
        };
    }

    if (score >= 72) {
        return {
            name: 'Creator Pro',
            tokens: '2.4T',
            priority: 'Tinggi',
            advice: 'Tambahkan demo publik dan metrik pengguna.'
        };
    }

    if (score >= 55) {
        return {
            name: 'Builder Pass',
            tokens: '800B',
            priority: 'Menengah',
            advice: 'Ubah ide menjadi prototype singkat dan sertakan screenshot atau video.'
        };
    }

    return {
        name: 'Launch Pad',
        tokens: '100B',
        priority: 'Rendah',
        advice: 'Perjelas masalah, target pengguna, dan rencana eksperimen 7 hari.'
    };
}

function buildPitch(projectName, creatorType, toolChoice, proofLevel, projectFocus, tierName) {
    const focus = projectFocus || 'membuat workflow AI yang hemat waktu dan mudah direplikasi';
    return `${projectName} adalah proyek ${labels.creatorType[creatorType]} yang memakai ${labels.toolChoice[toolChoice]} untuk ${focus} Proyek ini ${labels.proofLevel[proofLevel]}, sehingga cocok masuk tier ${tierName} dalam simulasi Orbit 100T.`;
}

function copyPitch() {
    navigator.clipboard?.writeText(copy[activeLanguage].pitch);
    const button = document.getElementById('copy-link');
    const original = button.textContent;
    button.textContent = copy[activeLanguage].copied;
    setTimeout(() => {
        button.textContent = original;
    }, 1400);
}

function toggleLanguage() {
    activeLanguage = activeLanguage === 'id' ? 'en' : 'id';
    document.getElementById('language-toggle').textContent = copy[activeLanguage].lang;
}

function pad(value) {
    return String(value).padStart(2, '0');
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function initMatrix() {
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');
    const glyphs = 'AI<>/{}[]01TOKENORBITMIMO創造者百万亿';
    let columns = [];
    let width = 0;
    let height = 0;

    function resize() {
        width = canvas.width = window.innerWidth * window.devicePixelRatio;
        height = canvas.height = window.innerHeight * window.devicePixelRatio;
        const count = Math.floor(width / 28);
        columns = Array.from({ length: count }, () => Math.random() * height);
    }

    function draw() {
        ctx.fillStyle = 'rgba(3, 4, 6, 0.16)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(246, 247, 251, 0.55)';
        ctx.font = `${15 * window.devicePixelRatio}px ui-monospace, monospace`;

        columns.forEach((y, index) => {
            const text = glyphs[Math.floor(Math.random() * glyphs.length)];
            const x = index * 28 * window.devicePixelRatio;
            ctx.fillText(text, x, y);
            columns[index] = y > height + Math.random() * 6000 ? 0 : y + 18 * window.devicePixelRatio;
        });

        requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);
}

document.getElementById('creator-form').addEventListener('submit', calculateScore);
document.querySelectorAll('#creator-form input, #creator-form select, #creator-form textarea').forEach((field) => {
    field.addEventListener('input', calculateScore);
});
document.getElementById('copy-link').addEventListener('click', copyPitch);
document.getElementById('language-toggle').addEventListener('click', toggleLanguage);

updateCountdown();
updateTokenVault();
calculateScore();
initMatrix();

setInterval(updateCountdown, 1000);
setInterval(updateTokenVault, 1200);
