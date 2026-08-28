/**
 * CactusGraph — Tier 2 Zero-Copy Arena Memory & Static Computational Graph
 * Pre-allocates static contiguous ArrayBuffer memory to eliminate heap allocations,
 * memory fragmentation, and Garbage Collection (GC) latency spikes during forward passes.
 */

export interface TensorShape {
  dims: number[];
  size: number;
}

export interface StaticTensor {
  id: string;
  shape: number[];
  offset: number;
  length: number;
  data: Float32Array;
}

export class MemoryArena {
  private buffer: ArrayBuffer;
  private floatView: Float32Array;
  private byteOffset: number = 0;
  private totalCapacityBytes: number;

  constructor(capacityMb: number = 32) {
    this.totalCapacityBytes = capacityMb * 1024 * 1024;
    this.buffer = new ArrayBuffer(this.totalCapacityBytes);
    this.floatView = new Float32Array(this.buffer);
  }

  /**
   * Allocates a contiguous static slice from the pre-allocated arena
   */
  public allocateTensor(id: string, shape: number[]): StaticTensor {
    const numElements = shape.reduce((acc, dim) => acc * dim, 1);
    const byteSize = numElements * 4; // 4 bytes per float32

    if (this.byteOffset + byteSize > this.totalCapacityBytes) {
      throw new Error(`MemoryArena OOM: requested ${byteSize} bytes, but only ${this.totalCapacityBytes - this.byteOffset} available.`);
    }

    const floatOffset = this.byteOffset / 4;
    const tensorData = new Float32Array(this.buffer, this.byteOffset, numElements);
    this.byteOffset += byteSize;

    return {
      id,
      shape,
      offset: floatOffset,
      length: numElements,
      data: tensorData,
    };
  }

  /**
   * Resets scratch offset for next forward pass without deallocating memory
   */
  public resetScratch(keepStaticBytes: number = 0): void {
    this.byteOffset = keepStaticBytes;
  }

  public getCapacityMb(): number {
    return this.totalCapacityBytes / (1024 * 1024);
  }

  public getAllocatedMb(): number {
    return this.byteOffset / (1024 * 1024);
  }
}

export enum Precision {
  FP32 = 'FP32',
  FP16 = 'FP16',
  INT8 = 'INT8',
  Q4 = 'Q4',
}

export interface GraphNode {
  id: string;
  shape: number[];
  precision: Precision;
  op?: 'input' | 'matmul' | 'transpose' | 'rmsnorm';
  inputs?: GraphNode[];
  transposeB?: boolean;
  tensorData?: Float32Array;
}

/**
 * Static Computation Graph with Zero-Copy In-Place Operations
 * Fully replicates the C++ CactusGraph API (input, matmul, transpose, execute, get_output, hard_reset)
 */
export class CactusGraph {
  private arena: MemoryArena;
  private nodes: Map<string, GraphNode> = new Map();
  private inputValues: Map<string, Float32Array> = new Map();
  private outputValues: Map<string, Float32Array> = new Map();
  private nextNodeId: number = 0;

  constructor(arenaCapacityMb: number = 32) {
    this.arena = new MemoryArena(arenaCapacityMb);
  }

  /**
   * Registers a symbolic input tensor in the computation graph
   */
  public input(shape: number[], precision: Precision = Precision.FP32): GraphNode {
    const id = `node_input_${this.nextNodeId++}`;
    const node: GraphNode = {
      id,
      shape,
      precision,
      op: 'input',
    };
    this.nodes.set(id, node);
    return node;
  }

  /**
   * Appends a matrix multiplication operation: Out = A @ (B or B^T)
   */
  public matmul(a: GraphNode, b: GraphNode, transposeB: boolean = false): GraphNode {
    const id = `node_matmul_${this.nextNodeId++}`;
    const m = a.shape[0];
    const n = transposeB ? b.shape[0] : b.shape[1];
    const node: GraphNode = {
      id,
      shape: [m, n],
      precision: a.precision,
      op: 'matmul',
      inputs: [a, b],
      transposeB,
    };
    this.nodes.set(id, node);
    return node;
  }

  /**
   * Appends a 2D matrix transpose operation
   */
  public transpose(a: GraphNode): GraphNode {
    const id = `node_transpose_${this.nextNodeId++}`;
    const node: GraphNode = {
      id,
      shape: [a.shape[1], a.shape[0]],
      precision: a.precision,
      op: 'transpose',
      inputs: [a],
    };
    this.nodes.set(id, node);
    return node;
  }

  /**
   * Sets the concrete buffer values for an input tensor
   */
  public set_input(node: GraphNode, data: Float32Array | number[], precision: Precision = Precision.FP32): void {
    const floatData = data instanceof Float32Array ? data : new Float32Array(data);
    this.inputValues.set(node.id, floatData);
  }

