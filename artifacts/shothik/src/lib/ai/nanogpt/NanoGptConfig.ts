/**
 * NanoGptConfig — Architectural Specifications for Shothik nanoGPT Models
 * Modeled after Karpathy's nanoGPT with optimizations for edge deployment,
 * WebGPU in-browser inference, and speculative draft decoding.
 */

export interface NanoGptModelConfig {
  name: string;
  nLayer: number;       // Number of Transformer blocks
  nHead: number;        // Number of attention heads
  nEmbd: number;        // Embedding dimension (hidden size)
  blockSize: number;    // Maximum context sequence length
  vocabSize: number;    // Vocabulary token count
  dropout: number;
  bias: boolean;        // Whether to include bias in linear layers and LayerNorms
  weightTying: boolean; // Share wte.weight with lm_head.weight
  quantization?: 'fp32' | 'fp16' | 'int8' | 'q4';
  parameterCountM: number;
  memoryFootprintMb: number;
}

/**
 * 38M Micro-Model — Ideal for sub-10ms in-browser WebGPU/WASM execution.
 * Powers: Banglish transliteration, Logistics address NER, NBR Tax parsing.
 */
export const NANO_GPT_MICRO_38M: NanoGptModelConfig = {
  name: 'shothik-nanogpt-micro-38m',
  nLayer: 6,
  nHead: 6,
  nEmbd: 384,
  blockSize: 512,
  vocabSize: 8192,
  dropout: 0.0,
  bias: false,
  weightTying: true,
  quantization: 'int8',
  parameterCountM: 38.2,
  memoryFootprintMb: 28.5,
};

/**
 * 85M Mini-Model — Edge specialist for local document reasoning and draft tokens.
 */
export const NANO_GPT_MINI_85M: NanoGptModelConfig = {
  name: 'shothik-nanogpt-mini-85m',
  nLayer: 8,
  nHead: 8,
  nEmbd: 512,
  blockSize: 1024,
  vocabSize: 16384,
  dropout: 0.0,
  bias: false,
  weightTying: true,
  quantization: 'int8',
  parameterCountM: 85.4,
  memoryFootprintMb: 64.0,
};

/**
 * 124M Standard GPT-2 Architecture — Baseline Karpathy nanoGPT reference.
 */
export const NANO_GPT_STANDARD_124M: NanoGptModelConfig = {
  name: 'shothik-nanogpt-standard-124m',
  nLayer: 12,
  nHead: 12,
  nEmbd: 768,
  blockSize: 1024,
  vocabSize: 50257,
  dropout: 0.0,
  bias: false,
  weightTying: true,
  quantization: 'fp16',
  parameterCountM: 124.4,
  memoryFootprintMb: 124.0,
};

export const DEFAULT_NANO_GPT_CONFIG = NANO_GPT_MICRO_38M;
