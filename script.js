let hits = 0;
let misses = 0;
let timeLeft = 30;
let targetImgSrc = '';
let spawnInterval;
let gameTimer;

// Your hosted images
const defaultTarget = "https://i.ibb.co/FqJs0Pb4/target.png";
const missIconSrc = "https://i.ibb.co/kVC37by2/miss.png";

const gameArea = document.getElementById('gameArea');
const hitsDisplay = document.getElementById('hits');
const missesDisplay = document.getElementById('misses');
const timeDisplay = document.getElementById('time');
const targetSizeInput = document.getElementById('targetSize');
const spawnRateInput = document.getElementById('spawnRate');
const uploadInput = document.getElementById('targetUpload');

uploadInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(file) {
    const reader = new FileReader();
    reader.onload = (event) => { targetImgSrc = event.target.result; };
    reader.readAsDataURL(file);
  }
});

function startGame() {
  hits = 0; misses = 0; timeLeft = 30;
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
  gameArea.innerHTML = '';

  const target = document.createElement('img');
  target.src = targetImgSrc || defaultTarget;
  target.classList.add('target');

  const size = (targetSizeInput.value / 100) * gameArea.clientWidth;
  target.style.width = `${size}px`;
  target.style.height = `${size}px`;

  const x = Math.random() * (gameArea.clientWidth - size);
  const y = Math.random() * (gameArea.clientHeight - size);
  target.style.left = `${x}px`;
  target.style.top = `${y}px`;

  target.addEventListener('click', (e) => {
    e.stopPropagation();
    hits++;
    hitsDisplay.textContent = hits;

    const hitIcon = document.createElement('img');
    hitIcon.src = targetImgSrc || defaultTarget;
    document.getElementById('hitIcons').appendChild(hitIcon);

    target.remove();
  });

  gameArea.appendChild(target);

  setTimeout(() => {
    if(gameArea.contains(target)) {
      target.remove();
      misses++;
      missesDisplay.textContent = misses;
      const missIcon = document.createElement('img');
      missIcon.src = missIconSrc;
      document.getElementById('missIcons').appendChild(missIcon);
    }
  }, spawnRateInput.value - 50);
}

function updateTimer() {
  timeLeft--;
  timeDisplay.textContent = timeLeft;
  if(timeLeft <= 0) endGame();
}

function endGame() {
  clearInterval(spawnInterval);
  clearInterval(gameTimer);
  alert(`Game Over! 🎯 Hits: ${hits} | Misses: ${misses}`);
}

document.getElementById('startBtn').addEventListener('click', startGame);

document.getElementById('downloadBtn').addEventListener('click', () => {
  const csv = `Hits,Misses\n${hits},${misses}`;
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'AimRush_Score.csv';
  a.click();
  URL.revokeObjectURL(url);
});
