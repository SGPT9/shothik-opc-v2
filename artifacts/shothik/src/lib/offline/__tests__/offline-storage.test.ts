import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveOfflineManuscript,
  getOfflineManuscript,
  listOfflineManuscripts,
  deleteOfflineManuscript,
  saveOfflineTask,
  listOfflineTasks,
  deleteOfflineTask,
  saveOfflineTranscript,
  getOfflineTranscript,
  listOfflineTranscripts,
  deleteOfflineTranscript,
  markTranscriptSynced,
  enqueueOutbox,
  getOutboxItem,
  listOutbox,
  updateOutboxItem,
  deleteOutboxItem,
  clearOfflineStorage,
} from '../offline-storage';

describe('Offline-First Storage Engine (offline-storage.ts)', () => {
  beforeEach(() => {
    clearOfflineStorage();
  });

  it('saves and retrieves manuscripts when offline', () => {
    saveOfflineManuscript({
      id: 'doc-101',
      title: 'Echoes of the River',
      content: '# Chapter 1\nThe river flowed silently.',
      updatedAt: Date.now(),
    });

    const doc = getOfflineManuscript('doc-101');
    expect(doc).toBeDefined();
    expect(doc?.title).toBe('Echoes of the River');
    expect(doc?.content).toContain('river flowed');
  });

  it('lists all saved offline documents sorted by recency', () => {
    saveOfflineManuscript({ id: 'doc-1', title: 'Draft 1', content: 'c1', updatedAt: 1000 });
    saveOfflineManuscript({ id: 'doc-2', title: 'Draft 2', content: 'c2', updatedAt: 2000 });

    const list = listOfflineManuscripts();
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe('doc-2');
  });

  it('deletes offline document cleanly', () => {
    saveOfflineManuscript({ id: 'doc-1', title: 'Draft 1', content: 'c1', updatedAt: 1000 });
    deleteOfflineManuscript('doc-1');

    expect(getOfflineManuscript('doc-1')).toBeUndefined();
  });

  it('saves, lists, and marks offline transcripts as synced', () => {
    saveOfflineTranscript({
      conversationId: 'conv-101',
      messages: [
        {
          _id: 'm1',
          conversationId: 'conv-101',
          userId: 'u1',
          role: 'user',
          content: 'Audit bKash checkout',
          contentFormat: 'plain',
          status: 'completed',
          createdAt: 1000,
          updatedAt: 1000,
        },
      ],
      updatedAt: 1000,
      syncStatus: 'pending_upload',
    });

    const transcript = getOfflineTranscript('conv-101');
    expect(transcript).toBeDefined();
    expect(transcript?.syncStatus).toBe('pending_upload');
    expect(transcript?.messages).toHaveLength(1);

    markTranscriptSynced('conv-101');
    expect(getOfflineTranscript('conv-101')?.syncStatus).toBe('synced');

    deleteOfflineTranscript('conv-101');
    expect(getOfflineTranscript('conv-101')).toBeUndefined();
  });

  it('manages offline outbox queue items with status transitions', () => {
    enqueueOutbox({
      id: 'outbox-bkash-01',
      type: 'mfs_verify',
      payload: { trxId: 'BK99281726X', amount: 1850 },
      retryCount: 0,
      status: 'queued',
      createdAt: 1000,
    });

    enqueueOutbox({
      id: 'outbox-courier-02',
      type: 'courier_dispatch',
      payload: { trackingId: 'ST-582910', provider: 'steadfast' },
      retryCount: 0,
      status: 'queued',
      createdAt: 2000,
    });

    const queued = listOutbox('queued');
    expect(queued).toHaveLength(2);
    expect(queued[0].id).toBe('outbox-bkash-01');

    updateOutboxItem('outbox-bkash-01', { status: 'in_flight' });
    expect(getOutboxItem('outbox-bkash-01')?.status).toBe('in_flight');
    expect(listOutbox('queued')).toHaveLength(1);

    deleteOutboxItem('outbox-bkash-01');
    expect(getOutboxItem('outbox-bkash-01')).toBeUndefined();
  });

  it('saves, lists, and deletes offline tasks persistently', () => {
    saveOfflineTask({
      id: 'task-101',
      title: 'Fix MFS webhook signature verification',
      category: 'code',
      status: 'todo',
      urgency: 'TONIGHT',
      cost: '5 Credits',
      updatedAt: 3000,
    });

    const tasks = listOfflineTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('task-101');
    expect(tasks[0].title).toContain('MFS webhook');

    deleteOfflineTask('task-101');
    expect(listOfflineTasks()).toHaveLength(0);
  });
});
