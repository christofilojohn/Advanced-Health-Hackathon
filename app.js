/* ═══════════════════════════════════════════════
   MINDBLOOM — App Logic
   ═══════════════════════════════════════════════ */

// ─── State ───
let state = {
  userName: 'Friend',
  entries: [],
  streak: 0,
  lastEntryDate: null,
  currentMood: 'neutral',
  emotionCounts: {},
  flRound: 47,
  flPeers: 1247,
  flAccuracy: 94.2,
  settings: {
    flEnabled: true,
    detectionEnabled: true,
    adaptiveTheme: true,
    dpEnabled: true
  }
};

// ─── Persistence ───
function loadState() {
  try {
    const saved = localStorage.getItem('mindbloom_state');
    if (saved) {
      state = { ...state, ...JSON.parse(saved) };
    }
  } catch(e) {}
}

function saveState() {
  try {
    localStorage.setItem('mindbloom_state', JSON.stringify(state));
  } catch(e) {}
}

// ─── Init ───
function init() {
  loadState();

  // Check onboarding
  if (localStorage.getItem('mindbloom_onboarded')) {
    document.getElementById('onboarding').classList.add('hidden');
    document.getElementById('app').style.display = 'flex';
  }

  setTimeGreeting();
  setDate();
  updateUserName(state.userName);
  updateStats();
  renderInsights();
  calculateStreak();

  // Settings sync
  document.getElementById('settingName').value = state.userName;
  document.getElementById('settingName').addEventListener('change', function() {
    state.userName = this.value || 'Friend';
    updateUserName(state.userName);
    saveState();
  });

  // Journal input listeners
  const textarea = document.getElementById('journalInput');
  textarea.addEventListener('input', handleJournalInput);

  // Avatar click
  document.getElementById('avatarWrapper').addEventListener('click', showMindfulnessTip);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      const active = document.querySelector('.screen.active');
      if (active.id === 'screen-journal') startLabelingFlow();
    }
  });
}

// ─── Onboarding ───
let currentSlide = 0;

function nextOnboardingSlide() {
  const slides = document.querySelectorAll('.onboarding-slide');
  const dots = document.querySelectorAll('.ob-dot');
  const btn = document.getElementById('onboardingBtn');

  if (currentSlide === 2) {
    // Finish onboarding
    const nameInput = document.getElementById('onboardingName').value.trim();
    state.userName = nameInput || 'Friend';
    saveState();
    localStorage.setItem('mindbloom_onboarded', 'true');
    document.getElementById('onboarding').classList.add('hidden');
    document.getElementById('app').style.display = 'flex';
    updateUserName(state.userName);
    document.getElementById('settingName').value = state.userName;
    return;
  }

  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');

  currentSlide++;

  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');

  if (currentSlide === 2) {
    btn.textContent = "Let's Go 🌸";
    setTimeout(() => document.getElementById('onboardingName').focus(), 500);
  }
}

// ─── Time & Date ───
function setTimeGreeting() {
  const hour = new Date().getHours();
  const el = document.getElementById('timeGreeting');
  if (hour < 6) el.textContent = 'Late Night';
  else if (hour < 12) el.textContent = 'Good Morning';
  else if (hour < 17) el.textContent = 'Good Afternoon';
  else if (hour < 21) el.textContent = 'Good Evening';
  else el.textContent = 'Good Night';
}

