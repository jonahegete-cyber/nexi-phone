const appData = [
 ["Telefon","📞","#25bd70"],
 ["Nachrichten","💬","#25b968"],
 ["Safari","🧭","#3289ed"],
 ["Kamera","📷","#777"],
 ["Fotos","🌈","#fff"],
 ["Einstellungen","⚙️","#777"],
 ["Musik","🎵","#ed315d"],
 ["Rechner","🔢","#555"],
 ["Kalender","📅","#fff"],
 ["Notizen","📝","#e5c34c"],
 ["Uhr","⏰","#222"],
 ["App Store","A","#087cf0"]
];

const dockNames = ["Telefon","Nachrichten","Safari","Kamera"];
const screen = document.getElementById("screen");

function makeIcon(app) {
 const [name, symbol, color] = app;
 return `<button class="app-icon" onclick="openApp('${name}')">
 <span class="icon-art" style="background:${color};color:${name==='Kalender'?'#e33':'white'}">${symbol}</span>
 <span>${name}</span></button>`;
}

function createHome() {
 document.getElementById("apps").innerHTML =
 appData.map(makeIcon).join("");
 document.getElementById("dock").innerHTML =
 dockNames.map(name => makeIcon(appData.find(a=>a[0]===name))).join("");
}

function updateClock() {
 const now = new Date();
 const time = now.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"});
 document.getElementById("statusTime").textContent=time;
 document.getElementById("lockClock").textContent=time;
 document.getElementById("lockDate").textContent=
 now.toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long"});
}
setInterval(updateClock,1000);
updateClock();
createHome();

let cameraStream = null;
let calcValue = "";

function goHome() {
 if(cameraStream) {
  cameraStream.getTracks().forEach(t=>t.stop());
  cameraStream=null;
 }
 document.getElementById("appPage")?.remove();
 screen.style.display="block";
 document.querySelector(".top").style.display="block";
 document.querySelector(".status").style.display="flex";
 document.getElementById("island").style.display="block";
}

