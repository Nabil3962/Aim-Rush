let hits=0,misses=0,spawnInterval;
let globalTargetImg='https://i.ibb.co/FqJs0Pb4/target.png'; // default
let activeTargetImg='';

const gameArea=document.getElementById('gameArea');
const sandalCursor=document.getElementById('sandalCursor');
const targetSizeInput=document.getElementById('targetSize');
const spawnRateInput=document.getElementById('spawnRate');
const uploadInput=document.getElementById('targetUpload');
const targetSizeValue=document.getElementById('targetSizeValue');
const spawnRateValue=document.getElementById('spawnRateValue');
const hitIconsDiv=document.getElementById('hitIcons');
const missIconsDiv=document.getElementById('missIcons');
const hitsDisplay=document.getElementById('hits');
const missesDisplay=document.getElementById('misses');

const missImgSrc="https://i.ibb.co/kVC37by2/miss.png";

// Update slider values
targetSizeInput.addEventListener('input',()=>targetSizeValue.textContent=targetSizeInput.value);
spawnRateInput.addEventListener('input',()=>spawnRateValue.textContent=spawnRateInput.value);

// Upload new target
uploadInput.addEventListener('change',(e)=>{
  const file=e.target.files[0];
  if(file){
    const reader=new FileReader();
    reader.onload=(ev)=>{
      globalTargetImg=ev.target.result;
      // Replace any existing target immediately
      document.querySelectorAll('.target').forEach(t=>t.src=globalTargetImg);
      alert("Uploaded! Sandal is ready. Click Start to respawn targets.");
    };
    reader.readAsDataURL(file);
  }
});

// Sandal cursor movement
gameArea.addEventListener('mousemove',(e)=>{
  const rect=gameArea.getBoundingClientRect();
  let x=e.clientX-rect.left;
  let y=e.clientY-rect.top;
  x=Math.max(0,Math.min(x,rect.width));
  y=Math.max(0,Math.min(y,rect.height));
  sandalCursor.style.left=`${x}px`;
  sandalCursor.style.top=`${y}px`;
});

// Sandal shooting animation
gameArea.addEventListener('click',()=>{
  sandalCursor.classList.add('shoot');
  setTimeout(()=>sandalCursor.classList.remove('shoot'),150);
});

// Spawn initial default target immediately
function spawnInitialTarget(){
  const target=document.createElement('img');
  target.src=globalTargetImg;
  target.classList.add('target');
  const size=(targetSizeInput.value/100)*gameArea.clientWidth;
  target.style.width=`${size}px`;
  target.style.height=`${size}px`;
  const x=(gameArea.clientWidth-size)/2;
  const y=(gameArea.clientHeight-size)/2;
  target.style.left=`${x}px`;
  target.style.top=`${y}px`;
  gameArea.appendChild(target);
}

// Spawn new target
function spawnTarget(){
  const target=document.createElement('img');
  target.src=globalTargetImg;
  target.classList.add('target');
  const size=(targetSizeInput.value/100)*gameArea.clientWidth;
  target.style.width=`${size}px`;
  target.style.height=`${size}px`;
  const x=Math.random()*(gameArea.clientWidth-size);
  const y=Math.random()*(gameArea.clientHeight-size);
  target.style.left=`${x}px`;
  target.style.top=`${y}px`;
  target.addEventListener('click',(e)=>{
    e.stopPropagation();
    hits++;hitsDisplay.textContent=hits;
    const hitImg=document.createElement('img'); hitImg.src=globalTargetImg;
    hitIconsDiv.appendChild(hitImg);
    target.remove();
  });
  gameArea.appendChild(target);
  setTimeout(()=>{
    if(gameArea.contains(target)){
      target.remove(); misses++; missesDisplay.textContent=misses;
      const missImg=document.createElement('img'); missImg.src=missImgSrc;
      missIconsDiv.appendChild(missImg);
    }
  },spawnRateInput.value-50);
}

// Start game
function startGame(){
  hits=0; misses=0;
  hitsDisplay.textContent=hits;
  missesDisplay.textContent=misses;
  hitIconsDiv.innerHTML=''; missIconsDiv.innerHTML='';
  clearInterval(spawnInterval);
  gameArea.innerHTML='';
  gameArea.appendChild(sandalCursor);
  spawnTarget();
  spawnInterval=setInterval(spawnTarget,spawnRateInput.value);
}

// Download CSV
document.getElementById('startBtn').addEventListener('click',startGame);
document.getElementById('downloadBtn').addEventListener('click',()=>{
  const csv=`Hits,Misses\n${hits},${misses}`;
  const blob=new Blob([csv],{type:'text/csv'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download='AimRush_Score.csv'; a.click();
  URL.revokeObjectURL(url);
});

// Spawn default target when page loads
window.onload=spawnInitialTarget;
