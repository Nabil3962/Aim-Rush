let hits = 0;
let misses = 0;
let targetImgSrc = '';
let spawnInterval;

const defaultTarget = "https://i.ibb.co/FqJs0Pb4/target.png";
const missImgSrc = "https://i.ibb.co/kVC37by2/miss.png";
const sandalCursor = document.getElementById('sandalCursor');

const gameArea = document.getElementById('gameArea');
const hitsDisplay = document.getElementById('hits');
const missesDisplay = document.getElementById('misses');
const targetSizeInput = document.getElementById('targetSize');
const spawnRateInput = document.getElementById('spawnRate');
const uploadInput = document.getElementById('targetUpload');
const targetSizeValue = document.getElementById('targetSizeValue');
const spawnRateValue = document.getElementById('spawnRateValue');

const hitIconsDiv = document.getElementById('hitIcons');
const missIconsDiv = document.getElementById('missIcons');

// Update sliders text
targetSizeInput.addEventListener('input', ()=>{ targetSizeValue.textContent = targetSizeInput.value; });
spawnRateInput.addEventListener('input', ()=>{ spawnRateValue.textContent = spawnRateInput.value; });

// Upload target image
uploadInput.addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(file){
    const reader = new FileReader();
    reader.onload = (event)=>{
      targetImgSrc = event.target.result;

      // Remove existing targets and spawn new one
      document.querySelectorAll('.target').forEach(t => t.remove());
      spawnTarget();
    };
    reader.readAsDataURL(file);
  }
});

// Move sandal cursor inside gameArea only
gameArea.addEventListener('mousemove', (e)=>{
  const rect = gameArea.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;

  // keep inside boundaries
  x = Math.max(0, Math.min(x, rect.width));
  y = Math.max(0, Math.min(y, rect.height));

  sandalCursor.style.left = `${x}px`;
  sandalCursor.style.top = `${y}px`;
});

// Click to shoot animation
gameArea.addEventListener('click', ()=>{
  sandalCursor.classList.add('shoot');
  setTimeout(()=> sandalCursor.classList.remove('shoot'), 150);
});

function startGame(){
  hits = 0; misses = 0;
  hitsDisplay.textContent = hits;
  missesDisplay.textContent = misses;
  hitIconsDiv.innerHTML = '';
  missIconsDiv.innerHTML = '';
  clearInterval(spawnInterval);

  gameArea.innerHTML = '';
  gameArea.appendChild(sandalCursor);

  // Ensure default target if no uploaded image
  if(!targetImgSrc) targetImgSrc = defaultTarget;

  spawnTarget();
  spawnInterval = setInterval(spawnTarget, spawnRateInput.value);
}

function spawnTarget(){
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

  target.addEventListener('click', (e)=>{
    e.stopPropagation();
    hits++;
    hitsDisplay.textContent = hits;

    const hitImg = document.createElement('img');
    hitImg.src = targetImgSrc || defaultTarget;
    hitIconsDiv.appendChild(hitImg);

    target.remove();
  });

  gameArea.appendChild(target);

  setTimeout(()=>{
    if(gameArea.contains(target)){
      target.remove();
      misses++;
      missesDisplay.textContent = misses;

      const missImg = document.createElement('img');
      missImg.src = missImgSrc;
      missIconsDiv.appendChild(missImg);
    }
  }, spawnRateInput.value - 50);
}

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('downloadBtn').addEventListener('click', ()=>{
  const csv = `Hits,Misses\n${hits},${misses}`;
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'AimRush_Score.csv';
  a.click();
  URL.revokeObjectURL(url);
});