function openApp(name) {
 screen.style.display="none";
 document.querySelector(".top").style.display="none";
 document.querySelector(".status").style.display="none";
 document.getElementById("island").style.display="none";

 document.getElementById("appPage")?.remove();

 const page=document.createElement("div");
 page.id="appPage";
 page.className="app-page";
 page.innerHTML=`
 <button class="back" onclick="goHome()">‹ Homescreen</button>
 <h1>${name}</h1>
 <div id="appContent"></div>`;
 document.querySelector(".phone").appendChild(page);

 const content=document.getElementById("appContent");

 const apps={
 "Telefon":()=>{
 content.innerHTML=`
 <div class="panel">
 <input id="phoneNumber" placeholder="Telefonnummer" readonly>
 <div class="keypad">
 ${["1","2","3","4","5","6","7","8","9","*","0","#"].map(n=>`<button class="action" onclick="document.getElementById('phoneNumber').value+= '${n}'">${n}</button>`).join("")}
 </div>
 <button class="action" onclick="alert('Telefonieren ist in dieser Web-Demo nicht verfügbar.')">📞 Anrufen</button>
 <button class="action danger" onclick="document.getElementById('phoneNumber').value=''">Löschen</button>
 </div>`;
 },

 "Nachrichten":()=>{
 content.innerHTML=`
 <div class="panel" id="chatList"></div>
 <input id="messageInput" placeholder="Nachricht schreiben">
 <button class="action" onclick="sendMessage()">Senden</button>`;
 showMessages();
 },

 "Notizen":()=>{
 content.innerHTML=`
 <textarea id="noteText" placeholder="Deine Notiz..."></textarea>
 <button class="action" onclick="saveNote()">Speichern</button>
 <div id="savedNote" class="panel"></div>`;
 showNote();
 },

 "Rechner":()=>{
 content.innerHTML=`
 <input class="big-number" id="calcDisplay" readonly placeholder="0">
 <div class="keypad">
 ${["7","8","9","4","5","6","1","2","3","0",".","+","-","*","/","(",")"].map(n=>`<button class="action" onclick="calcPress('${n}')">${n}</button>`).join("")}
 <button class="action danger" onclick="calcClear()">C</button>
 <button class="action" onclick="calcResult()">=</button>
 </div>`;
 },

 "Safari":()=>{
 content.innerHTML=`
 <div class="panel">
 <p>🌐 NEXI Browser</p>
 <input id="webAddress" placeholder="https://example.com">
 <button class="action" onclick="openWebsite()">Öffnen</button>
 <p>Deine Webseite</p>
 <a href="https://jonahegete-cyber.github.io/nexi-phone/" target="_blank">NEXI PHONE besuchen</a>
 <iframe id="webFrame" style="width:100%;height:300px;border:0;border-radius:12px"></iframe>
 </div>`;
 },

 "Kamera":()=>{
 content.innerHTML=`
 <div class="panel">
 <video id="cameraPreview" autoplay playsinline></video>
 <button class="action" onclick="startCamera()">Kamera starten</button>
 <button class="action" onclick="takePhoto()">Foto aufnehmen</button>
 <canvas id="photoCanvas" hidden></canvas>
 <div id="photoResult"></div>
 </div>`;
 },

 "Fotos":()=>{
 content.innerHTML=`
 <div class="panel">
 <h3>Deine Galerie</h3>
 <input type="file" accept="image/*" multiple onchange="loadPhotos(event)">
 <div class="photo-grid" id="photoGrid"></div>
 </div>`;
 },

 "Einstellungen":()=>{
 content.innerHTML=`
 <div class="item">📶 WLAN <input type="checkbox" checked></div>
 <div class="item">🔵 Bluetooth <input type="checkbox"></div>
 <div class="item">🌙 Dark Mode <input type="checkbox" checked></div>
 <div class="item">☀️ Helligkeit
 <input type="range" min="40" max="100" value="100" onchange="document.querySelector('.phone').style.filter='brightness('+this.value+'%)'">
 </div>
 <div class="item">📱 NEXI PHONE<br>Version 2.0</div>
 <div class="item">🌈 Hintergrund
 <button class="action" onclick="changeWallpaper()">Ändern</button>
 </div>`;
 },

 "Kalender":()=>{
 content.innerHTML=`
 <div class="panel">
 <h2>${new Date().toLocaleDateString("de-DE",{month:"long",year:"numeric"})}</h2>
 <input type="date" id="eventDate">
 <input id="eventName" placeholder="Termin">
 <button class="action" onclick="saveEvent()">Termin speichern</button>
 <div id="events"></div>
 </div>`;
 showEvents();
 },

 "Uhr":()=>{
 content.innerHTML=`
 <div class="panel">
 <h2>⏱ Stoppuhr</h2>
 <div class="big-number" id="stopwatch">00:00</div>
 <button class="action" onclick="startStopwatch()">Start</button>
 <button class="action danger" onclick="stopStopwatch()">Stopp</button>
 <button class="action" onclick="resetStopwatch()">Reset</button>
 </div>`;
 },

 "Musik":()=>{
 content.innerHTML=`
 <div class="panel">
 <div class="big-number">🎵</div>
 <h2>NEXI MUSIC</h2>
 <input type="file" accept="audio/*" onchange="loadMusic(event)">
 <audio id="audioPlayer" controls style="width:100%"></audio>
 </div>`;
 },

 "App Store":()=>{
 content.innerHTML=`
 <div class="panel">
 <h2>App Store</h2>
 <p>Willkommen im NEXI App Store.</p>
 <p>Weitere Apps kommen bald!</p>
 </div>`;
 }
 };

 if(apps[name]) apps[name]();
}

function sendMessage() {
 const input=document.getElementById("messageInput");
 if(!input.value.trim()) return;
 let messages=JSON.parse(localStorage.getItem("nexiMessages")||"[]");
 messages.push(input.value);
 localStorage.setItem("nexiMessages",JSON.stringify(messages));
 input.value="";
 showMessages();
}

function showMessages() {
 const box=document.getElementById("chatList");
 if(!box)return;
 let messages=JSON.parse(localStorage.getItem("nexiMessages")||"[]");
 box.innerHTML=messages.map(m=>`<p class="item">💬 ${escapeHTML(m)}</p>`).join("");
}

