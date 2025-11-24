# Outputs for Security Module

output "bastion_nsg_id" {
  description = "ID of the Bastion Network Security Group"
  value       = azurerm_network_security_group.bastion.id
}

output "app_nsg_id" {
  description = "ID of the Application Network Security Group"
  value       = azurerm_network_security_group.application.id
}

output "database_nsg_id" {
  description = "ID of the Database Network Security Group"
  value       = azurerm_network_security_group.database.id
}

