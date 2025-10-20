let hits=0, misses=0, spawnInterval, gameTime=30, timerInterval;
let currentTargetImg='https://i.ibb.co/FqJs0Pb4/target.png'; 
const missImgSrc="https://i.ibb.co/kVC37by2/miss.png";

const gameArea=document.getElementById('gameArea');
const sandalCursor=document.getElementById('sandalCursor');
const targetSizeInput=document.getElementById('targetSize');
const spawnRateInput=document.getElementById('spawnRate');
const uploadInput=document.getElementById('targetUpload');
const targetSizeValue=document.getElementById('targetSizeValue');
const spawnRateValue=document.getElementById('spawnRateValue');
const scoreDisplay=document.getElementById('scoreDisplay');
const timerDisplay=document.getElementById('timer');

// Update sliders
targetSizeInput.addEventListener('input',()=>targetSizeValue.textContent=targetSizeInput.value);
spawnRateInput.addEventListener('input',()=>spawnRateValue.textContent=spawnRateInput.value);

// Upload target
uploadInput.addEventListener('change',(e)=>{
  const file=e.target.files[0];
  if(file){
    const reader=new FileReader();
    reader.onload=(ev)=>{ currentTargetImg=ev.target.result; };
    reader.readAsDataURL(file);
  }
});

// Sandal cursor movement
gameArea.addEventListener('mousemove',(e)=>{
  const rect=gameArea.getBoundingClientRect();
  let x=e.clientX-rect.left;
  let y=e.clientY-rect.top;
  x=Math.max(0, Math.min(x, rect.width));
  y=Math.max(0, Math.min(y, rect.height));
  sandalCursor.style.left=`${x}px`;
  sandalCursor.style.top=`${y}px`;
});

// Sandal shooting animation
gameArea.addEventListener('click',()=>{
  sandalCursor.classList.add('shoot');
  setTimeout(()=>sandalCursor.classList.remove('shoot'),150);
});

// Spawn a single target (only one at a time)
function spawnTarget(){
  // Remove existing targets
  document.querySelectorAll('.target').forEach(t=>t.remove());

  const target=document.createElement('img');
  target.src=currentTargetImg;
  target.classList.add('target');
  const size=(targetSizeInput.value/100)*gameArea.clientWidth / 3.5; // 3.5x smaller
  target.style.width=`${size}px`;
  target.style.height=`${size}px`;

  const x=Math.random()*(gameArea.clientWidth-size);
  const y=Math.random()*(gameArea.clientHeight-size);
  target.style.left=`${x}px`;
  target.style.top=`${y}px`;

  target.addEventListener('click',(e)=>{
    e.stopPropagation();
    hits++;
    updateScore();
    target.remove();
  });

  gameArea.appendChild(target);

  // Remove target after spawnRate
  setTimeout(()=>{
    if(gameArea.contains(target)){
      target.remove();
      misses++;
      updateScore();
    }
  }, spawnRateInput.value-50);
}

// Update score display
function updateScore(){
  scoreDisplay.textContent=`Hits: ${hits} | Misses: ${misses}`;
}

// Start game
function startGame(){
  hits=0; misses=0;
  updateScore();
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  gameTime=30;
  timerDisplay.textContent=`Time: ${gameTime}s`;

  spawnTarget();
  spawnInterval=setInterval(spawnTarget, spawnRateInput.value);

  // Timer countdown
  timerInterval=setInterval(()=>{
    gameTime--;
    timerDisplay.textContent=`Time: ${gameTime}s`;
    if(gameTime<=0){
      clearInterval(spawnInterval);
      clearInterval(timerInterval);
      alert(`Game Over! Hits: ${hits}, Misses: ${misses}`);
    }
  },1000);
}

// Download CSV
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('downloadBtn').addEventListener('click',()=>{
  const csv=`Hits,Misses\n${hits},${misses}`;
  const blob=new Blob([csv],{type:'text/csv'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download='AimRush_Score.csv';
  a.click();
  URL.revokeObjectURL(url);
});
