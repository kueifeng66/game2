/**
 * Park Patrol: Giant Hand (公園保衛戰：巨手降臨)
 * Core Game Engine & Logic
 */

(function () {
  'use strict';

  // Canvas roundRect Polyfill for older browser compatibility
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
      if (!radii) radii = 0;
      const r = typeof radii === 'number' ? Math.min(radii, w / 2, h / 2) : 0;
      this.beginPath();
      this.moveTo(x + r, y);
      this.arcTo(x + w, y, x + w, y + h, r);
      this.arcTo(x + w, y + h, x, y + h, r);
      this.arcTo(x, y + h, x, y, r);
      this.arcTo(x, y, x + w, y, r);
      this.closePath();
      return this;
    };
  }

  // --- Audio Synthesizer (Web Audio API) ---
  class SoundSystem {
    constructor() {
      this.ctx = null;
      this.muted = false;
      this.bgmPlaying = false;
      this.bgmTimer = null;
    }

    init() {
      try {
        if (!this.ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) {
            this.ctx = new AudioContext();
          }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        // iOS Safari Audio Unlock: play a silent 1-sample buffer on user gesture
        if (this.ctx && !this.unlocked) {
          const buffer = this.ctx.createBuffer(1, 1, 22050);
          const source = this.ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(this.ctx.destination);
          source.start(0);
          this.unlocked = true;
        }
      } catch (e) {}
    }

    playBark(pitch = 1.0) {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140 * pitch, now);
        osc.frequency.exponentialRampToValueAtTime(70 * pitch, now + 0.12);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600 * pitch, now);
        filter.Q.setValueAtTime(3.0, now);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
      } catch (e) {}
    }

    playSnap() {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        // Whip / crack noise
        const bufferSize = this.ctx.sampleRate * 0.08;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1200, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
      } catch (e) {}
    }

    playGrab() {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.1);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
      } catch (e) {}
    }

    playTie() {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.05);

          gain.gain.setValueAtTime(0.18, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.2);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.22);
        });
      } catch (e) {}
    }

    playChomp() {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } catch (e) {}
    }

    playGasp() {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.15);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } catch (e) {}
    }

    playVictory() {
      if (this.muted || !this.ctx) return;
      try {
        const notes = [523.25, 659.25, 783.99, 1046.50, 880, 1046.50];
        const times = [0, 0.12, 0.24, 0.36, 0.52, 0.7];
        const now = this.ctx.currentTime;
        notes.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + times[i]);

          gain.gain.setValueAtTime(0.25, now + times[i]);
          gain.gain.exponentialRampToValueAtTime(0.001, now + times[i] + 0.35);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + times[i]);
          osc.stop(now + times[i] + 0.4);
        });
      } catch (e) {}
    }

    playDefeat() {
      if (this.muted || !this.ctx) return;
      try {
        const notes = [440, 415, 392, 349];
        const now = this.ctx.currentTime;
        notes.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + i * 0.25);

          gain.gain.setValueAtTime(0.2, now + i * 0.25);
          gain.gain.linearRampToValueAtTime(0.001, now + i * 0.25 + 0.3);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.25);
          osc.stop(now + i * 0.25 + 0.35);
        });
      } catch (e) {}
    }

    startBgm() {
      if (this.bgmPlaying || !this.ctx) return;
      this.bgmPlaying = true;
      const melody = [
        261.63, 329.63, 392.00, 523.25, 392.00, 329.63,
        293.66, 349.23, 440.00, 587.33, 440.00, 349.23,
        329.63, 392.00, 493.88, 659.25, 493.88, 392.00,
        261.63, 329.63, 392.00, 523.25, 392.00, 261.63
      ];
      let step = 0;
      const tick = () => {
        if (!this.bgmPlaying) return;
        if (!this.muted && this.ctx) {
          try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(melody[step % melody.length], now);

            gain.gain.setValueAtTime(0.035, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.25);
          } catch (e) {}
        }
        step++;
        this.bgmTimer = setTimeout(tick, 220);
      };
      tick();
    }

    stopBgm() {
      this.bgmPlaying = false;
      if (this.bgmTimer) clearTimeout(this.bgmTimer);
    }
  }

  // --- Dog Breeds Configuration ---
  const DOG_BREEDS = [
    { name: 'Corgi', color: '#e67e22', earColor: '#d35400', size: 14, speed: 105, minRope: 25, maxRope: 45, pitch: 1.3 },
    { name: 'Bulldog', color: '#bdc3c7', earColor: '#7f8c8d', size: 18, speed: 85, minRope: 20, maxRope: 35, pitch: 0.75 },
    { name: 'Beagle', color: '#f39c12', earColor: '#5c3818', size: 15, speed: 110, minRope: 30, maxRope: 55, pitch: 1.0 },
    { name: 'Husky', color: '#95a5a6', earColor: '#2c3e50', size: 17, speed: 125, minRope: 35, maxRope: 60, pitch: 0.9 },
    { name: 'Poodle', color: '#ecf0f1', earColor: '#bdc3c7', size: 13, speed: 115, minRope: 28, maxRope: 48, pitch: 1.4 },
    { name: 'Golden', color: '#f1c40f', earColor: '#d4ac0d', size: 19, speed: 100, minRope: 32, maxRope: 58, pitch: 0.85 }
  ];

  // --- Child Clothing Colors ---
  const SHIRT_COLORS = ['#e74c3c', '#3498db', '#9b59b6', '#1abc9c', '#f39c12', '#e84393', '#00cec9'];
  const HAIR_COLORS = ['#2c3e50', '#8d6e63', '#d4ac0d', '#5d4037', '#e67e22'];

  // --- Main Game Class ---
  class ParkPatrolGame {
    constructor() {
      this.canvas = document.getElementById('game-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.sound = new SoundSystem();

      // View & Scaling (Auto-detecting screen)
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = window.devicePixelRatio || 1;
      this.baseScale = 1.0;
      this.speedScale = 1.0;
      this.isPortrait = false;
      this.isTouch = false;
      this.effectiveGrabDist = 52;

      // Game Clock & Time (10 minutes = 600s)
      this.TOTAL_TIME = 300;
      this.timeRemaining = this.TOTAL_TIME;
      this.timeElapsed = 0;
      this.gameSpeed = 1;
      this.state = 'START'; // START, PLAYING, PAUSED, GAMEOVER, VICTORY

      // Stats
      this.injuredCount = 0;
      this.MAX_INJURIES = 5;
      this.dogsCaught = 0;
      this.ropesSnapped = 0;

      // Input / Giant Hand
      this.mouse = { x: this.width / 2, y: this.height / 2, isDown: false, grabTarget: null };
      this.hand = {
        x: this.width / 2,
        y: this.height / 2,
        targetX: this.width / 2,
        targetY: this.height / 2,
        altitude: 40, // Height above ground for 3D shadow illusion
        isGrabbing: false,
        angle: 0
      };

      // Entities
      this.children = [];
      this.dogs = [];
      this.particles = [];
      this.floatingTexts = [];
      this.confetti = [];

      // Park Features
      this.cage = {
        x: this.width / 2,
        y: this.height / 2,
        radius: 110,
        posts: []
      };

      this.trees = [];
      this.benches = [];
      this.playground = { x: 0, y: 0 };
      this.pond = { x: 0, y: 0, radius: 90 };

      // Timing Loop
      this.lastTime = performance.now();

      // How-to-play Center Notice (Displays for 10 seconds at start)
      this.tipDuration = 2.0;
      this.tipTimer = this.tipDuration;

      // UI Elements Cache
      this.ui = {
        timerVal: document.getElementById('timer-val'),
        phaseTag: document.getElementById('phase-tag'),
        injuredStatus: document.getElementById('injured-status'),
        hearts: document.querySelectorAll('.heart-slot'),
        startModal: document.getElementById('start-modal'),
        pauseModal: document.getElementById('pause-modal'),
        gameOverModal: document.getElementById('game-over-modal'),
        victoryModal: document.getElementById('victory-modal'),
        startBtn: document.getElementById('start-btn'),
        resumeBtn: document.getElementById('resume-btn'),
        retryBtn: document.getElementById('retry-btn'),
        playAgainBtn: document.getElementById('play-again-btn'),
        pauseBtn: document.getElementById('pause-btn'),
        soundBtn: document.getElementById('sound-btn'),
        fullscreenBtn: document.getElementById('fullscreen-btn'),
        speedOpts: document.querySelectorAll('.speed-opt'),
        // Center Tip Notice
        centerTipBanner: document.getElementById('center-tip-banner'),
        tipProgressBar: document.getElementById('tip-progress-bar'),
        tipCountdownText: document.getElementById('tip-countdown-text'),
        // Victory stats
        vicTime: document.getElementById('vic-time'),
        vicDogs: document.getElementById('vic-dogs'),
        vicInjured: document.getElementById('vic-injured'),
        vicStars: document.getElementById('vic-stars'),
        // Game Over stats
        goTime: document.getElementById('go-time'),
        goDogs: document.getElementById('go-dogs'),
        goSnapped: document.getElementById('go-snapped')
      };

      this.setupEvents();
      this.resize();
      this.initWorld();
      this.updateHUD();

      // Start rendering loop
      requestAnimationFrame(this.loop.bind(this));
    }

    resize() {
      const oldWidth = this.width || window.innerWidth;
      const oldHeight = this.height || window.innerHeight;
      const oldCageX = (this.cage && this.cage.x !== undefined) ? this.cage.x : oldWidth / 2;
      const oldCageY = (this.cage && this.cage.y !== undefined) ? this.cage.y : oldHeight / 2;

      // 1. Auto-detect screen & viewport metrics (Full Screen, VisualViewport, Desktop window)
      const isFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;

      let w = window.innerWidth;
      let h = window.innerHeight;

      if (isFs && fsEl) {
        w = fsEl.clientWidth || window.innerWidth;
        h = fsEl.clientHeight || window.innerHeight;
      } else if (window.visualViewport) {
        w = Math.round(window.visualViewport.width);
        h = Math.round(window.visualViewport.height);
      }

      this.width = (w && w > 0) ? w : (window.innerWidth || 800);
      this.height = (h && h > 0) ? h : (window.innerHeight || 600);
      this.isPortrait = this.height > this.width;
      this.isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

      // 2. Compute dynamic baseScale for optimal visibility and proportion on any screen
      if (this.isPortrait) {
        // Mobile phone / tall tablet portrait
        this.baseScale = Math.max(0.72, Math.min(1.15, this.width / 410));
      } else {
        // Desktop / landscape tablet
        this.baseScale = Math.max(0.85, Math.min(1.35, Math.min(this.width / 960, this.height / 600)));
      }

      // 3. Normalized speed scale: ensures reaction time from cage to children is balanced on all screen sizes
      const minDim = Math.min(this.width, this.height);
      this.speedScale = Math.max(0.60, Math.min(1.25, minDim / 520));

      // 4. Effective touch grab distance
      this.effectiveGrabDist = (this.isTouch ? 68 : 50) * this.baseScale;

      // 5. Cap DPR to 2 on mobile/retina to prevent memory crashes on iOS Safari
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;

      // Reset transform then apply scale
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(this.dpr, this.dpr);

      // 6. Dynamic Park Layout (Adapts to Portrait vs. Landscape for best play effect)
      if (this.isPortrait) {
        // Mobile Portrait: Vertical flow
        this.cage.x = this.width / 2;
        this.cage.y = this.height * 0.46;
        this.cage.radius = Math.min(this.width * 0.23, this.height * 0.14, 96);

        // Duck Pond placed in bottom meadow
        this.pond.x = this.width * 0.26;
        this.pond.y = this.height * 0.84;
        this.pond.radius = Math.min(this.width * 0.18, 70);

        // Playground placed in top meadow
        this.playground.x = this.width * 0.74;
        this.playground.y = this.height * 0.16;
      } else {
        // Landscape / Desktop: Panoramic flow
        this.cage.x = this.width / 2;
        this.cage.y = this.height / 2;
        this.cage.radius = Math.min(this.width * 0.15, this.height * 0.22, 120);

        // Pond on left
        this.pond.x = this.width * 0.16;
        this.pond.y = this.height * 0.78;
        this.pond.radius = Math.min(this.width * 0.12, 85);

        // Playground on right
        this.playground.x = this.width * 0.84;
        this.playground.y = this.height * 0.22;
      }

      this.rebuildPosts();

      const scaleX = (oldWidth > 0) ? (this.width / oldWidth) : 1;
      const scaleY = (oldHeight > 0) ? (this.height / oldHeight) : 1;
      const cageDeltaX = this.cage.x - oldCageX;
      const cageDeltaY = this.cage.y - oldCageY;

      // 7. Synchronize DOGS with Cage & Posts
      if (this.dogs && this.dogs.length > 0) {
        for (let i = 0; i < this.dogs.length; i++) {
          const dog = this.dogs[i];
          const postIdx = (dog.postIndex !== undefined && dog.postIndex >= 0 && dog.postIndex < this.cage.posts.length)
            ? dog.postIndex
            : (i % this.cage.posts.length);
          dog.postIndex = postIdx;
          const post = this.cage.posts[postIdx];

          // Ensure anchor post coordinates always point to the new post position in the cage!
          dog.postX = post.x;
          dog.postY = post.y;
          dog.facingAngle = post.angle;

          if (dog.state === 'TETHERED') {
            post.occupiedDog = dog;
            // Position the dog cleanly inside the cage tied to its post
            const tugDist = 8 + Math.sin(dog.strainPhase || 0) * 6;
            dog.x = dog.postX + Math.cos(dog.facingAngle) * tugDist;
            dog.y = dog.postY + Math.sin(dog.facingAngle) * tugDist;
            dog.vx = 0;
            dog.vy = 0;
          } else if (dog.state === 'CHARGING') {
            post.occupiedDog = null;
            // Scale roaming position relative to the cage
            if (scaleX !== 1 || scaleY !== 1 || cageDeltaX !== 0 || cageDeltaY !== 0) {
              const relX = dog.x - oldCageX;
              const relY = dog.y - oldCageY;
              dog.x = this.cage.x + relX * scaleX;
              dog.y = this.cage.y + relY * scaleY;
            }
            // Keep charging dog outside the cage
            const distToCage = Math.hypot(dog.x - this.cage.x, dog.y - this.cage.y);
            if (distToCage < this.cage.radius + 15) {
              const pushAngle = Math.atan2(dog.y - this.cage.y, dog.x - this.cage.x) || (dog.facingAngle || 0);
              dog.x = this.cage.x + Math.cos(pushAngle) * (this.cage.radius + 20);
              dog.y = this.cage.y + Math.sin(pushAngle) * (this.cage.radius + 20);
            }
            dog.x = Math.max(20, Math.min(this.width - 20, dog.x));
            dog.y = Math.max(20, Math.min(this.height - 20, dog.y));
          } else if (dog.state === 'GRABBED') {
            post.occupiedDog = null;
            dog.x = this.hand.x;
            dog.y = this.hand.y + 12 * this.baseScale;
          }
        }
      }

      // 8. Synchronize CHILDREN across full screen
      if (this.children && this.children.length > 0) {
        for (const child of this.children) {
          if (scaleX !== 1 || scaleY !== 1) {
            child.x *= scaleX;
            child.y *= scaleY;
            child.targetX *= scaleX;
            child.targetY *= scaleY;
          }
          // Prevent children from spawning/landing inside the cage
          const distToCage = Math.hypot(child.x - this.cage.x, child.y - this.cage.y);
          if (distToCage < this.cage.radius + 50 * this.baseScale) {
            const pushAngle = Math.atan2(child.y - this.cage.y, child.x - this.cage.x) || (child.id * 0.5);
            child.x = this.cage.x + Math.cos(pushAngle) * (this.cage.radius + 60 * this.baseScale);
            child.y = this.cage.y + Math.sin(pushAngle) * (this.cage.radius + 60 * this.baseScale);
          }
          child.x = Math.max(30, Math.min(this.width - 30, child.x));
          child.y = Math.max(30, Math.min(this.height - 30, child.y));
        }
      }

      // 9. Synchronize Trees along the borders of the park
      if (this.trees && this.trees.length > 0) {
        for (const tree of this.trees) {
          if (tree.side === 0) {
            tree.x = (tree.ratio !== undefined ? tree.ratio : (tree.x / oldWidth)) * this.width;
            tree.y = tree.margin !== undefined ? tree.margin : Math.min(tree.y, 80);
          } else if (tree.side === 1) {
            tree.x = (tree.ratio !== undefined ? tree.ratio : (tree.x / oldWidth)) * this.width;
            tree.y = this.height - (tree.margin !== undefined ? tree.margin : (oldHeight - tree.y));
          } else if (tree.side === 2) {
            tree.x = tree.margin !== undefined ? tree.margin : Math.min(tree.x, 80);
            tree.y = (tree.ratio !== undefined ? tree.ratio : (tree.y / oldHeight)) * this.height;
          } else if (tree.side === 3) {
            tree.x = this.width - (tree.margin !== undefined ? tree.margin : (oldWidth - tree.x));
            tree.y = (tree.ratio !== undefined ? tree.ratio : (tree.y / oldHeight)) * this.height;
          } else {
            tree.x *= scaleX;
            tree.y *= scaleY;
          }
        }
      }

      // 10. Synchronize Giant Hand and Cursor
      if (scaleX !== 1 || scaleY !== 1) {
        this.hand.x = Math.max(20, Math.min(this.width - 20, this.hand.x * scaleX));
        this.hand.y = Math.max(20, Math.min(this.height - 20, this.hand.y * scaleY));
        this.hand.targetX = this.hand.x;
        this.hand.targetY = this.hand.y;
        this.mouse.x = this.hand.x;
        this.mouse.y = this.hand.y;
      }

      // 11. Immediate redraw so paused/start states reflect layout instantly
      if (this.ctx) {
        this.render();
      }
    }

    rebuildPosts() {
      // Create 6-8 tether posts arranged radially inside the cage
      const numPosts = 6;
      this.cage.posts = [];
      for (let i = 0; i < numPosts; i++) {
        const angle = (i / numPosts) * Math.PI * 2;
        const dist = this.cage.radius * 0.65;
        this.cage.posts.push({
          x: this.cage.x + Math.cos(angle) * dist,
          y: this.cage.y + Math.sin(angle) * dist,
          angle: angle,
          occupiedDog: null
        });
      }
    }

    getRandomDogSpeed() {
      // Condition: Dog speed is randomized — some are fast, some are slow!
      const roll = Math.random();
      if (roll < 0.35) {
        // Slow dogs (55 - 80 px/s): Waddlers, heavy pullers, slow trotters
        return {
          speed: Math.round(55 + Math.random() * 25),
          speedType: 'slow'
        };
      } else if (roll < 0.70) {
        // Medium dogs (95 - 130 px/s): Normal run pace
        return {
          speed: Math.round(95 + Math.random() * 35),
          speedType: 'medium'
        };
      } else {
        // Fast dogs (155 - 210 px/s): Lightning speedsters and sprinters!
        return {
          speed: Math.round(155 + Math.random() * 55),
          speedType: 'fast'
        };
      }
    }

    initWorld() {
      this.rebuildPosts();

      // Generate Children (14 children roaming around the park)
      this.children = [];
      const numKids = 14;
      for (let i = 0; i < numKids; i++) {
        let x, y, distToCage;
        do {
          x = 60 + Math.random() * (this.width - 120);
          y = 60 + Math.random() * (this.height - 120);
          distToCage = Math.hypot(x - this.cage.x, y - this.cage.y);
        } while (distToCage < this.cage.radius + 60);

        this.children.push({
          id: i,
          x: x,
          y: y,
          targetX: x,
          targetY: y,
          vx: 0,
          vy: 0,
          speed: 35 + Math.random() * 20,
          wanderTimer: Math.random() * 3,
          shirtColor: SHIRT_COLORS[i % SHIRT_COLORS.length],
          hairColor: HAIR_COLORS[i % HAIR_COLORS.length],
          isInjured: false,
          isPanicking: false,
          cryTimer: 0,
          facingAngle: Math.random() * Math.PI * 2
        });
      }

      // Generate Dogs in Cage (6 dogs initially)
      this.dogs = [];
      const numDogs = 6;
      for (let i = 0; i < numDogs; i++) {
        const breed = DOG_BREEDS[i % DOG_BREEDS.length];
        const post = this.cage.posts[i];
        const maxRope = breed.minRope + Math.random() * (breed.maxRope - breed.minRope);
        const speedData = this.getRandomDogSpeed();

        const dog = {
          id: i,
          breed: breed,
          speed: speedData.speed,
          speedType: speedData.speedType,
          postIndex: i,
          x: post.x + (Math.random() - 0.5) * 10,
          y: post.y + (Math.random() - 0.5) * 10,
          postX: post.x,
          postY: post.y,
          vx: 0,
          vy: 0,
          state: 'TETHERED', // TETHERED, CHARGING, GRABBED
          maxRopeTime: maxRope,
          ropeTimer: maxRope,
          barkCooldown: 1.0 + Math.random() * 2.0,
          strainPhase: Math.random() * Math.PI * 2,
          targetChild: null,
          kickAnim: 0,
          facingAngle: post.angle
        };
        post.occupiedDog = dog;
        this.dogs.push(dog);
      }

      // Generate Trees around park border
      this.trees = [];
      const treeCount = 18;
      for (let i = 0; i < treeCount; i++) {
        const side = Math.floor(Math.random() * 4);
        const ratio = 0.05 + Math.random() * 0.90;
        const margin = 40 + Math.random() * 40;
        let tx, ty;
        if (side === 0) {
          tx = ratio * this.width;
          ty = margin;
        } else if (side === 1) {
          tx = ratio * this.width;
          ty = this.height - margin;
        } else if (side === 2) {
          tx = margin;
          ty = ratio * this.height;
        } else {
          tx = this.width - margin;
          ty = ratio * this.height;
        }

        this.trees.push({
          x: tx,
          y: ty,
          side: side,
          ratio: ratio,
          margin: margin,
          radius: 26 + Math.random() * 16,
          isBlossom: Math.random() > 0.6,
          swayOffset: Math.random() * Math.PI * 2
        });
      }
    }

    setupEvents() {
      const onResize = () => {
        this.resize();
        this.render();
      };

      // Screen resizing & orientation change listeners for desktop fullscreen, iPhone & mobile
      window.addEventListener('resize', onResize);
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', onResize);
      }
      window.addEventListener('orientationchange', () => {
        onResize();
        setTimeout(onResize, 120);
        setTimeout(onResize, 350);
      });

      const onFsChange = () => {
        this.updateFullscreenBtn();
        onResize();
        requestAnimationFrame(onResize);
        setTimeout(onResize, 100);
        setTimeout(onResize, 350);
      };

      document.addEventListener('fullscreenchange', onFsChange);
      document.addEventListener('webkitfullscreenchange', onFsChange);
      document.addEventListener('mozfullscreenchange', onFsChange);
      document.addEventListener('MSFullscreenChange', onFsChange);

      if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => {
          onResize();
        });
        const wrapper = document.getElementById('game-wrapper');
        if (wrapper) ro.observe(wrapper);
      }

      // Unified Pointer & Touch coordinate resolver
      const getPos = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        let clientX = e.clientX;
        let clientY = e.clientY;

        if (clientX === undefined && e.touches && e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else if (clientX === undefined && e.changedTouches && e.changedTouches.length > 0) {
          clientX = e.changedTouches[0].clientX;
          clientY = e.changedTouches[0].clientY;
        }

        const isTouch = e.pointerType === 'touch' || Boolean(e.touches || e.changedTouches);

        const rawX = (clientX !== undefined ? clientX : this.mouse.x) - rect.left;
        const rawY = (clientY !== undefined ? clientY : this.mouse.y) - rect.top;
        const scaleX = rect.width > 0 ? (this.width / rect.width) : 1;
        const scaleY = rect.height > 0 ? (this.height / rect.height) : 1;

        return {
          x: rawX * scaleX,
          y: rawY * scaleY,
          isTouch
        };
      };

      const handlePointerMove = (e) => {
        const pos = getPos(e);
        this.mouse.x = pos.x;
        this.mouse.y = pos.y;
        this.mouse.isTouch = pos.isTouch;
      };

      const handlePointerDown = (e) => {
        // Prevent default touch gestures (pinch-zoom, bounce, pull-to-refresh)
        if (e.cancelable && (e.pointerType === 'touch' || e.touches)) {
          e.preventDefault();
        }

        this.sound.init();
        const pos = getPos(e);
        this.mouse.x = pos.x;
        this.mouse.y = pos.y;
        this.mouse.isDown = true;
        this.mouse.isTouch = pos.isTouch;

        if (this.state !== 'PLAYING') return;

        // Responsive grab radius adapted to touchscreens (iPhone) & screen scale
        const grabRadius = this.effectiveGrabDist || (pos.isTouch ? 68 : 52);
        let bestTarget = null;
        let bestDist = grabRadius;

        for (const dog of this.dogs) {
          if (dog.state === 'CHARGING') {
            const d = Math.hypot(dog.x - this.mouse.x, dog.y - this.mouse.y);
            if (d < bestDist) {
              bestTarget = dog;
              bestDist = d;
            }
          }
        }

        if (bestTarget) {
          this.grabDog(bestTarget);
        } else {
          // If the player clicked directly on a tethered dog inside the cage, inform them:
          for (const dog of this.dogs) {
            if (dog.state === 'TETHERED') {
              const d = Math.hypot(dog.x - this.mouse.x, dog.y - this.mouse.y);
              if (d < 46 * (this.baseScale || 1)) {
                this.addFloatingText('Cannot move! Still tied in cage! 🔒', dog.x, dog.y - 20 * (this.baseScale || 1), '#ffb300');
                break;
              }
            }
          }
        }
      };

      const handlePointerUp = (e) => {
        this.mouse.isDown = false;
        if (this.mouse.grabTarget) {
          this.releaseDog(this.mouse.grabTarget);
        }
      };

      // Pointer Events: modern standard supported across iOS Safari 13+ and Desktop
      if (window.PointerEvent) {
        this.canvas.addEventListener('pointerdown', (e) => {
          handlePointerDown(e);
          try {
            this.canvas.setPointerCapture(e.pointerId);
          } catch (err) {}
        }, { passive: false });

        this.canvas.addEventListener('pointermove', handlePointerMove, { passive: true });

        this.canvas.addEventListener('pointerup', (e) => {
          handlePointerUp(e);
          try {
            this.canvas.releasePointerCapture(e.pointerId);
          } catch (err) {}
        });

        this.canvas.addEventListener('pointercancel', (e) => {
          handlePointerUp(e);
          try {
            this.canvas.releasePointerCapture(e.pointerId);
          } catch (err) {}
        });
      } else {
        // Fallback for older browsers
        this.canvas.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('mousemove', handlePointerMove);
        window.addEventListener('mouseup', handlePointerUp);

        this.canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
        this.canvas.addEventListener('touchmove', handlePointerMove, { passive: false });
        this.canvas.addEventListener('touchend', handlePointerUp);
        this.canvas.addEventListener('touchcancel', handlePointerUp);
      }

      // Safe UI Button Handlers (Responsive on iOS touch & click)
      const bindBtn = (btn, action) => {
        if (!btn) return;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          action();
        });
        btn.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
        });
      };

      bindBtn(this.ui.startBtn, () => this.startGame());
      bindBtn(this.ui.resumeBtn, () => this.resumeGame());
      bindBtn(this.ui.pauseBtn, () => this.togglePause());
      bindBtn(this.ui.retryBtn, () => this.restartGame());
      bindBtn(this.ui.playAgainBtn, () => this.restartGame());

      bindBtn(this.ui.soundBtn, () => {
        this.sound.init();
        this.sound.muted = !this.sound.muted;
        this.ui.soundBtn.innerHTML = this.sound.muted ? '🔇 Sound: Off' : '🔊 Sound: On';
      });

      bindBtn(this.ui.fullscreenBtn, () => this.toggleFullscreen());

      // Speed selection
      this.ui.speedOpts.forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.ui.speedOpts.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.gameSpeed = parseFloat(btn.dataset.speed) || 1;
        });
      });

      // Keyboard Controls
      window.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
          this.togglePause();
        } else if (e.key === 'f' || e.key === 'F') {
          this.toggleFullscreen();
        }
      });
    }

    toggleFullscreen() {
      const doc = document;
      const isFs = Boolean(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
      if (!isFs) {
        const root = document.documentElement;
        if (root.requestFullscreen) {
          root.requestFullscreen().catch(() => {});
        } else if (root.webkitRequestFullscreen) {
          root.webkitRequestFullscreen().catch(() => {});
        } else if (root.mozRequestFullScreen) {
          root.mozRequestFullScreen().catch(() => {});
        } else if (root.msRequestFullscreen) {
          root.msRequestFullscreen().catch(() => {});
        }
      } else {
        if (doc.exitFullscreen) {
          doc.exitFullscreen().catch(() => {});
        } else if (doc.webkitExitFullscreen) {
          doc.webkitExitFullscreen().catch(() => {});
        } else if (doc.mozCancelFullScreen) {
          doc.mozCancelFullScreen().catch(() => {});
        } else if (doc.msExitFullscreen) {
          doc.msExitFullscreen().catch(() => {});
        }
      }
    }

    updateFullscreenBtn() {
      if (!this.ui.fullscreenBtn) return;
      const isFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
      const label = this.ui.fullscreenBtn.querySelector('.fs-text');
      const icon = this.ui.fullscreenBtn.querySelector('.fs-icon');
      if (label && icon) {
        icon.textContent = isFs ? '🗗' : '⛶';
        label.textContent = isFs ? 'Exit Full' : 'Fullscreen';
      } else {
        this.ui.fullscreenBtn.innerHTML = isFs ? '🗗 Exit Full' : '⛶ Fullscreen';
      }
    }

    startGame() {
      this.sound.init();
      this.sound.startBgm();
      this.ui.startModal.classList.add('hidden');
      this.state = 'PLAYING';
      this.lastTime = performance.now();

      // Show How-to-play center notice for 10 seconds
      this.tipTimer = this.tipDuration;
      if (this.ui.centerTipBanner) {
        this.ui.centerTipBanner.classList.remove('hidden');
      }
      if (this.ui.tipProgressBar) {
        this.ui.tipProgressBar.style.width = '100%';
      }
      if (this.ui.tipCountdownText) {
        this.ui.tipCountdownText.textContent = `Notice closes in ${Math.ceil(this.tipDuration)}s`;
      }
    }

    resumeGame() {
      this.ui.pauseModal.classList.add('hidden');
      this.state = 'PLAYING';
      this.lastTime = performance.now();
    }

    togglePause() {
      if (this.state === 'PLAYING') {
        this.state = 'PAUSED';
        this.ui.pauseModal.classList.remove('hidden');
      } else if (this.state === 'PAUSED') {
        this.resumeGame();
      }
    }

    restartGame() {
      this.ui.gameOverModal.classList.add('hidden');
      this.ui.victoryModal.classList.add('hidden');
      this.timeRemaining = this.TOTAL_TIME;
      this.timeElapsed = 0;
      this.injuredCount = 0;
      this.dogsCaught = 0;
      this.ropesSnapped = 0;
      this.particles = [];
      this.floatingTexts = [];
      this.confetti = [];
      this.mouse.grabTarget = null;
      this.hand.isGrabbing = false;

      this.initWorld();
      this.updateHUD();
      this.startGame();
    }

    grabDog(dog) {
      // STRICT REQUIREMENT: Hand can only seize dogs that have broken through the cage!
      if (dog.state !== 'CHARGING') {
        this.addFloatingText('Cannot move! Still tied in cage! 🔒', dog.x, dog.y - 20, '#ffb300');
        return;
      }

      this.mouse.grabTarget = dog;
      dog.state = 'GRABBED';
      this.hand.isGrabbing = true;
      this.sound.playGrab();

      // Floating feedback
      this.addFloatingText('Seized! ✋', dog.x, dog.y - 20, '#4caf50');
      this.createBurst(dog.x, dog.y, 8, '#ffffff');
    }

    releaseDog(dog) {
      this.mouse.grabTarget = null;
      this.hand.isGrabbing = false;

      // Check if dropped inside the cage perimeter
      const distToCage = Math.hypot(dog.x - this.cage.x, dog.y - this.cage.y);
      if (distToCage < this.cage.radius + 15) {
        // Successfully retethered!
        this.retetherDog(dog);
      } else {
        // Dropped back in the park -> resumes charging
        dog.state = 'CHARGING';
        this.addFloatingText('Dropped!', dog.x, dog.y - 20, '#f44336');
        this.sound.playBark(dog.breed.pitch);
      }
    }

    retetherDog(dog) {
      dog.state = 'TETHERED';
      this.dogsCaught++;

      // Find the closest post in the cage
      let chosenPost = null;
      let minD = Infinity;
      for (let i = 0; i < this.cage.posts.length; i++) {
        const post = this.cage.posts[i];
        const d = Math.hypot(post.x - dog.x, post.y - dog.y);
        const penalty = (post.occupiedDog && post.occupiedDog !== dog) ? 500 : 0;
        if (d + penalty < minD) {
          minD = d + penalty;
          chosenPost = post;
          dog.postIndex = i;
        }
      }
      if (!chosenPost) {
        dog.postIndex = (dog.postIndex !== undefined && dog.postIndex >= 0 && dog.postIndex < this.cage.posts.length)
          ? dog.postIndex
          : 0;
        chosenPost = this.cage.posts[dog.postIndex];
      }

      chosenPost.occupiedDog = dog;
      dog.x = chosenPost.x;
      dog.y = chosenPost.y;
      dog.postX = chosenPost.x;
      dog.postY = chosenPost.y;
      dog.facingAngle = chosenPost.angle;

      // New randomized endurance timer (20s - 60s)
      const newTimer = dog.breed.minRope + Math.random() * (dog.breed.maxRope - dog.breed.minRope);
      dog.maxRopeTime = newTimer;
      dog.ropeTimer = newTimer;
      dog.targetChild = null;

      // Re-randomize speed for the next breakout!
      const speedData = this.getRandomDogSpeed();
      dog.speed = speedData.speed;
      dog.speedType = speedData.speedType;

      this.sound.playTie();
      this.addFloatingText('Tied & Secured! 🪢', dog.x, dog.y - 25 * (this.baseScale || 1), '#ffb300');
      this.createBurst(dog.x, dog.y, 14, '#ffd54f');
    }

    addFloatingText(text, x, y, color = '#ffffff') {
      this.floatingTexts.push({
        text, x, y, color,
        life: 1.0,
        vy: -28
      });
    }

    createBurst(x, y, count = 10, color = '#ffffff') {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 25 + Math.random() * 75;
        this.particles.push({
          x, y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          life: 0.6 + Math.random() * 0.4,
          maxLife: 1.0,
          size: 3 + Math.random() * 4,
          color
        });
      }
    }

    triggerGameOver() {
      this.state = 'GAMEOVER';
      this.sound.stopBgm();
      this.sound.playDefeat();

      const mins = Math.floor((this.TOTAL_TIME - this.timeRemaining) / 60);
      const secs = Math.floor((this.TOTAL_TIME - this.timeRemaining) % 60);
      this.ui.goTime.textContent = `${mins}m ${secs.toString().padStart(2, '0')}s`;
      this.ui.goDogs.textContent = this.dogsCaught;
      this.ui.goSnapped.textContent = this.ropesSnapped;

      this.ui.gameOverModal.classList.remove('hidden');
    }

    triggerVictory() {
      this.state = 'VICTORY';
      this.sound.stopBgm();
      this.sound.playVictory();

      // Generate celebration confetti
      for (let i = 0; i < 150; i++) {
        this.confetti.push({
          x: Math.random() * this.width,
          y: -20 - Math.random() * 200,
          vx: (Math.random() - 0.5) * 60,
          vy: 80 + Math.random() * 120,
          color: ['#f1c40f', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6'][Math.floor(Math.random() * 5)],
          size: 6 + Math.random() * 6,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 6
        });
      }

      this.ui.vicTime.textContent = '10:00';
      this.ui.vicDogs.textContent = this.dogsCaught;
      this.ui.vicInjured.textContent = `${this.injuredCount} / 5`;

      // Rating: 0 injuries = 3 stars, 1-2 = 2 stars, 3-4 = 1 star
      let stars = '⭐⭐⭐';
      if (this.injuredCount > 2) stars = '⭐☆☆';
      else if (this.injuredCount > 0) stars = '⭐⭐☆';
      this.ui.vicStars.textContent = stars;

      this.ui.victoryModal.classList.remove('hidden');
    }

    // --- Main Game Loop ---
    loop(timestamp) {
      const rawDt = (timestamp - this.lastTime) / 1000;
      this.lastTime = timestamp;
      const dt = Math.min(rawDt, 0.1) * (this.state === 'PLAYING' ? this.gameSpeed : 0);

      if (this.state === 'PLAYING') {
        this.update(dt);
      }

      this.render();
      requestAnimationFrame(this.loop.bind(this));
    }

    // --- Simulation Updates ---
    update(dt) {
      // 1. Clock Countdown
      this.timeRemaining -= dt;
      this.timeElapsed += dt;

      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        this.updateHUD();
        this.triggerVictory();
        return;
      }

      // 1b. Center How-To-Play Notice (10 Seconds Display)
      if (this.tipTimer > 0) {
        this.tipTimer -= dt;
        if (this.ui.tipProgressBar) {
          const pct = Math.max(0, (this.tipTimer / this.tipDuration) * 100);
          this.ui.tipProgressBar.style.width = `${pct}%`;
        }
        if (this.ui.tipCountdownText) {
          this.ui.tipCountdownText.textContent = `Notice closes in ${Math.max(1, Math.ceil(this.tipTimer))}s`;
        }
        if (this.tipTimer <= 0) {
          this.tipTimer = 0;
          if (this.ui.centerTipBanner) {
            this.ui.centerTipBanner.classList.add('hidden');
          }
        }
      }

      // 2. Hand Position Lerp
      this.hand.targetX = this.mouse.x;
      // On mobile touchscreens while grabbing, offset target slightly upward (-32px) so the player's finger doesn't block their view of the carried dog
      const touchOffsetY = (this.mouse.isTouch && this.hand.isGrabbing) ? -32 : 0;
      this.hand.targetY = this.mouse.y + touchOffsetY;
      this.hand.x += (this.hand.targetX - this.hand.x) * Math.min(1, dt * 25);
      this.hand.y += (this.hand.targetY - this.hand.y) * Math.min(1, dt * 25);

      // 3. Update Dogs
      for (const dog of this.dogs) {
        dog.strainPhase += dt * 8;

        if (dog.state === 'TETHERED') {
          // Timer counts down
          dog.ropeTimer -= dt;

          // Barking logic
          dog.barkCooldown -= dt;
          const isUrgent = dog.ropeTimer < dog.maxRopeTime * 0.25;

          if (dog.barkCooldown <= 0) {
            dog.barkCooldown = isUrgent ? (0.3 + Math.random() * 0.4) : (1.4 + Math.random() * 1.8);
            this.sound.playBark(dog.breed.pitch);
            this.addFloatingText(isUrgent ? 'WOOF! 💢' : 'Woof!', dog.x, dog.y - 18, isUrgent ? '#e53935' : '#ffffff');
          }

          // Rope snapped!
          if (dog.ropeTimer <= 0) {
            dog.ropeTimer = 0;
            dog.state = 'CHARGING';
            this.ropesSnapped++;
            this.sound.playSnap();
            this.sound.playBark(dog.breed.pitch * 1.15);
            this.createBurst(dog.x, dog.y, 16, '#ff5722');

            // Random speed announcement
            if (dog.speedType === 'fast') {
              this.addFloatingText(`⚡ FAST! (${dog.speed} spd)`, dog.x, dog.y - 25, '#ff1744');
            } else if (dog.speedType === 'slow') {
              this.addFloatingText(`🐢 SLOW (${dog.speed} spd)`, dog.x, dog.y - 25, '#039be5');
            } else {
              this.addFloatingText(`💨 Escaped! (${dog.speed} spd)`, dog.x, dog.y - 25, '#ff9800');
            }
          }

          // Tug rope motion
          const tugDist = 8 + Math.sin(dog.strainPhase) * 6;
          dog.x = dog.postX + Math.cos(dog.facingAngle) * tugDist;
          dog.y = dog.postY + Math.sin(dog.facingAngle) * tugDist;

        } else if (dog.state === 'CHARGING') {
          // Charge toward closest uninjured child
          if (!dog.targetChild || dog.targetChild.isInjured) {
            let closest = null;
            let minDist = Infinity;
            for (const child of this.children) {
              if (!child.isInjured) {
                const dist = Math.hypot(child.x - dog.x, child.y - dog.y);
                if (dist < minDist) {
                  minDist = dist;
                  closest = child;
                }
              }
            }
            dog.targetChild = closest;
          }

          if (dog.targetChild) {
            const angle = Math.atan2(dog.targetChild.y - dog.y, dog.targetChild.x - dog.x);
            dog.facingAngle = angle;
            // Move with randomized speed scaled by speedScale for balanced play on all screens!
            const effectiveSpeed = dog.speed * this.speedScale;
            dog.x += Math.cos(angle) * effectiveSpeed * dt;
            dog.y += Math.sin(angle) * effectiveSpeed * dt;

            // Dust trail behind fast dogs
            if (dog.speedType === 'fast' && Math.random() < 0.35) {
              this.particles.push({
                x: dog.x - Math.cos(dog.facingAngle) * dog.breed.size * 0.7 * this.baseScale,
                y: dog.y - Math.sin(dog.facingAngle) * dog.breed.size * 0.7 * this.baseScale,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                life: 0.3,
                maxLife: 0.3,
                size: (2.5 + Math.random() * 2) * this.baseScale,
                color: 'rgba(255, 255, 255, 0.65)'
              });
            }

            // Barking while charging
            dog.barkCooldown -= dt;
            if (dog.barkCooldown <= 0) {
              dog.barkCooldown = 0.5 + Math.random() * 0.4;
              this.sound.playBark(dog.breed.pitch * 1.2);
              this.addFloatingText('GRRR WOOF!', dog.x, dog.y - 18 * this.baseScale, '#ff1744');
            }

            // Check bite collision with child (scaled by baseScale)
            const biteDist = Math.hypot(dog.targetChild.x - dog.x, dog.targetChild.y - dog.y);
            if (biteDist < 24 * this.baseScale) {
              // BITE EVENT!
              this.childBitten(dog.targetChild, dog);
              dog.targetChild = null; // Look for next child
            }
          } else {
            // No uninjured children left? Wander randomly
            dog.x += Math.cos(dog.facingAngle) * (dog.speed * 0.3 * this.speedScale) * dt;
            dog.y += Math.sin(dog.facingAngle) * (dog.speed * 0.3 * this.speedScale) * dt;
          }

        } else if (dog.state === 'GRABBED') {
          // Follow giant hand directly
          dog.x = this.hand.x;
          dog.y = this.hand.y + 12 * this.baseScale;
          dog.kickAnim += dt * 18;
        }
      }

      // 4. Update Children
      for (const child of this.children) {
        if (child.isInjured) continue;

        // Check if any charging dog is threatening this child
        let threatened = false;
        let threatDog = null;
        for (const dog of this.dogs) {
          if (dog.state === 'CHARGING') {
            const dist = Math.hypot(child.x - dog.x, child.y - dog.y);
            if (dist < 165 * this.baseScale) {
              threatened = true;
              threatDog = dog;
              break;
            }
          }
        }

        if (threatened && threatDog) {
          // Panic! Run away from the dog
          if (!child.isPanicking) {
            child.isPanicking = true;
            this.sound.playGasp();
            this.addFloatingText('EEEEK! 😱', child.x, child.y - 20 * this.baseScale, '#ff9800');
          }

          const runAngle = Math.atan2(child.y - threatDog.y, child.x - threatDog.x);
          child.facingAngle = runAngle;
          child.x += Math.cos(runAngle) * 75 * this.speedScale * dt;
          child.y += Math.sin(runAngle) * 75 * this.speedScale * dt;

        } else {
          // Normal idle wandering
          child.isPanicking = false;
          child.wanderTimer -= dt;
          if (child.wanderTimer <= 0) {
            child.wanderTimer = 2.0 + Math.random() * 4.0;
            const distToCage = Math.hypot(child.x - this.cage.x, child.y - this.cage.y);
            // Move away if too close to cage
            if (distToCage < this.cage.radius + 60 * this.baseScale) {
              const pushAngle = Math.atan2(child.y - this.cage.y, child.x - this.cage.x);
              child.facingAngle = pushAngle;
            } else {
              child.facingAngle = Math.random() * Math.PI * 2;
            }
          }

          child.x += Math.cos(child.facingAngle) * child.speed * 0.4 * this.speedScale * dt;
          child.y += Math.sin(child.facingAngle) * child.speed * 0.4 * this.speedScale * dt;
        }

        // Keep children in bounds
        child.x = Math.max(50, Math.min(this.width - 50, child.x));
        child.y = Math.max(50, Math.min(this.height - 50, child.y));
      }

      // 5. Update Particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) this.particles.splice(i, 1);
      }

      // 6. Update Floating Text
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.y += ft.vy * dt;
        ft.life -= dt * 1.2;
        if (ft.life <= 0) this.floatingTexts.splice(i, 1);
      }

      // 7. Update Confetti (Victory)
      for (let i = 0; i < this.confetti.length; i++) {
        const c = this.confetti[i];
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        c.rotation += c.vRot * dt;
        if (c.y > this.height + 20) c.y = -20;
      }

      this.updateHUD();
    }

    childBitten(child, dog) {
      child.isInjured = true;
      this.injuredCount++;
      this.sound.playChomp();
      this.createBurst(child.x, child.y, 20, '#d32f2f');
      this.addFloatingText('CHOMP! 💔', child.x, child.y - 25, '#d32f2f');

      // Update HUD immediately
      this.updateHUD();

      // Check Defeat Condition (>= 5 injuries)
      if (this.injuredCount >= this.MAX_INJURIES) {
        this.triggerGameOver();
      }
    }

    updateHUD() {
      // Timer Display
      const mins = Math.floor(this.timeRemaining / 60);
      const secs = Math.floor(this.timeRemaining % 60);
      this.ui.timerVal.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

      // Phase Tag
      const elapsed = this.TOTAL_TIME - this.timeRemaining;
      if (elapsed < 120) {
        this.ui.phaseTag.textContent = 'Phase 1: Morning Calm';
      } else if (elapsed < 270) {
        this.ui.phaseTag.textContent = 'Phase 2: Playtime Rush';
      } else if (elapsed < 450) {
        this.ui.phaseTag.textContent = 'Phase 3: The Midday Chorus';
      } else if (elapsed < 540) {
        this.ui.phaseTag.textContent = 'Phase 4: Park Rush Hour';
      } else {
        this.ui.phaseTag.textContent = 'Phase 5: Final Countdown!';
      }

      // Hearts / Injury tracker
      this.ui.injuredStatus.textContent = `${this.injuredCount} / ${this.MAX_INJURIES} Injured`;
      if (this.injuredCount >= 4) {
        this.ui.injuredStatus.className = 'injured-status-text danger';
      } else if (this.injuredCount >= 2) {
        this.ui.injuredStatus.className = 'injured-status-text warning';
      } else {
        this.ui.injuredStatus.className = 'injured-status-text';
      }

      this.ui.hearts.forEach((slot, idx) => {
        if (idx < this.injuredCount) {
          slot.classList.add('injured');
          slot.textContent = '🩹';
        } else {
          slot.classList.remove('injured');
          slot.textContent = '💚';
        }
      });
    }

    // --- Rendering Functions ---
    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);

      // 1. Draw Park Ground & Paths
      this.drawParkEnvironment(ctx);

      // 2. Draw Central Cage
      this.drawCage(ctx);

      // 3. Draw Tether Ropes
      this.drawRopes(ctx);

      // 4. Draw Children
      this.drawChildren(ctx);

      // 5. Draw Dogs
      this.drawDogs(ctx);

      // 6. Draw Particles & Visual Feedback
      this.drawParticles(ctx);

      // 7. Draw Floating Texts
      this.drawFloatingTexts(ctx);

      // 8. Draw Confetti (if Victory)
      if (this.state === 'VICTORY') {
        this.drawConfetti(ctx);
      }

      // 9. Draw Giant Hand (Player)
      this.drawGiantHand(ctx);
    }

    drawParkEnvironment(ctx) {
      // Grass Base
      ctx.fillStyle = '#59a860';
      ctx.fillRect(0, 0, this.width, this.height);

      // Subtle grass texture patches
      ctx.fillStyle = '#62b369';
      for (let i = 0; i < 25; i++) {
        const px = ((i * 137.5) % this.width);
        const py = ((i * 219.3) % this.height);
        ctx.beginPath();
        ctx.ellipse(px, py, 40, 24, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cobblestone Circular Path around Cage
      ctx.beginPath();
      ctx.arc(this.cage.x, this.cage.y, this.cage.radius + 35, 0, Math.PI * 2);
      ctx.lineWidth = 26;
      ctx.strokeStyle = '#d7ccc8';
      ctx.stroke();

      // Path border lines
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#a1887f';
      ctx.beginPath();
      ctx.arc(this.cage.x, this.cage.y, this.cage.radius + 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(this.cage.x, this.cage.y, this.cage.radius + 48, 0, Math.PI * 2);
      ctx.stroke();

      // Duck Pond (Bottom-Left)
      ctx.fillStyle = '#4fc3f7';
      ctx.beginPath();
      ctx.ellipse(this.pond.x, this.pond.y, this.pond.radius, this.pond.radius * 0.7, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#b2ebf2';
      ctx.stroke();

      // Floating Duck in Pond
      ctx.fillStyle = '#fbc02d';
      ctx.beginPath();
      ctx.arc(this.pond.x - 15, this.pond.y - 10, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f57c00';
      ctx.beginPath();
      ctx.arc(this.pond.x - 8, this.pond.y - 10, 3, 0, Math.PI * 2);
      ctx.fill();

      // Playground (Top-Right Sandbox & Slide)
      ctx.fillStyle = '#ffe082';
      ctx.beginPath();
      ctx.roundRect(this.playground.x - 60, this.playground.y - 45, 120, 90, 16);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#8d6e63';
      ctx.stroke();

      // Trees with swaying shadows
      const timeSec = performance.now() / 1000;
      for (const tree of this.trees) {
        const sway = Math.sin(timeSec * 2 + tree.swayOffset) * 4;

        // Tree Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        ctx.ellipse(tree.x + 10, tree.y + 12, tree.radius * 0.9, tree.radius * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Foliage
        ctx.fillStyle = tree.isBlossom ? '#f48fb1' : '#2e7d32';
        ctx.beginPath();
        ctx.arc(tree.x + sway, tree.y - 8, tree.radius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = tree.isBlossom ? '#f8bbd0' : '#43a047';
        ctx.beginPath();
        ctx.arc(tree.x + sway - 5, tree.y - 14, tree.radius * 0.65, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawCage(ctx) {
      const cx = this.cage.x;
      const cy = this.cage.y;
      const r = this.cage.radius;

      // Cage Floor (Paved Stone)
      ctx.fillStyle = '#efebe9';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#8d6e63';
      ctx.stroke();

      // Cage Octagonal Wooden Railing
      const segments = 8;
      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#5d4037';
      ctx.stroke();

      // Cage Posts (Wooden Pillars)
      for (const post of this.cage.posts) {
        ctx.fillStyle = '#6d4c41';
        ctx.beginPath();
        ctx.arc(post.x, post.y, 7, 0, Math.PI * 2);
        ctx.fill();

        // Iron Ring
        ctx.strokeStyle = '#37474f';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(post.x, post.y, 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Central Gazebo Beam & Banner
      ctx.fillStyle = '#3e2723';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();

      // Flag on top
      ctx.fillStyle = '#e53935';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 14);
      ctx.lineTo(cx + 22, cy - 22);
      ctx.lineTo(cx, cy - 30);
      ctx.closePath();
      ctx.fill();
    }

    drawRopes(ctx) {
      for (const dog of this.dogs) {
        if (dog.state === 'TETHERED') {
          const ratio = Math.max(0, dog.ropeTimer / dog.maxRopeTime);

          // Color based on remaining endurance
          let ropeColor = '#8d6e63'; // Brown hemp
          if (ratio < 0.25) {
            // Blinking Red when about to break
            ropeColor = (Math.floor(performance.now() / 150) % 2 === 0) ? '#e53935' : '#ff9800';
          } else if (ratio < 0.5) {
            ropeColor = '#f57f17'; // Yellow warning
          }

          // Rope cord
          ctx.strokeStyle = ropeColor;
          ctx.lineWidth = ratio < 0.25 ? 2.5 : 3.5;
          ctx.beginPath();
          ctx.moveTo(dog.postX, dog.postY);
          ctx.lineTo(dog.x, dog.y);
          ctx.stroke();

          // Tension Meter Pill above post
          const scale = this.baseScale || 1;
          const barW = 34 * scale;
          const barH = 5 * scale;
          const barX = dog.x - barW / 2;
          const barY = dog.y - 28 * scale;

          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

          ctx.fillStyle = ratio < 0.25 ? '#ef5350' : (ratio < 0.5 ? '#fbc02d' : '#66bb6a');
          ctx.fillRect(barX, barY, barW * ratio, barH);
        }
      }
    }

    drawChildren(ctx) {
      for (const child of this.children) {
        ctx.save();
        ctx.translate(child.x, child.y);
        if (this.baseScale && this.baseScale !== 1) {
          ctx.scale(this.baseScale, this.baseScale);
        }

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
        ctx.beginPath();
        ctx.ellipse(0, 7, 10, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        if (child.isInjured) {
          // Bitten / Sitting Crying State
          ctx.fillStyle = child.shirtColor;
          ctx.beginPath();
          ctx.ellipse(0, 0, 10, 8, 0, 0, Math.PI * 2);
          ctx.fill();

          // Head
          ctx.fillStyle = '#ffcc80';
          ctx.beginPath();
          ctx.arc(0, -9, 8, 0, Math.PI * 2);
          ctx.fill();

          // Hair
          ctx.fillStyle = child.hairColor;
          ctx.beginPath();
          ctx.arc(0, -11, 8, Math.PI, Math.PI * 2);
          ctx.fill();

          // Crying Tears (Blue drops)
          ctx.fillStyle = '#29b6f6';
          ctx.fillRect(-4, -6, 2, 4);
          ctx.fillRect(3, -6, 2, 4);

          // Band-Aid on Head/Knee
          ctx.fillStyle = '#ffe082';
          ctx.fillRect(-6, -14, 12, 4);
          ctx.fillStyle = '#e53935';
          ctx.fillRect(-1, -13, 2, 2);

        } else {
          // Walking / Panicking Child
          const bob = Math.sin(performance.now() / 150 + child.id) * 2;

          // Body (Shirt)
          ctx.fillStyle = child.shirtColor;
          ctx.beginPath();
          ctx.arc(0, bob, 8, 0, Math.PI * 2);
          ctx.fill();

          // Head
          ctx.fillStyle = '#ffcc80';
          ctx.beginPath();
          ctx.arc(0, bob - 10, 7, 0, Math.PI * 2);
          ctx.fill();

          // Hair
          ctx.fillStyle = child.hairColor;
          ctx.beginPath();
          ctx.arc(0, bob - 12, 7, Math.PI * 0.9, Math.PI * 2.1);
          ctx.fill();

          // Eyes
          ctx.fillStyle = '#222';
          if (child.isPanicking) {
            // Big startled eyes
            ctx.beginPath();
            ctx.arc(-2, bob - 10, 2, 0, Math.PI * 2);
            ctx.arc(2, bob - 10, 2, 0, Math.PI * 2);
            ctx.fill();
            // Sweat drop
            ctx.fillStyle = '#29b6f6';
            ctx.beginPath();
            ctx.arc(7, bob - 14, 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Calm dots
            ctx.fillRect(-3, bob - 10, 1.5, 2);
            ctx.fillRect(2, bob - 10, 1.5, 2);
          }
        }

        ctx.restore();
      }
    }

    drawDogs(ctx) {
      const scale = this.baseScale || 1;
      for (const dog of this.dogs) {
        ctx.save();
        ctx.translate(dog.x, dog.y);
        if (scale !== 1) {
          ctx.scale(scale, scale);
        }

        // Dog Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        const shadowOffset = dog.state === 'GRABBED' ? 24 : 6;
        ctx.beginPath();
        ctx.ellipse(0, shadowOffset, dog.breed.size * 0.9, dog.breed.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rotate in facing direction
        ctx.rotate(dog.facingAngle);

        // Dog Body
        ctx.fillStyle = dog.breed.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, dog.breed.size, dog.breed.size * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dog Head
        ctx.beginPath();
        ctx.arc(dog.breed.size * 0.7, -2, dog.breed.size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Snout
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.arc(dog.breed.size * 1.15, -1, 3, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.fillStyle = dog.breed.earColor;
        ctx.beginPath();
        ctx.ellipse(dog.breed.size * 0.5, -dog.breed.size * 0.5, 4, 8, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Legs (Kicking if grabbed)
        ctx.strokeStyle = dog.breed.color;
        ctx.lineWidth = 3.5;
        const kick = dog.state === 'GRABBED' ? Math.sin(dog.kickAnim) * 8 : 0;
        ctx.beginPath();
        ctx.moveTo(-dog.breed.size * 0.5, 4);
        ctx.lineTo(-dog.breed.size * 0.5 + kick, 12);
        ctx.moveTo(dog.breed.size * 0.5, 4);
        ctx.lineTo(dog.breed.size * 0.5 - kick, 12);
        ctx.stroke();

        // Tail
        ctx.strokeStyle = dog.breed.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-dog.breed.size * 0.8, 0);
        ctx.quadraticCurveTo(-dog.breed.size * 1.2, -8 + Math.sin(dog.strainPhase) * 4, -dog.breed.size * 0.9, -12);
        ctx.stroke();

        ctx.restore();

        // If charging, draw red threat line to child
        if (dog.state === 'CHARGING' && dog.targetChild) {
          ctx.strokeStyle = 'rgba(244, 67, 54, 0.4)';
          ctx.lineWidth = 2 * scale;
          ctx.setLineDash([6 * scale, 6 * scale]);
          ctx.beginPath();
          ctx.moveTo(dog.x, dog.y);
          ctx.lineTo(dog.targetChild.x, dog.targetChild.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Speed tag above charging dog (Fast, Slow, Medium)
        if (dog.state === 'CHARGING') {
          ctx.save();
          const fontSize = Math.max(10, Math.round(11 * scale));
          ctx.font = `bold ${fontSize}px "Segoe UI", sans-serif`;
          ctx.textAlign = 'center';
          const tagOffset = (dog.breed.size + 8) * scale;
          if (dog.speedType === 'fast') {
            ctx.fillStyle = '#d50000';
            ctx.fillText(`⚡ FAST (${dog.speed})`, dog.x, dog.y - tagOffset);
          } else if (dog.speedType === 'slow') {
            ctx.fillStyle = '#0288d1';
            ctx.fillText(`🐢 SLOW (${dog.speed})`, dog.x, dog.y - tagOffset);
          } else {
            ctx.fillStyle = '#e65100';
            ctx.fillText(`🏃 MED (${dog.speed})`, dog.x, dog.y - tagOffset);
          }
          ctx.restore();
        }

        // Grab Target Indicator: when hand hovers over an eligible broken-out dog
        if (dog.state === 'CHARGING') {
          const dHand = Math.hypot(dog.x - this.hand.x, dog.y - this.hand.y);
          const grabRadius = this.effectiveGrabDist || 52;
          if (dHand < grabRadius && !this.hand.isGrabbing) {
            ctx.save();
            ctx.strokeStyle = '#4caf50';
            ctx.lineWidth = 2.5 * scale;
            ctx.beginPath();
            ctx.arc(dog.x, dog.y, (dog.breed.size + 10) * scale, 0, Math.PI * 2);
            ctx.stroke();
            // Target text
            ctx.fillStyle = '#4caf50';
            const fontSize = Math.max(10, Math.round(12 * scale));
            ctx.font = `bold ${fontSize}px "Segoe UI", sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('GRAB! ✋', dog.x, dog.y - (dog.breed.size + 14) * scale);
            ctx.restore();
          }
        } else if (dog.state === 'TETHERED') {
          // Hover over tethered dog shows locked status
          const dHand = Math.hypot(dog.x - this.hand.x, dog.y - this.hand.y);
          if (dHand < 40 * scale && !this.hand.isGrabbing) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 193, 7, 0.9)';
            const fontSize = Math.max(12, Math.round(14 * scale));
            ctx.font = `${fontSize}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('🔒', dog.x, dog.y - (dog.breed.size + 8) * scale);
            ctx.restore();
          }
        }
      }
    }

    drawGiantHand(ctx) {
      const hx = this.hand.x;
      const hy = this.hand.y;
      const isGrabbing = this.hand.isGrabbing;
      const scale = this.baseScale || 1;

      // 1. Hand Drop Shadow (Changes size & position with altitude)
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      const shadowY = hy + (isGrabbing ? 20 : 35) * scale;
      const shadowScale = (isGrabbing ? 0.85 : 1.1) * scale;
      ctx.beginPath();
      ctx.ellipse(hx, shadowY, 32 * shadowScale, 18 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Giant Hand Drawing (Whimsical Cartoon Glove)
      ctx.save();
      ctx.translate(hx, hy);
      if (scale !== 1) {
        ctx.scale(scale, scale);
      }

      if (isGrabbing) {
        // Clenched Grasping Glove
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#263238';
        ctx.lineWidth = 3.5;

        // Palm & knuckles
        ctx.beginPath();
        ctx.roundRect(-24, -20, 48, 42, 14);
        ctx.fill();
        ctx.stroke();

        // Knuckle lines
        ctx.strokeStyle = '#cfd8dc';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-12, -4); ctx.lineTo(-12, 12);
        ctx.moveTo(0, -4); ctx.lineTo(0, 12);
        ctx.moveTo(12, -4); ctx.lineTo(12, 12);
        ctx.stroke();

        // Glove Cuff
        ctx.fillStyle = '#eceff1';
        ctx.strokeStyle = '#263238';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-26, -32, 52, 14, 6);
        ctx.fill();
        ctx.stroke();

      } else {
        // Open Hovering Hand with 4 fingers and thumb
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#263238';
        ctx.lineWidth = 3.5;

        // Fingers
        const fingerOffsets = [-18, -6, 6, 18];
        const fingerHeights = [28, 36, 34, 26];
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.roundRect(fingerOffsets[i] - 5, -28 - (fingerHeights[i] - 28), 10, fingerHeights[i], 6);
          ctx.fill();
          ctx.stroke();
        }

        // Thumb
        ctx.beginPath();
        ctx.roundRect(-28, 4, 12, 22, 6);
        ctx.fill();
        ctx.stroke();

        // Palm
        ctx.beginPath();
        ctx.roundRect(-22, -10, 44, 38, 12);
        ctx.fill();
        ctx.stroke();

        // Glove Cuff
        ctx.fillStyle = '#eceff1';
        ctx.beginPath();
        ctx.roundRect(-26, 26, 52, 14, 6);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }

    drawParticles(ctx) {
      for (const p of this.particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    }

    drawFloatingTexts(ctx) {
      ctx.textAlign = 'center';
      ctx.font = 'bold 15px "Segoe UI", sans-serif';
      for (const ft of this.floatingTexts) {
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = Math.max(0, ft.life);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.lineWidth = 3;
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillText(ft.text, ft.x, ft.y);
      }
      ctx.globalAlpha = 1.0;
    }

    drawConfetti(ctx) {
      for (const c of this.confetti) {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
        ctx.restore();
      }
    }
  }

  // Initialize once DOM is loaded
  window.addEventListener('DOMContentLoaded', () => {
    window.game = new ParkPatrolGame();
  });

})();
