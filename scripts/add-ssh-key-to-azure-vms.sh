#!/bin/bash
# Script to add the new SSH public key to Azure VMs
# This updates the authorized_keys on the VMs

set -e

RG_NAME="${1:-momo-splitwise-prod-rg}"
PUBLIC_KEY_FILE="${2:-$HOME/.ssh/id_rsa_momo_splitwise.pub}"

if [ ! -f "$PUBLIC_KEY_FILE" ]; then
    echo "❌ Public key file not found: $PUBLIC_KEY_FILE"
    exit 1
fi

echo "🔑 Adding SSH public key to Azure VMs"
echo "Resource Group: $RG_NAME"
echo "Public Key: $PUBLIC_KEY_FILE"
echo ""

# Read the public key
PUBLIC_KEY=$(cat "$PUBLIC_KEY_FILE")

# List VMs
VMS=$(az vm list --resource-group "$RG_NAME" --query '[].name' -o tsv)

if [ -z "$VMS" ]; then
    echo "❌ No VMs found in resource group: $RG_NAME"
    exit 1
fi

echo "Found VMs:"
for VM in $VMS; do
    echo "  - $VM"
done
echo ""

# Update each VM
for VM in $VMS; do
    echo "📝 Updating VM: $VM"
    
    # Get VM public IP
    VM_IP=$(az vm show --name "$VM" --resource-group "$RG_NAME" --show-details --query 'publicIps' -o tsv 2>/dev/null || echo "")
    
    if [ -z "$VM_IP" ]; then
        echo "  ⚠️  No public IP found for $VM, skipping..."
        continue
    fi
    
    echo "  Public IP: $VM_IP"
    
    # Add the public key using Azure CLI
    # This adds the key to the VM's authorized_keys
    # First ensure .ssh directory exists, then add the key
    az vm run-command invoke \
        --resource-group "$RG_NAME" \
        --name "$VM" \
        --command-id RunShellScript \
        --scripts "mkdir -p ~/.ssh && echo '$PUBLIC_KEY' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && chmod 700 ~/.ssh && sort -u ~/.ssh/authorized_keys -o ~/.ssh/authorized_keys" \
        --query "value[0].message" -o tsv
    
    echo "  ✅ SSH key added to $VM"
    echo ""
done

echo "✅ All VMs updated!"
echo ""
echo "Next steps:"
echo "1. Add the PRIVATE key to GitHub Secrets (SSH_PRIVATE_KEY)"
echo "2. Test connection: ssh -i ~/.ssh/id_rsa_momo_splitwise azureuser@<VM_IP>"

