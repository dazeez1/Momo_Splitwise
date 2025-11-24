# Outputs for Compute Module

output "bastion_host_public_ip" {
  description = "Public IP address of the Bastion Host"
  value       = azurerm_public_ip.bastion.ip_address
}

output "bastion_host_private_ip" {
  description = "Private IP address of the Bastion Host"
  value       = azurerm_network_interface.bastion.private_ip_address
}

output "bastion_vm_id" {
  description = "ID of the Bastion VM"
  value       = azurerm_linux_virtual_machine.bastion.id
}

output "application_vm_private_ip" {
  description = "Private IP address of the Application VM"
  value       = azurerm_network_interface.application.private_ip_address
}

output "application_vm_id" {
  description = "ID of the Application VM"
  value       = azurerm_linux_virtual_machine.application.id
}

output "application_vm_identity_id" {
  description = "ID of the managed identity for Application VM"
  value       = azurerm_user_assigned_identity.app_vm_identity.id
}

