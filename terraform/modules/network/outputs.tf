# Outputs for Network Module

output "vnet_id" {
  description = "ID of the Virtual Network"
  value       = azurerm_virtual_network.main.id
}

output "vnet_name" {
  description = "Name of the Virtual Network"
  value       = azurerm_virtual_network.main.name
}

output "public_subnet_id" {
  description = "ID of the public subnet"
  value       = azurerm_subnet.public.id
}

output "private_subnet_id" {
  description = "ID of the private subnet"
  value       = azurerm_subnet.private.id
}

output "database_subnet_id" {
  description = "ID of the database subnet"
  value       = azurerm_subnet.database.id
}

output "app_gateway_subnet_id" {
  description = "ID of the Application Gateway subnet"
  value       = azurerm_subnet.app_gateway.id
}

output "public_subnet_nsg_id" {
  description = "ID of the public subnet NSG"
  value       = azurerm_network_security_group.public_subnet.id
}

output "private_subnet_nsg_id" {
  description = "ID of the private subnet NSG"
  value       = azurerm_network_security_group.private_subnet.id
}

output "database_subnet_nsg_id" {
  description = "ID of the database subnet NSG"
  value       = azurerm_network_security_group.database_subnet.id
}

