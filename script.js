// Birthday website settings — update the date if the birthday changes.
const CONFIG = {
  // Birthday unlocks at midnight in India (IST).
  unlockAt: "2026-11-21T00:00:00+05:30"
};

const $ = id => document.getElementById(id);
const targetTime = new Date(CONFIG.unlockAt).getTime();
let unlocked = false;
let musicPlaying = false;
let audioContext = null;
let melodyTimer = null;
let melodyStep = 0;

const countdownScreen = $("countdownScreen");
const birthdayScreen = $("birthdayScreen");
const lockedButton = $("lockedButton");

function unlock() {
  if (unlocked) return;
  unlocked = true;
  countdownScreen.classList.add("hidden");
  birthdayScreen.classList.remove("hidden");
  burstConfetti();
}
function updateCountdown() {
  const remaining = targetTime - Date.now();
  if (remaining <= 0) {
    ["days","hours","minutes","seconds"].forEach(id => $(id).textContent = "00");
    $("unlockNote").textContent = "The little door is open! ✨";
    lockedButton.disabled = false;
    lockedButton.textContent = "✨ Open your surprise";
    lockedButton.onclick = unlock;
    unlock();
    return;
  }
  const values = [
    Math.floor(remaining / 86400000),
    Math.floor((remaining % 86400000) / 3600000),
    Math.floor((remaining % 3600000) / 60000),
    Math.floor((remaining % 60000) / 1000)
  ];
  ["days","hours","minutes","seconds"].forEach((id,i) => $(id).textContent = String(values[i]).padStart(2,"0"));
}
updateCountdown();
setInterval(updateCountdown,1000);

$("exploreButton").addEventListener("click", () => {
  $("content").classList.remove("hidden");
  $("content").scrollIntoView({behavior:"smooth"});
  burstConfetti();
});

const quotes = [
  "Good friends make ordinary moments feel extraordinary.",
  "Some people make the world feel a little softer just by being in it.",
  "A true friend is one of life's loveliest plot twists.",
  "The best memories are made of laughter, kindness, and a little bit of chaos.",
  "A friend is a favourite chapter that you never want to end."
];
let quoteIndex = 0;
$("nextQuote").addEventListener("click", () => {
  quoteIndex = (quoteIndex + 1) % quotes.length;
  $("quoteText").textContent = `“${quotes[quoteIndex]}”`;
});
$("letterButton").addEventListener("click", () => {
  $("letter").classList.toggle("hidden");
  $("letterButton").textContent = $("letter").classList.contains("hidden") ? "💌 Open your letter" : "💌 Close your letter";
});

// Original, synthesised gentle piano-like melody using Web Audio.
// It creates sound in the browser; no copyrighted recording or music file is included.
const notes = [523.25,659.25,783.99,659.25,587.33,698.46,783.99,698.46,523.25,587.33,659.25,523.25];
function playNote(frequency, startAt, duration=0.72) {
  if (!audioContext) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const tone = audioContext.createBiquadFilter();
  osc.type = "sine";
  osc.frequency.value = frequency;
  tone.type = "lowpass";
  tone.frequency.value = 2400;
  gain.gain.setValueAtTime(0.0001,startAt);
  gain.gain.exponentialRampToValueAtTime(0.11,startAt+0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001,startAt+duration);
  osc.connect(tone); tone.connect(gain); gain.connect(audioContext.destination);
  osc.start(startAt); osc.stop(startAt+duration+0.03);
}
function melodyTick() {
  if (!musicPlaying || !audioContext) return;
  const now = audioContext.currentTime;
  playNote(notes[melodyStep % notes.length],now,0.82);
  if (melodyStep % 4 === 0) playNote(notes[(melodyStep+4) % notes.length] / 2,now,1.15);
  melodyStep++;
}
async function toggleMusic() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      $("musicButton").textContent = "Music unavailable";
      return;
    }
    audioContext = new AudioContextClass();
  }
  if (musicPlaying) {
    musicPlaying = false;
    clearInterval(melodyTimer);
    await audioContext.suspend();
    $("musicButton").textContent = "♫ Play piano";
    $("musicButton").setAttribute("aria-pressed","false");
  } else {
    await audioContext.resume();
    musicPlaying = true;
    melodyTick();
    melodyTimer = setInterval(melodyTick,650);
    $("musicButton").textContent = "Ⅱ Pause piano";
    $("musicButton").setAttribute("aria-pressed","true");
  }
}
$("musicButton").addEventListener("click",toggleMusic);

function addAmbientLights() {
  for (let i=0;i<90;i++) {
    const star=document.createElement("i"); star.className="star";
    star.style.left=`${Math.random()*100}%`; star.style.top=`${Math.random()*100}%`;
    star.style.animationDelay=`${Math.random()*3}s`; $("stars").append(star);
  }
  for (let i=0;i<18;i++) {
    const light=document.createElement("i"); light.className="firefly";
    light.style.left=`${Math.random()*100}%`; light.style.top=`${30+Math.random()*65}%`;
    light.style.animationDelay=`${Math.random()*8}s`; $("fireflies").append(light);
  }
}
function burstConfetti() {
  const layer=$("confettiLayer"), symbols=["✦","✧","♥","✿"];
  for(let i=0;i<65;i++) {
    const bit=document.createElement("span"); bit.className="confetti";
    bit.textContent=symbols[Math.floor(Math.random()*symbols.length)];
    bit.style.left=`${Math.random()*100}%`; bit.style.animationDelay=`${Math.random()*1.3}s`;
    bit.style.fontSize=`${12+Math.random()*15}px`;
    bit.style.color=["#ffd6a5","#ffb8c8","#d7c4ff","#fff1cf"][i%4];
    layer.append(bit); setTimeout(()=>bit.remove(),5000);
  }
}
addAmbientLights();
