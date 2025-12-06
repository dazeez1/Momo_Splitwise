#!/bin/bash
# Connection test script for Ansible deployment troubleshooting
# Usage: ./check-connection.sh [VM_IP] [SSH_KEY_PATH]

set -e

VM_IP="${1:-${APPLICATION_VM_IP}}"
SSH_KEY="${2:-${HOME}/.ssh/id_rsa}"

if [ -z "$VM_IP" ]; then
    echo "❌ Error: VM IP address not provided"
    echo "Usage: $0 [VM_IP] [SSH_KEY_PATH]"
    echo "   or set APPLICATION_VM_IP environment variable"
    exit 1
fi

echo "🔍 Testing connection to $VM_IP..."
echo ""

# Test 1: Ping test
echo "1️⃣ Testing ICMP connectivity..."
# Use ping with count limit (works on both Linux and macOS)
if ping -c 3 -W 5 "$VM_IP" > /dev/null 2>&1; then
    echo "   ✅ Ping successful"
else
    echo "   ⚠️  Ping failed (ICMP may be blocked by firewall)"
fi
echo ""

# Test 2: Port connectivity
echo "2️⃣ Testing SSH port (22) connectivity..."
if command -v nc > /dev/null 2>&1; then
    # macOS nc uses different syntax, try both
    if nc -zv -G 5 "$VM_IP" 22 2>&1 || nc -zv -w 5 "$VM_IP" 22 2>&1; then
        echo "   ✅ SSH port 22 is reachable"
    else
        echo "   ⚠️  Cannot connect to SSH port 22 (will try SSH directly)"
        echo "      This may be normal if port scanning is blocked"
    fi
else
    echo "   ⚠️  netcat (nc) not available, skipping port test"
fi
echo ""

# Test 3: SSH key validation
echo "3️⃣ Validating SSH key..."
if [ ! -f "$SSH_KEY" ]; then
    echo "   ❌ SSH key not found at: $SSH_KEY"
    exit 1
fi

if ! ssh-keygen -l -f "$SSH_KEY" > /dev/null 2>&1; then
    echo "   ❌ SSH key is invalid or corrupted"
    exit 1
fi

KEY_TYPE=$(ssh-keygen -l -f "$SSH_KEY" | awk '{print $4}')
echo "   ✅ SSH key is valid ($KEY_TYPE)"
chmod 600 "$SSH_KEY" 2>/dev/null || true
echo ""

# Test 4: SSH authentication
echo "4️⃣ Testing SSH authentication..."
MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    # SSH has built-in ConnectTimeout, no need for external timeout command
    if ssh -i "$SSH_KEY" \
        -o ConnectTimeout=60 \
        -o StrictHostKeyChecking=no \
        -o UserKnownHostsFile=/dev/null \
        -o ServerAliveInterval=30 \
        -o ServerAliveCountMax=3 \
        azureuser@"$VM_IP" \
        "echo 'SSH connection successful' && uname -a" 2>&1; then
        echo "   ✅ SSH authentication successful"
        echo ""
        echo "5️⃣ Testing system requirements..."
        ssh -i "$SSH_KEY" \
            -o ConnectTimeout=60 \
            -o StrictHostKeyChecking=no \
            azureuser@"$VM_IP" \
            "python3 --version && docker --version && docker compose version" 2>&1 || true
        echo ""
        echo "✅ All connection tests passed!"
        exit 0
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo "   ⏳ SSH connection attempt $RETRY_COUNT failed, retrying in 5 seconds..."
            sleep 5
        else
            echo "   ❌ SSH authentication failed after $MAX_RETRIES attempts"
            echo ""
            echo "   Troubleshooting steps:"
            echo "   1. Verify SSH_PRIVATE_KEY secret is correct in GitHub"
            echo "   2. Check if VM is running: az vm show --name <vm-name> --resource-group <rg> --query 'powerState'"
            echo "   3. Verify NSG rules allow SSH from your IP"
            echo "   4. Check VM public IP: az vm show --name <vm-name> --resource-group <rg> --show-details --query 'publicIps'"
            echo "   5. Test SSH manually: ssh -i $SSH_KEY azureuser@$VM_IP"
            exit 1
        fi
    fi
done
