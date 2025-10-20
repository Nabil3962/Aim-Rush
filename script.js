let hits = 0;
let misses = 0;
let timeLeft = 30;
let targetImgSrc = '';
let spawnInterval;
let gameTimer;

const gameArea = document.getElementById('gameArea');
const hitsDisplay = document.getElementById('hits');
const missesDisplay = document.getElementById('misses');
const timeDisplay = document.getElementById('time');
const targetSizeInput = document.getElementById('targetSize');
const spawnRateInput = document.getElementById('spawnRate');
const uploadInput = document.getElementById('targetUpload');

uploadInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      targetImgSrc = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

function startGame() {
  hits = 0;
  misses = 0;
  timeLeft = 30;
  hitsDisplay.textContent = hits;
  missesDisplay.textContent = misses;
  timeDisplay.textContent = timeLeft;
  document.getElementById('hitIcons').innerHTML = '';
  document.getElementById('missIcons').innerHTML = '';

  clearInterval(spawnInterval);
  clearInterval(gameTimer);
  gameArea.innerHTML = '';

  spawnTarget();
  spawnInterval = setInterval(spawnTarget, spawnRateInput.value);
  gameTimer = setInterval(updateTimer, 1000);
}

function spawnTarget() {
  gameArea.innerHTML = ''; // Only one target at a time (like Duck Hunt)

  const target = document.createElement('img');
  target.src = targetImgSrc || 'https://i.ibb.co/F61PmY3/target.png';
  target.classList.add('target');

  const size = targetSizeInput.value;
  target.style.width = `${size}px`;
  target.style.height = `${size}px`;

  const x = Math.random() * (gameArea.clientWidth - size);
  const y = Math.random() * (gameArea.clientHeight - size);
  target.style.left = `${x}px`;
  target.style.top = `${y}px`;

  if(targetImgSrc) target.classList.add('custom');

  target.addEventListener('click', (e) => {
    e.stopPropagation();
    hits++;
    hitsDisplay.textContent = hits;

    const hitIcon = document.createElement('img');
    hitIcon.src = targetImgSrc || 'https://i.ibb.co/F61PmY3/target.png';
    document.getElementById('hitIcons').appendChild(hitIcon);

    playHitSound();

    const flash = document.createElement('div');
    flash.id = 'gunFlash';
    document.body.appendChild(flash);
    flash.style.animation = 'flash 0.3s ease-out';
    setTimeout(() => flash.remove(), 300);

    target.remove();
  });

  gameArea.appendChild(target);

  setTimeout(() => {
    if (gameArea.contains(target)) {
      target.remove();
      misses++;
      missesDisplay.textContent = misses;
      const missIcon = document.createElement('img');
      missIcon.src = 'https://i.ibb.co/yp4qvM7/miss.png';
      document.getElementById('missIcons').appendChild(missIcon);
    }
  }, spawnRateInput.value - 50); // disappear if not hit
}

gameArea.addEventListener('click', () => {
  // Miss handled in spawn timeout
});

function updateTimer() {
  timeLeft--;
  timeDisplay.textContent = timeLeft;
  if (timeLeft <= 0) endGame();
}

function endGame() {
  clearInterval(spawnInterval);
  clearInterval(gameTimer);
  alert(`Game Over! 🎯 Hits: ${hits} | Misses: ${misses}`);
}

function playHitSound() {
  const audio = new Audio('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg');
  audio.volume = 0.3;
  audio.play();
}

document.getElementById('startBtn').addEventListener('click', startGame);

document.getElementById('downloadBtn').addEventListener('click', () => {
  const csv = `Hits,Misses\n${hits},${misses}`;
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'score.csv';
  a.click();
});
