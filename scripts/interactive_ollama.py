#!/usr/bin/env python3
"""
Interactive Python Bridge to Local Ollama GPU Engine (Qwen2.5-Coder:7b)
Connects directly to http://127.0.0.1:11434 with streaming token output.
"""
import sys
import json
import urllib.request
import urllib.error

# Force UTF-8 for Windows console support
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
DEFAULT_MODEL = "qwen2.5-coder:7b"

def stream_ollama_query(prompt: str, model: str = DEFAULT_MODEL, system_prompt: str = ""):
    payload = {
        "model": model,
        "prompt": prompt,
        "system": system_prompt or "You are Shothik's Lead AI Architect and Autonomous Software Engineer.",
        "stream": True
    }
    
    req = urllib.request.Request(
        OLLAMA_URL,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            for line in response:
                if line:
                    chunk = json.loads(line.decode('utf-8'))
                    if "response" in chunk:
                        sys.stdout.write(chunk["response"])
                        sys.stdout.flush()
            print("\n")
    except urllib.error.URLError as e:
        print(f"\n❌ Error connecting to Ollama at {OLLAMA_URL}: {e}")

def main():
    print("=" * 80)
    print(f"🤖 SHOTHIK INTERACTIVE OLLAMA GPU BRIDGE ({DEFAULT_MODEL})")
    print("=" * 80)
    print("Type your prompt and press Enter. Type 'exit' or 'quit' to close.\n")
    
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
        print(f"Query: {query}\n")
        stream_ollama_query(query)
        return

    while True:
        try:
            user_input = input("👤 Prompt > ").strip()
            if not user_input:
                continue
            if user_input.lower() in ("exit", "quit", "q"):
                print("👋 Exiting Ollama interactive bridge.")
                break
            
            print("\n⚡ [Qwen2.5-Coder Response]:")
            stream_ollama_query(user_input)
            print("-" * 80)
        except (KeyboardInterrupt, EOFError):
            print("\n👋 Exiting.")
            break

if __name__ == "__main__":
    main()
