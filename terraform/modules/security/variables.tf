# Variables for Security Module

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

variable "vnet_id" {
  description = "ID of the Virtual Network"
  type        = string
}

variable "public_subnet_id" {
  description = "ID of the public subnet"
  type        = string
}

variable "private_subnet_id" {
  description = "ID of the private subnet"
  type        = string
}

variable "database_subnet_id" {
  description = "ID of the database subnet"
  type        = string
}

variable "allowed_ssh_ip_address" {
  description = "IP address or CIDR block allowed to SSH into Bastion"
  type        = string
}

variable "public_subnet_cidr" {
  description = "CIDR block of the public subnet (for NSG rules)"
  type        = string
}

variable "private_subnet_cidr" {
  description = "CIDR block of the private subnet (for NSG rules)"
  type        = string
}

variable "app_gateway_subnet_cidr" {
  description = "CIDR block of the Application Gateway subnet"
  type        = string
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}

