#!/bin/bash
# Backend Verification Script
# This script verifies the backend is running and accessible

set -e

echo "=== Backend Verification ==="
echo ""

# Get VM details from Terraform
cd "$(dirname "$0")/../terraform" || exit 1

VM_PUBLIC_IP=$(terraform output -raw application_vm_public_ip 2>/dev/null || echo "")
VM_PRIVATE_IP=$(terraform output -raw application_vm_private_ip 2>/dev/null || echo "")
BASTION_IP=$(terraform output -raw bastion_host_public_ip 2>/dev/null || echo "")

echo "📋 Infrastructure Details:"
echo "  Application VM Public IP: ${VM_PUBLIC_IP}"
echo "  Application VM Private IP: ${VM_PRIVATE_IP}"
echo "  Bastion Host IP: ${BASTION_IP}"
echo ""

# Check if SSH key exists
SSH_KEY="${HOME}/.ssh/id_rsa"
if [ ! -f "$SSH_KEY" ]; then
    echo "⚠️  SSH key not found at: $SSH_KEY"
    echo "   Please ensure your SSH key is available for verification"
    echo ""
fi

echo "🔍 Verification Methods:"
echo ""
echo "1. Check GitHub Actions Deployment Status:"
echo "   https://github.com/dazeez1/Momo_Splitwise/actions"
echo "   Look for successful deployment with 'Deployment completed successfully'"
echo ""

echo "2. SSH to VM and Check Containers:"
if [ -n "$BASTION_IP" ] && [ -n "$VM_PRIVATE_IP" ]; then
    echo "   ssh -J azureuser@${BASTION_IP} azureuser@${VM_PRIVATE_IP}"
    echo ""
    echo "   Then run:"
    echo "   docker ps"
    echo "   curl http://localhost:5001/health"
    echo "   docker logs momo-splitwise-backend --tail 50"
    echo ""
fi

echo "3. Test via Application Gateway (once provisioned):"
echo "   curl http://68.221.206.80/health"
echo "   (Should return HTTP 200 with JSON when gateway is ready)"
echo ""

echo "4. Use Ansible to Verify:"
echo "   cd ansible"
echo "   ansible application -i inventory/production.yml -m shell -a 'docker ps'"
echo "   ansible application -i inventory/production.yml -m uri -a 'url=http://localhost:5001/health'"
echo ""

echo "✅ Expected Backend Status:"
echo "   - Container 'momo-splitwise-backend' should be running"
echo "   - Container 'momo-mongo' should be running"
echo "   - Health endpoint should return: {\"status\":\"OK\",...}"
echo ""

