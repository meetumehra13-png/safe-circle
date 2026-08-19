/**
 * Web Audio API Service for real-time sound synthesis (Emergency Siren & Beeps)
 */

class AudioService {
  private ctx: AudioContext | null = null;
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private sirenTimer: number | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Starts a dynamic emergency siren sound (alternating frequencies)
   */
  public startSiren() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.sirenOsc) this.stopSiren();

      this.sirenOsc = this.ctx.createOscillator();
      this.sirenGain = this.ctx.createGain();

      this.sirenOsc.type = 'sawtooth';
      this.sirenOsc.frequency.setValueAtTime(700, this.ctx.currentTime);
      this.sirenGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

      this.sirenOsc.connect(this.sirenGain);
      this.sirenGain.connect(this.ctx.destination);

      this.sirenOsc.start();

      let high = false;
      this.sirenTimer = window.setInterval(() => {
        try {
          if (!this.ctx || !this.sirenOsc) return;
          const now = this.ctx.currentTime;
          const targetFreq = high ? 700 : 1200;
          this.sirenOsc.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.4);
          high = !high;
        } catch {
          // Ignored if oscillator state changed asynchronously
        }
      }, 450);
    } catch (e) {
      console.warn('Audio API warning:', e);
    }
  }

  /**
   * Stops the emergency siren
   */
  public stopSiren() {
    if (this.sirenTimer) {
      clearInterval(this.sirenTimer);
      this.sirenTimer = null;
    }
    if (this.sirenOsc) {
      try {
        this.sirenOsc.stop();
        this.sirenOsc.disconnect();
      } catch {
        // Ignored if already stopped
      }
      this.sirenOsc = null;
    }
    if (this.sirenGain) {
      try {
        this.sirenGain.disconnect();
      } catch {
        // Ignored
      }
      this.sirenGain = null;
    }
  }

  /**
   * Plays a single warning beep sound (e.g. check-in countdown warning)
   */
  public playBeep(freq = 880, duration = 0.2, volume = 0.3) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Beep audio warning:', e);
    }
  }
}

export const audioService = new AudioService();
