
class SoundManager {
  private ctx: AudioContext | null = null;
  private bgmInterval: number | null = null;
  private bgmStep = 0;
  private isBgmPlaying = false;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  vibrate(pattern: number | number[]) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number, fadeOut = true) {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    if (fadeOut) {
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  startBGM() {
    if (this.isBgmPlaying) return;
    this.init();
    this.isBgmPlaying = true;
    
    const bpm = 160; // Faster tempo for Turbo
    const stepTime = 60 / bpm / 2; 

    // Aggressive synth-wave style bassline
    const bassSeq = [50, 50, 60, 50, 70, 50, 60, 40]; 
    const leadSeq = [200, 300, 250, 400, 0, 350, 200, 600];

    this.bgmInterval = window.setInterval(() => {
      if (!this.ctx) return;
      
      // Kick drum
      if (this.bgmStep % 4 === 0) {
        this.playTone(55, 'sine', 0.25, 0.1);
      }
      
      // Snare
      if (this.bgmStep % 8 === 4) {
        this.playTone(220, 'square', 0.1, 0.02, true);
      }

      const bFreq = bassSeq[this.bgmStep % bassSeq.length];
      this.playTone(bFreq, 'sawtooth', 0.1, 0.04);

      if (Math.random() > 0.7) {
        const lFreq = leadSeq[this.bgmStep % leadSeq.length];
        if (lFreq > 0) this.playTone(lFreq, 'square', 0.15, 0.015);
      }

      this.bgmStep++;
    }, stepTime * 1000);
  }

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.isBgmPlaying = false;
  }

  playLaunch() {
    this.init();
    if (!this.ctx) return;
    this.vibrate(50);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  playImpact(intensity: number) {
    const vol = Math.min(0.4, intensity * 0.06);
    this.vibrate(intensity * 2);
    this.playTone(80 + Math.random() * 40, 'square', 0.2, vol);
  }

  playSpecial() {
    this.init();
    if (!this.ctx) return;
    this.vibrate([100, 50, 100, 50, 200]);
    const duration = 1.2;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + duration);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playLoss() {
    this.vibrate(800);
    [400, 300, 200, 100].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sawtooth', 0.5, 0.1), i * 150);
    });
  }
}

export const sounds = new SoundManager();
