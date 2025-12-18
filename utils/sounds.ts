
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
    
    const bpm = 140;
    const stepTime = 60 / bpm / 2; // 1/8th notes

    const bassSeq = [55, 55, 65, 55, 55, 55, 65, 73]; 
    const leadSeq = [220, 0, 247, 0, 261, 293, 261, 0];

    this.bgmInterval = window.setInterval(() => {
      if (!this.ctx) return;
      
      if (this.bgmStep % 4 === 0) {
        this.playTone(60, 'sine', 0.2, 0.05);
      }
      
      if (this.bgmStep % 8 === 4) {
        this.playTone(200, 'square', 0.05, 0.01, false);
      }

      const bFreq = bassSeq[this.bgmStep % bassSeq.length];
      if (bFreq > 0) {
        this.playTone(bFreq, 'sawtooth', 0.15, 0.02);
      }

      const lFreq = leadSeq[this.bgmStep % leadSeq.length];
      if (lFreq > 0 && Math.random() > 0.4) {
        this.playTone(lFreq, 'square', 0.1, 0.005);
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
    this.vibrate(20);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playImpact(intensity: number) {
    const vol = Math.min(0.3, intensity * 0.05);
    if (intensity > 15) {
      this.vibrate([30, 20, 30]);
      this.playTone(100, 'square', 0.2, vol);
      this.playTone(40, 'sine', 0.3, vol);
    } else {
      this.vibrate(10);
      this.playTone(250 + Math.random() * 100, 'square', 0.1, vol * 0.5);
    }
  }

  playEnergyGain() {
    this.playTone(880, 'sine', 0.05, 0.02);
  }

  playEnergyMax() {
    this.vibrate([100, 50, 100]);
    this.playTone(440, 'square', 0.1, 0.05);
    this.playTone(660, 'square', 0.1, 0.05);
    this.playTone(880, 'square', 0.2, 0.05);
  }

  playSpecial() {
    this.init();
    if (!this.ctx) return;
    this.vibrate([50, 50, 100, 50, 150]);
    const duration = 1.0;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + duration);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playWin() {
    this.vibrate([200, 100, 200, 100, 400]);
    const freqs = [261, 329, 392, 523, 659];
    freqs.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'square', 0.4, 0.08), i * 150);
    });
  }

  playLoss() {
    this.vibrate(500);
    const freqs = [523, 392, 329, 261];
    freqs.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sawtooth', 0.4, 0.08), i * 150);
    });
  }
}

export const sounds = new SoundManager();
