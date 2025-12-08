# **Momo Splitwise — Final DevOps Project**

Momo Splitwise is an expense-splitting application that helps friends, roommates, and groups track shared expenses and settle payments easily. It includes a full DevOps pipeline covering Infrastructure as Code, security scanning, CI/CD automation, and a live deployment on Azure.

---

## **Live Application**

**Deployed Link:**
[http://158.158.49.253/](http://158.158.49.253/)

---

## **Presentation Video**

**Final Demo (Git-to-Production Walkthrough):**
[https://drive.google.com/drive/folders/1XnbrdbTpCDgw5eoJYL48kBV8YibtJ147?usp=drive_link](https://drive.google.com/drive/folders/1XnbrdbTpCDgw5eoJYL48kBV8YibtJ147?usp=drive_link)

The video demonstrates:

* Making a small code change
* Creating a Pull Request
* CI pipeline with security scans
* Merging to main
* CD pipeline is deploying automatically
* Change appearing live on the deployed link

---

## **What the Application Does**

Momo Splitwise allows users to:

* Add and track shared expenses
* Automatically calculate balances
* Generate mobile money payment links
* View simple reports
* Receive real-time updates when expenses are added

It is useful for students, roommates, or small groups who want a simple way to manage shared costs.

---

# **DevOps Implementation (Rubric-Aligned for “Exemplary”)**

## **1. Infrastructure as Code (Terraform)**

The entire cloud infrastructure was built using Terraform and stored in a `terraform/` directory.
The setup includes:

* Azure Virtual Network
* Virtual Machine in a private subnet
* Bastion Host for secure SSH
* MongoDB Atlas (managed database)
* Network Security Groups
* Private Azure Container Registry (ACR)
* Modular Terraform files (`main.tf`, `variables.tf`, `outputs.tf`)

---

## **2. Configuration Management (Ansible)**

The `ansible/` directory contains the playbooks used to configure the VM.

The playbook:

* Installs Docker and Docker Compose
* Installs required system packages
* Logs the VM into ACR
* Deploys the application using Docker Compose

This ensures the VM is fully configured automatically.

---

## **3. DevSecOps in CI Pipeline**

The CI workflow runs on Pull Requests and includes:

* Docker image vulnerability scanning
* Terraform (IaC) security scanning
* Linting and testing
* Build fails if critical vulnerabilities are found

This ensures the application is secure before merging to the main branch.

---

## **4. Continuous Deployment Pipeline**

The CD workflow triggers on **merge to main** and:

1. Runs all CI checks
2. Builds the Docker image
3. Pushes the image to Azure ACR
4. Authenticates to Azure
5. Runs the Ansible deployment playbook
6. Pulls the latest image and restarts the application

This creates a complete **automated Git-to-Production** flow.

---

# **Quick Start (Local Development)**

### Clone the repository:

```bash
git clone https://github.com/dazeez1/Momo_Splitwise.git
```

### Backend:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend:

```bash
cd ../momo_splitwise
npm install
npm run dev
```

### Using Docker:

```bash
docker-compose up -d
```

---

# **Team**

* Damilare Gbenga Azeez — Backend & QA
* Stella Remember Habiyambere — DevOps & Documentation
* Daniel Iryivuze — Frontend & CI/CD
