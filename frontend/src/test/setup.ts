import '@testing-library/jest-dom';

// jsdom does not implement scrollIntoView — mock it globally so components
// that call bottomRef.current?.scrollIntoView() don't crash in tests.
window.HTMLElement.prototype.scrollIntoView = function () {};

// jsdom does not implement ResizeObserver — stub it for chart components.
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// jsdom does not implement HTMLCanvasElement.getContext — stub it so
// lightweight-charts and other canvas-based libraries don't throw.
HTMLCanvasElement.prototype.getContext = function () {
  return null;
};

// Suppress IntersectionObserver errors from UI libraries.
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  constructor(_cb: IntersectionObserverCallback, _opts?: IntersectionObserverInit) {}
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: readonly number[] = [];
  takeRecords(): IntersectionObserverEntry[] { return []; }
} as unknown as typeof IntersectionObserver;
