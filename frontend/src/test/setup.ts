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

// jsdom does not implement HTMLCanvasElement.getContext — provide a full no-op
// canvas context mock so components doing ctx.fillRect(...) etc. don't crash.
HTMLCanvasElement.prototype.getContext = function () {
  return {
    fillRect: () => {},
    clearRect: () => {},
    getImageData: () => ({ data: [] }),
    putImageData: () => {},
    createImageData: () => [],
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    fillText: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    arc: () => {},
    fill: () => {},
    measureText: () => ({ width: 0 }),
    transform: () => {},
    rect: () => {},
    clip: () => {},
    canvas: { width: 0, height: 0 },
  } as unknown as CanvasRenderingContext2D;
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
