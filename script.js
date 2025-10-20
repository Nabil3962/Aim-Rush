let hits=0, misses=0, shotsImg=0, missesImg=0;
let spawnInterval, gameTime=30, timerInterval;
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
const imageCountDisplay=document.getElementById('imageCount');

// Slider updates
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

// Make sandal cursor exactly follow mouse
gameArea.addEventListener('mousemove',(e)=>{
  const rect=gameArea.getBoundingClientRect();
  let x=e.clientX-rect.left;
  let y=e.clientY-rect.top;
  x=Math.max(0, Math.min(x, rect.width));
  y=Math.max(0, Math.min(y, rect.height));
  sandalCursor.style.left=`${x}px`;
  sandalCursor.style.top=`${y}px`;
});

// Sandal shooting animation & hit/miss detection
gameArea.addEventListener('click',(e)=>{
  sandalCursor.classList.add('shoot');
  setTimeout(()=>sandalCursor.classList.remove('shoot'),150);

  const target=document.querySelector('.target');
  const rect=target?.getBoundingClientRect();
  const gameRect=gameArea.getBoundingClientRect();
  const clickX=e.clientX;
  const clickY=e.clientY;

  if(target && clickX>=rect.left && clickX<=rect.right && clickY>=rect.top && clickY<=rect.bottom){
    hits++;
    shotsImg++;
    showShot(target);
  } else {
    misses++;
    missesImg++;
    showMiss(e.clientX,e.clientY);
  }
  updateScore();
});

// Spawn a single target
function spawnTarget(){
  document.querySelectorAll('.target').forEach(t=>t.remove());

  const target=document.createElement('img');
  target.src=currentTargetImg;
  target.classList.add('target');
  const size=((targetSizeInput.value/100)*gameArea.clientWidth) * 1.5;
  target.style.width=`${size}px`;
  target.style.height=`${size}px`;

  const x=Math.random()*(gameArea.clientWidth-size);
  const y=Math.random()*(gameArea.clientHeight-size);
  target.style.left=`${x}px`;
  target.style.top=`${y}px`;

  gameArea.appendChild(target);

  setTimeout(()=>{
    if(gameArea.contains(target)){
      target.remove();
    }
  }, spawnRateInput.value-50);
}

// Show shot image
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

// Show miss image
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

// Update score & images
function updateScore(){
  scoreDisplay.textContent=`Hits: ${hits} | Misses: ${misses}`;
  imageCountDisplay.textContent=`Shots: ${shotsImg} | Misses: ${missesImg}`;
}

// Start game
function startGame(){
  hits=0; misses=0; shotsImg=0; missesImg=0;
  updateScore();
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  gameTime=30;
  timerDisplay.textContent=`Time: ${gameTime}s`;

  spawnTarget();
  spawnInterval=setInterval(spawnTarget, spawnRateInput.value);

  timerInterval=setInterval(()=>{
    gameTime--;
    timerDisplay.textContent=`Time: ${gameTime}s`;
    if(gameTime<=0){
      clearInterval(spawnInterval);
      clearInterval(timerInterval);
      alert(`Game Over!\nHits: ${hits}, Misses: ${misses}`);
    }
  },1000);
}

// Download CSV
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('downloadBtn').addEventListener('click',()=>{
  const csv=`Hits,Misses,ShotImages,MissImages\n${hits},${misses},${shotsImg},${missesImg}`;
  const blob=new Blob([csv],{type:'text/csv'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download='AimRush_Score.csv';
  a.click();
  URL.revokeObjectURL(url);
});
