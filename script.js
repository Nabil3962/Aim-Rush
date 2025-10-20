// --- TONE.JS SOUND SETUP ---
let hitSynth, missSynth, gameEndSynth;

async function initializeAudio() {
    if (Tone.context.state !== 'running') await Tone.start();

    if (!hitSynth) {
        hitSynth = new Tone.Synth({
            oscillator: { type: "square" },
            envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
        }).toDestination();

        missSynth = new Tone.NoiseSynth({
            envelope: { attack: 0.005, decay: 0.15, sustain: 0 }
        }).toDestination();

        gameEndSynth = new Tone.PolySynth(Tone.Synth).toDestination();
    }
}

const enableAudio = () => { initializeAudio(); document.body.removeEventListener('click', enableAudio); };
document.body.addEventListener('click', enableAudio, { once: true });

const playHit = () => hitSynth.triggerAttackRelease("C5", "8n");
const playMiss = () => missSynth.triggerAttackRelease(0.1);
const playGameOver = () => gameEndSynth.triggerAttackRelease(["C4", "E4", "G4"], "1n");

// --- GAME LOGIC ---

let hits = 0, misses = 0, shotsImg = 0, missesImg = 0;
let spawnInterval, gameTime = 30, timerInterval;
let isGameRunning = false;

let currentTargetImg = 'https://i.ibb.co.com/FqJs0Pb4/target.png';
const missImgSrc = "https://i.ibb.co.com/kVC37by2/miss.png";

const gameArea = document.getElementById('gameArea');
const sandalCursor = document.getElementById('sandalCursor');
const fireCursor = document.getElementById('fireCursor');
const targetSizeInput = document.getElementById('targetSize');
const spawnRateInput = document.getElementById('spawnRate');
const uploadInput = document.getElementById('targetUpload');
const targetSizeValue = document.getElementById('targetSizeValue');
const spawnRateValue = document.getElementById('spawnRateValue');
const scoreDisplay = document.getElementById('scoreDisplay');
const timerDisplay = document.getElementById('timer');
const imageCountDisplay = document.getElementById('imageCount');
const startBtn = document.getElementById('startBtn');
const gameOverModal = document.getElementById('gameOverModal');
const modalResults = document.getElementById('modalResults');
const closeModalBtn = document.getElementById('closeModalBtn');

sandalCursor.style.opacity = 0;
fireCursor.style.opacity = 0;

// --- PNG Visual Counters ---
const hitPNG = 'https://i.ibb.co/3W1QfVh/target-hit.png';
const missPNG = 'https://i.ibb.co/kVC37by2/miss.png';

// --- RESPONSIVENESS ---
window.addEventListener('resize', () => {
    if (isGameRunning) {
        document.querySelectorAll('.target').forEach(t => t.remove());
        spawnTarget();
    }
});

// Slider updates
targetSizeInput.addEventListener('input', () => targetSizeValue.textContent = targetSizeInput.value);
spawnRateInput.addEventListener('input', () => spawnRateValue.textContent = spawnRateInput.value);

// Upload target
uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => { currentTargetImg = ev.target.result; };
        reader.readAsDataURL(file);
        document.querySelectorAll('.target').forEach(t => t.src = currentTargetImg);
    }
});

// Cursor tracking
gameArea.addEventListener('mousemove', (e) => {
    const rect = gameArea.getBoundingClientRect();
    let x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    let y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    sandalCursor.style.left = `${e.clientX}px`;
    sandalCursor.style.top = `${e.clientY}px`;
    fireCursor.style.left = `${e.clientX}px`;
    fireCursor.style.top = `${e.clientY}px`;
});

gameArea.addEventListener('mouseover', () => { sandalCursor.style.opacity = 1; fireCursor.style.opacity = 1; });
gameArea.addEventListener('mouseleave', () => { sandalCursor.style.opacity = 0; fireCursor.style.opacity = 0; });

// Click detection
gameArea.addEventListener('click', (e) => {
    if (!isGameRunning) return;

    sandalCursor.classList.add('shoot');
    fireCursor.classList.add('shoot');
    setTimeout(() => { sandalCursor.classList.remove('shoot'); fireCursor.classList.remove('shoot'); }, 150);

    const target = document.querySelector('.target');
    if (target) {
        const rect = target.getBoundingClientRect();
        const clickX = e.clientX, clickY = e.clientY;
        if (clickX >= rect.left && clickX <= rect.right && clickY >= rect.top && clickY <= rect.bottom) {
            hits++; shotsImg++;
            playHit(); showHitFlash(e.clientX, e.clientY); showShot(target);
        } else {
            misses++; missesImg++;
            playMiss(); showMiss(e.clientX, e.clientY); shakeGameArea();
        }
    } else {
        misses++; missesImg++;
        playMiss(); showMiss(e.clientX, e.clientY); shakeGameArea();
    }
    updateScore();
});

function shakeGameArea() {
    gameArea.classList.add('shake');
    setTimeout(() => gameArea.classList.remove('shake'), 200);
}

