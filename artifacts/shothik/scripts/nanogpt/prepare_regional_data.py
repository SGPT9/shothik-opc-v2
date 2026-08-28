"""
prepare_regional_data.py — Dataset Preparation for Shothik nanoGPT
Packages Banglish-Bangla pairs, Steadfast Logistics NER texts, and NBR Tax cases
into uint16 binary memory-mapped files (train.bin, val.bin) for instant loading.
"""

import os
import numpy as np

# Sample regional dataset for Banglish normalization and courier NER
SAMPLE_DATA = [
    # Banglish -> Bangla pairs
    {"src": "ami bhalo achi", "tgt": "আমি ভালো আছি"},
    {"src": "apnar order delivery kobe hobe?", "tgt": "আপনার অর্ডার ডেলিভারি কবে হবে?"},
    {"src": "dhaka theke chittagong delivery charge koto taka?", "tgt": "ঢাকা থেকে চট্টগ্রাম ডেলিভারি চার্জ কত টাকা?"},
    {"src": "bKash payment confirm korun", "tgt": "বিকাশ পেমেন্ট কনফার্ম করুন"},
    {"src": "steadfast parcel tracking id din", "tgt": "স্টেডফাস্ট পার্সেল ট্র্যাকিং আইডি দিন"},
    
    # Steadfast / Pathao Courier NER Orders
    {"src": "Order: Tanvir Ahmed, 01711223344, House 12 Road 5 Dhanmondi Dhaka. COD: 1450 Tk",
     "tgt": '{"name":"Tanvir Ahmed","phone":"01711223344","district":"Dhaka","thana":"Dhanmondi","cod":1450}'},
    {"src": "Customer: Farzana Yasmin, 01812345678, GEC Circle Chittagong. Amount 2200",
     "tgt": '{"name":"Farzana Yasmin","phone":"01812345678","district":"Chattogram","thana":"GEC","cod":2200}'},
    {"src": "Recipient: Sajjad Hossain, 01987654321, Shibganj Sylhet. Cash on delivery 850 taka",
     "tgt": '{"name":"Sajjad Hossain","phone":"01987654321","district":"Sylhet","thana":"Shibganj","cod":850}'},
]

def build_char_vocab():
    chars = sorted(list(set("".join([d["src"] + " -> " + d["tgt"] + "\n" for d in SAMPLE_DATA]))))
    vocab_size = len(chars) + 256 # headroom for UTF-8
    char_to_id = {ch: i for i, ch in enumerate(chars)}
    return char_to_id, vocab_size

def main():
    out_dir = os.path.dirname(__file__)
    char_to_id, vocab_size = build_char_vocab()
    print(f"Generated Vocabulary Size: {vocab_size}")

    # Build token stream
    full_text = ""
    for _ in range(500): # replicate to build decent test memory map
        for item in SAMPLE_DATA:
            full_text += f"{item['src']} -> {item['tgt']}\n"

    tokens = [char_to_id.get(ch, 0) for ch in full_text]
    tokens_np = np.array(tokens, dtype=np.uint16)

    # 90% train, 10% val split
    split_idx = int(len(tokens_np) * 0.9)
    train_data = tokens_np[:split_idx]
    val_data = tokens_np[split_idx:]

    train_path = os.path.join(out_dir, "train.bin")
    val_path = os.path.join(out_dir, "val.bin")

    train_data.tofile(train_path)
    val_data.tofile(val_path)

    print(f"✅ Created {train_path} ({len(train_data):,} tokens)")
    print(f"✅ Created {val_path} ({len(val_data):,} tokens)")

if __name__ == "__main__":
    main()
