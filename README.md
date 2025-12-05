# Momo Splitwise

A modern expense splitting application with mobile money integration, designed to help friends, roommates, and groups track shared expenses and settle debts seamlessly.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.9-blue.svg)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Infrastructure Setup](#infrastructure-setup)
- [Configuration Management](#configuration-management)
- [CI/CD Pipelines](#cicd-pipelines)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Development Guide](#development-guide)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Overview

Momo Splitwise is a full-stack web application that simplifies expense management for groups. Whether you're splitting bills with roommates, tracking expenses on a trip, or managing a savings group (chama), Momo Splitwise makes it easy to:

- Track shared expenses
- Automatically calculate who owes whom
- Generate mobile money payment links
- View detailed expense reports and analytics
- Get real-time notifications

The application is built with modern best practices, including Infrastructure as Code (Terraform), Configuration Management (Ansible), and fully automated CI/CD pipelines.

## Features

### Core Functionality

- **Smart Expense Splitting**: Split bills equally, by percentage, or custom amounts
- **Group Management**: Create and manage groups for different purposes (roommates, trips, savings groups)
- **Mobile Money Integration**: Generate payment links for seamless debt settlement
- **Real-time Updates**: Get instant notifications via WebSocket when expenses are added or payments made
- **Expense Analytics**: Track spending patterns with detailed reports and visualizations
- **User Authentication**: Secure JWT-based authentication with session management

### Technical Features

- **Infrastructure as Code**: Complete Azure infrastructure defined in Terraform
- **Automated Deployment**: CI/CD pipelines for continuous integration and deployment
- **Containerized**: Docker-based deployment for consistency across environments
- **Security**: Rate limiting, input validation, and security headers
- **Scalable Architecture**: Load-balanced setup with Application Gateway

## Tech Stack

### Frontend

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Socket.io Client** for real-time updates
- **Recharts** for data visualization

### Backend

- **Node.js 18+** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.io** for WebSocket connections
- **JWT** for authentication
- **Express Validator** for input validation
- **Helmet** for security headers

### Infrastructure & DevOps

- **Terraform** for Infrastructure as Code
- **Ansible** for configuration management
- **Docker** & **Docker Compose** for containerization
- **Azure** cloud platform
- **GitHub Actions** for CI/CD
- **Azure Container Registry (ACR)** for Docker images

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Application Gateway (Public IP)                │
│  • Routes /api/* → Backend (Port 5001)                      │
│  • Routes /* → Frontend (Port 80)                           │
│  • Health probes and load balancing                          │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────┐         ┌──────────────────┐
│  Bastion VM  │         │  Application VM   │
│  (Public)    │         │   (Private)      │
│              │         │                   │
│  • SSH Only  │         │  • Backend API    │
│  • Access    │         │  • Frontend       │
│    Control   │         │  • MongoDB        │
└──────────────┘         └──────────────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  Azure Container │
                         │  Registry (ACR)  │
                         │                  │
                         │  • Docker Images │
                         └──────────────────┘
```

### Network Architecture

- **Public Subnet**: Bastion Host for secure SSH access
- **Private Subnet**: Application VM running containers
- **Application Gateway Subnet**: Load balancer and routing
- **Database Subnet**: Reserved for future database deployments

### Security

- Network Security Groups (NSGs) with strict firewall rules
- SSH access restricted to allowed IP addresses
- Application Gateway for public-facing traffic
- Private subnet isolation for application components

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **Docker** 20.10 or higher
- **Docker Compose** 2.0 or higher
- **Terraform** 1.5 or higher
- **Ansible** 2.14 or higher
- **Azure CLI** 2.50 or higher
- **Git** 2.30 or higher

### Azure Requirements

- Active Azure subscription
- Azure CLI configured with appropriate permissions
- Service Principal for GitHub Actions (for CI/CD)

## Quick Start

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/dazeez1/Momo_Splitwise.git
   cd Momo_Splitwise
   ```

2. **Set up environment variables**

   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB connection string and secrets
   ```

3. **Install dependencies**

   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../momo_splitwise
   npm install
   ```

4. **Start development servers**

   ```bash
   # Backend (from backend directory)
   npm run dev

   # Frontend (from momo_splitwise directory)
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001
   - API Health Check: http://localhost:5001/health

### Docker Development

1. **Start services with Docker Compose**

   ```bash
   docker-compose up -d
   ```

2. **View logs**

   ```bash
   docker-compose logs -f
   ```

3. **Stop services**
   ```bash
   docker-compose down
   ```

## Infrastructure Setup

The infrastructure is managed using Terraform. All Azure resources are defined as code for reproducibility and version control.

### Prerequisites

- Azure subscription with appropriate permissions
- Terraform installed and configured
- Azure CLI authenticated (`az login`)

### Deploy Infrastructure

1. **Navigate to Terraform directory**

   ```bash
   cd terraform
   ```

2. **Configure variables**

   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

3. **Initialize Terraform**

   ```bash
   terraform init
   ```

4. **Review the deployment plan**

   ```bash
   terraform plan
   ```

5. **Deploy infrastructure**

   ```bash
   terraform apply
   ```

6. **Get output values**
   ```bash
   terraform output
   ```

### Infrastructure Components

- **Virtual Network (VNet)**: `10.0.0.0/16` with multiple subnets
- **Network Security Groups**: Firewall rules for each subnet
- **Bastion Host VM**: Secure SSH access point
- **Application VM**: Container host for application services
- **Azure Container Registry**: Private Docker image registry
- **Application Gateway**: Public-facing load balancer

For detailed infrastructure documentation, see [terraform/README.md](terraform/README.md).

## Configuration Management

Ansible is used to configure the Application VM with Docker, Docker Compose, and Azure Container Registry authentication.

### Prerequisites

- Ansible installed
- SSH access to the Application VM
- Terraform outputs available

### Configure Application VM

1. **Update Ansible inventory**

   ```bash
   cd ansible
   ./update-inventory.sh ../terraform
   ```

2. **Review inventory**

   ```bash
   cat inventory/hosts.yml
   ```

3. **Run configuration playbook**
   ```bash
   ansible-playbook -i inventory/hosts.yml playbooks/main.yml
   ```

This playbook will:

- Install Docker Engine
- Install Docker Compose
- Set up Azure Container Registry authentication
- Configure system services

For detailed Ansible documentation, see [ansible/README.md](ansible/README.md).

## CI/CD Pipelines

The project includes two GitHub Actions workflows:

### Continuous Integration (CI)

**File**: `.github/workflows/ci.yml`

**Triggers**:

- Pull requests to `main` branch
- Pushes to any branch (except `main`)

**Jobs**:

1. **Lint and Test**: Code linting and unit tests
2. **Security Scan**: Container and IaC vulnerability scanning

### Continuous Deployment (CD)

**File**: `.github/workflows/cd.yml`

**Triggers**:

- Merges to `main` branch
- Manual trigger via GitHub Actions UI

**Jobs**:

1. **CI Checks**: Run all CI checks (lint, test, security)
2. **Security Scan**: Container and IaC scanning
3. **Build and Push**: Build Docker image and push to ACR
4. **Deploy**: Deploy to Application VM using Ansible
5. **Health Check**: Verify deployment via Application Gateway

### Required GitHub Secrets

Configure these secrets in GitHub: `Settings → Secrets and variables → Actions`

- `AZURE_CREDENTIALS`: Service Principal JSON for Azure authentication
- `ACR_NAME`: Azure Container Registry name
- `ACR_LOGIN_SERVER`: ACR login server URL
- `ACR_RESOURCE_GROUP`: Resource group name
- `APPLICATION_VM_IP`: Application VM public IP address
- `SSH_PRIVATE_KEY`: Private SSH key for VM access
- `APPLICATION_GATEWAY_URL`: Application Gateway public URL
- `TEST_MONGODB_URI`: MongoDB connection string for tests

Use the helper script to get values:

```bash
./scripts/get-github-secrets.sh
```

For detailed CD setup instructions, see [docs/CD_SETUP.md](docs/CD_SETUP.md).

## Deployment

### Automated Deployment

The CD pipeline automatically deploys when code is merged to `main`:

1. **Merge Pull Request** to `main` branch
2. **CD Pipeline Triggers** automatically
3. **Build & Push**: Docker image built and pushed to ACR
4. **Deploy**: Ansible playbook deploys to Application VM
5. **Verify**: Health checks confirm successful deployment

### Manual Deployment

1. **Build and push Docker image**

   ```bash
   # Login to ACR
   az acr login --name <acr-name>

   # Build and push
   docker build -t <acr-name>.azurecr.io/momo-splitwise-backend:latest .
   docker push <acr-name>.azurecr.io/momo-splitwise-backend:latest
   ```

2. **Deploy with Ansible**
   ```bash
   cd ansible
   ansible-playbook -i inventory/hosts.yml playbooks/deploy.yml \
     --extra-vars "image_tag=<acr-name>.azurecr.io/momo-splitwise-backend:latest"
   ```

### Accessing the Application

After deployment, access the application via:

- **Application Gateway URL**: `http://<gateway-ip>`
- **Health Check**: `http://<gateway-ip>/health`
- **API Endpoints**: `http://<gateway-ip>/api/*`

Get the Application Gateway IP:

```bash
cd terraform
terraform output application_gateway_public_ip
```

## API Documentation

### Base URL

- **Local**: `http://localhost:5001`
- **Production**: `http://<application-gateway-ip>/api`

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Health Check

```http
GET /health
```

**Response**:

```json
{
  "status": "OK",
  "message": "Momo Splitwise API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "MoMo Split API",
  "database": "Connected",
  "databaseName": "momo_splitwise",
  "host": "cluster.mongodb.net"
}
```

### API Endpoints

#### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

#### Groups

- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create new group
- `GET /api/groups/:id` - Get group by ID
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

#### Expenses

- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/:id` - Get expense by ID
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

#### Payments

- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create new payment
- `GET /api/payments/:id` - Get payment by ID

#### Balances

- `GET /api/balances` - Get all balances
- `GET /api/balances/group/:groupId` - Get balances for group

For detailed API documentation, see the API routes in `backend/routes/`.

## Development Guide

### Code Style

- **ESLint** for JavaScript/TypeScript linting
- **Prettier** (recommended) for code formatting
- Follow existing code patterns and naming conventions

### Naming Conventions

- **Variables**: Use descriptive, camelCase names (e.g., `userBalance`, `expenseAmount`)
- **Functions**: Use verb-noun pattern (e.g., `calculateBalance`, `createExpense`)
- **Components**: Use PascalCase (e.g., `ExpenseForm`, `GroupDetail`)
- **Files**: Use kebab-case (e.g., `expense-controller.js`, `group-detail.tsx`)

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests (if configured)
cd momo_splitwise
npm test
```

### Linting

```bash
# Backend
cd backend
npm run lint

# Frontend
cd momo_splitwise
npm run lint
```

### Project Structure

```
Momo_Splitwise/
├── .github/
│   └── workflows/          # CI/CD pipeline definitions
│       ├── ci.yml          # Continuous Integration
│       └── cd.yml          # Continuous Deployment
├── ansible/                # Configuration Management
│   ├── inventory/          # Ansible inventory files
│   ├── playbooks/          # Deployment playbooks
│   ├── roles/              # Reusable Ansible roles
│   └── templates/          # Jinja2 templates
├── backend/                # Backend API
│   ├── controllers/        # Request handlers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   └── services/           # Business logic services
├── momo_splitwise/         # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── services/       # API service layer
│   └── public/             # Static assets
├── terraform/               # Infrastructure as Code
│   ├── modules/            # Terraform modules
│   │   ├── network/        # Network resources
│   │   ├── security/      # Security groups
│   │   ├── compute/        # Virtual machines
│   │   └── registry/      # Container registry
│   └── main.tf             # Main configuration
├── scripts/                # Utility scripts
├── docs/                   # Documentation
├── docker-compose.yml      # Local development
├── docker-compose.prod.yml # Production reference
├── Dockerfile              # Backend Docker image
└── README.md               # This file
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** following the code style guidelines
4. **Write or update tests** as needed
5. **Commit your changes** with clear, descriptive messages
6. **Push to your branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request** with a detailed description

### Pull Request Guidelines

- Provide a clear description of changes
- Reference any related issues
- Ensure all tests pass
- Update documentation as needed
- Follow the existing code style

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
