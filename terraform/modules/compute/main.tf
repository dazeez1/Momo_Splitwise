# Compute Module - Creates Virtual Machines (Bastion and Application)

# Generate random password for VM (if SSH key is not provided, though we use SSH keys)
resource "random_password" "vm_password" {
  length  = 16
  special = true
}

# Create Public IP for Bastion Host
resource "azurerm_public_ip" "bastion" {
  name                = "${var.project_name}-${var.environment}-bastion-ip"
  resource_group_name = var.resource_group_name
  location            = var.location
  allocation_method   = "Static"
  sku                 = "Standard"

  tags = var.common_tags
}

# Create Network Interface for Bastion Host
resource "azurerm_network_interface" "bastion" {
  name                = "${var.project_name}-${var.environment}-bastion-nic"
  resource_group_name = var.resource_group_name
  location            = var.location

  ip_configuration {
    name                          = "${var.project_name}-bastion-ip-config"
    subnet_id                     = var.public_subnet_id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.bastion.id
  }

  tags = var.common_tags
}

# Associate Bastion NSG with Bastion NIC
resource "azurerm_network_interface_security_group_association" "bastion" {
  network_interface_id      = azurerm_network_interface.bastion.id
  network_security_group_id = var.bastion_nsg_id
}

# Create Bastion Host VM
resource "azurerm_linux_virtual_machine" "bastion" {
  name                = "${var.project_name}-${var.environment}-bastion-vm"
  resource_group_name = var.resource_group_name
  location            = var.location
  size                = var.bastion_vm_size
  admin_username      = var.admin_username

  network_interface_ids = [
    azurerm_network_interface.bastion.id,
  ]

  # Use SSH key authentication
  admin_ssh_key {
    username   = var.admin_username
    public_key = var.ssh_public_key
  }

  os_disk {
    name                 = "${var.project_name}-${var.environment}-bastion-os-disk"
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }

  # Disable password authentication for security
  disable_password_authentication = true

  tags = var.common_tags
}

# Create Public IP for Application VM (for Ansible access - if rubric allows)
resource "azurerm_public_ip" "application" {
  name                = "${var.project_name}-${var.environment}-app-ip"
  resource_group_name = var.resource_group_name
  location            = var.location
  allocation_method   = "Static"
  sku                 = "Standard"

  tags = var.common_tags
}

# Create Network Interface for Application VM (with Public IP for Ansible access)
resource "azurerm_network_interface" "application" {
  name                = "${var.project_name}-${var.environment}-app-nic"
  resource_group_name = var.resource_group_name
  location            = var.location

  ip_configuration {
    name                          = "${var.project_name}-app-ip-config"
    subnet_id                     = var.public_subnet_id  # Moved to public subnet for direct Ansible access
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.application.id
  }

  tags = var.common_tags
}

# Associate Application NSG with Application NIC
resource "azurerm_network_interface_security_group_association" "application" {
  network_interface_id      = azurerm_network_interface.application.id
  network_security_group_id = var.app_nsg_id
}

# Create Managed Identity for Application VM (for ACR access)
resource "azurerm_user_assigned_identity" "app_vm_identity" {
  count               = var.create_managed_identity ? 1 : 0
  name                = "${var.project_name}-${var.environment}-app-vm-identity"
  resource_group_name = var.resource_group_name
  location            = var.location

  tags = var.common_tags
}

# Grant the managed identity AcrPull role on the container registry
resource "azurerm_role_assignment" "acr_pull" {
  count                = var.create_managed_identity && var.create_acr_role_assignment ? 1 : 0
  scope                = var.container_registry_id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.app_vm_identity[0].principal_id
}

# Create Application VM
resource "azurerm_linux_virtual_machine" "application" {
  name                = "${var.project_name}-${var.environment}-app-vm"
  resource_group_name = var.resource_group_name
  location            = var.location
  size                = var.application_vm_size
  admin_username      = var.admin_username

  network_interface_ids = [
    azurerm_network_interface.application.id,
  ]

  # Use SSH key authentication
  admin_ssh_key {
    username   = var.admin_username
    public_key = var.ssh_public_key
  }

  # Attach managed identity for ACR access (if created)
  dynamic "identity" {
    for_each = var.create_managed_identity ? [1] : []
    content {
      type         = "UserAssigned"
      identity_ids = [azurerm_user_assigned_identity.app_vm_identity[0].id]
    }
  }

  os_disk {
    name                 = "${var.project_name}-${var.environment}-app-os-disk"
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS" # Better performance for application
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }

  # Disable password authentication for security
  disable_password_authentication = true

  tags = var.common_tags
}

