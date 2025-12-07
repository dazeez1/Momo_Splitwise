# Momo Splitwise

**Split bills, keep friends.**

A modern expense splitting application that helps friends, roommates, and groups track shared expenses and settle debts seamlessly. Built with mobile money integration for easy payments.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.9-blue.svg)

## Live Application

**Try it out:** [http://158.158.49.253](http://158.158.49.253)

- **Health Check:** [http://158.158.49.253:5001/health](http://158.158.49.253:5001/health)
- **API Base URL:** [http://158.158.49.253:5001/api](http://158.158.49.253:5001/api)

> **Note:** The Application Gateway URL ([http://68.221.206.80](http://68.221.206.80)) is also available but may take time to fully provision.

## Presentation Video

[Watch the presentation video on Google Drive](https://drive.google.com/file/d/YOUR_VIDEO_ID/view)

## What It Does

Momo Splitwise makes it easy to:

- Track shared expenses with friends, roommates, or groups
- Automatically calculate who owes whom
- Generate mobile money payment links
- View expense reports and analytics
- Get real-time notifications when expenses are added

Perfect for university students, roommates, or informal savings groups (chamas) who need a simple way to manage shared costs.

## Tech Stack

**Frontend:** React 19 + TypeScript, Vite, Tailwind CSS  
**Backend:** Node.js + Express.js  
**Database:** MongoDB (MongoDB Atlas)  
**Infrastructure:** Azure, Docker, Terraform, Ansible  
**CI/CD:** GitHub Actions

## Quick Start

### Local Development

1. **Clone and install:**

   ```bash
   git clone https://github.com/dazeez1/Momo_Splitwise.git
   cd Momo_Splitwise

   # Backend
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB connection string

   # Frontend
   cd ../momo_splitwise
   npm install
   ```

2. **Run the app:**

   ```bash
   # Backend (from backend directory)
   npm run dev

   # Frontend (from momo_splitwise directory)
   npm run dev
   ```

### Docker

```bash
docker-compose up -d
```

## Infrastructure & DevOps

### Docker

The application is containerized using Docker for consistent deployment across environments. We have separate Dockerfiles for the frontend and backend:

- **Backend Dockerfile**: Builds the Node.js API server
- **Frontend Dockerfile**: Builds the React app with Nginx for serving static files
- **docker-compose.yml**: Orchestrates local development with all services

### Terraform

Infrastructure as Code (IaC) is managed with Terraform. All Azure resources are defined in code:

- Virtual Network (VNet) with multiple subnets
- Network Security Groups (NSGs) for firewall rules
- Virtual Machines (Bastion Host and Application VM)
- Azure Container Registry (ACR) for Docker images
- Application Gateway for load balancing and routing

To deploy infrastructure:

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### Ansible

Configuration management is handled by Ansible. It automates the setup of the Application VM:

- Installs Docker and Docker Compose
- Configures Azure Container Registry authentication
- Sets up system services and dependencies
- Deploys the application using Docker Compose

To run Ansible playbooks:

```bash
cd ansible
ansible-playbook -i inventory/hosts.yml playbooks/deploy.yml
```

## Deployment

The app is deployed on Azure using:

- **Terraform** for infrastructure
- **Ansible** for configuration
- **GitHub Actions** for automated CI/CD

Every push to `main` automatically triggers a deployment. See the [CI/CD workflows](.github/workflows/) for details.

## Team

- **Damilare Gbenga Azeez** - Backend Developer & Quality Assurance
- **Stella Remember Habiyambere** - DevOps Engineer & Documentation Lead
- **Daniel Iryivuze** - Frontend Developer & CI/CD Integrator

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

MIT License - see [LICENSE](LICENSE) for details.
