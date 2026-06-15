/**
 * @fileOverview A browser-compatible EventEmitter implementation to replace Node.js 'events'.
 * This prevents build errors in Next.js when bundling for the client.
 */

type Listener = (...args: any[]) => void;

class CustomEventEmitter {
  private events: Record<string, Listener[]> = {};

  on(event: string, listener: Listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  off(event: string, listener: Listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;
    this.events[event].forEach(l => l(...args));
  }
}

export const errorEmitter = new CustomEventEmitter();
