let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playKeySound(type: 'none' | 'click' | 'beep' | 'mechanical') {
  if (type === 'none') return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'click') {
      // Soft high-frequency click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
      
      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'beep') {
      // Vintage retro beep
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      
      gainNode.gain.setValueAtTime(0.04, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'mechanical') {
      // Heavy deep tactile mechanical blue-switch click
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.01);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);

      // Create a transient pop at the start
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.linearRampToValueAtTime(0.05, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.start(now);
      osc.stop(now + 0.07);
    }
  } catch (e) {
    // Fail silently if Web Audio is blocked or unsupported
    console.warn("Audio Context error:", e);
  }
}

export function playRecordSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Play a nice arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);
      
      gainNode.gain.setValueAtTime(0, now + index * 0.08);
      gainNode.gain.linearRampToValueAtTime(0.1, now + index * 0.08 + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.25);
      
      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.25);
    });
  } catch (e) {
    console.warn("Record sound error:", e);
  }
}
