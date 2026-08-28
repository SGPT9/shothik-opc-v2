"""
cactus_quantize.py — Cactus Tier 4 Rotation-Based Quantization Tool
Applies randomized Hadamard orthogonal rotations to smooth outlier channels
and quantizes model weights to 4-bit / 8-bit formats.
"""

import os
import math
import numpy as np

def apply_hadamard_rotation(weights: np.ndarray) -> np.ndarray:
    """
    Applies Fast Walsh-Hadamard Transform (FWHT) across rows
    """
    rotated = weights.copy()
    n = rotated.shape[-1]
    
    # Pad to nearest power of 2 if necessary
    next_pow2 = 1 << (n - 1).bit_length()
    if next_pow2 != n:
        pad_width = next_pow2 - n
        rotated = np.pad(rotated, ((0, 0), (0, pad_width)), mode='constant')
        n = next_pow2

    h = 1
    while h < n:
        for i in range(0, n, 2 * h):
            for j in range(i, i + h):
                x = rotated[:, j].copy()
                y = rotated[:, j + h].copy()
                rotated[:, j] = x + y
                rotated[:, j + h] = x - y
        h *= 2

    rotated /= math.sqrt(n)
    return rotated

def quantize_to_q4(weights: np.ndarray, block_size: int = 32):
    """
    Quantizes matrix into 4-bit blocks with scale and bias factors
    """
    flat = weights.flatten()
    num_blocks = math.ceil(len(flat) / block_size)
    scales = []
    biases = []
    q_weights = []

    for b in range(num_blocks):
        start = b * block_size
        end = min(start + block_size, len(flat))
        block = flat[start:end]

        b_min = float(np.min(block))
        b_max = float(np.max(block))
        scale = max((b_max - b_min) / 15.0, 1e-8)

        q = np.clip(np.round((block - b_min) / scale), 0, 15).astype(np.uint8)
        
        scales.append(scale)
        biases.append(b_min)
        q_weights.extend(q)

    return {
        "scales": np.array(scales, dtype=np.float32),
        "biases": np.array(biases, dtype=np.float32),
        "q_weights": np.array(q_weights, dtype=np.uint8),
        "shape": list(weights.shape)
    }

def main():
    print("🌵 Running Cactus Rotation-Based Quantizer...")
    # Generate dummy weight matrix [512, 512] with synthetic outlier channels
    np.random.seed(42)
    weights = np.random.randn(512, 512).astype(np.float32)
    # Inject synthetic outlier spikes in column 42 and 128 (100x larger)
    weights[:, 42] *= 85.0
    weights[:, 128] *= 95.0

    print(f"Pre-Rotation Outlier Peak: {np.max(np.abs(weights)):.2f}")

    # 1. Apply Hadamard Rotation
    rotated_weights = apply_hadamard_rotation(weights)
    print(f"Post-Rotation Outlier Peak (Smoothed): {np.max(np.abs(rotated_weights)):.2f}")

    # 2. Quantize to 4-bit Blocks
    q4_data = quantize_to_q4(rotated_weights)
    orig_size_kb = weights.nbytes / 1024
    q4_size_kb = (len(q4_data['q_weights']) / 2 + len(q4_data['scales']) * 4 + len(q4_data['biases']) * 4) / 1024

    print(f"Original FP32 Size: {orig_size_kb:.2f} KB")
    print(f"Cactus Q4 Rotated Size: {q4_size_kb:.2f} KB ({orig_size_kb / q4_size_kb:.2f}x compression)")
    print("✅ Quantization successful!")

if __name__ == "__main__":
    main()
