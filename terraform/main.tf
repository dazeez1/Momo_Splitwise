# Main Terraform configuration for Momo Splitwise Infrastructure
# This file orchestrates all infrastructure components

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }

  # Terraform Cloud backend configuration
  cloud {
    organization = "Mono_split"

    workspaces {
      name = "Summative"
    }
  }
}

# Configure the Azure Provider
# For Terraform Cloud: Set these as environment variables in workspace:
#   ARM_SUBSCRIPTION_ID, ARM_CLIENT_ID, ARM_CLIENT_SECRET, ARM_TENANT_ID
# For local development: Uses Azure CLI authentication (az login)
provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
    key_vault {
      purge_soft_delete_on_destroy = true
    }
  }
  
  # Terraform will automatically use environment variables if set
  # No need to explicitly set them here - the provider reads ARM_* env vars automatically
}

# Generate random suffix for unique resource names
resource "random_string" "resource_suffix" {
  length  = 6
  special = false
  upper   = false
}

# Create Resource Group
resource "azurerm_resource_group" "main" {
  name     = "${var.project_name}-${var.environment}-rg"
  location = var.azure_region

  tags = local.common_tags
}

# Call Network Module
module "network" {
  source = "./modules/network"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  project_name        = var.project_name
  environment         = var.environment
  
  vnet_address_space        = var.vnet_address_space
  public_subnet_cidr        = var.public_subnet_cidr
  private_subnet_cidr       = var.private_subnet_cidr
  database_subnet_cidr      = var.database_subnet_cidr
  app_gateway_subnet_cidr   = var.app_gateway_subnet_cidr
  
  common_tags = local.common_tags
}

# Call Security Module
module "security" {
  source = "./modules/security"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  project_name        = var.project_name
  environment         = var.environment
  
  vnet_id                = module.network.vnet_id
  public_subnet_id       = module.network.public_subnet_id
  private_subnet_id      = module.network.private_subnet_id
  database_subnet_id     = module.network.database_subnet_id
  
  allowed_ssh_ip_address = var.allowed_ssh_ip_address
  public_subnet_cidr     = var.public_subnet_cidr
  private_subnet_cidr    = var.private_subnet_cidr
  app_gateway_subnet_cidr = var.app_gateway_subnet_cidr
  
  common_tags = local.common_tags
}

# Call Registry Module
module "registry" {
  source = "./modules/registry"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  project_name        = var.project_name
  environment         = var.environment
  resource_suffix     = random_string.resource_suffix.result
  
  common_tags = local.common_tags
}

# Call Compute Module
module "compute" {
  source = "./modules/compute"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  project_name        = var.project_name
  environment         = var.environment
  
  public_subnet_id  = module.network.public_subnet_id
  private_subnet_id = module.network.private_subnet_id
  
  bastion_nsg_id = module.security.bastion_nsg_id
  app_nsg_id     = module.security.app_nsg_id
  
  container_registry_id         = module.registry.acr_id
  container_registry_login_server = module.registry.acr_login_server
  container_registry_admin_user   = module.registry.acr_admin_username
  container_registry_admin_pass   = module.registry.acr_admin_password
  
  bastion_vm_size     = var.bastion_vm_size
  application_vm_size = var.application_vm_size
  
  admin_username = var.vm_admin_username
  ssh_public_key = var.ssh_public_key
  
  # Temporarily disable managed identity due to Azure policy restrictions
  create_managed_identity = false
  
  common_tags = local.common_tags
}

# Create Public IP for Application Gateway
resource "azurerm_public_ip" "app_gateway" {
  name                = "${var.project_name}-${var.environment}-app-gateway-ip"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  allocation_method   = "Static"
  sku                 = "Standard"
  
  tags = local.common_tags
}

# Create Application Gateway
resource "azurerm_application_gateway" "main" {
  name                = "${var.project_name}-${var.environment}-app-gateway"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  sku {
    name     = "Standard_v2"
    tier     = "Standard_v2"
    capacity = 2
  }

  gateway_ip_configuration {
    name      = "${var.project_name}-gateway-ip-config"
    subnet_id = module.network.app_gateway_subnet_id
  }

  frontend_port {
    name = "http-port"
    port = 80
  }

  frontend_port {
    name = "https-port"
    port = 443
  }

  frontend_ip_configuration {
    name                 = "${var.project_name}-frontend-ip"
    public_ip_address_id = azurerm_public_ip.app_gateway.id
  }

  backend_address_pool {
    name = "${var.project_name}-backend-pool"
    ip_addresses = [
      module.compute.application_vm_private_ip
    ]
  }

  backend_address_pool {
    name = "${var.project_name}-frontend-pool"
    ip_addresses = [
      module.compute.application_vm_private_ip
    ]
  }

  # Define health probe before referencing it
  probe {
    name                = "${var.project_name}-backend-health-probe"
    protocol            = "Http"
    path                = "/health"
    interval            = 30
    timeout             = 30
    unhealthy_threshold = 3
    match {
      status_code = ["200"]
    }
    pick_host_name_from_backend_http_settings = true
  }

  backend_http_settings {
    name                                = "${var.project_name}-backend-http-settings"
    cookie_based_affinity               = "Disabled"
    port                                = 5001
    protocol                            = "Http"
    request_timeout                     = 20
    probe_name                          = "${var.project_name}-backend-health-probe"
    pick_host_name_from_backend_address = true
  }

  backend_http_settings {
    name                  = "${var.project_name}-frontend-http-settings"
    cookie_based_affinity = "Disabled"
    port                  = 80
    protocol              = "Http"
    request_timeout       = 20
  }

  http_listener {
    name                           = "${var.project_name}-http-listener"
    frontend_ip_configuration_name = "${var.project_name}-frontend-ip"
    frontend_port_name             = "http-port"
    protocol                       = "Http"
  }

  request_routing_rule {
    name                       = "${var.project_name}-api-routing-rule"
    rule_type                  = "PathBasedRouting"
    http_listener_name         = "${var.project_name}-http-listener"
    url_path_map_name          = "${var.project_name}-url-path-map"
    priority                   = 100
  }

  url_path_map {
    name                               = "${var.project_name}-url-path-map"
    default_backend_address_pool_name  = "${var.project_name}-frontend-pool"
    default_backend_http_settings_name = "${var.project_name}-frontend-http-settings"

    path_rule {
      name                       = "${var.project_name}-api-path-rule"
      paths                      = ["/api/*"]
      backend_address_pool_name   = "${var.project_name}-backend-pool"
      backend_http_settings_name  = "${var.project_name}-backend-http-settings"
    }

    path_rule {
      name                       = "${var.project_name}-health-path-rule"
      paths                      = ["/health"]
      backend_address_pool_name   = "${var.project_name}-backend-pool"
      backend_http_settings_name  = "${var.project_name}-backend-http-settings"
    }
  }

  tags = local.common_tags

  # Note: depends_on removed to allow Application Gateway creation
  # when compute module has issues (e.g., bastion VM size unavailable)
  # The Application Gateway only needs the network module which is already created
  depends_on = [
    module.network
  ]
}

# Local values for common tags
locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    # Removed CreatedAt timestamp to avoid tag updates triggering policy deletions
  }
}

