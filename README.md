# 💸 MoMo Splitwise  
**Tagline:** *"Split bills, keep friends."*  

---

## 📘 Project Overview  

**MoMo Splitwise** is a web-based application designed to help groups — such as friends, roommates, or informal savings groups — easily track shared expenses and split costs fairly using mobile money.  

The project aims to address a common problem faced by many young Africans: the difficulty of managing shared expenses transparently in group settings. By integrating mobile money functionality, MoMo Splitwise promotes accountability, fairness, and financial clarity among group members.  

---

## 🌍 Problem Statement  

Groups like university students, roommates, and chamas (informal savings groups) often struggle to track shared expenses and ensure fair cost distribution. Without proper tools, this process can lead to misunderstandings and financial disputes. **MoMo Splitwise** simplifies this by allowing users to record expenses, calculate balances, and generate mobile money payment links — all in one platform.

---

## 🧑‍🤝‍🧑 Target Users  

- University students  
- Shared housing or roommate groups  
- Informal savings groups (chamas)  
- Small social groups managing shared funds  

---

## ⚙️ Core Features  

- 🧾 Create and manage expense groups  
- 💰 Add expenses and assign split percentages  
- 🔄 Automatically calculate who owes whom  
- 🔗 Generate mobile money payment links  
- 📊 View expense history and reports  

---

## 🧱 Tech Stack  

| Layer | Technology |
|-------|-------------|
| **Frontend** | React (Vite) + Tailwind CSS |
| **Backend** | Node.js (Express.js) |
| **Database** | MongoDB |
| **Containerization** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions |

---

## 🚀 Setup Instructions  

### 🔧 Prerequisites  
Ensure you have the following installed:  
- [Node.js](https://nodejs.org/)  
- [Docker](https://www.docker.com/) and Docker Compose  
- [Git](https://git-scm.com/)  

---

### 🧩 Running the App (Local Development)

1. **Clone the repository:**  
   ```bash
   git clone https://github.com/your-username/momo_splitwise.git
   cd momo_splitwise

   Backend setup:

2. **cd backend**
```bash
npm install
npm start
```

3. **Frontend setup:**
```bash
cd frontend
npm install
npm run dev
```
---

Access the app:
Visit http://localhost:5173 (frontend) and http://localhost:5000 (backend API).

---

**🐳 Running with Docker Compose**

To run both frontend and backend containers together:
```bash
docker compose up --build
```
---

## Once running:

- Frontend: http://localhost:5173

- Backend API: http://localhost:5000
  
---

## 🔁 Continuous Integration (CI)

The project includes a GitHub Actions CI pipeline that automatically:

- Checks out the repository

- Installs dependencies

- Runs linting and tests

- Builds the Docker image

✅ The pipeline fails if linting, tests, or the Docker build fail.
✅ Branch protection rules ensure all checks pass before merging to main.

## 🧑‍💻 Team Members
|Name	 |Role|  
|------|----------|
|*Damilare Gbenga Azeez* |	Backend Developer && CI/CD Integrator| 
|*Stella Remember Habiyambere*| DevOps Engineer && Documentation Lead|
|*Daniel Iryivuze*|	 Frontend Developer && Quality Assurance|

---
# 🏗️ Project Phases
## Formative 1: Project Foundation

- Defined project idea, context, and target users

- Created GitHub Projects board and .gitignore

- Implemented initial functional codebase

- Established branch protection and collaboration practices

## Formative 2: Docker + CI Implementation

- Created and tested Dockerfile and docker-compose.yml

- Built and ran containers for frontend, backend, and MongoDB

- Implemented GitHub Actions CI workflow (.github/workflows/ci.yml)

- Enforced CI checks before merging to main

## 🔒 Repository Configuration

- .gitignore excludes sensitive files (e.g., .env, node_modules/, build artifacts)

- Branch protection rules are enabled on main

- All team members added as collaborators

- GitHub Project board tracks all tasks and progress

# 📄 License

This project is licensed under the MIT License — free to use and modify for educational purposes.

# 💬 Acknowledgments

Special thanks to our DevOps course instructor and team members for collaboration, patience, and teamwork throughout this learning journey.