function setDate() {
  const now = new Date();
  document.getElementById('datePill').textContent = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function updateUserName(name) {
  document.getElementById('userName').textContent = name;
}

// ─── Mood / Theme ───
const emotionPrompts = {
  neutral: '"What\'s one thing on your mind right now?"',
  happy: '"What made you smile today? ☀️"',
  sad: '"It\'s okay to feel this way. What happened?"',
  anxious: '"Take a breath. What\'s weighing on you?"',
  angry: '"Let it out — what\'s frustrating you?"',
  grateful: '"What are you thankful for today?"',
  hopeful: '"What are you looking forward to?"',
  lonely: '"You\'re not alone. What\'s on your heart?"',
  overwhelmed: '"One thing at a time. What\'s most pressing?"',
  calm: '"Beautiful stillness. What brought you peace?"',
  confused: '"Let\'s untangle this. What\'s unclear?"'
};

const emotionSubtitles = {
  neutral: 'What would you like to talk about today?',
  happy: 'Wonderful to see you in good spirits!',
  sad: "We're here to listen. Take your time.",
  anxious: "Let's take a moment together.",
  angry: 'This is a safe space to express yourself.',
  grateful: 'Gratitude is a beautiful practice.',
  hopeful: 'Hold onto that light.',
  lonely: 'Connection starts right here.',
  overwhelmed: "Let's break it down together.",
  calm: 'Enjoy this moment of peace.',
  confused: "Let's work through this."
};

function setMood(mood) {
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`[data-mood="${mood}"]`);
  if (btn) btn.classList.add('active');

  // Flash
  const flash = document.getElementById('themeFlash');
  flash.classList.add('active');
  setTimeout(() => flash.classList.remove('active'), 300);

  // Theme
  if (state.settings.adaptiveTheme) {
    if (mood === 'neutral') {
      document.documentElement.removeAttribute('data-emotion');
    } else {
      document.documentElement.setAttribute('data-emotion', mood);
    }
  }

  // Update text
  document.getElementById('journalPrompt').textContent = emotionPrompts[mood] || emotionPrompts.neutral;
  document.getElementById('greetingSubtitle').textContent = emotionSubtitles[mood] || emotionSubtitles.neutral;

  state.currentMood = mood;
}

// ─── On-device Emotion Detection ───
const emotionKeywords = {
  happy: ['happy','great','wonderful','amazing','love','excited','joy','smile','good','awesome','fantastic','blessed','fun','laugh','celebrate','thrilled','delighted'],
  sad: ['sad','cry','tears','lonely','miss','hurt','broken','lost','grief','pain','depressed','empty','hopeless','sorrow','tired','heartbroken'],
  anxious: ['worried','anxious','nervous','stress','afraid','panic','overwhelm','fear','restless','tense','uneasy','uncertain','pressure','deadline','scary'],
  angry: ['angry','frustrated','annoyed','furious','hate','unfair','rage','mad','irritated','outraged','disgusted','resentful'],
  grateful: ['grateful','thankful','appreciate','fortunate','gratitude','thanks','kind','lucky','privilege','gift'],
  hopeful: ['hope','hopeful','looking forward','excited about','optimistic','bright','future','dream','aspire','possibility'],
  lonely: ['alone','lonely','isolated','nobody','disconnected','abandoned','forgotten','invisible'],
  overwhelmed: ['overwhelmed','too much','can\'t handle','drowning','swamped','buried','exhausted','burnout'],
  calm: ['calm','peaceful','serene','relaxed','content','tranquil','still','quiet','zen','balanced'],
  confused: ['confused','unsure','don\'t know','lost','unclear','mixed','conflicted','torn']
};

let analysisTimeout;

function analyzeEmotion(text) {
  const lower = text.toLowerCase();
  const scores = {};
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    scores[emotion] = keywords.reduce((c, kw) => c + (lower.includes(kw) ? 1 : 0), 0);
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted[0][1] > 0 ? sorted[0][0] : null;
}

function handleJournalInput() {
  const text = this.value;
  const bar = document.getElementById('analysisBar');

  // Word count
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  document.getElementById('wordCount').textContent = words;

  clearTimeout(analysisTimeout);

  if (text.length > 20 && state.settings.detectionEnabled) {
    bar.classList.add('visible');
    document.getElementById('analysisResult').textContent = 'Analyzing your writing...';

    analysisTimeout = setTimeout(() => {
      const detected = analyzeEmotion(text);
      if (detected) {
        const labels = {
          happy:'😊 Happiness', sad:'😔 Sadness', anxious:'😰 Anxiety', angry:'😤 Frustration',
          grateful:'🙏 Gratitude', hopeful:'🌱 Hope', lonely:'🫂 Loneliness',
          overwhelmed:'🌊 Overwhelm', calm:'🧘 Calm', confused:'🤔 Confusion'
        };
        document.getElementById('analysisResult').innerHTML =
          `Detected <strong>${labels[detected]}</strong> — theme adapting`;
        if (state.settings.adaptiveTheme) setMood(detected);
      } else {
        document.getElementById('analysisResult').textContent = 'Keep writing... building emotional context.';
      }
    }, 1000);
  } else {
    bar.classList.remove('visible');
  }
}

