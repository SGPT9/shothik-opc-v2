/**
 * Cactus Compute Full-Stack AI Engine Subsystem — Index Facade
 * 
 * ┌─────────────────┐
 * │  Cactus Engine  │ ←── OpenAI-compatible APIs for text, speech, and vision.
 * └─────────────────┘     
 *          │
 * ┌─────────────────┐
 * │  Cactus Graph   │ ←── Zero-copy computation graph
 * └─────────────────┘     
 *          │
 * ┌─────────────────┐
 * │ Cactus Kernels  │ ←── CPU/GPU kernels for (Apple, Samsung, Pixel, etc.)
 * └─────────────────┘     
 *          │
 * ┌─────────────────┐
 * │ Cactus Quants   │ ←── Custom rotation-based quantization technique
 * └─────────────────┘
 */

export * from './CactusEngine';
export * from './CactusGraph';
export * from './CactusKernels';
export * from './CactusQuants';
