# Network Module - Creates Virtual Network and Subnets

# Create Virtual Network
resource "azurerm_virtual_network" "main" {
  name                = "${var.project_name}-${var.environment}-vnet"
  resource_group_name = var.resource_group_name
  location            = var.location
  address_space       = var.vnet_address_space

  tags = var.common_tags
}

# Create Public Subnet (for Bastion Host)
resource "azurerm_subnet" "public" {
  name                 = "${var.project_name}-${var.environment}-public-subnet"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = [var.public_subnet_cidr]
}

# Create Private Subnet (for Application VM)
resource "azurerm_subnet" "private" {
  name                 = "${var.project_name}-${var.environment}-private-subnet"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = [var.private_subnet_cidr]
}

# Create Database Subnet (reserved for future use or MongoDB Atlas connectivity)
resource "azurerm_subnet" "database" {
  name                 = "${var.project_name}-${var.environment}-database-subnet"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = [var.database_subnet_cidr]
}

# Create Application Gateway Subnet
resource "azurerm_subnet" "app_gateway" {
  name                 = "${var.project_name}-${var.environment}-app-gateway-subnet"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = [var.app_gateway_subnet_cidr]
}

# Create Network Security Group for Public Subnet
resource "azurerm_network_security_group" "public_subnet" {
  name                = "${var.project_name}-${var.environment}-public-subnet-nsg"
  resource_group_name = var.resource_group_name
  location            = var.location

  tags = var.common_tags
}

# Associate NSG with Public Subnet
resource "azurerm_subnet_network_security_group_association" "public" {
  subnet_id                 = azurerm_subnet.public.id
  network_security_group_id = azurerm_network_security_group.public_subnet.id
}

# Create Network Security Group for Private Subnet
resource "azurerm_network_security_group" "private_subnet" {
  name                = "${var.project_name}-${var.environment}-private-subnet-nsg"
  resource_group_name = var.resource_group_name
  location            = var.location

  tags = var.common_tags
}

# Associate NSG with Private Subnet
resource "azurerm_subnet_network_security_group_association" "private" {
  subnet_id                 = azurerm_subnet.private.id
  network_security_group_id = azurerm_network_security_group.private_subnet.id
}

# Create Network Security Group for Database Subnet
resource "azurerm_network_security_group" "database_subnet" {
  name                = "${var.project_name}-${var.environment}-database-subnet-nsg"
  resource_group_name = var.resource_group_name
  location            = var.location

  tags = var.common_tags
}

# Associate NSG with Database Subnet
resource "azurerm_subnet_network_security_group_association" "database" {
  subnet_id                 = azurerm_subnet.database.id
  network_security_group_id = azurerm_network_security_group.database_subnet.id
}

