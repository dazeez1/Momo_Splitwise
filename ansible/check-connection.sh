#!/bin/bash
# Quick connection check script

echo "=== Connection Check ==="
echo ""
echo "1. Checking current IP..."
CURRENT_IP=$(curl -s https://api.ipify.org)
echo "   Current IP: $CURRENT_IP"
echo ""
echo "2. Testing Bastion SSH..."
timeout 5 ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no azureuser@72.146.32.202 "echo 'Bastion: OK'" 2>&1 && echo "   ✓ Bastion is reachable" || echo "   ✗ Bastion connection failed"
echo ""
echo "3. Testing Application VM (via Bastion)..."
timeout 10 ssh -o ConnectTimeout=5 -J azureuser@72.146.32.202 azureuser@10.0.2.4 "echo 'App VM: OK'" 2>&1 && echo "   ✓ Application VM is reachable" || echo "   ✗ Application VM connection failed"
echo ""
echo "=== Next Steps ==="
echo "If connections fail:"
echo "  1. Update allowed_ssh_ip_address in terraform/terraform.tfvars"
echo "  2. Run: cd terraform && terraform apply"
echo "  3. Wait 2-3 minutes for NSG rules to update"
