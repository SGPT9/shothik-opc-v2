/**
 * Plugin Registry — Dynamic Agent Plugin System
 * Adapted from DeepSeek Harness packages/core/agent/ (Cordis plugin architecture)
 *
 * Provides a typed plugin registry where agents register with lifecycle hooks.
 * Replaces hardcoded agent lists with a dynamic, composable system.
 *
 * Key DSH concepts adapted:
 *  - Registrations are effects (mount/unmount with disposers)
 *  - Everything is a plugin (agents, tools, providers)
 *  - Typed events for inter-plugin communication
 */

// ── Types ───────────────────────────────────────────────

export type PluginStatus = 'registered' | 'mounted' | 'unmounted' | 'error';

export interface PluginLifecycle {
  /** Called when the plugin is mounted into the registry */
  onMount?(): void | Promise<void>;
  /** Called when the plugin is unmounted from the registry */
  onUnmount?(): void | Promise<void>;
  /** Called at the start of each agent turn */
  onTurnStart?(turnId: string): void | Promise<void>;
  /** Called at the end of each agent turn */
  onTurnEnd?(turnId: string): void | Promise<void>;
  /** Called when a tool execution starts */
  onToolCall?(toolName: string, args: Record<string, unknown>): void | Promise<void>;
  /** Called when a tool execution completes */
  onToolResult?(toolName: string, result: unknown): void | Promise<void>;
}

export interface PluginDescriptor {
  /** Unique plugin identifier */
  readonly id: string;
  /** Human-readable display name */
  readonly name: string;
  /** Semantic version string */
  readonly version: string;
  /** Plugin category for grouping */
  readonly category: 'agent' | 'tool' | 'provider' | 'guard' | 'extension';
  /** Capabilities this plugin provides */
  readonly provides: readonly string[];
  /** Capabilities this plugin requires */
  readonly requires: readonly string[];
  /** Plugin lifecycle hooks */
  readonly lifecycle: PluginLifecycle;
}

export interface PluginRegistration {
  readonly descriptor: PluginDescriptor;
  readonly status: PluginStatus;
  readonly mountedAt?: number;
  readonly unmountedAt?: number;
  /** Disposer function — calling it unmounts the plugin */
  readonly dispose: () => void;
}

export type PluginEventType =
  | 'plugin:registered'
  | 'plugin:mounted'
  | 'plugin:unmounted'
  | 'plugin:error';

export interface PluginEvent {
  readonly type: PluginEventType;
  readonly pluginId: string;
  readonly timestamp: number;
  readonly error?: string;
}

type PluginEventListener = (event: PluginEvent) => void;

// ── Plugin Registry ─────────────────────────────────────

export class PluginRegistry {
  private readonly plugins: Map<string, PluginRegistration> = new Map();
  private readonly listeners: Map<PluginEventType, Set<PluginEventListener>> = new Map();
  private readonly capabilityIndex: Map<string, Set<string>> = new Map();

  /**
   * Register a plugin into the registry.
   * Returns a disposer function that unmounts the plugin when called.
   * Adapted from DSH: "registrations are effects that unwind when their plugin unloads"
   */
  register(descriptor: PluginDescriptor): PluginRegistration {
    if (this.plugins.has(descriptor.id)) {
      throw new Error(`Plugin already registered: ${descriptor.id}`);
    }

    // Validate required capabilities are available
    for (const req of descriptor.requires) {
      if (!this.capabilityIndex.has(req) || this.capabilityIndex.get(req)!.size === 0) {
        throw new Error(
          `Plugin "${descriptor.id}" requires capability "${req}" but no provider is registered`
        );
      }
    }

    const dispose = () => {
      this.unmount(descriptor.id);
    };

    const registration: PluginRegistration = {
      descriptor,
      status: 'registered',
      dispose,
    };

    this.plugins.set(descriptor.id, registration);

    // Index provided capabilities
    for (const cap of descriptor.provides) {
      if (!this.capabilityIndex.has(cap)) {
        this.capabilityIndex.set(cap, new Set());
      }
      this.capabilityIndex.get(cap)!.add(descriptor.id);
    }

    this.emit({ type: 'plugin:registered', pluginId: descriptor.id, timestamp: Date.now() });

    return registration;
  }

  /**
   * Mount a registered plugin, triggering its onMount lifecycle hook.
   */
  async mount(pluginId: string): Promise<void> {
    const reg = this.plugins.get(pluginId);
    if (!reg) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }
    if (reg.status === 'mounted') {
      return; // Already mounted, idempotent
    }

    try {
      await reg.descriptor.lifecycle.onMount?.();

      const updated: PluginRegistration = {
        ...reg,
        status: 'mounted',
        mountedAt: Date.now(),
      };
      this.plugins.set(pluginId, updated);

      this.emit({ type: 'plugin:mounted', pluginId, timestamp: Date.now() });
    } catch (err) {
      const updated: PluginRegistration = {
        ...reg,
        status: 'error',
      };
      this.plugins.set(pluginId, updated);

      this.emit({
        type: 'plugin:error',
        pluginId,
        timestamp: Date.now(),
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }

  /**
   * Unmount a plugin, triggering its onUnmount lifecycle hook.
   * Adapted from DSH: effects unwind when their plugin unloads.
   */
  async unmount(pluginId: string): Promise<void> {
    const reg = this.plugins.get(pluginId);
    if (!reg) {
      return; // Already removed, idempotent
    }

    try {
      await reg.descriptor.lifecycle.onUnmount?.();
    } catch {
      // Swallow unmount errors — plugin is being removed anyway
    }

    // Remove from capability index
    for (const cap of reg.descriptor.provides) {
      this.capabilityIndex.get(cap)?.delete(pluginId);
    }

    const updated: PluginRegistration = {
      ...reg,
      status: 'unmounted',
      unmountedAt: Date.now(),
    };
    this.plugins.set(pluginId, updated);

    this.emit({ type: 'plugin:unmounted', pluginId, timestamp: Date.now() });
  }

  /**
   * Get all registered plugins.
   */
  getAll(): readonly PluginRegistration[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugins by category.
   */
  getByCategory(category: PluginDescriptor['category']): readonly PluginRegistration[] {
    return this.getAll().filter((r) => r.descriptor.category === category);
  }

  /**
   * Get mounted plugins that provide a specific capability.
   */
  getProviders(capability: string): readonly PluginRegistration[] {
    const ids = this.capabilityIndex.get(capability);
    if (!ids) return [];
    return Array.from(ids)
      .map((id) => this.plugins.get(id))
      .filter((r): r is PluginRegistration => r !== undefined && r.status === 'mounted');
  }

  /**
   * Check if a capability is available (at least one mounted provider).
   */
  hasCapability(capability: string): boolean {
    return this.getProviders(capability).length > 0;
  }

  /**
   * Subscribe to plugin events.
   */
  on(type: PluginEventType, listener: PluginEventListener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
    return () => {
      this.listeners.get(type)?.delete(listener);
    };
  }

  private emit(event: PluginEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        listener(event);
      }
    }
  }
}