// ─── Labeling Flow ───
let pendingEntry = '';

function startLabelingFlow() {
  const text = document.getElementById('journalInput').value.trim();
  if (!text) {
    showToast('Write something first — even a single sentence counts ✨');
    return;
  }
  if (text.split(/\s+/).length < 3) {
    showToast('A few more words would help the model learn 📝');
    return;
  }

  pendingEntry = text;

  // Preview
  document.getElementById('labelingPreview').textContent =
    text.length > 200 ? text.substring(0, 200) + '...' : text;

  // Clear selected emotions
  document.querySelectorAll('.emotion-chip').forEach(c => c.classList.remove('selected'));

  switchScreen('labeling');
}

function toggleEmotion(el) {
  const selected = document.querySelectorAll('.emotion-chip.selected');
  if (!el.classList.contains('selected') && selected.length >= 2) {
    showToast('Pick up to 2 emotions');
    return;
  }
  el.classList.toggle('selected');
}

function getSelectedEmotions() {
  return [...document.querySelectorAll('.emotion-chip.selected')].map(c => c.dataset.emotion);
}

// ─── Save Entry ───
function saveEntry(labels) {
  const entry = {
    id: Date.now(),
    text: pendingEntry,
    labels: labels,
    mood: state.currentMood,
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  };

  state.entries.unshift(entry);

  // Update emotion counts
  labels.forEach(l => {
    state.emotionCounts[l] = (state.emotionCounts[l] || 0) + 1;
  });
  if (labels.length === 0 && state.currentMood !== 'neutral') {
    state.emotionCounts[state.currentMood] = (state.emotionCounts[state.currentMood] || 0) + 1;
  }

  state.lastEntryDate = new Date().toISOString();
  calculateStreak();
  saveState();

  // Clear input
  document.getElementById('journalInput').value = '';
  document.getElementById('wordCount').textContent = '0';
  document.getElementById('analysisBar').classList.remove('visible');

  if (labels.length > 0 && state.settings.flEnabled) {
    // Show training simulation
    switchScreen('training');
    runTrainingSimulation(labels);
  } else {
    showToast('Entry saved locally 🔒');
    switchScreen('journal');
    updateStats();
    renderInsights();
  }
}

// ─── Training Simulation ───
function runTrainingSimulation(labels) {
  const steps = [
    { id: 'step-tokenize', delay: 400 },
    { id: 'step-forward', delay: 800 },
    { id: 'step-loss', delay: 600 },
    { id: 'step-backward', delay: 700 },
    { id: 'step-dp', delay: 500 },
    { id: 'step-fl', delay: 900 },
    { id: 'step-agg', delay: 600 },
    { id: 'step-done', delay: 400 }
  ];

  // Reset
  const progressEl = document.getElementById('trainingProgress');
  const percentEl = document.getElementById('trainingPercent');
  document.getElementById('trainingStats').style.display = 'none';
  document.getElementById('trainingDoneBtn').style.display = 'none';
  progressEl.style.strokeDashoffset = '327';
  percentEl.textContent = '0%';
  steps.forEach(s => {
    const el = document.getElementById(s.id);
    el.className = 'training-step';
    el.querySelector('.step-icon').textContent = '⏳';
  });

  let totalDelay = 0;
  const totalTime = steps.reduce((s, st) => s + st.delay, 0);

  steps.forEach((step, i) => {
    totalDelay += step.delay;
    const cumDelay = totalDelay;

    setTimeout(() => {
      // Set previous to done
      if (i > 0) {
        const prev = document.getElementById(steps[i-1].id);
        prev.classList.remove('active');
        prev.classList.add('done');
        prev.querySelector('.step-icon').textContent = '✅';
      }

      const el = document.getElementById(step.id);
      el.classList.add('active');
      el.querySelector('.step-icon').textContent = '⚡';

      // Progress
      const pct = Math.round((cumDelay / totalTime) * 100);
      const offset = 327 - (327 * pct / 100);
      progressEl.style.transition = 'stroke-dashoffset 0.5s ease';
      progressEl.style.strokeDashoffset = offset;
      percentEl.textContent = pct + '%';

    }, totalDelay);
  });

  // Final
  totalDelay += 400;
  setTimeout(() => {
    const last = document.getElementById(steps[steps.length-1].id);
    last.classList.remove('active');
    last.classList.add('done');
    last.querySelector('.step-icon').textContent = '✅';

    progressEl.style.strokeDashoffset = '0';
    percentEl.textContent = '100%';

    // Update FL stats
    state.flRound++;
    state.flPeers += Math.floor(Math.random() * 5);
    state.flAccuracy = Math.min(99.9, state.flAccuracy + (Math.random() * 0.3));
    saveState();

    // Show stats
    const loss = (0.15 + Math.random() * 0.2).toFixed(4);
    const acc = (state.flAccuracy).toFixed(1);
    document.getElementById('tLoss').textContent = loss;
    document.getElementById('tAcc').textContent = acc + '%';
    document.getElementById('tRound').textContent = 'R' + state.flRound;
    document.getElementById('tPeers').textContent = state.flPeers.toLocaleString();
    document.getElementById('trainingStats').style.display = 'flex';
    document.getElementById('trainingDoneBtn').style.display = 'block';

  }, totalDelay);
}

