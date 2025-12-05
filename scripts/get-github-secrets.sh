#!/bin/bash
# Script to extract Terraform outputs for GitHub Secrets configuration
# Usage: ./scripts/get-github-secrets.sh

set -e

echo "🔍 Extracting Terraform outputs for GitHub Secrets..."
echo ""

cd "$(dirname "$0")/../terraform" || exit 1

# Initialize Terraform if needed
if [ ! -d ".terraform" ]; then
  echo "📦 Initializing Terraform..."
  terraform init -backend=false > /dev/null 2>&1 || terraform init
fi

echo "📋 GitHub Secrets Configuration:"
echo ""
echo "=== Azure Container Registry ==="
ACR_NAME=$(terraform output -raw container_registry_name 2>/dev/null || echo "NOT_FOUND")
ACR_LOGIN_SERVER=$(terraform output -raw container_registry_login_server 2>/dev/null || echo "NOT_FOUND")
ACR_RG=$(terraform output -raw resource_group_name 2>/dev/null || echo "NOT_FOUND")

echo "ACR_NAME=$ACR_NAME"
echo "ACR_LOGIN_SERVER=$ACR_LOGIN_SERVER"
echo "ACR_RESOURCE_GROUP=$ACR_RG"
echo ""

echo "=== Application VM ==="
APP_VM_IP=$(terraform output -raw application_vm_public_ip 2>/dev/null || echo "NOT_FOUND")
echo "APPLICATION_VM_IP=$APP_VM_IP"
echo ""

echo "=== Application Gateway ==="
APP_GATEWAY_IP=$(terraform output -raw application_gateway_fqdn 2>/dev/null || echo "NOT_FOUND")
echo "APPLICATION_GATEWAY_URL=http://$APP_GATEWAY_IP"
echo ""

echo "=== SSH Key ==="
if [ -f ~/.ssh/id_rsa ]; then
  echo "SSH_PRIVATE_KEY=$(cat ~/.ssh/id_rsa)"
  echo ""
  echo "⚠️  Note: Copy the SSH_PRIVATE_KEY value above (it may be long)"
else
  echo "⚠️  SSH private key not found at ~/.ssh/id_rsa"
  echo "   Generate one with: ssh-keygen -t rsa -b 4096 -C 'your_email@example.com'"
  echo ""
fi

echo "=== Azure Service Principal ==="
echo "To create a service principal for GitHub Actions, run:"
echo ""
echo "az ad sp create-for-rbac --name 'momo-splitwise-github-actions' \\"
echo "  --role contributor \\"
echo "  --scopes /subscriptions/<subscription-id>/resourceGroups/$ACR_RG \\"
echo "  --sdk-auth"
echo ""
echo "Copy the JSON output and set it as AZURE_CREDENTIALS secret"
echo ""

echo "=== MongoDB (Optional) ==="
echo "Set these if using MongoDB Atlas:"
echo "MONGODB_URI=mongodb+srv://..."
echo "JWT_SECRET=<your-secret>"
echo "SESSION_SECRET=<your-secret>"
echo ""

echo "✅ Copy the values above and add them as GitHub Secrets:"
echo "   Settings → Secrets and variables → Actions → New repository secret"
echo ""

