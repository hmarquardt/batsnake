// @ts-check

export const GamePhase = Object.freeze({ LOADING: 'loading', MENU: 'menu', PLAYING: 'playing', PAUSED: 'paused', ENDED: 'ended' });

export class GameState {
  constructor() {
    /** @type {keyof typeof GamePhase|string} */ this.phase = GamePhase.LOADING;
    /** @type {'bat'|'snake'|null} */ this.mode = null;
    this.runId = 0;
  }
  /** @param {string} phase */ setPhase(phase) { this.phase = phase; }
  /** @param {'bat'|'snake'} mode */ begin(mode) { this.mode = mode; this.phase = GamePhase.PLAYING; this.runId += 1; }
  isPlaying() { return this.phase === GamePhase.PLAYING; }
}
