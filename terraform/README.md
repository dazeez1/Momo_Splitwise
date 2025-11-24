# Terraform Infrastructure as Code

This directory contains the Terraform configuration for provisioning the complete Azure infrastructure for Momo Splitwise application.

## Architecture Overview

```
Internet
  │
  ├─> Application Gateway (Public IP)
  │     │
  │     ├─> Routes /api/* → Backend (Port 5001)
  │     └─> Routes /* → Frontend (Port 80) [Future]
  │
  ├─> Bastion Host (Public Subnet)
  │     └─> SSH Access Only (from allowed IP)
  │
  └─> Application VM (Private Subnet)
        ├─> Backend Container (Port 5001)
        └─> Frontend Container (Port 80) [Future]

  MongoDB Atlas (External - Provisioned Separately)
```

## Infrastructure Components

### 1. **Network Module** (`modules/network/`)

- Virtual Network (VNet) with CIDR: `10.0.0.0/16`
- Public Subnet: `10.0.1.0/24` (Bastion Host)
- Private Subnet: `10.0.2.0/24` (Application VM)
- Database Subnet: `10.0.3.0/24` (Reserved for future use)
- Application Gateway Subnet: `10.0.4.0/24`

### 2. **Security Module** (`modules/security/`)

- Network Security Groups (NSGs) for each subnet
- Bastion NSG: Allows SSH only from your IP address
- Application NSG: Allows SSH from Bastion, HTTP/HTTPS from Application Gateway
- Database NSG: Allows MongoDB connections from Application VM only

### 3. **Compute Module** (`modules/compute/`)

- **Bastion Host VM**: Small VM (Standard_B1s) in public subnet for SSH access
- **Application VM**: Medium VM (Standard_B2s) in private subnet running containers
- Managed Identity for Application VM (for ACR access)

### 4. **Registry Module** (`modules/registry/`)

- Azure Container Registry (ACR) for storing Docker images
- Admin-enabled for Ansible access
- Private registry with public network access

### 5. **Application Gateway**

- Public-facing load balancer
- Path-based routing:
  - `/api/*` → Backend (Port 5001)
  - `/*` → Frontend (Port 80) [Future]
- Health probe on `/health` endpoint

## Prerequisites

1. **Azure Account**: Active Azure subscription
2. **Azure CLI**: Installed and configured
   ```bash
   az login
   az account set --subscription "YOUR_SUBSCRIPTION_ID"
   ```
3. **Terraform**: Version >= 1.5.0
   ```bash
   terraform version
   ```
4. **SSH Key Pair**: Generate if you don't have one
   ```bash
   ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
   ```

## Setup Instructions

### Step 1: Configure Variables

