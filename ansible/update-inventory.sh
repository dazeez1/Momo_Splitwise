#!/bin/bash
# Script to update Ansible inventory from Terraform outputs
# 
# Usage: ./update-inventory.sh [terraform_directory]
# 
# This script reads Terraform outputs and updates the Ansible inventory file

set -e

TERRAFORM_DIR="${1:-../terraform}"
INVENTORY_FILE="inventory/hosts.yml"
GROUP_VARS_FILE="group_vars/application.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Updating Ansible inventory from Terraform outputs...${NC}"

# Check if Terraform directory exists
if [ ! -d "$TERRAFORM_DIR" ]; then
    echo -e "${RED}Error: Terraform directory not found: $TERRAFORM_DIR${NC}"
    exit 1
fi

# Change to Terraform directory to run terraform output
cd "$TERRAFORM_DIR"

# Get Terraform outputs
echo -e "${YELLOW}Fetching Terraform outputs...${NC}"
BASTION_IP=$(terraform output -raw bastion_host_public_ip 2>/dev/null || echo "")
APP_VM_IP=$(terraform output -raw application_vm_private_ip 2>/dev/null || echo "")
ACR_NAME=$(terraform output -raw container_registry_name 2>/dev/null || echo "")
RESOURCE_GROUP=$(terraform output -raw resource_group_name 2>/dev/null || echo "")

# Return to ansible directory
cd - > /dev/null

# Check if outputs are empty
if [ -z "$BASTION_IP" ] || [ -z "$APP_VM_IP" ]; then
    echo -e "${RED}Error: Could not fetch Terraform outputs. Make sure Terraform has been applied.${NC}"
    exit 1
fi

echo -e "${GREEN}Found Terraform outputs:${NC}"
echo "  Bastion IP: $BASTION_IP"
echo "  Application VM IP: $APP_VM_IP"
echo "  ACR Name: $ACR_NAME"
echo "  Resource Group: $RESOURCE_GROUP"

# Update inventory file
if [ -f "$INVENTORY_FILE" ]; then
    echo -e "${YELLOW}Updating inventory file...${NC}"
    
    # Update Bastion IP
    sed -i.bak "s/ansible_host: \".*\"/ansible_host: \"$BASTION_IP\"/" "$INVENTORY_FILE"
    sed -i.bak "/bastion_host:/,/ansible_ssh_common_args:/ s/ansible_host: \".*\"/ansible_host: \"$BASTION_IP\"/" "$INVENTORY_FILE"
    
    # Update Application VM IP
    sed -i.bak "/application_vm:/,/ansible_ssh_common_args:/ s/ansible_host: \".*\"/ansible_host: \"$APP_VM_IP\"/" "$INVENTORY_FILE"
    
    # Update ProxyCommand with Bastion IP
    sed -i.bak "s|ProxyCommand=\"ssh -W %h:%p -i ~/.ssh/id_rsa azureuser@.*\"|ProxyCommand=\"ssh -W %h:%p -i ~/.ssh/id_rsa azureuser@$BASTION_IP\"|" "$INVENTORY_FILE"
    
    # Remove backup file
    rm -f "${INVENTORY_FILE}.bak"
    
    echo -e "${GREEN}Inventory file updated successfully!${NC}"
else
    echo -e "${YELLOW}Inventory file not found. Creating from example...${NC}"
    cp inventory/hosts.yml.example "$INVENTORY_FILE"
    
    # Update values
    sed -i.bak "s/ansible_host: \".*\"/ansible_host: \"$BASTION_IP\"/" "$INVENTORY_FILE"
    sed -i.bak "/application_vm:/,/ansible_ssh_common_args:/ s/ansible_host: \".*\"/ansible_host: \"$APP_VM_IP\"/" "$INVENTORY_FILE"
    sed -i.bak "s|ProxyCommand=\"ssh -W %h:%p -i ~/.ssh/id_rsa azureuser@.*\"|ProxyCommand=\"ssh -W %h:%p -i ~/.ssh/id_rsa azureuser@$BASTION_IP\"|" "$INVENTORY_FILE"
    
    rm -f "${INVENTORY_FILE}.bak"
fi

# Update group_vars file
if [ -f "$GROUP_VARS_FILE" ] && [ -n "$ACR_NAME" ] && [ -n "$RESOURCE_GROUP" ]; then
    echo -e "${YELLOW}Updating group variables...${NC}"
    
    sed -i.bak "s/acr_name: \".*\"/acr_name: \"$ACR_NAME\"/" "$GROUP_VARS_FILE"
    sed -i.bak "s/acr_resource_group: \".*\"/acr_resource_group: \"$RESOURCE_GROUP\"/" "$GROUP_VARS_FILE"
    
    rm -f "${GROUP_VARS_FILE}.bak"
    
    echo -e "${GREEN}Group variables updated successfully!${NC}"
fi

echo -e "${GREEN}✓ Inventory update complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Review the updated inventory file: $INVENTORY_FILE"
echo "  2. Test connection: ansible all -i $INVENTORY_FILE -m ping"
echo "  3. Run playbook: ansible-playbook -i $INVENTORY_FILE playbooks/main.yml"

