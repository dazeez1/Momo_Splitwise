# Input variables for Momo Splitwise Infrastructure

variable "project_name" {
  description = "Name of the project (used for resource naming)"
  type        = string
  default     = "momo-splitwise"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod"
  }
}

variable "azure_region" {
  description = "Azure region where resources will be created"
  type        = string
  default     = "eastus"
}

# Azure Authentication (for Terraform Cloud)
# These should be set as environment variables in Terraform Cloud workspace
variable "azure_subscription_id" {
  description = "Azure Subscription ID (set as ARM_SUBSCRIPTION_ID in Terraform Cloud)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "azure_client_id" {
  description = "Azure Service Principal Client ID (set as ARM_CLIENT_ID in Terraform Cloud)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "azure_client_secret" {
  description = "Azure Service Principal Client Secret (set as ARM_CLIENT_SECRET in Terraform Cloud)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "azure_tenant_id" {
  description = "Azure Tenant ID (set as ARM_TENANT_ID in Terraform Cloud)"
  type        = string
  default     = ""
  sensitive   = true
}

# Network Configuration
variable "vnet_address_space" {
  description = "Address space for the Virtual Network (CIDR notation)"
  type        = list(string)
  default     = ["10.0.0.0/16"]
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet (Bastion Host)"
  type        = string
  default     = "10.0.1.0/24"
}

variable "private_subnet_cidr" {
  description = "CIDR block for the private subnet (Application VM)"
  type        = string
  default     = "10.0.2.0/24"
}

variable "database_subnet_cidr" {
  description = "CIDR block for the database subnet (reserved for future use)"
  type        = string
  default     = "10.0.3.0/24"
}

variable "app_gateway_subnet_cidr" {
  description = "CIDR block for the Application Gateway subnet"
  type        = string
  default     = "10.0.4.0/24"
}

# Security Configuration
variable "allowed_ssh_ip_address" {
  description = "IP address allowed to SSH into the Bastion Host (use your public IP)"
  type        = string
  default     = "0.0.0.0/0" # Change this to your IP for security
  
  validation {
    condition     = can(cidrhost(var.allowed_ssh_ip_address, 0))
    error_message = "allowed_ssh_ip_address must be a valid CIDR notation"
  }
}

# Virtual Machine Configuration
variable "bastion_vm_size" {
  description = "VM size for the Bastion Host"
  type        = string
  default     = "Standard_B1s" # 1 vCPU, 1GB RAM (cheapest option)
}

variable "application_vm_size" {
  description = "VM size for the Application VM"
  type        = string
  default     = "Standard_B2s" # 2 vCPU, 4GB RAM
}

variable "vm_admin_username" {
  description = "Admin username for the VMs"
  type        = string
  default     = "azureuser"
  
  validation {
    condition     = length(var.vm_admin_username) >= 3 && length(var.vm_admin_username) <= 20
    error_message = "VM admin username must be between 3 and 20 characters"
  }
}

variable "ssh_public_key" {
  description = "SSH public key for VM access (contents of ~/.ssh/id_rsa.pub)"
  type        = string
  sensitive   = true
}

# MongoDB Atlas Configuration (for reference - not provisioned by Terraform)
variable "mongodb_atlas_connection_string" {
  description = "MongoDB Atlas connection string (stored in Azure Key Vault or as secret)"
  type        = string
  sensitive   = true
  default     = ""
}

# Container Registry Configuration
variable "acr_sku" {
  description = "SKU for Azure Container Registry (Basic, Standard, Premium)"
  type        = string
  default     = "Basic"
  
  validation {
    condition     = contains(["Basic", "Standard", "Premium"], var.acr_sku)
    error_message = "ACR SKU must be one of: Basic, Standard, Premium"
  }
}

