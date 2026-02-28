# 🌸 Clarity — AI-Powered Mental Health Journal

**Privacy-first mental health journaling app powered by on-device AI and Federated Learning via Flower.**

## Includes: 

<ol>
  <li>Clarity Web Interface: For text analysis, voice-to-text feature, nearest GP locator and Agentic Email Management.</li>
  <li>Mental Health Analyzer and Classifier integrating federated learning for user data privacy.</li>
</ol>
## 🎯 What It Does

Clarity helps users journal their thoughts and track emotions while keeping all data on-device. An emotion classifier is trained locally using user-provided labels and improved globally through Federated Learning — no raw data ever leaves the device.

## 🧠 The FL Pipeline

1. **Write** — User journals their thoughts freely
2. **Label** — Post-entry reflection: user selects up to 2 emotion labels from 10 categories
3. **Train** — On-device text classifier (TinyBERT + multi-label classification head) trains on the (text, labels) pair
4. **FL Sync** — Only model weight deltas are sent to the Flower server for FedAvg aggregation with differential privacy

## ✨ Features

- **Adaptive Theme Engine** — UI colors, ambient orbs, and avatar expression morph based on detected emotion
- **On-Device Emotion Detection** — Real-time keyword-based classifier analyzes journal text as you type
- **Multi-Label Emotion Taxonomy** — 10 emotion categories: Happy, Sad, Anxious, Angry, Grateful, Hopeful, Lonely, Overwhelmed, Calm, Confused
- **FL Training Simulation** — Visual walkthrough of the entire federated learning pipeline (tokenization → forward pass → loss → backprop → DP noise → FL sync)
- **Breathing Exercises** — 4-7-8, Box, and Calm breathing with animated visual guide
- **Analytics Dashboard** — Emotion distribution bars, mood timeline, FL model stats, entry history
- **Streak System** — Daily journaling streak tracker
- **Mindfulness Tips** — Interactive avatar with rotating wellness tips
- **Data Export** — Full JSON export of all entries
- **Onboarding** — 3-slide intro explaining the app, FL pipeline, and personalization

## 🔒 Privacy Architecture

- All journal text stays on-device (localStorage in demo, encrypted local DB in production)
- Only model weight updates (gradients) are shared via Flower FL
- Differential privacy noise is applied to weight updates before transmission
- Users can toggle FL, emotion detection, and DP independently
- Full data export and deletion capabilities

## 🛠 Tech Stack

| Component | Technology |
|----------|-------------|
| Frontend | Vanilla HTML/CSS/JS |
| On-device ML | TinyBERT (simulated in demo) |
| FL Framework | Flower (simulated in demo) |
| Aggregation | FedAvg with DP |
| Persistence | localStorage |
| Hosting | Netlify |

## 🚀 Deploy

**Netlify (drag & drop):**

1. Go to https://app.netlify.com/drop
2. Drag the `clarity` folder onto the page
3. Done!

**Or via CLI:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=.
