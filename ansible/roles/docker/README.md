# Docker Role

This role installs and configures Docker Engine and Docker Compose on the target system.

## Requirements

- Ubuntu/Debian-based Linux distribution
- Root or sudo access
- Internet connectivity

## Role Variables

- `docker_compose_version`: Version of Docker Compose to install (default: "2.24.0")
- `docker_users`: List of users to add to the docker group (default: [])

## Dependencies

None

## Example Playbook

```yaml
- hosts: application
  roles:
    - role: docker
      vars:
        docker_users:
          - azureuser
```