function finishTraining() {
  showToast('Model updated! Your data stays on-device 🔒');
  switchScreen('journal');
  updateStats();
  renderInsights();
}

// ─── Navigation ───
function switchScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navBtn = document.querySelector(`[data-screen="${name}"]`);
  if (navBtn) navBtn.classList.add('active');

  // Scroll to top
  document.getElementById('screen-' + name).scrollTop = 0;

  if (name === 'insights') renderInsights();
}

// ─── Stats ───
function updateStats() {
  document.getElementById('entryCount').textContent = state.entries.length;
  document.getElementById('streakCount').textContent = state.streak;

  // Mood trend
  const recent = state.entries.slice(0, 5);
  const positiveEmotions = ['happy', 'grateful', 'hopeful', 'calm'];
  const recentPositive = recent.filter(e =>
    e.labels.some(l => positiveEmotions.includes(l)) ||
    positiveEmotions.includes(e.mood)
  ).length;
  const trend = recent.length < 2 ? '—' : recentPositive >= recent.length / 2 ? '↑' : '↓';
  document.getElementById('moodTrend').textContent = trend;
}

function calculateStreak() {
  if (!state.entries.length) { state.streak = 0; return; }

  const today = new Date();
  today.setHours(0,0,0,0);
  let streak = 0;
  let checkDate = new Date(today);

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const hasEntry = state.entries.some(e => e.timestamp.split('T')[0] === dateStr);
    if (hasEntry) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  state.streak = streak;
}

// ─── Insights Rendering ───
function renderInsights() {
  renderEmotionBars();
  renderMoodTimeline();
  renderEntries();
  updateFLStats();
}

function renderEmotionBars() {
  const container = document.getElementById('emotionBars');
  const emotions = ['happy','sad','anxious','angry','grateful','hopeful','lonely','overwhelmed','calm','confused'];
  const max = Math.max(1, ...emotions.map(e => state.emotionCounts[e] || 0));

  container.innerHTML = emotions.map(e => {
    const count = state.emotionCounts[e] || 0;
    const pct = (count / max) * 100;
    const emoji = { happy:'😊', sad:'😔', anxious:'😰', angry:'😤', grateful:'🙏', hopeful:'🌱', lonely:'🫂', overwhelmed:'🌊', calm:'🧘', confused:'🤔' };
    return `
      <div class="ebar-row">
        <div class="ebar-label">${emoji[e]} ${e}</div>
        <div class="ebar-track"><div class="ebar-fill" style="width:${pct}%"></div></div>
        <div class="ebar-count">${count}</div>
      </div>`;
  }).join('');
}

