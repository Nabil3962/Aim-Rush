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
gameArea.addEventListener('click',(e)=>{
  sandalCursor.classList.add('shoot');
  setTimeout(()=>sandalCursor.classList.remove('shoot'),150);

  // Check if click hits target
  const target=document.querySelector('.target');
  const rect=target?.getBoundingClientRect();
  const gameRect=gameArea.getBoundingClientRect();
  const clickX=e.clientX;
  const clickY=e.clientY;

  if(target && clickX>=rect.left && clickX<=rect.right && clickY>=rect.top && clickY<=rect.bottom){
    // Hit
    hits++;
    showShot(target);
  }else{
    // Miss
    misses++;
    showMiss(e.clientX,e.clientY);
  }
  updateScore();
});

// Spawn a single target (only one at a time)
function spawnTarget(){
  // Remove existing target
  document.querySelectorAll('.target').forEach(t=>t.remove());

  const target=document.createElement('img');
  target.src=currentTargetImg;
  target.classList.add('target');
  const size=((targetSizeInput.value/100)*gameArea.clientWidth) * 1.5; // 1.5x bigger
  target.style.width=`${size}px`;
  target.style.height=`${size}px`;

  const x=Math.random()*(gameArea.clientWidth-size);
  const y=Math.random()*(gameArea.clientHeight-size);
  target.style.left=`${x}px`;
  target.style.top=`${y}px`;

  gameArea.appendChild(target);

  // Remove target after spawnRate
  setTimeout(()=>{
    if(gameArea.contains(target)){
      target.remove();
    }
  }, spawnRateInput.value-50);
}

// Show shot image (target image) briefly
function showShot(target){
  const shot=document.createElement('img');
  shot.src=currentTargetImg;
  shot.style.position='absolute';
  shot.style.left=target.style.left;
  shot.style.top=target.style.top;
  shot.style.width=target.style.width;
  shot.style.height=target.style.height;
  shot.style.pointerEvents='none';
  gameArea.appendChild(shot);
  target.remove();
  setTimeout(()=>shot.remove(),300);
}

// Show miss image briefly at click position
function showMiss(x,y){
  const miss=document.createElement('img');
  miss.src=missImgSrc;
  miss.style.position='absolute';
  const rect=gameArea.getBoundingClientRect();
  miss.style.left=`${x-rect.left-15}px`;
  miss.style.top=`${y-rect.top-15}px`;
  miss.style.width='30px';
  miss.style.height='30px';
  miss.style.pointerEvents='none';
  gameArea.appendChild(miss);
  setTimeout(()=>miss.remove(),300);
}

// Update score
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
