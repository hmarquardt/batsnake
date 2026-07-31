// @ts-check

/** Restrained application event channel with unsubscribe support. */
export class EventBus {
  constructor() { /** @type {Map<string, Set<(detail:any)=>void>>} */ this.listeners = new Map(); }
  /** @param {string} type @param {(detail:any)=>void} listener */
  on(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)?.add(listener);
    return () => this.listeners.get(type)?.delete(listener);
  }
  /** @param {string} type @param {any} [detail] */
  emit(type, detail = {}) { this.listeners.get(type)?.forEach((listener) => listener(detail)); }
  clear() { this.listeners.clear(); }
}
