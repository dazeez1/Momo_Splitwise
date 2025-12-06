#!/bin/bash
# VM Connection Diagnostic Script
# Helps diagnose why VMs are not reachable

set -e

echo "🔍 VM Connection Diagnostics"
echo "============================"
echo ""

# Check if Azure CLI is available
if ! command -v az > /dev/null 2>&1; then
    echo "❌ Azure CLI not found. Please install it first:"
    echo "   https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in
if ! az account show > /dev/null 2>&1; then
    echo "❌ Not logged into Azure. Please run: az login"
    exit 1
fi

echo "✅ Azure CLI is available and authenticated"
echo ""

# Get resource group and VM names (you may need to adjust these)
read -p "Enter resource group name (or press Enter to skip): " RG_NAME
if [ -z "$RG_NAME" ]; then
    echo "⚠️  Skipping VM status checks (resource group not provided)"
    echo ""
    echo "To check VM status manually, run:"
    echo "  az vm list --resource-group <rg-name> --show-details --query '[].{Name:name, PowerState:powerState, PublicIP:publicIps}' -o table"
    exit 0
fi

echo ""
echo "📋 Checking VMs in resource group: $RG_NAME"
echo ""

# List all VMs
VMS=$(az vm list --resource-group "$RG_NAME" --query '[].name' -o tsv 2>/dev/null || echo "")

if [ -z "$VMS" ]; then
    echo "⚠️  No VMs found in resource group: $RG_NAME"
    echo ""
    echo "Available resource groups:"
    az group list --query '[].name' -o table
    exit 1
fi

echo "Found VMs:"
for VM in $VMS; do
    echo "  - $VM"
done
echo ""

# Check each VM
for VM in $VMS; do
    echo "🔍 Checking VM: $VM"
    echo "-------------------"
    
    # Get VM status
    POWER_STATE=$(az vm show --name "$VM" --resource-group "$RG_NAME" --query 'powerState' -o tsv 2>/dev/null || echo "Unknown")
    echo "  Power State: $POWER_STATE"
    
    # Get public IP
    PUBLIC_IP=$(az vm show --name "$VM" --resource-group "$RG_NAME" --show-details --query 'publicIps' -o tsv 2>/dev/null || echo "None")
    echo "  Public IP: ${PUBLIC_IP:-None}"
    
    # Get private IP
    PRIVATE_IP=$(az vm show --name "$VM" --resource-group "$RG_NAME" --show-details --query 'privateIps' -o tsv 2>/dev/null || echo "None")
    echo "  Private IP: ${PRIVATE_IP:-None}"
    
    # Get NSG associated with VM
    NSG_ID=$(az vm show --name "$VM" --resource-group "$RG_NAME" --query 'networkProfile.networkInterfaces[0].id' -o tsv 2>/dev/null | xargs -I {} az network nic show --ids {} --query 'networkSecurityGroup.id' -o tsv 2>/dev/null || echo "")
    
    if [ -n "$NSG_ID" ]; then
        NSG_NAME=$(basename "$NSG_ID")
        echo "  NSG: $NSG_NAME"
        
        # Check SSH rules
        echo "  SSH Rules:"
        az network nsg rule list --nsg-name "$NSG_NAME" --resource-group "$RG_NAME" --query "[?direction=='Inbound' && (destinationPortRange=='22' || destinationPortRanges[?contains(@, '22')])].{Name:name, Priority:priority, Source:sourceAddressPrefix, Access:access}" -o table 2>/dev/null || echo "    (Unable to list rules)"
    else
        echo "  NSG: Not found"
    fi
    
    echo ""
done

echo "📝 Recommendations:"
echo "-------------------"
echo ""
echo "1. If VM is stopped, start it:"
echo "   az vm start --name <vm-name> --resource-group $RG_NAME"
echo ""
echo "2. Check NSG rules allow SSH from your IP:"
echo "   az network nsg rule list --nsg-name <nsg-name> --resource-group $RG_NAME -o table"
echo ""
echo "3. To allow SSH from anywhere (for testing):"
echo "   az network nsg rule create \\"
echo "     --resource-group $RG_NAME \\"
echo "     --nsg-name <nsg-name> \\"
echo "     --name allow-ssh-from-internet \\"
echo "     --priority 1000 \\"
echo "     --direction Inbound \\"
echo "     --access Allow \\"
echo "     --protocol Tcp \\"
echo "     --destination-port-ranges 22 \\"
echo "     --source-address-prefixes '*'"
echo ""
echo "4. For GitHub Actions, you may need to allow SSH from 0.0.0.0/0"
echo "   (GitHub Actions runners use dynamic IPs)"

