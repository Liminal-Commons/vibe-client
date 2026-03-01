/**
 * Speech bubble lifecycle management.
 * Pure logic — handles creation, expiry, and queuing of speech bubbles.
 * Rendering is handled separately in CafeScene.
 */

export interface SpeechBubble {
  id: string;
  speakerId: string;
  text: string;
  createdAt: number;
  /** When the bubble should start fading (ms since epoch) */
  fadeAt: number;
  /** When the bubble should be removed entirely (ms since epoch) */
  expireAt: number;
}

export interface SpeechBubbleManagerOptions {
  /** How long the bubble stays fully visible (default: 5000ms) */
  displayMs?: number;
  /** How long the fade animation takes (default: 2000ms) */
  fadeDurationMs?: number;
  /** Max bubbles per speaker (default: 2) */
  maxPerSpeaker?: number;
}

const DEFAULT_DISPLAY_MS = 5000;
const DEFAULT_FADE_MS = 2000;
const DEFAULT_MAX_PER_SPEAKER = 2;

let nextId = 0;

export class SpeechBubbleManager {
  private bubbles: SpeechBubble[] = [];
  private readonly displayMs: number;
  private readonly fadeDurationMs: number;
  private readonly maxPerSpeaker: number;

  constructor(options: SpeechBubbleManagerOptions = {}) {
    this.displayMs = options.displayMs ?? DEFAULT_DISPLAY_MS;
    this.fadeDurationMs = options.fadeDurationMs ?? DEFAULT_FADE_MS;
    this.maxPerSpeaker = options.maxPerSpeaker ?? DEFAULT_MAX_PER_SPEAKER;
  }

  /** Add a new speech bubble for a speaker. */
  addBubble(speakerId: string, text: string, now: number = Date.now()): SpeechBubble {
    // Evict oldest bubble from this speaker if at max
    const speakerBubbles = this.bubbles.filter((b) => b.speakerId === speakerId);
    if (speakerBubbles.length >= this.maxPerSpeaker) {
      const oldest = speakerBubbles[0]!;
      this.bubbles = this.bubbles.filter((b) => b.id !== oldest.id);
    }

    const bubble: SpeechBubble = {
      id: `bubble-${nextId++}`,
      speakerId,
      text,
      createdAt: now,
      fadeAt: now + this.displayMs,
      expireAt: now + this.displayMs + this.fadeDurationMs,
    };

    this.bubbles.push(bubble);
    return bubble;
  }

  /** Remove expired bubbles. Returns the IDs of removed bubbles. */
  cleanup(now: number = Date.now()): string[] {
    const expired = this.bubbles.filter((b) => now >= b.expireAt);
    this.bubbles = this.bubbles.filter((b) => now < b.expireAt);
    return expired.map((b) => b.id);
  }

  /** Get the current opacity of a bubble (1.0 = fully visible, 0.0 = fully faded). */
  getOpacity(bubble: SpeechBubble, now: number = Date.now()): number {
    if (now < bubble.fadeAt) return 1.0;
    if (now >= bubble.expireAt) return 0.0;
    const fadeProgress = (now - bubble.fadeAt) / this.fadeDurationMs;
    return 1.0 - fadeProgress;
  }

  /** Get all active bubbles. */
  getAll(): readonly SpeechBubble[] {
    return this.bubbles;
  }

  /** Get bubbles for a specific speaker. */
  getBySpeaker(speakerId: string): SpeechBubble[] {
    return this.bubbles.filter((b) => b.speakerId === speakerId);
  }

  /** Remove all bubbles for a speaker (e.g., on disconnect). */
  removeSpeaker(speakerId: string): void {
    this.bubbles = this.bubbles.filter((b) => b.speakerId !== speakerId);
  }

  /** Clear all bubbles. */
  clear(): void {
    this.bubbles = [];
  }

  /** Current bubble count. */
  get count(): number {
    return this.bubbles.length;
  }
}
