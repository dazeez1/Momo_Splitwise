# Output values for Momo Splitwise Infrastructure
# These values can be used by other modules or displayed after apply

output "resource_group_name" {
  description = "Name of the created resource group"
  value       = azurerm_resource_group.main.name
}

output "resource_group_location" {
  description = "Location of the created resource group"
  value       = azurerm_resource_group.main.location
}

# Network Outputs
output "virtual_network_id" {
  description = "ID of the Virtual Network"
  value       = module.network.vnet_id
}

output "virtual_network_name" {
  description = "Name of the Virtual Network"
  value       = module.network.vnet_name
}

output "public_subnet_id" {
  description = "ID of the public subnet (Bastion)"
  value       = module.network.public_subnet_id
}

output "private_subnet_id" {
  description = "ID of the private subnet (Application VM)"
  value       = module.network.private_subnet_id
}

# Compute Outputs
output "bastion_host_public_ip" {
  description = "Public IP address of the Bastion Host"
  value       = module.compute.bastion_host_public_ip
}

output "bastion_host_private_ip" {
  description = "Private IP address of the Bastion Host"
  value       = module.compute.bastion_host_private_ip
}

output "application_vm_private_ip" {
  description = "Private IP address of the Application VM"
  value       = module.compute.application_vm_private_ip
}

output "application_vm_id" {
  description = "ID of the Application VM"
  value       = module.compute.application_vm_id
}

# Registry Outputs
output "container_registry_name" {
  description = "Name of the Azure Container Registry"
  value       = module.registry.acr_name
}

output "container_registry_login_server" {
  description = "Login server URL for the Container Registry"
  value       = module.registry.acr_login_server
}

output "container_registry_admin_username" {
  description = "Admin username for the Container Registry"
  value       = module.registry.acr_admin_username
  sensitive   = true
}

output "container_registry_admin_password" {
  description = "Admin password for the Container Registry"
  value       = module.registry.acr_admin_password
  sensitive   = true
}

# Application Gateway Outputs
output "application_gateway_public_ip" {
  description = "Public IP address of the Application Gateway"
  value       = azurerm_public_ip.app_gateway.ip_address
}

output "application_url" {
  description = "Public URL to access the application"
  value       = "http://${azurerm_public_ip.app_gateway.ip_address}"
}

# SSH Connection Instructions
output "ssh_bastion_command" {
  description = "SSH command to connect to the Bastion Host"
  value       = "ssh ${var.vm_admin_username}@${module.compute.bastion_host_public_ip}"
}

output "ssh_app_vm_via_bastion" {
  description = "SSH command to connect to Application VM via Bastion"
  value       = "ssh -J ${var.vm_admin_username}@${module.compute.bastion_host_public_ip} ${var.vm_admin_username}@${module.compute.application_vm_private_ip}"
}

