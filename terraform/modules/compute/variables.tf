# Variables for Compute Module

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region location"
  type        = string
}

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "public_subnet_id" {
  description = "ID of the public subnet for Bastion Host"
  type        = string
}

variable "private_subnet_id" {
  description = "ID of the private subnet for Application VM"
  type        = string
}

variable "bastion_nsg_id" {
  description = "ID of the Bastion Network Security Group"
  type        = string
}

variable "app_nsg_id" {
  description = "ID of the Application Network Security Group"
  type        = string
}

variable "container_registry_id" {
  description = "ID of the Azure Container Registry"
  type        = string
}

variable "container_registry_login_server" {
  description = "Login server URL for the Container Registry"
  type        = string
}

variable "container_registry_admin_user" {
  description = "Admin username for the Container Registry"
  type        = string
  sensitive   = true
}

variable "container_registry_admin_pass" {
  description = "Admin password for the Container Registry"
  type        = string
  sensitive   = true
}

variable "bastion_vm_size" {
  description = "VM size for the Bastion Host"
  type        = string
  default     = "Standard_B1s"
}

variable "application_vm_size" {
  description = "VM size for the Application VM"
  type        = string
  default     = "Standard_B2s"
}

variable "admin_username" {
  description = "Admin username for the VMs"
  type        = string
}

variable "ssh_public_key" {
  description = "SSH public key for VM access"
  type        = string
  sensitive   = true
}

variable "create_managed_identity" {
  description = "Whether to create a managed identity for the Application VM (for ACR access)"
  type        = bool
  default     = true
}

variable "create_acr_role_assignment" {
  description = "Whether to create ACR pull role assignment for the managed identity"
  type        = bool
  default     = false
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}