1. Copy the example variables file:

   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. Edit `terraform.tfvars` with your values:
   - Set `allowed_ssh_ip_address` to your public IP (find it at https://whatismyipaddress.com/)
   - Add your SSH public key (`cat ~/.ssh/id_rsa.pub`)
   - Adjust VM sizes if needed
   - Choose your Azure region

### Step 2: Initialize Terraform

```bash
cd terraform
terraform init
```

This will download the required providers (Azure, Random).

### Step 3: Review the Plan

```bash
terraform plan
```

Review the changes that will be made. You should see:

- Resource group creation
- Virtual network and subnets
- Network security groups
- Container registry
- Two virtual machines (Bastion and Application)
- Application Gateway

### Step 4: Apply the Infrastructure

```bash
terraform apply
```

Type `yes` when prompted. This will take approximately 10-15 minutes to complete.

### Step 5: Get Output Values

After successful deployment, get important values:

```bash
terraform output
```

Key outputs:

- `application_url`: Public URL to access your application
- `bastion_host_public_ip`: IP to SSH into Bastion
- `container_registry_name`: ACR name for pushing images
- `ssh_bastion_command`: Command to connect to Bastion

## Accessing Your Infrastructure

### SSH to Bastion Host

```bash
ssh azureuser@<bastion_host_public_ip>
```

### SSH to Application VM (via Bastion)

From your local machine:

```bash
ssh -J azureuser@<bastion_host_public_ip> azureuser@<application_vm_private_ip>
```

Or from the Bastion Host:

```bash
ssh azureuser@<application_vm_private_ip>
```

### Access Application Gateway

The Application Gateway will be accessible at the public IP address shown in the outputs:

```bash
curl http://<application_gateway_public_ip>/health
```

## Container Registry Access

### Login to ACR

From your local machine (for CI/CD):

```bash
az acr login --name <container_registry_name>
```

Or using admin credentials:

```bash
docker login <container_registry_login_server> \
  -u <container_registry_admin_username> \
  -p <container_registry_admin_password>
```

### Push Images

```bash
# Tag your image
docker tag momo-splitwise-backend:latest <container_registry_login_server>/momo-splitwise-backend:latest

# Push to registry
docker push <container_registry_login_server>/momo-splitwise-backend:latest
```

## Cost Estimation

Approximate monthly costs (Azure East US):

- **Bastion VM (Standard_B1s)**: ~$7-10/month
- **Application VM (Standard_B2s)**: ~$30-35/month
- **Application Gateway (Standard_v2)**: ~$25/month + data transfer
- **Container Registry (Basic)**: ~$5/month
- **Public IPs**: ~$3/month
- **Storage**: ~$5-10/month
- **Total**: ~$75-90/month

_Note: Costs vary by region and usage. Use Azure Pricing Calculator for accurate estimates._

## Destroying Infrastructure

**Warning**: This will delete all resources!

```bash
terraform destroy
```

Type `yes` when prompted. This is useful for:

- Cleaning up test environments
- Avoiding unnecessary costs
- Starting fresh

## Troubleshooting

### Terraform State Issues

If you encounter state lock issues:

```bash
terraform force-unlock <LOCK_ID>
```

### VM Connection Issues

1. Verify your IP is in the `allowed_ssh_ip_address` variable
2. Check NSG rules: `az network nsg rule list --nsg-name <nsg-name> -g <rg-name>`
3. Verify VM is running: `az vm show -d -g <rg-name> -n <vm-name>`

### Application Gateway Issues

1. Check backend health: `az network application-gateway show-backend-health -g <rg-name> -n <gateway-name>`
2. Verify NSG allows traffic from Application Gateway subnet
3. Check Application VM is running and container is listening on port 5001

## Module Structure

```
terraform/
├── main.tf                    # Main configuration
├── variables.tf               # Input variables
├── outputs.tf                 # Output values
├── terraform.tfvars.example  # Example variables
├── README.md                  # This file
└── modules/
    ├── network/              # Network resources
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    ├── security/             # Security groups
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    ├── compute/              # Virtual machines
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    └── registry/             # Container registry
        ├── main.tf
        ├── variables.tf
        └── outputs.tf
```

## Best Practices Implemented

✅ **Modular Design**: Separated concerns into reusable modules  
✅ **Security**: Least privilege NSG rules, private subnets, SSH key authentication  
✅ **Naming Conventions**: Consistent, descriptive resource names  
✅ **Tags**: Applied to all resources for organization  
✅ **Managed Identity**: Used for secure ACR access  
✅ **Health Probes**: Application Gateway monitors backend health  
✅ **Documentation**: Comprehensive README and inline comments

## Next Steps

After infrastructure is provisioned:

1. **Configure Ansible** (Section 2): Set up the Application VM with Docker
2. **Set up CI/CD** (Section 3): Configure GitHub Actions for automated deployments
3. **Deploy Application** (Section 4): Use Ansible to deploy containers from ACR

## Support

For issues or questions:

- Check Azure Portal for resource status
- Review Terraform logs: `terraform apply -auto-approve 2>&1 | tee terraform.log`
- Check Azure Activity Log for deployment errors
