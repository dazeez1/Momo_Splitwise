# Registry Module - Creates Azure Container Registry (ACR)

# Create Azure Container Registry
resource "azurerm_container_registry" "main" {
  name                = "${replace(var.project_name, "-", "")}${var.environment}acr${var.resource_suffix}"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = var.acr_sku
  admin_enabled       = true # Enable admin user for Ansible access

  # Enable public network access (can be restricted later)
  public_network_access_enabled = true

  # Enable georeplication for Premium SKU (optional)
  # georeplications {
  #   location = "westus"
  #   tags     = var.common_tags
  # }

  tags = var.common_tags
}

# Optional: Create a private endpoint for ACR (more secure)
# This would require additional networking setup
# resource "azurerm_private_endpoint" "acr" {
#   name                = "${var.project_name}-${var.environment}-acr-endpoint"
#   resource_group_name = var.resource_group_name
#   location            = var.location
#   subnet_id           = var.private_subnet_id
#
#   private_service_connection {
#     name                           = "${var.project_name}-acr-connection"
#     private_connection_resource_id = azurerm_container_registry.main.id
#     subresource_names              = ["registry"]
#     is_manual_connection           = false
#   }
#
#   tags = var.common_tags
# }

