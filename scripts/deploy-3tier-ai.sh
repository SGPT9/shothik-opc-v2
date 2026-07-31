#!/usr/bin/env bash
# ==============================================================================
# Shothik 3-Tier AI Infrastructure Setup Script (Colibri C Engine + AirLLM 2.8T)
# ==============================================================================

set -e

echo "🚀 Starting Shothik 3-Tier AI Infrastructure Deployment..."

# 1. System Dependencies & Build Tools
sudo apt update && sudo apt install -y build-essential git wget python3.11 python3.11-venv nvme-cli

# 2. Setup High-Speed NVMe Storage Mount
echo "📁 Setting up NVMe mount directory (/mnt/nvme)..."
sudo mkdir -p /mnt/nvme
sudo chown -R $USER:$USER /mnt/nvme

# 3. Clone & Compile Colibri C Engine (Tier 2 Medium MoE)
echo "⚡ Building Colibri C Inference Engine..."
if [ ! -d "colibri" ]; then
    git clone https://github.com/JustVugg/colibri.git
fi
cd colibri && make && cd ..

# 4. Setup Python Virtual Environment for AirLLM v3.1.0 (Tier 3 Frontier 2.8T MoE)
echo "🧠 Setting up Python environment for AirLLM v3.1.0 (Kimi K3 2.8T)..."
python3.11 -m venv venv_airllm
source venv_airllm/bin/activate
pip install --upgrade pip
pip install "airllm>=3.1.0" compressed-tensors "transformers>=4.56.0,<5.0.0"

# 5. Create Systemd Service for Colibri C Daemon
echo "⚙️ Creating Colibri Systemd Service..."
sudo bash -c 'cat <<EOF > /etc/systemd/system/colibri.service
[Unit]
Description=Colibri C Inference Engine Daemon
After=network.target

[Service]
Type=simple
User='$USER'
WorkingDirectory='$(pwd)'/colibri
ExecStart='$(pwd)'/colibri/colibri --model /mnt/nvme/qwen_moe.gguf --port 8080
Restart=always

[Install]
WantedBy=multi-user.target
EOF'

sudo systemctl daemon-reload
sudo systemctl enable colibri
sudo systemctl restart colibri

echo "✅ Shothik 3-Tier AI Infrastructure setup completed successfully!"
