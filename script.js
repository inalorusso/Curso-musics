// ══════════════ NAVIGATION ══════════════
const pages = {
  home: 'page-home',
  drums: 'page-drums',
  guitar: 'page-guitar',
  metronome: 'page-metronome',
  progress: 'page-progress'
};

const tabIds = {
  home: 'tab-home',
  drums: 'tab-drums',
  guitar: 'tab-guitar',
  metronome: 'tab-metronome',
  progress: 'tab-progress'
};

function goToTab(name) {
  // Hide all pages
  Object.values(pages).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  
  // Deactivate all nav tabs
  Object.values(tabIds).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  
  // Show selected page
  const page = document.getElementById(pages[name]);
  const tab = document.getElementById(tabIds[name]);
  
  if (page) {
    page.classList.add('active');
    window.scrollTo(0, 0);
  }
  if (tab) tab.classList.add('active');
}

// ══════════════ MODULE TOGGLE ══════════════
function toggleModule(header) {
  header.closest('.module-card').classList.toggle('open');
}

// ══════════════ DRUM TAB NAVIGATION ══════════════
function showDrumTab(tabName) {
  // Hide all drum sections
  document.querySelectorAll('#page-drums .section-content').forEach(el => {
    el.classList.remove('active');
  });
  
  // Deactivate all drum tab buttons
  document.querySelectorAll('#drum-tabs .tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected section
  const section = document.getElementById(tabName);
  if (section) section.classList.add('active');
  
  // Activate selected button
  event.target.classList.add('active');
  window.scrollTo(0, 0);
}

// ══════════════ GUITAR TAB NAVIGATION ══════════════
function showGuitarTab(tabName) {
  // Hide all guitar sections
  document.querySelectorAll('#page-guitar .section-content').forEach(el => {
    el.classList.remove('active');
  });
  
  // Deactivate all guitar tab buttons
  document.querySelectorAll('#guitar-tabs .tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected section
  const section = document.getElementById(tabName);
  if (section) section.classList.add('active');
  
  // Activate selected button
  event.target.classList.add('active');
  window.scrollTo(0, 0);
}

// ══════════════ METRONOME ══════════════
let metroContext = null;
let metroOscillator = null;
let metroGain = null;
let metroBeat = 0;
let metroRunning = false;
let metroBpm = 80;
let metroTimeoutId = null;

function initMetronome() {
  if (!metroContext) {
    metroContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playClick() {
  initMetronome();
  
  const now = metroContext.currentTime;
  
  // Create oscillator for click sound
  const osc = metroContext.createOscillator();
  const gain = metroContext.createGain();
  
  osc.connect(gain);
  gain.connect(metroContext.destination);
  
  // Frequency: 1000 Hz for normal beat, 1500 Hz for accent
  osc.frequency.value = metroBeat === 0 ? 1500 : 1000;
  
  // Quick envelope
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  
  osc.start(now);
  osc.stop(now + 0.1);
  
  updateBeatVis();
}

function updateBeatVis() {
  const dots = document.querySelectorAll('.beat-dot');
  dots.forEach((dot, i) => {
    dot.classList.remove('active', 'accent');
    if (i === metroBeat) {
      dot.classList.add('active');
      if (metroBeat === 0) dot.classList.add('accent');
    }
  });
}

function metroTick() {
  playClick();
  metroBeat = (metroBeat + 1) % 4;
  
  if (metroRunning) {
    const interval = (60000 / metroBpm) / 2; // Twice per beat for 8th notes visual
    metroTimeoutId = setTimeout(metroTick, interval);
  }
}

function toggleMetro() {
  metroRunning = !metroRunning;
  const btn = document.getElementById('metroPlayBtn');
  
  if (metroRunning) {
    btn.classList.add('running');
    btn.textContent = '⏸ PARAR';
    metroBeat = 0;
    metroTick();
  } else {
    btn.classList.remove('running');
    btn.textContent = '▶ TOCAR';
    clearTimeout(metroTimeoutId);
    updateBeatVis();
  }
}

function setBpm(value) {
  metroBpm = parseInt(value);
  document.getElementById('metroBpm').textContent = metroBpm;
}

function changeBpm(delta) {
  const newBpm = Math.max(40, Math.min(220, metroBpm + delta));
  document.getElementById('bpmSlider').value = newBpm;
  setBpm(newBpm);
}

// ══════════════ INITIALIZE METRONOME UI ══════════════
function initMetronomeUI() {
  // Create beat visualization dots
  const beatVis = document.getElementById('beatVis');
  if (beatVis && beatVis.children.length === 0) {
    for (let i = 0; i < 4; i++) {
      const dot = document.createElement('div');
      dot.className = 'beat-dot';
      beatVis.appendChild(dot);
    }
  }
  
  // Create time signature buttons
  const metroSig = document.getElementById('metroSig');
  if (metroSig && metroSig.children.length === 0) {
    const sigs = ['4/4', '3/4', '6/8'];
    sigs.forEach((sig, i) => {
      const btn = document.createElement('button');
      btn.textContent = sig;
      btn.className = i === 0 ? 'active' : '';
      btn.onclick = () => {
        document.querySelectorAll('.metro-sig button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      };
      metroSig.appendChild(btn);
    });
  }
  
  // Create BPM reference
  const bpmRefs = document.getElementById('bpmRefs');
  if (bpmRefs && bpmRefs.children.length === 0) {
    const refs = [
      { tempo: 'Muito Lento', range: '40–60 BPM', example: 'Balada (Someone Like You - Adele)' },
      { tempo: 'Lento', range: '60–80 BPM', example: 'Blues (The Thrill is Gone - B.B. King)' },
      { tempo: 'Moderado', range: '80–100 BPM', example: 'Rock Médio (Come As You Are - Nirvana)' },
      { tempo: 'Rápido', range: '100–130 BPM', example: 'Rock Acelerado (Back in Black - AC/DC)' },
      { tempo: 'Muito Rápido', range: '130–160 BPM', example: 'Punk (Blitzkrieg Bop - Ramones)' },
      { tempo: 'Metal', range: '160–200 BPM', example: 'Metal (Master of Puppets - Metallica)' }
    ];
    
    refs.forEach(ref => {
      const html = `
        <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid var(--border);">
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--gold);">${ref.tempo}</div>
          <div style="font-size: 0.75rem; color: #CCC;">${ref.range}</div>
          <div style="font-size: 0.7rem; color: var(--gray);">${ref.example}</div>
        </div>
      `;
      bpmRefs.insertAdjacentHTML('beforeend', html);
    });
  }
}

// ══════════════ DRUM TAB BUILDER ══════════════
function buildDrumTab(containerId, tracks, title, bpm, beats) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const beatLabels8 = ['1', '+', '2', '+', '3', '+', '4', '+'];
  const beatLabels16 = ['1', 'e', '+', 'a', '2', 'e', '+', 'a', '3', 'e', '+', 'a', '4', 'e', '+', 'a'];
  const beatLabels12 = ['1', 'la', 'li', '2', 'la', 'li', '3', 'la', 'li', '4', 'la', 'li'];
  
  let labels = beats === 16 ? beatLabels16 : beats === 12 ? beatLabels12 : beatLabels8;

  let html = `<div class="dtab-wrap">`;
  if (title) html += `<div class="dtab-title">${title}<span class="dtab-bpm">♩= ${bpm}</span></div>`;
  html += `<div class="dtab">`;

  // Beat count row
  html += `<div class="dtab-beat-row"><div class="dtab-beat-label"></div><div class="dtab-beat-cells"><div class="dtab-beat-cells-inner">`;
  labels.forEach(label => {
    html += `<div class="dtab-beat-cell">${label}</div>`;
  });
  html += `</div></div></div>`;

  // Track rows
  tracks.forEach(track => {
    html += `<div class="dtab-row">`;
    html += `<div class="dtab-label">${track.label}</div>`;
    html += `<div class="dtab-cells"><div class="dtab-cells-inner">`;
    
    track.notes.forEach((note, i) => {
      const classes = [];
      if (i % (beats / 4) === 0) classes.push('beat-start');
      if (i === 0) classes.push('bar-start');
      
      html += `<div class="dtab-cell ${classes.join(' ')}">`;
      if (note) {
        html += `<span class="sym-${note}">${note}</span>`;
      }
      html += `</div>`;
    });
    
    html += `</div></div></div>`;
  });

  html += `</div></div>`;
  el.innerHTML = html;
}

// ══════════════ GUITAR FRETBOARD ══════════════
function buildFretboard(containerId, scale, root) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const strings = ['E', 'B', 'G', 'D', 'A', 'E'];
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  let html = `<div class="fretboard">`;

  strings.forEach((string, stringIdx) => {
    const stringNotes = [];
    const startIdx = notes.indexOf(string);
    
    for (let i = 0; i < 14; i++) {
      stringNotes.push(notes[(startIdx + i) % 12]);
    }

    // String label
    html += `<div class="fb-label">${string}</div>`;

    // Frets
    stringNotes.forEach((note, fretIdx) => {
      let cellClass = 'fb-cell';
      if (fretIdx === 0) cellClass += ' fb-nut';
      
      html += `<div class="${cellClass}">`;
      
      if (scale.includes(note) && note === root) {
        html += `<div class="fb-note root">${note}</div>`;
      } else if (scale.includes(note)) {
        html += `<div class="fb-note scale">${note}</div>`;
      }
      
      if ([3, 5, 7, 9, 12].includes(fretIdx)) {
        html += `<div class="inlay"></div>`;
      }
      
      html += `</div>`;
    });
  });

  html += `</div>`;
  el.innerHTML = html;
}

// ══════════════ INITIALIZE ON LOAD ══════════════
document.addEventListener('DOMContentLoaded', () => {
  initMetronomeUI();
  
  // Example: Build G01 drum tab
  buildDrumTab('tab-g01', [
    { label: 'HH', notes: ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x'] },
    { label: 'SN', notes: ['', '', 'x', '', '', '', 'x', ''] },
    { label: 'BD', notes: ['x', '', '', '', 'x', '', '', ''] }
  ], 'G01 — Rock Básico', 100, 8);
  
  // Example: Build A minor pentatonic scale
  buildFretboard('tab-am-pent', ['A', 'C', 'D', 'E', 'G'], 'A');
});

// ══════════════ UTILITY: LOCAL STORAGE ══════════════
function savePage(pageName) {
  localStorage.setItem('lastPage', pageName);
}

function loadLastPage() {
  const lastPage = localStorage.getItem('lastPage') || 'home';
  goToTab(lastPage);
}

// Load last page on page load
window.addEventListener('load', () => {
  loadLastPage();
});
