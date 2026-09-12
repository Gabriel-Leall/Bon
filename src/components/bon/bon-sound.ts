type BonSound = 'celebrate' | 'urgent'

export function playBonSound(kind: BonSound) {
  const AudioContextClass =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext

  if (!AudioContextClass) return

  try {
    const context = new AudioContextClass()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const now = context.currentTime

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(kind === 'urgent' ? 440 : 520, now)
    oscillator.frequency.exponentialRampToValueAtTime(
      kind === 'urgent' ? 620 : 780,
      now + 0.13
    )
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.025)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(now)
    oscillator.stop(now + 0.21)
    oscillator.addEventListener('ended', () => void context.close(), {
      once: true,
    })
  } catch {
    // Optional audio must never interrupt the user's work.
  }
}
