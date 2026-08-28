"""
export_onnx.py — Exports PyTorch nanoGPT model to ONNX format
Enables direct execution via WebGPU / ONNX Runtime Web in the client browser.
"""

import os
import torch
from model import GPT, GPTConfig

def export():
    # 1. Instantiate 38M Micro-Configuration
    config = GPTConfig(
        block_size=512,
        vocab_size=8192,
        n_layer=6,
        n_head=6,
        n_embd=384,
        bias=False
    )
    model = GPT(config)
    model.eval()

    # 2. Create Dummy Input
    dummy_input = torch.randint(0, 8192, (1, 64), dtype=torch.long)
    
    out_dir = os.path.dirname(__file__)
    onnx_path = os.path.join(out_dir, "shothik_nanogpt_micro_38m.onnx")

    print("Exporting model to ONNX...")
    torch.onnx.export(
        model,
        dummy_input,
        onnx_path,
        export_params=True,
        opset_version=17,
        do_constant_folding=True,
        input_names=["input_ids"],
        output_names=["logits"],
        dynamic_axes={
            "input_ids": {0: "batch_size", 1: "sequence_length"},
            "logits": {0: "batch_size", 1: "sequence_length"}
        }
    )

    size_mb = os.path.getsize(onnx_path) / (1024 * 1024)
    print(f"✅ Exported {onnx_path} successfully ({size_mb:.2f} MB)")

if __name__ == "__main__":
    export()
