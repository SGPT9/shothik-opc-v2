/**
 * Shothik Unified Voice Engine - Full Duplex Stream Manager
 * 
 * Handles real-time bidirectional audio streaming with "barge-in" capability.
 * Allows users to interrupt the AI mid-sentence, critical for natural Bangla/Banglish conversation.
 * 
 * @module @shothik/voice-engine
 */

import { EventEmitter } from 'events';
import { AudioProcessor } from './AudioProcessor';
import { SpeechSynthesizer } from './SpeechSynthesizer';
import { VoiceState } from '../types/voice-types';

export interface DuplexConfig {
  interruptionThreshold: number; // dB level to trigger interruption
  duckingFactor: number; // Volume reduction factor (0.0 - 1.0) when user speaks
  minInterruptionDuration: number; // ms of sound required to count as interruption
  sampleRate: number;
  echoCancellation: boolean;
}

export class FullDuplexStream extends EventEmitter {
  private audioProcessor: AudioProcessor;
  private synthesizer: SpeechSynthesizer;
  private isSpeaking: boolean = false;
  private isListening: boolean = false;
  private animationFrameId: number | null = null;
  private config: DuplexConfig;

  constructor(config: Partial<DuplexConfig> = {}) {
    super();
    this.config = {
      interruptionThreshold: config.interruptionThreshold || -45, // dB
      duckingFactor: config.duckingFactor || 0.2,
      minInterruptionDuration: config.minInterruptionDuration || 300, // ms
      sampleRate: config.sampleRate || 16000,
      echoCancellation: config.echoCancellation ?? true,
    };
    
    this.audioProcessor = new AudioProcessor({
      sampleRate: this.config.sampleRate,
      echoCancellation: this.config.echoCancellation,
      noiseSuppression: true, // Will be enhanced in Week 4
    });
    
    this.synthesizer = new SpeechSynthesizer();
    
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.audioProcessor.on('volume-change', (dBLevel) => {
      if (this.isSpeaking && dBLevel > this.config.interruptionThreshold) {
        this.handlePotentialInterruption(dBLevel);
      }
    });

    this.synthesizer.on('synth-start', () => {
      this.isSpeaking = true;
      this.emit('state-change', { state: VoiceState.SPEAKING, isInterrupted: false });
    });

    this.synthesizer.on('synth-end', () => {
      this.isSpeaking = false;
      this.emit('state-change', { state: VoiceState.IDLE, isInterrupted: false });
    });
  }

  private interruptionTimer: NodeJS.Timeout | null = null;

  private handlePotentialInterruption(dBLevel: number) {
    if (!this.isSpeaking) return;

    if (!this.interruptionTimer) {
      this.interruptionTimer = setTimeout(() => {
        if (this.isSpeaking) {
          this.executeBargeIn();
        }
        this.interruptionTimer = null;
      }, this.config.minInterruptionDuration);
    }
  }

  private executeBargeIn() {
    console.log('[VoiceEngine] Barge-in detected! Interrupting synthesis...');
    
    // 1. Immediately stop speaking
    this.synthesizer.stop();
    
    // 2. Duck volume momentarily (smooth transition)
    this.audioProcessor.setGain(this.config.duckingFactor);
    
    // 3. Emit interruption event for UI (Orb visualizer)
    this.emit('interruption', { 
      timestamp: Date.now(), 
      reason: 'user-speech' 
    });

    // 4. Reset listening state to ensure immediate capture
    this.isSpeaking = false;
    this.emit('state-change', { 
      state: VoiceState.LISTENING, 
      isInterrupted: true 
    });

    // 5. Restore volume after short delay
    setTimeout(() => {
      this.audioProcessor.setGain(1.0);
    }, 500);
  }

  async startSession() {
    await this.audioProcessor.initialize();
    await this.audioProcessor.startMonitoring();
    this.isListening = true;
    this.emit('session-start', { mode: 'full-duplex' });
  }

  async stopSession() {
    if (this.interruptionTimer) clearTimeout(this.interruptionTimer);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    
    await this.audioProcessor.stopMonitoring();
    this.isListening = false;
    this.isSpeaking = false;
    this.emit('session-end');
  }

  async speak(text: string, options?: { personaId?: string }) {
    if (this.isListening) {
      // In full duplex, we might pause listening while speaking to avoid self-triggering
      // unless echo cancellation is perfect
      this.audioProcessor.pauseMonitoring(); 
    }

    await this.synthesizer.speak(text, {
      ...options,
      onInterrupt: () => {
        this.executeBargeIn();
      }
    });

    if (this.isListening) {
      this.audioProcessor.resumeMonitoring();
    }
  }

  getStats() {
    return {
      isSpeaking: this.isSpeaking,
      isListening: this.isListening,
      config: this.config,
      activeInterruptions: this.interruptionTimer ? 1 : 0,
    };
  }
}
