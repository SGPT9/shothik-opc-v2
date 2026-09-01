/**
 * ShothikGPT Harness — Barrel Export
 * Adapted from DeepSeek Harness architecture
 *
 * Provides a unified entry point for all harness modules:
 *  - PluginRegistry (dynamic agent lifecycle)
 *  - SessionEventLog (durable event stream)
 *  - GoalDriver (structured goal tracking)
 *  - CapabilitySeamRegistry (swappable capabilities)
 *  - Guard (loop hygiene)
 *  - HookBridge (cross-platform event bridges)
 *  - SkillProviderRegistry (unified skill discovery)
 */

export {
  PluginRegistry,
  type PluginDescriptor,
  type PluginRegistration,
  type PluginLifecycle,
  type PluginStatus,
  type PluginEvent,
  type PluginEventType,
} from './plugin-registry';

export {
  SessionEventLog,
  type SessionEvent,
  type SessionEventType,
} from './session-event-log';

export {
  GoalDriver,
  type GoalState,
  type GoalSubtask,
  type GoalInput,
  type GoalStatus,
} from './goal-driver';

export {
  CapabilitySeamRegistry,
  type ServiceDefinition,
  type ServiceProvider,
  type CapabilitySeamRegistration,
} from './capability-seam';

export {
  Guard,
  type GuardConfig,
  type GuardViolation,
} from './guard';

export {
  HookBridge,
  type HookEvent,
  type HookHandler,
  type HookBridgeConfig,
  type HookTiming,
  type HookDialect,
} from './hook-bridge';

export {
  SkillProviderRegistry,
  EccFilesystemSkillProvider,
  EmporiumSkillProvider,
  type SkillDescriptor,
  type SkillCatalogEntry,
  type SkillProviderPlugin,
  type SkillSource,
} from './skill-provider-registry';