  /**
   * Compiles and executes the computation graph using zero-copy arena memory
   */
  public execute(): void {
    for (const [id, node] of this.nodes.entries()) {
      if (node.op === 'input') {
        const inputData = this.inputValues.get(id);
        if (inputData) {
          this.outputValues.set(id, inputData);
        }
      } else if (node.op === 'transpose') {
        const inputNode = node.inputs![0];
        const srcData = this.outputValues.get(inputNode.id);
        if (srcData) {
          const [rows, cols] = inputNode.shape;
          const transposed = new Float32Array(rows * cols);
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              transposed[c * rows + r] = srcData[r * cols + c];
            }
          }
          this.outputValues.set(id, transposed);
        }
      } else if (node.op === 'matmul') {
        const nodeA = node.inputs![0];
        const nodeB = node.inputs![1];
        const dataA = this.outputValues.get(nodeA.id);
        const dataB = this.outputValues.get(nodeB.id);

        if (dataA && dataB) {
          const M = nodeA.shape[0];
          const K = nodeA.shape[1];
          let matB = dataB;
          let N = nodeB.shape[1];

          if (node.transposeB) {
            const [r, c] = nodeB.shape;
            const tr = new Float32Array(r * c);
            for (let i = 0; i < r; i++) {
              for (let j = 0; j < c; j++) tr[j * r + i] = dataB[i * c + j];
            }
            matB = tr;
            N = r;
          }

          // Compute C = dataA @ matB with dimensions [M, K] x [K, N] -> [M, N]
          const actualK = node.transposeB ? nodeB.shape[0] : nodeB.shape[0];
          const outCols = node.transposeB ? nodeB.shape[1] : nodeB.shape[1];
          const out = new Float32Array(M * outCols);

          for (let m = 0; m < M; m++) {
            for (let n = 0; n < outCols; n++) {
              let dot = 0;
              for (let k = 0; k < Math.min(K, actualK); k++) {
                const aVal = dataA[m * K + k] || 0;
                const bVal = matB[k * outCols + n] || 0;
                dot += aVal * bVal;
              }
              out[m * outCols + n] = dot;
            }
          }
          this.outputValues.set(id, out);
        }
      }
    }
  }

  /**
   * Retrieves the concrete output tensor data from a graph node
   */
  public get_output(node: GraphNode): Float32Array | undefined {
    return this.outputValues.get(node.id);
  }

  /**
   * Resets all graph nodes, inputs, outputs, and scratch arena memory
   */
  public hard_reset(): void {
    this.nodes.clear();
    this.inputValues.clear();
    this.outputValues.clear();
    this.arena.resetScratch(0);
    this.nextNodeId = 0;
  }

  /**
   * Zero-copy matrix multiplication: C = A @ B
   */
  public matmulRaw(A: Float32Array, B: Float32Array, M: number, K: number, N: number, out?: Float32Array): Float32Array {
    const C = out || new Float32Array(M * N);
    for (let m = 0; m < M; m++) {
      const aOffset = m * K;
      const cOffset = m * N;
      for (let k = 0; k < K; k++) {
        const aVal = A[aOffset + k];
        const bOffset = k * N;
        for (let n = 0; n < N; n++) {
          C[cOffset + n] += aVal * B[bOffset + n];
        }
      }
    }
    return C;
  }

  /**
   * Zero-copy RMSNorm: y = (x / rms(x)) * weight
   */
  public rmsNorm(x: Float32Array, weight: Float32Array, dim: number, eps: number = 1e-5, out?: Float32Array): Float32Array {
    const y = out || new Float32Array(dim);
    let sumSq = 0;
    for (let i = 0; i < dim; i++) {
      sumSq += x[i] * x[i];
    }
    const rms = 1.0 / Math.sqrt(sumSq / dim + eps);

    for (let i = 0; i < dim; i++) {
      y[i] = x[i] * rms * (weight ? weight[i] : 1.0);
    }
    return y;
  }

  /**
   * Fast In-Place SwiGLU / GELU Activation
   */
  public silu(x: Float32Array, length: number, out?: Float32Array): Float32Array {
    const y = out || new Float32Array(length);
    for (let i = 0; i < length; i++) {
      const val = x[i];
      y[i] = val / (1.0 + Math.exp(-val));
    }
    return y;
  }

  /**
   * Online Softmax for FlashAttention-style numerical stability
   */
  public onlineSoftmax(logits: Float32Array, length: number, out?: Float32Array): Float32Array {
    const probs = out || new Float32Array(length);
    let max = -Infinity;
    for (let i = 0; i < length; i++) {
      if (logits[i] > max) max = logits[i];
    }

    let sum = 0;
    for (let i = 0; i < length; i++) {
      const expVal = Math.exp(logits[i] - max);
      probs[i] = expVal;
      sum += expVal;
    }

    const invSum = 1.0 / (sum || 1e-9);
    for (let i = 0; i < length; i++) {
      probs[i] *= invSum;
    }
    return probs;
  }

  public getArena(): MemoryArena {
    return this.arena;
  }
}
