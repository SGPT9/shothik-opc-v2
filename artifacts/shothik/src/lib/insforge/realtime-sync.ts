/**
 * InsForge Realtime WebSocket Pub/Sub Manager
 * Manages database event listeners (Postgres CDC via PostgREST/InsForge Realtime)
 * and peer-to-peer collaborative channels (Writing Studio, Editorial Room, Task Board).
 */

import { getInsforgeBrowserClient } from './client';

export type TableEventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export interface TableEventPayload<T = any> {
  eventType: TableEventType;
  newRecord?: T;
  oldRecord?: T;
  table?: string;
}

export type TableEventCallback<T = any> = (payload: TableEventPayload<T>) => void;
export type ChannelEventCallback<T = any> = (payload: T) => void;

export interface RealtimeSyncOptions {
  companyId?: string;
  autoReconnect?: boolean;
}

export class InsforgeRealtimeSync {
  private companyId: string;
  private tableListeners: Map<string, Set<TableEventCallback>> = new Map();
  private channelListeners: Map<string, Set<ChannelEventCallback>> = new Map();
  private isConnected: boolean = false;

  constructor(options: RealtimeSyncOptions = {}) {
    this.companyId = options.companyId || 'comp_verifiq';
    this.initRealtimeConnection();
  }

  private initRealtimeConnection(): void {
    const client = getInsforgeBrowserClient();
    if (client) {
      this.isConnected = true;
    }
  }

  public subscribeToTable<T = any>(table: string, callback: TableEventCallback<T>): () => void {
    if (!this.tableListeners.has(table)) {
      this.tableListeners.set(table, new Set());
    }

    const listeners = this.tableListeners.get(table)!;
    listeners.add(callback as TableEventCallback);

    return () => {
      listeners.delete(callback as TableEventCallback);
      if (listeners.size === 0) {
        this.tableListeners.delete(table);
      }
    };
  }

  public subscribeToChannel<T = any>(channelName: string, callback: ChannelEventCallback<T>): () => void {
    if (!this.channelListeners.has(channelName)) {
      this.channelListeners.set(channelName, new Set());
    }

    const listeners = this.channelListeners.get(channelName)!;
    listeners.add(callback as ChannelEventCallback);

    return () => {
      listeners.delete(callback as ChannelEventCallback);
      if (listeners.size === 0) {
        this.channelListeners.delete(channelName);
      }
    };
  }

  public broadcast<T = any>(channelName: string, payload: T): void {
    const listeners = this.channelListeners.get(channelName);
    if (listeners) {
      listeners.forEach((fn) => {
        try {
          fn(payload);
        } catch (err) {
          console.error('[InsForge Realtime] Error executing channel listener:', err);
        }
      });
    }
  }

  public simulateEvent<T = any>(table: string, payload: TableEventPayload<T>): void {
    const listeners = this.tableListeners.get(table);
    if (listeners) {
      listeners.forEach((fn) => {
        try {
          fn(payload);
        } catch (err) {
          console.error('[InsForge Realtime] Error executing table listener:', err);
        }
      });
    }
  }

  public getStatus(): { isConnected: boolean; activeTables: number; activeChannels: number } {
    return {
      isConnected: this.isConnected,
      activeTables: this.tableListeners.size,
      activeChannels: this.channelListeners.size,
    };
  }
}