function renderMoodTimeline() {
  const container = document.getElementById('moodTimeline');
  const last14 = [];
  const today = new Date();

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayEntries = state.entries.filter(e => e.timestamp.split('T')[0] === dateStr);
    const positive = ['happy','grateful','hopeful','calm'];
    const score = dayEntries.length === 0 ? 0.1 :
      dayEntries.reduce((s, e) => {
        const isPos = e.labels.some(l => positive.includes(l)) || positive.includes(e.mood);
        return s + (isPos ? 1 : 0.4);
      }, 0) / dayEntries.length;
    last14.push({ score, label: d.toLocaleDateString('en-US', { weekday: 'narrow' }) });
  }

  const maxScore = Math.max(1, ...last14.map(d => d.score));
  container.innerHTML = last14.map(d => {
    const h = Math.max(4, (d.score / maxScore) * 70);
    return `<div class="mood-bar" style="height:${h}px" data-label="${d.label}"></div>`;
  }).join('');
}

function renderEntries() {
  const container = document.getElementById('entriesList');
  if (state.entries.length === 0) {
    container.innerHTML = '<div class="empty-state">No entries yet. Start journaling! 🌱</div>';
    return;
  }
  container.innerHTML = state.entries.slice(0, 10).map(e => `
    <div class="entry-item">
      <div class="entry-date">${e.date} — ${new Date(e.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
      <div class="entry-text">${escapeHtml(e.text)}</div>
      <div class="entry-tags">
        ${e.labels.map(l => `<span class="entry-tag">${l}</span>`).join('')}
        ${e.labels.length === 0 ? `<span class="entry-tag">${e.mood}</span>` : ''}
      </div>
    </div>
  `).join('');
}

function updateFLStats() {
  document.getElementById('flPeers').textContent = state.flPeers.toLocaleString();
  document.getElementById('flRound').textContent = 'R' + state.flRound;
  document.getElementById('flAccuracy').textContent = state.flAccuracy.toFixed(1) + '%';
  document.getElementById('flLocalSamples').textContent = state.entries.filter(e => e.labels.length > 0).length;
}

// ─── Breathing Exercises ───
let breatheInterval = null;
let breatheActive = false;
let breatheCycles = 0;
let breatheType = '478';

const breatheConfigs = {
  '478': { inhale: 4, hold: 7, exhale: 8, name: '4-7-8 Relaxation' },
  'box': { inhale: 4, hold: 4, exhale: 4, holdOut: 4, name: 'Box Breathing' },
  'calm': { inhale: 5, hold: 0, exhale: 5, name: 'Calm Breathing' }
};

function selectBreathType(el) {
  document.querySelectorAll('.breathe-type').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  breatheType = el.dataset.type;
  stopBreathing();
}

document.addEventListener('DOMContentLoaded', () => {
  const circle = document.getElementById('breatheCircle');
  if (circle) {
    circle.addEventListener('click', () => {
      if (breatheActive) stopBreathing();
      else startBreathing();
    });
  }
});

function startBreathing() {
  breatheActive = true;
  breatheCycles = 0;
  document.getElementById('breatheCycles').textContent = '0';

  const config = breatheConfigs[breatheType];
  const totalDuration = config.inhale + config.hold + config.exhale + (config.holdOut || 0);

  const circle = document.getElementById('breatheCircle');
  circle.style.setProperty('--breathe-duration', totalDuration + 's');
  circle.classList.add('breathing');

  runBreathCycle();
}

function runBreathCycle() {
  if (!breatheActive) return;

  const config = breatheConfigs[breatheType];
  const textEl = document.getElementById('breatheText');
  const timerEl = document.getElementById('breatheTimer');
  const instrEl = document.getElementById('breatheInstruction');

  let phase = 0;
  const phases = [
    { text: 'Breathe In', duration: config.inhale, instruction: 'Inhale slowly through your nose' },
    { text: 'Hold', duration: config.hold, instruction: 'Hold gently' },
    { text: 'Breathe Out', duration: config.exhale, instruction: 'Exhale slowly through your mouth' },
  ];
  if (config.holdOut) {
    phases.push({ text: 'Hold', duration: config.holdOut, instruction: 'Hold empty' });
  }
  // Remove zero-duration phases
  const activePhases = phases.filter(p => p.duration > 0);

  function runPhase() {
    if (!breatheActive || phase >= activePhases.length) {
      if (breatheActive) {
        breatheCycles++;
        document.getElementById('breatheCycles').textContent = breatheCycles;
        phase = 0;
        runPhase();
      }
      return;
    }

    const p = activePhases[phase];
    textEl.textContent = p.text;
    instrEl.textContent = p.instruction;
    let remaining = p.duration;
    timerEl.textContent = remaining;

    breatheInterval = setInterval(() => {
      remaining--;
      timerEl.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(breatheInterval);
        phase++;
        runPhase();
      }
    }, 1000);
  }

  runPhase();
}

