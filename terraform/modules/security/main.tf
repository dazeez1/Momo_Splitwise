# Security Module - Creates Network Security Groups with proper rules

# Network Security Group for Bastion Host (in Public Subnet)
resource "azurerm_network_security_group" "bastion" {
  name                = "${var.project_name}-${var.environment}-bastion-nsg"
  resource_group_name = var.resource_group_name
  location            = var.location

  # Allow SSH from allowed IP address only
  # tfsec:ignore:azure-network-no-public-ingress - SSH access is restricted to allowed_ssh_ip_address variable
  # tfsec:ignore:azure-network-ssh-blocked-from-internet - SSH access is intentionally allowed from specific IP for bastion host
  security_rule {
    name                       = "allow-ssh-from-allowed-ip"
    priority                   = 1000
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = var.allowed_ssh_ip_address
    destination_address_prefix = "*"
    description                = "Allow SSH access from allowed IP address"
  }

  # Deny all other inbound traffic
  security_rule {
    name                       = "deny-all-inbound"
    priority                   = 4000
    direction                  = "Inbound"
    access                     = "Deny"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
    description                = "Deny all other inbound traffic"
  }

  # Allow all outbound traffic (for updates, package installation, etc.)
  # tfsec:ignore:azure-network-no-public-egress - Outbound internet access is required for package updates, Azure services, and API calls
  security_rule {
    name                       = "allow-all-outbound"
    priority                   = 1000
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
    description                = "Allow all outbound traffic"
  }

  tags = var.common_tags
}

# Network Security Group for Application VM (in Public Subnet for Ansible access)
resource "azurerm_network_security_group" "application" {
  name                = "${var.project_name}-${var.environment}-app-nsg"
  resource_group_name = var.resource_group_name
  location            = var.location

  # Allow SSH from Bastion Host subnet
  security_rule {
    name                       = "allow-ssh-from-bastion"
    priority                   = 1000
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = var.public_subnet_cidr
    destination_address_prefix = "*"
    description                = "Allow SSH access from Bastion Host subnet"
  }

  # Allow SSH from Internet (for GitHub Actions and Ansible deployment)
  # tfsec:ignore:azure-network-no-public-ingress - SSH access required for CI/CD deployment
  # tfsec:ignore:azure-network-ssh-blocked-from-internet - SSH access required for automated deployment
  security_rule {
    name                       = "allow-ssh-from-internet"
    priority                   = 1030
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
    description                = "Allow SSH access from Internet for GitHub Actions deployment"
  }

  # TEMPORARY: Allow public access to frontend for presentation (can be removed later)
  security_rule {
    name                       = "allow-public-frontend-temporary"
    priority                   = 1004
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
    description                = "TEMPORARY: Allow public access to frontend for presentation - remove after Application Gateway is ready"
  }

  # TEMPORARY: Allow public access to backend for presentation (can be removed later)
  security_rule {
    name                       = "allow-public-backend-temporary"
    priority                   = 1005
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "5001"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
    description                = "TEMPORARY: Allow public access to backend for presentation - remove after Application Gateway is ready"
  }

  # Allow HTTP from Application Gateway
  security_rule {
    name                       = "allow-http-from-app-gateway"
    priority                   = 1010
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "5001"
    source_address_prefix      = var.app_gateway_subnet_cidr
    destination_address_prefix = "*"
    description                = "Allow HTTP traffic from Application Gateway to backend port"
  }

  # Allow HTTPS from Application Gateway
  security_rule {
    name                       = "allow-https-from-app-gateway"
    priority                   = 1020
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = var.app_gateway_subnet_cidr
    destination_address_prefix = "*"
    description                = "Allow HTTPS traffic from Application Gateway"
  }

  # Allow all outbound traffic (for API calls, package updates, etc.)
  # tfsec:ignore:azure-network-no-public-egress - Outbound internet access is required for package updates, Azure services, and API calls
  security_rule {
    name                       = "allow-all-outbound"
    priority                   = 1000
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
    description                = "Allow all outbound traffic"
  }

  # Deny all other inbound traffic
  security_rule {
    name                       = "deny-all-inbound"
    priority                   = 4000
    direction                  = "Inbound"
    access                     = "Deny"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
    description                = "Deny all other inbound traffic"
  }

  tags = var.common_tags
}

# Network Security Group for Database Subnet (for future use)
resource "azurerm_network_security_group" "database" {
  name                = "${var.project_name}-${var.environment}-database-nsg"
  resource_group_name = var.resource_group_name
  location            = var.location

  # Allow MongoDB connection from Application VM only
  security_rule {
    name                       = "allow-mongodb-from-app"
    priority                   = 1000
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "27017"
    source_address_prefix      = var.private_subnet_cidr
    destination_address_prefix = "*"
    description                = "Allow MongoDB connection from Application VM subnet"
  }

  # Deny all other inbound traffic
  security_rule {
    name                       = "deny-all-inbound"
    priority                   = 4000
    direction                  = "Inbound"
    access                     = "Deny"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
    description                = "Deny all other inbound traffic"
  }

  # Allow all outbound traffic
  # tfsec:ignore:azure-network-no-public-egress - Outbound internet access is required for package updates, Azure services, and API calls
  security_rule {
    name                       = "allow-all-outbound"
    priority                   = 1000
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
    description                = "Allow all outbound traffic"
  }

  tags = var.common_tags
}

# Associate Bastion NSG with Public Subnet
resource "azurerm_subnet_network_security_group_association" "bastion" {
  subnet_id                 = var.public_subnet_id
  network_security_group_id = azurerm_network_security_group.bastion.id
}

# Associate Application NSG with Private Subnet
resource "azurerm_subnet_network_security_group_association" "application" {
  subnet_id                 = var.private_subnet_id
  network_security_group_id = azurerm_network_security_group.application.id
}

# Associate Database NSG with Database Subnet
resource "azurerm_subnet_network_security_group_association" "database" {
  subnet_id                 = var.database_subnet_id
  network_security_group_id = azurerm_network_security_group.database.id
}

