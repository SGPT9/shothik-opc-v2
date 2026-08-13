import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InsforgeRealtimeSync } from '../realtime-sync';

describe('InsForge Realtime WebSocket Pub/Sub (realtime-sync.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('allows subscribing to database table event notifications', () => {
    const sync = new InsforgeRealtimeSync({ companyId: 'comp_verifiq' });
    const onTaskUpdated = vi.fn();

    const unsubscribe = sync.subscribeToTable('opc_tasks', onTaskUpdated);

    sync.simulateEvent('opc_tasks', {
      eventType: 'INSERT',
      newRecord: { id: 'task-101', title: 'Audit Steadfast API', status: 'todo' },
    });

    expect(onTaskUpdated).toHaveBeenCalledWith({
      eventType: 'INSERT',
      newRecord: { id: 'task-101', title: 'Audit Steadfast API', status: 'todo' },
    });

    unsubscribe();
    sync.simulateEvent('opc_tasks', { eventType: 'UPDATE', newRecord: { id: 'task-101' } });
    expect(onTaskUpdated).toHaveBeenCalledTimes(1);
  });

  it('broadcasts client-to-client collaborative broadcast events', () => {
    const sync = new InsforgeRealtimeSync({ companyId: 'comp_verifiq' });
    const onCursorMove = vi.fn();

    sync.subscribeToChannel('editorial_room', onCursorMove);

    sync.broadcast('editorial_room', {
      user: 'Editor 1',
      cursorPosition: 420,
    });

    expect(onCursorMove).toHaveBeenCalledWith({
      user: 'Editor 1',
      cursorPosition: 420,
    });
  });
});
