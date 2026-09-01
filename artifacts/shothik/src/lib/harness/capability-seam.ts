/**
 * Capability Seam — Generic Swappable Capability Framework
 * Adapted from DeepSeek Harness architecture (Service Definition / Provider / Consumer)
 *
 * "A seam is a swappable capability with three roles:
 *  - Service Definition declaring the interface
 *  - Service Provider implementing it
 *  - Consumer using it (commonly a model-facing tool)"
 *
 * "One provider swap changes the whole product."
 */

// ── Types ───────────────────────────────────────────────

export interface ServiceDefinition<T> {
  /** Unique name for this capability seam */
  readonly name: string;
  /** Human-readable description */
  readonly description: string;
  /** The interface type (for documentation; runtime uses the generic T) */
  readonly interfaceVersion: string;
}

export interface ServiceProvider<T> {
  /** Unique provider identifier */
  readonly id: string;
  /** Provider display name */
  readonly name: string;
  /** Provider version */
  readonly version: string;
  /** The concrete implementation */
  readonly implementation: T;
  /** Priority for auto-selection (higher = preferred) */
  readonly priority: number;
}

export interface CapabilitySeamRegistration<T> {
  readonly definition: ServiceDefinition<T>;
  readonly providers: Map<string, ServiceProvider<T>>;
  readonly activeProviderId: string | null;
}

// ── Capability Registry ─────────────────────────────────

export class CapabilitySeamRegistry {
  private readonly seams: Map<string, CapabilitySeamRegistration<unknown>> = new Map();
  private readonly listeners: Map<
    string,
    Set<(event: { type: string; seamName: string; providerId?: string }) => void>
  > = new Map();

  /**
   * Define a new capability seam.
   * This establishes the interface contract that providers must implement.
   */
  defineSeam<T>(definition: ServiceDefinition<T>): void {
    if (this.seams.has(definition.name)) {
      throw new Error(`Capability seam already defined: ${definition.name}`);
    }

    this.seams.set(definition.name, {
      definition: definition as ServiceDefinition<unknown>,
      providers: new Map(),
      activeProviderId: null,
    });
  }

  /**
   * Register a provider for a defined capability seam.
   * Returns a disposer function (registrations are effects).
   */
  registerProvider<T>(seamName: string, provider: ServiceProvider<T>): () => void {
    const seam = this.seams.get(seamName) as CapabilitySeamRegistration<T> | undefined;
    if (!seam) {
      throw new Error(`Cannot register provider: seam "${seamName}" is not defined`);
    }

    if (seam.providers.has(provider.id)) {
      throw new Error(
        `Provider "${provider.id}" already registered for seam "${seamName}"`
      );
    }

    seam.providers.set(provider.id, provider);

    // Auto-activate if no active provider, or if this one has higher priority
    if (
      !seam.activeProviderId ||
      provider.priority >
        (seam.providers.get(seam.activeProviderId)?.priority ?? 0)
    ) {
      (seam as { activeProviderId: string | null }).activeProviderId = provider.id;
    }

    this.emit(seamName, {
      type: 'provider:registered',
      seamName,
      providerId: provider.id,
    });

    // Return disposer
    return () => {
      seam.providers.delete(provider.id);
      if (seam.activeProviderId === provider.id) {
        // Select next highest-priority provider
        let highestPriority = -1;
        let nextProvider: string | null = null;
        for (const [id, p] of seam.providers) {
          if (p.priority > highestPriority) {
            highestPriority = p.priority;
            nextProvider = id;
          }
        }
        (seam as { activeProviderId: string | null }).activeProviderId = nextProvider;
      }

      this.emit(seamName, {
        type: 'provider:unregistered',
        seamName,
        providerId: provider.id,
      });
    };
  }

  /**
   * Switch the active provider for a capability seam.
   * Consumers automatically use the new provider — zero code changes.
   */
  switchProvider(seamName: string, providerId: string): void {
    const seam = this.seams.get(seamName);
    if (!seam) {
      throw new Error(`Seam not found: ${seamName}`);
    }
    if (!seam.providers.has(providerId)) {
      throw new Error(
        `Provider "${providerId}" not registered for seam "${seamName}"`
      );
    }

    (seam as { activeProviderId: string | null }).activeProviderId = providerId;

    this.emit(seamName, {
      type: 'provider:switched',
      seamName,
      providerId,
    });
  }

  /**
   * Resolve the active provider implementation for a capability seam.
   * This is what consumers call — they never import a concrete provider.
   */
  resolve<T>(seamName: string): T {
    const seam = this.seams.get(seamName) as CapabilitySeamRegistration<T> | undefined;
    if (!seam) {
      throw new Error(`Seam not defined: ${seamName}`);
    }
    if (!seam.activeProviderId) {
      throw new Error(`No active provider for seam "${seamName}"`);
    }
    const provider = seam.providers.get(seam.activeProviderId);
    if (!provider) {
      throw new Error(
        `Active provider "${seam.activeProviderId}" not found for seam "${seamName}"`
      );
    }
    return provider.implementation;
  }

  /**
   * Get all registered seams and their status.
   */
  getSeamStatus(): ReadonlyArray<{
    name: string;
    description: string;
    providerCount: number;
    activeProvider: string | null;
    isComplete: boolean;
  }> {
    return Array.from(this.seams.entries()).map(([name, seam]) => ({
      name,
      description: seam.definition.description,
      providerCount: seam.providers.size,
      activeProvider: seam.activeProviderId,
      isComplete: seam.providers.size > 0 && seam.activeProviderId !== null,
    }));
  }

  /**
   * Get all providers for a seam.
   */
  getProviders<T>(seamName: string): ReadonlyArray<ServiceProvider<T>> {
    const seam = this.seams.get(seamName) as CapabilitySeamRegistration<T> | undefined;
    if (!seam) return [];
    return Array.from(seam.providers.values());
  }

  /**
   * Subscribe to seam events.
   */
  on(
    seamName: string,
    listener: (event: { type: string; seamName: string; providerId?: string }) => void
  ): () => void {
    if (!this.listeners.has(seamName)) {
      this.listeners.set(seamName, new Set());
    }
    this.listeners.get(seamName)!.add(listener);
    return () => this.listeners.get(seamName)?.delete(listener);
  }

  private emit(
    seamName: string,
    event: { type: string; seamName: string; providerId?: string }
  ): void {
    const listeners = this.listeners.get(seamName);
    if (listeners) {
      for (const listener of listeners) {
        listener(event);
      }
    }
  }
}
