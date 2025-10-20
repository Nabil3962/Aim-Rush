let hits=0, misses=0, spawnInterval;
let currentTargetImg='https://i.ibb.co/FqJs0Pb4/target.png'; // default target
const missImgSrc="https://i.ibb.co/kVC37by2/miss.png";

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

// Update sliders
targetSizeInput.addEventListener('input',()=>targetSizeValue.textContent=targetSizeInput.value);
spawnRateInput.addEventListener('input',()=>spawnRateValue.textContent=spawnRateInput.value);

// Upload target
uploadInput.addEventListener('change',(e)=>{
  const file=e.target.files[0];
  if(file){
    const reader=new FileReader();
    reader.onload=(ev)=>{
      currentTargetImg=ev.target.result;
      // Replace existing targets
      document.querySelectorAll('.target').forEach(t=>t.src=currentTargetImg);
      alert("Target image uploaded! Ready to start.");
    };
    reader.readAsDataURL(file);
  }
});

// Sandal cursor movement inside box
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

// Spawn a single target
function spawnTarget(){
  const target=document.createElement('img');
  target.src=currentTargetImg;
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
    hits++;
    hitsDisplay.textContent=hits;
    const hitImg=document.createElement('img');
    hitImg.src=currentTargetImg;
    hitIconsDiv.appendChild(hitImg);
    target.remove();
  });

  gameArea.appendChild(target);

  setTimeout(()=>{
    if(gameArea.contains(target)){
      target.remove();
      misses++;
      missesDisplay.textContent=misses;
      const missImg=document.createElement('img');
      missImg.src=missImgSrc;
      missIconsDiv.appendChild(missImg);
    }
  }, spawnRateInput.value-50);
}

// Start game
function startGame(){
  hits=0; misses=0;
  hitsDisplay.textContent=hits;
  missesDisplay.textContent=misses;
  hitIconsDiv.innerHTML=''; missIconsDiv.innerHTML='';
  clearInterval(spawnInterval);

  spawnTarget(); // spawn first immediately
  spawnInterval=setInterval(spawnTarget, spawnRateInput.value);
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

// Spawn default target immediately on page load
window.onload = () => {
  const target=document.createElement('img');
  target.src=currentTargetImg;
  target.classList.add('target');
  const size=(targetSizeInput.value/100)*gameArea.clientWidth;
  target.style.width=`${size}px`;
  target.style.height=`${size}px`;
  target.style.left=`${(gameArea.clientWidth-size)/2}px`;
  target.style.top=`${(gameArea.clientHeight-size)/2}px`;
  gameArea.appendChild(target);
};
