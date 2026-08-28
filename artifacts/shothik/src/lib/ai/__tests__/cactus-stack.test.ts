import { describe, it, expect } from 'vitest';
import {
  CactusEngine,
  CactusGraph,
  CactusKernels,
  CactusQuants,
} from '../cactus';

describe('Cactus Compute 4-Tier Full-Stack Suite', () => {
  describe('Tier 4: Cactus Quants', () => {
    it('applies Walsh-Hadamard Transform (WHT) to disperse outlier activation peaks', () => {
      const vec = new Float32Array(8);
      vec[0] = 100.0; // Giant outlier
      for (let i = 1; i < 8; i++) vec[i] = 1.0;

      const origMax = Math.max(...vec);
      CactusQuants.applyWHT(vec, 8);
      const postMax = Math.max(...vec);

      // Maximum peak should be substantially reduced after orthogonal rotation
      expect(postMax).toBeLessThan(origMax);
    });

    it('quantizes to 4-bit block representation and computes accurate dot products', () => {
      const weights = new Float32Array(64);
      const activation = new Float32Array(64);
      for (let i = 0; i < 64; i++) {
        weights[i] = (i % 10) * 0.5;
        activation[i] = 1.0;
      }

      // Expected exact dot product
      let expectedDot = 0;
      for (let i = 0; i < 64; i++) expectedDot += weights[i] * activation[i];

      const q4 = CactusQuants.quantizeQ4(weights, 32);
      expect(q4.scales.length).toBe(2);
      expect(q4.weights.length).toBe(32);

      const q4Dot = CactusQuants.dotProductQ4(activation, q4, 32);
      // Q4 dot product should closely approximate floating-point dot product
      expect(Math.abs(q4Dot - expectedDot)).toBeLessThan(5.0);
    });

    it('quantizes to Int8 representation properly', () => {
      const weights = new Float32Array([-10, -5, 0, 5, 10]);
      const int8Tensor = CactusQuants.quantizeInt8(weights);
      expect(int8Tensor.weights.length).toBe(5);
      expect(int8Tensor.scale).toBeGreaterThan(0);
    });
  });

  describe('Tier 2: Cactus Graph & Memory Arena', () => {
    it('allocates static tensors from contiguous arena memory without heap reallocation', () => {
      const graph = new CactusGraph(4); // 4MB arena
      const arena = graph.getArena();

      const t1 = arena.allocateTensor('w1', [128, 64]);
      const t2 = arena.allocateTensor('w2', [64, 128]);

      expect(t1.length).toBe(128 * 64);
      expect(t2.length).toBe(64 * 128);
      expect(arena.getAllocatedMb()).toBeGreaterThan(0);

      arena.resetScratch(0);
      expect(arena.getAllocatedMb()).toBe(0);
    });

    it('executes zero-copy RMSNorm and Softmax correctly', () => {
      const graph = new CactusGraph(2);
      const x = new Float32Array([1.0, 2.0, 3.0, 4.0]);
      const weight = new Float32Array([1.0, 1.0, 1.0, 1.0]);
      const normalized = graph.rmsNorm(x, weight, 4);

      expect(normalized.length).toBe(4);

      const probs = graph.onlineSoftmax(normalized, 4);
      let sum = 0;
      for (let i = 0; i < probs.length; i++) sum += probs[i];
      expect(Math.abs(sum - 1.0)).toBeLessThan(1e-4);
    });
  });

  describe('Tier 3: Cactus Kernels', () => {
    it('initializes kernel manager and reports hardware device state', async () => {
      const kernels = new CactusKernels();
      await kernels.initialize();
      const info = kernels.getAdapterInfo();
      expect(info).toBeDefined();
      expect(typeof info.architecture).toBe('string');
    });
  });

  describe('Tier 1: Cactus Engine', () => {
    it('handles OpenAI-compatible chat completion requests with streaming chunks', async () => {
      const engine = new CactusEngine();
      await engine.initialize();

      const chunksReceived: any[] = [];
      const result = await engine.createChatCompletion(
        {
          messages: [
            { role: 'user', content: 'Customer: Kabir Ahmed, 01711998877, Dhanmondi Dhaka. COD 1500 taka' }
          ],
          stream: true,
        },
        (chunk) => chunksReceived.push(chunk)
      );

      expect(result.text).toContain('Courier Parcel');
      expect(result.text).toContain('01711998877');
      expect(result.dispatch?.selectedTool?.name).toBe('parse_courier_parcel');
      expect(chunksReceived.length).toBeGreaterThan(0);
      expect(chunksReceived[0].object).toBe('chat.completion.chunk');
    });
  });
});
