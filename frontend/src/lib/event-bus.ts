type Handler<T = unknown> = (payload: T) => void;

const listeners: Map<string, Set<Handler>> = new Map();

export const bus = {
  on<T>(event: string, handler: Handler<T>): () => void {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event)!.add(handler as Handler);
    return () => listeners.get(event)?.delete(handler as Handler);
  },
  emit<T>(event: string, payload: T): void {
    listeners.get(event)?.forEach(h => h(payload));
  },
};

export const EVENTS = {
  SYMBOL_SELECTED: 'symbol:selected',
} as const;
