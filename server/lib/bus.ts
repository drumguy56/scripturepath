// In-process change feed. Writes publish here; the SSE route forwards each event to
// every connected browser that is allowed to read the record. Single-process only:
// run one server instance, or swap this for Postgres LISTEN/NOTIFY before scaling out.
export type ChangeEvent = {
  entity: string;
  type: 'create' | 'update' | 'delete';
  id: string;
  data: Record<string, unknown>;
  created_by_id: string | null;
};

type Listener = (event: ChangeEvent) => void;
const listeners = new Set<Listener>();

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function publish(event: ChangeEvent) {
  for (const listener of listeners) {
    try {
      listener(event);
    } catch (error) {
      console.error('change listener failed', error);
    }
  }
}
