export class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicTimer: number | null = null;
  private nextNoteTime = 0;
  private step = 0;
  private soundEnabled: boolean;
  private musicEnabled: boolean;

  private static readonly MELODY = [
    523.25, 659.25, 783.99, 659.25, 587.33, 783.99, 659.25, 523.25,
    880, 783.99, 659.25, 587.33, 523.25, 587.33, 659.25, 523.25,
  ];
  private static readonly BASS = [130.81, 130.81, 164.81, 196.0, 174.61, 196.0, 164.81, 130.81];
  private static readonly STEP = 0.22;

  constructor(soundEnabled: boolean, musicEnabled: boolean) {
    this.soundEnabled = soundEnabled;
    this.musicEnabled = musicEnabled;
  }

  unlock(): void {
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.soundEnabled ? 0.35 : 0;
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.14;
      this.musicGain.connect(this.master);
      this.startMusic();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(enabled ? 0.35 : 0, this.ctx.currentTime, 0.02);
    }
  }

  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (enabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }

  private startMusic(): void {
    if (!this.ctx || !this.musicEnabled || this.musicTimer !== null) return;
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.step = 0;
    this.musicTimer = window.setInterval(() => this.scheduleMusic(), 60);
  }

  private stopMusic(): void {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private scheduleMusic(): void {
    if (!this.ctx || !this.musicGain || !this.musicEnabled) return;
    while (this.nextNoteTime < this.ctx.currentTime + 0.3) {
      const melody = AudioManager.MELODY[this.step % AudioManager.MELODY.length];
      const bass = AudioManager.BASS[Math.floor(this.step / 2) % AudioManager.BASS.length];
      this.note(melody, this.nextNoteTime, AudioManager.STEP * 0.9, 'square', 0.045, this.musicGain);
      if (this.step % 2 === 0) {
        this.note(bass, this.nextNoteTime, AudioManager.STEP * 1.7, 'sine', 0.12, this.musicGain);
      }
      this.nextNoteTime += AudioManager.STEP;
      this.step++;
    }
  }

  private note(freq: number, when: number, duration: number, type: OscillatorType, volume: number, dest: GainNode): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(volume, when + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, when + duration);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(when);
    osc.stop(when + duration + 0.05);
  }

  private tone(freq: number, endFreq: number, duration: number, type: OscillatorType, volume: number, delay = 0): void {
    if (!this.ctx || !this.master || !this.soundEnabled) return;
    const when = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 1), when + duration);
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(volume, when + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, when + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(when);
    osc.stop(when + duration + 0.05);
  }

  playJump(): void {
    this.tone(300, 620, 0.12, 'sine', 0.4);
  }

  playLand(): void {
    this.tone(190, 95, 0.12, 'triangle', 0.45);
    this.tone(95, 60, 0.14, 'sine', 0.3, 0.02);
  }

  playCollect(): void {
    this.tone(880, 880, 0.07, 'square', 0.22);
    this.tone(1318.5, 1318.5, 0.14, 'square', 0.22, 0.06);
  }

  playSpecial67(): void {
    this.tone(523.25, 523.25, 0.09, 'square', 0.25);
    this.tone(659.25, 659.25, 0.09, 'square', 0.25, 0.09);
    this.tone(783.99, 783.99, 0.09, 'square', 0.25, 0.18);
    this.tone(1046.5, 1046.5, 0.22, 'square', 0.28, 0.27);
  }

  playDeath(): void {
    this.tone(420, 55, 0.65, 'sawtooth', 0.35);
    this.tone(210, 40, 0.7, 'triangle', 0.25, 0.05);
  }

  playVictory(): void {
    const seq = [392, 523.25, 659.25, 783.99, 1046.5];
    seq.forEach((f, i) => this.tone(f, f, 0.16, 'square', 0.22, i * 0.11));
  }

  destroy(): void {
    this.stopMusic();
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
  }
}