function spawnTarget() {
    document.querySelectorAll('.target').forEach(t => t.remove());
    const target = document.createElement('img');
    target.src = currentTargetImg;
    target.classList.add('target');

    const targetSizePercent = targetSizeInput.value / 100;
    const desiredSize = (targetSizePercent * gameArea.clientWidth) * 1.5;
    const finalSize = Math.max(40, Math.min(200, desiredSize));

    target.style.width = `${finalSize}px`;
    target.style.height = `${finalSize}px`;

    const x = Math.random() * (gameArea.clientWidth - finalSize);
    const y = Math.random() * (gameArea.clientHeight - finalSize);
    target.style.left = `${x}px`;
    target.style.top = `${y}px`;

    gameArea.appendChild(target);

    setTimeout(() => { if (gameArea.contains(target)) target.remove(); }, spawnRateInput.value - 50);
}

function showShot(target) {
    const shot = document.createElement('img');
    shot.src = currentTargetImg;
    shot.style.position = 'absolute';
    shot.style.left = target.style.left;
    shot.style.top = target.style.top;
    shot.style.width = target.style.width;
    shot.style.height = target.style.height;
    shot.style.pointerEvents = 'none';
    gameArea.appendChild(shot);
    target.remove();
    setTimeout(() => shot.remove(), 300);
}

function showMiss(x, y) {
    const miss = document.createElement('img');
    miss.src = missImgSrc;
    miss.classList.add('miss-fx');
    const rect = gameArea.getBoundingClientRect();
    miss.style.left = `${x - rect.left - 20}px`;
    miss.style.top = `${y - rect.top - 20}px`;
    gameArea.appendChild(miss);
    setTimeout(() => miss.remove(), 300);
}

function showHitFlash(x, y) {
    const flash = document.createElement('div');
    flash.classList.add('hit-fx');
    const rect = gameArea.getBoundingClientRect();
    flash.style.left = `${x - rect.left}px`;
    flash.style.top = `${y - rect.top}px`;
    gameArea.appendChild(flash);
    setTimeout(() => flash.remove(), 300);
}

function updateScore() {
    scoreDisplay.textContent = `Total Clicks: ${hits+misses} | Misses: ${misses}`;

    const targetHitsContainer = document.getElementById('targetHitsContainer');
    const missesContainer = document.getElementById('missesContainer');
    targetHitsContainer.innerHTML = '';
    missesContainer.innerHTML = '';

    for(let i=0; i<shotsImg; i++){
        const img = document.createElement('img'); img.src = hitPNG; img.width=24; img.height=24;
        targetHitsContainer.appendChild(img);
    }
    for(let i=0; i<missesImg; i++){
        const img = document.createElement('img'); img.src = missPNG; img.width=24; img.height=24;
        missesContainer.appendChild(img);
    }
}

function startGame() {
    if (isGameRunning) return;
    isGameRunning = true;
    gameOverModal.classList.add('hidden');
    hits = 0; misses = 0; shotsImg = 0; missesImg = 0; updateScore();
    clearInterval(spawnInterval); clearInterval(timerInterval); gameTime = 30; timerDisplay.textContent=`Time: ${gameTime}s`;
    document.querySelectorAll('.target').forEach(t=>t.remove());
    startBtn.textContent='Restart'; spawnTarget();
    spawnInterval = setInterval(spawnTarget, spawnRateInput.value);
    timerInterval = setInterval(()=>{
        gameTime--; timerDisplay.textContent=`Time: ${gameTime}s`;
        if(gameTime<=0) endGame();
    },1000);
}

function endGame() {
    isGameRunning = false; clearInterval(spawnInterval); clearInterval(timerInterval); startBtn.textContent='Start Game';
    playGameOver();
    const totalShots=hits+misses; const accuracy=totalShots>0?((hits/totalShots)*100).toFixed(1):0;
    modalResults.innerHTML=`
        <div class="text-left inline-block mt-2 font-mono">
            <p class="mb-1">🎯 Total Hits: <span class="text-primary-color">${hits}</span></p>
            <p class="mb-1">❌ Total Misses: <span class="text-secondary-color">${misses}</span></p>
            <p class="mb-1">📸 Target Hits: ${shotsImg}</p>
            <p class="mb-1">🔥 Accuracy: <span class="text-yellow-400">${accuracy}%</span></p>
        </div>
    `;
    gameOverModal.classList.remove('hidden');
    document.querySelectorAll('.target').forEach(t=>t.remove());
}

closeModalBtn.addEventListener('click',()=>{ gameOverModal.classList.add('hidden'); gameTime=30; timerDisplay.textContent=`Time: ${gameTime}s`; });

document.getElementById('downloadBtn').addEventListener('click',()=>{
    const totalShots=hits+misses; const accuracy=totalShots>0?((hits/totalShots)*100).toFixed(1):0;
    const csv=`Metric,Value\nTotal Clicks,${totalShots}\nTotal Misses,${misses}\nTarget Hits,${shotsImg}\nGame Misses,${missesImg}\nAccuracy,${accuracy}%`;
    const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='AimRush_Perfected_Score.csv'; a.click(); URL.revokeObjectURL(url);
});

startBtn.addEventListener('click',startGame);
