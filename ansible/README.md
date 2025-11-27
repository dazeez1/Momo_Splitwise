# Ansible Configuration Management

This directory contains Ansible playbooks and roles for configuring the Momo Splitwise application infrastructure.

## Overview

Ansible is used to automate the configuration of the Application VM, including:
- Docker Engine installation
- Docker Compose installation
- Azure Container Registry (ACR) authentication setup
- System optimizations

## Directory Structure

```
ansible/
├── ansible.cfg              # Ansible configuration
├── inventory/               # Host inventory files
│   ├── hosts.yml           # Main inventory (update with your IPs)
│   └── hosts.yml.example   # Example inventory template
├── playbooks/              # Ansible playbooks
│   └── main.yml           # Main playbook for VM configuration
├── roles/                  # Reusable Ansible roles
│   ├── docker/            # Docker installation role
│   └── acr-auth/          # ACR authentication role
├── group_vars/             # Group-specific variables
│   └── application.yml    # Variables for application hosts
└── README.md              # This file
```

## Prerequisites

1. **Ansible installed** on your local machine:
   ```bash
   # macOS
   brew install ansible
   
   # Ubuntu/Debian
   sudo apt-get install ansible
   
   # Or using pip
   pip3 install ansible
   ```

2. **SSH access configured**:
   - SSH key pair generated and added to Azure VMs
   - Private key at `~/.ssh/id_rsa`
   - Public key added to VMs during Terraform deployment

3. **Terraform outputs available**:
   - Infrastructure must be deployed with Terraform
   - You'll need the VM IP addresses and ACR details

## Quick Start

### 1. Get Infrastructure Details

After Terraform deployment, get the required information:

```bash
cd terraform
terraform output -json > ../ansible/terraform_outputs.json
```

Or manually get the values:

```bash
terraform output bastion_host_public_ip
terraform output application_vm_private_ip
terraform output container_registry_name
terraform output resource_group_name
```

### 2. Configure Inventory

Copy the example inventory and update with your values:

```bash
cd ansible
cp inventory/hosts.yml.example inventory/hosts.yml
```

Edit `inventory/hosts.yml` and update:
- `ansible_host` for `bastion_host` (use `bastion_host_public_ip`)
- `ansible_host` for `application_vm` (use `application_vm_private_ip`)
- `ProxyCommand` IP in `ansible_ssh_common_args` (use `bastion_host_public_ip`)

### 3. Configure Group Variables

Edit `group_vars/application.yml` and update:
- `acr_name`: Your ACR name from Terraform output
- `acr_resource_group`: Your resource group name from Terraform output

### 4. Test Connection

Test SSH connection to the Bastion host:

```bash
ansible bastion -i inventory/hosts.yml -m ping
```

Test SSH connection to Application VM (via Bastion):

```bash
ansible application -i inventory/hosts.yml -m ping
```

### 5. Run the Playbook

Run the main playbook to configure the Application VM:

```bash
ansible-playbook -i inventory/hosts.yml playbooks/main.yml
```

Or run specific roles:

```bash
# Only install Docker
ansible-playbook -i inventory/hosts.yml playbooks/main.yml --tags docker

# Only configure ACR authentication
ansible-playbook -i inventory/hosts.yml playbooks/main.yml --tags acr-auth
```

## Playbooks

### Main Playbook (`playbooks/main.yml`)

The main playbook configures the Application VM with:
- System package updates
- Docker Engine installation
- Docker Compose installation
- ACR authentication setup
- User permissions configuration

**Usage:**
```bash
ansible-playbook -i inventory/hosts.yml playbooks/main.yml
```

## Roles

### Docker Role (`roles/docker/`)

Installs and configures Docker Engine and Docker Compose.

**Features:**
- Adds Docker's official repository
- Installs Docker CE, CLI, and Containerd
- Installs Docker Compose (standalone and plugin)
- Configures Docker daemon with logging and storage optimizations
- Adds users to docker group

**Variables:**
- `docker_compose_version`: Docker Compose version (default: "2.24.0")
- `docker_users`: List of users to add to docker group

### ACR Auth Role (`roles/acr-auth/`)

Configures Docker to authenticate with Azure Container Registry using Managed Identity.

**Features:**
- Installs Azure CLI (if not present)
- Creates ACR login script
- Sets up systemd service for automatic ACR authentication
- Performs initial ACR login

**Requirements:**
- Azure Managed Identity must be assigned to the VM
- Managed Identity must have `AcrPull` role on the ACR

**Variables:**
- `acr_name`: Name of the Azure Container Registry
- `acr_resource_group`: Resource group containing the ACR

## Inventory Configuration

The inventory file defines the target hosts. The Application VM is in a private subnet, so access is through the Bastion host using SSH ProxyCommand.

**Bastion Host:**
- Public IP address
- Direct SSH access from your machine

**Application VM:**
- Private IP address
- SSH access via Bastion (jump host)
- Uses ProxyCommand for SSH tunneling

## Troubleshooting

### Connection Issues

**Problem:** Cannot connect to Bastion host
```bash
# Test SSH connection manually
ssh azureuser@<bastion_public_ip>

# Check SSH key permissions
chmod 600 ~/.ssh/id_rsa
```

**Problem:** Cannot connect to Application VM via Bastion
```bash
# Test SSH connection manually
ssh -J azureuser@<bastion_public_ip> azureuser@<app_vm_private_ip>

# Verify ProxyCommand syntax in inventory
```

### Docker Installation Issues

**Problem:** Docker installation fails
```bash
# Check if Docker repository is accessible
curl -fsSL https://download.docker.com/linux/ubuntu/gpg

# Verify system is Ubuntu/Debian
ansible application -i inventory/hosts.yml -m setup -a "filter=ansible_distribution*"
```

### ACR Authentication Issues

**Problem:** ACR login fails
```bash
# Check Managed Identity is assigned
az vm identity show --name <vm-name> --resource-group <rg-name>

# Verify Managed Identity has AcrPull role
az role assignment list --assignee <identity-id> --scope /subscriptions/<sub-id>/resourceGroups/<rg-name>/providers/Microsoft.ContainerRegistry/registries/<acr-name>

# Test ACR login manually on VM
ssh -J azureuser@<bastion_ip> azureuser@<app_vm_ip>
az login --identity
az acr login --name <acr-name>
```

## Best Practices

✅ **Idempotency**: All tasks are idempotent - safe to run multiple times  
✅ **Modular Design**: Separated into reusable roles  
✅ **Security**: Uses SSH keys and Managed Identity for authentication  
✅ **Documentation**: Comprehensive inline comments and README files  
✅ **Error Handling**: Proper error checking and informative messages  

## Next Steps

After Ansible configuration is complete:

1. **Build and push Docker images** to ACR
2. **Deploy containers** using Docker Compose or Kubernetes
3. **Set up CI/CD pipeline** with GitHub Actions
4. **Configure monitoring** and logging

## Support

For issues or questions:
- Check Ansible documentation: https://docs.ansible.com/
- Review playbook output for error messages
- Verify infrastructure is deployed correctly with Terraform

