# ACR Authentication Role

This role configures Docker to authenticate with Azure Container Registry using Azure Managed Identity.

## Requirements

- Docker must be installed
- Azure Managed Identity must be assigned to the VM
- The Managed Identity must have AcrPull role on the ACR

## Role Variables

- `acr_name`: Name of the Azure Container Registry (required)
- `acr_resource_group`: Resource group containing the ACR (required)

## Dependencies

- Docker role (should be run first)

## Example Playbook

```yaml
- hosts: application
  roles:
    - role: acr-auth
      vars:
        acr_name: "momosplitwiseprodacr"
        acr_resource_group: "momo-splitwise-prod-rg"
```