function stopBreathing() {
  breatheActive = false;
  clearInterval(breatheInterval);
  const circle = document.getElementById('breatheCircle');
  circle.classList.remove('breathing');
  document.getElementById('breatheText').textContent = 'Tap to start';
  document.getElementById('breatheTimer').textContent = '';
  document.getElementById('breatheInstruction').textContent = 'Press the circle to begin';
}

// ─── Mindfulness Tips ───
const tips = [
  "Try naming 5 things you can see right now 👀",
  "Place your hand on your heart — feel it beating 💓",
  "Take 3 deep breaths before continuing ✨",
  "What's one thing you're grateful for right now? 🙏",
  "It's okay to not be okay. You're human. 🌿",
  "Progress isn't linear — every step counts 🌱",
  "Your feelings are valid, all of them 💜",
  "Try the breathing exercise — it really helps 🫁",
  "Writing it down is already a brave step 📝",
  "You're showing up for yourself today 🌸",
  "One moment at a time, one breath at a time 🧘",
  "Drink some water — your body will thank you 💧"
];

function showMindfulnessTip() {
  const tip = tips[Math.floor(Math.random() * tips.length)];
  const bubble = document.getElementById('speechText');
  bubble.style.opacity = '0';
  setTimeout(() => {
    bubble.textContent = tip;
    bubble.style.opacity = '1';
  }, 200);
}

// ─── Prompt Suggestions ───
const prompts = [
  "Today I noticed...",
  "Something that surprised me was...",
  "I'm feeling grateful for...",
  "One thing I'd tell my past self...",
  "Right now, my body feels...",
  "A small win I had today was...",
  "What's been on my mind lately is...",
  "If I could change one thing today...",
  "Something I learned about myself...",
  "The best part of my day was..."
];

function insertPromptSuggestion() {
  const textarea = document.getElementById('journalInput');
  if (textarea.value.trim() === '') {
    const prompt = prompts[Math.floor(Math.random() * prompts.length)];
    textarea.value = prompt + ' ';
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    showToast('💡 Prompt suggestion added');
  } else {
    showToast('💡 Clear your entry first for a new prompt');
  }
}

// ─── Settings ───
function toggleSetting(el) {
  el.classList.toggle('active');
  const isActive = el.classList.contains('active');

  if (el.id === 'toggleFL') state.settings.flEnabled = isActive;
  if (el.id === 'toggleDetection') state.settings.detectionEnabled = isActive;
  if (el.id === 'toggleTheme') {
    state.settings.adaptiveTheme = isActive;
    if (!isActive) document.documentElement.removeAttribute('data-emotion');
  }
  if (el.id === 'toggleDP') state.settings.dpEnabled = isActive;

  saveState();
}

function exportData() {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mindbloom_export_' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('📦 Data exported!');
}

function clearAllData() {
  if (confirm('Are you sure? This will delete all entries and reset the app.')) {
    localStorage.removeItem('mindbloom_state');
    localStorage.removeItem('mindbloom_onboarded');
    state = {
      userName: 'Friend', entries: [], streak: 0, lastEntryDate: null,
      currentMood: 'neutral', emotionCounts: {}, flRound: 47, flPeers: 1247, flAccuracy: 94.2,
      settings: { flEnabled: true, detectionEnabled: true, adaptiveTheme: true, dpEnabled: true }
    };
    saveState();
    showToast('🗑 All data cleared');
    location.reload();
  }
}

// ─── Utilities ───
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ─── Start ───
document.addEventListener('DOMContentLoaded', init);