function saveNote() {
 localStorage.setItem("nexiNote",document.getElementById("noteText").value);
 showNote();
}
function showNote() {
 const box=document.getElementById("savedNote");
 if(box) box.textContent=localStorage.getItem("nexiNote")||"Noch keine Notiz gespeichert.";
}

function escapeHTML(s) {
 return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

function calcPress(n) {
 calcValue+=n;
 document.getElementById("calcDisplay").value=calcValue;
}
function calcClear() {
 calcValue="";
 document.getElementById("calcDisplay").value="";
}
function calcResult() {
 try {
  if(!/^[0-9+\-*/(). ]+$/.test(calcValue))throw Error();
  calcValue=String(Function('"use strict";return ('+calcValue+')')());
  document.getElementById("calcDisplay").value=calcValue;
 } catch {
  calcValue="";
  document.getElementById("calcDisplay").value="Fehler";
 }
}

function openWebsite() {
 let url=document.getElementById("webAddress").value.trim();
 if(!/^https?:\/\//i.test(url))url="https://"+url;
 document.getElementById("webFrame").src=url;
}

async function startCamera() {
 try {
  cameraStream=await navigator.mediaDevices.getUserMedia({video:true});
  document.getElementById("cameraPreview").srcObject=cameraStream;
 } catch {
  alert("Kamerazugriff nicht möglich. Bitte Browser-Berechtigung prüfen.");
 }
}

function takePhoto() {
 const video=document.getElementById("cameraPreview");
 if(!video.videoWidth)return alert("Starte zuerst die Kamera.");
 const canvas=document.getElementById("photoCanvas");
 canvas.width=video.videoWidth;
 canvas.height=video.videoHeight;
 canvas.getContext("2d").drawImage(video,0,0);
 const link=document.createElement("a");
 link.href=canvas.toDataURL("image/png");
 link.download="NEXI-Foto.png";
 link.click();
}

function loadPhotos(event) {
 const grid=document.getElementById("photoGrid");
 [...event.target.files].forEach(file=>{
  const img=document.createElement("img");
  img.src=URL.createObjectURL(file);
  img.style.width="100%";
  img.style.borderRadius="14px";
  grid.appendChild(img);
 });
}

function loadMusic(event) {
 const player=document.getElementById("audioPlayer");
 player.src=URL.createObjectURL(event.target.files[0]);
 player.play();
}

function changeWallpaper() {
 const colors=[
 "linear-gradient(140deg,#071b42,#6042a3)",
 "linear-gradient(140deg,#004b47,#00a6a6)",
 "linear-gradient(140deg,#651b4c,#ef7865)",
 "linear-gradient(140deg,#121212,#555)"
 ];
 const w=document.querySelector(".wallpaper");
 let index=Number(localStorage.getItem("wallpaperIndex")||0);
 index=(index+1)%colors.length;
 localStorage.setItem("wallpaperIndex",index);
 w.style.background=colors[index];
}

function saveEvent() {
 let events=JSON.parse(localStorage.getItem("nexiEvents")||"[]");
 events.push({
  date:document.getElementById("eventDate").value,
  name:document.getElementById("eventName").value
 });
 localStorage.setItem("nexiEvents",JSON.stringify(events));
 showEvents();
}

function showEvents() {
 const box=document.getElementById("events");
 if(!box)return;
 const events=JSON.parse(localStorage.getItem("nexiEvents")||"[]");
 box.innerHTML=events.map(e=>`<div class="item">${escapeHTML(e.date)} – ${escapeHTML(e.name)}</div>`).join("");
}

let watchInterval=null;
let watchSeconds=0;
function startStopwatch() {
 if(watchInterval)return;
 watchInterval=setInterval(()=>{
  watchSeconds++;
  const el=document.getElementById("stopwatch");
  if(el)el.textContent=
   String(Math.floor(watchSeconds/60)).padStart(2,"0")+":"+
   String(watchSeconds%60).padStart(2,"0");
 },1000);
}
function stopStopwatch() {
 clearInterval(watchInterval);
 watchInterval=null;
}
function resetStopwatch() {
 stopStopwatch();
 watchSeconds=0;
 const el=document.getElementById("stopwatch");
 if(el)el.textContent="00:00";
}
