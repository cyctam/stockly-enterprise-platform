
# Stockly Enterprise | Cloud-Native Supply Chain Platform

**A Cloud & DevOps Engineering Project**

Stockly is a cloud-native supply chain management platform designed to demonstrate modern Cloud Computing, DevOps practices, and microservices architecture.

The project combines application development with cloud infrastructure automation, containerization, CI/CD pipelines, and Infrastructure as Code (IaC) to simulate how a scalable production-ready system can be designed, deployed, and managed in a cloud environment.

---

## Project Overview

Stockly is more than an inventory management application. It is an engineering project focused on building, deploying, and managing a distributed application using modern cloud and DevOps technologies.

The platform provides inventory tracking, stock movement management, procurement workflows, and operational monitoring through a centralized dashboard.

From an infrastructure perspective, the project explores how independent services can be containerized, connected, automated, and deployed to cloud infrastructure.

## Engineering Focus

This project focuses on the following engineering areas:

- **Cloud Computing** — Designing and deploying scalable application infrastructure on AWS.
- **DevOps Engineering** — Automating development, testing, building, and deployment workflows.
- **Microservices Architecture** — Separating application responsibilities into independent services.
- **Infrastructure as Code (IaC)** — Managing cloud infrastructure using Terraform.
- **Containerization** — Packaging applications and services using Docker.
- **CI/CD Automation** — Building automated pipelines using GitHub Actions.
- **Cloud Infrastructure Management** — Exploring networking, compute, storage, and managed database services.

## Core Features

### Application Features

- Inventory and material management.
- Stock movement tracking.
- Purchase request management.
- Procurement workflow management.
- Stock level alerts.
- Centralized operational dashboard.

### Cloud & DevOps Features

- Docker-based application containerization.
- Microservices-oriented architecture.
- Infrastructure provisioning using Terraform.
- CI/CD workflow automation using GitHub Actions.
- PostgreSQL database infrastructure.
- AWS cloud deployment architecture.
- Environment-based application configuration.

---

## System Architecture

Stockly follows a microservices-based architecture where each service operates independently and communicates through defined service interfaces.

### Application Components

| Component | Responsibility |
|---|---|
| Dashboard | React-based frontend for inventory and procurement operations. |
| Inventory Service | Handles materials, stock movements, and inventory alerts. |
| Procurement Service | Manages purchase requests and approval workflows. |
| Event Simulator | Simulates stock delivery events and background processing. |
| PostgreSQL | Stores application and operational data. |

### Cloud Architecture

The target cloud infrastructure is designed around AWS services.

| AWS Service | Purpose |
|---|---|
| Amazon VPC | Network isolation and infrastructure networking. |
| Amazon ECS | Containerized application deployment. |
| Amazon EC2 | Compute infrastructure where required. |
| Amazon RDS | Managed PostgreSQL database. |
| Amazon S3 | Object and static asset storage. |
| AWS Lambda | Serverless background processing. |

---

## Technology Stack

### Application Development
- React
- Vite
- Tailwind CSS
- Node.js
- NestJS
- TypeScript
- gRPC

### Database
- PostgreSQL
- TypeORM

### Cloud Computing
- Amazon Web Services (AWS)
- Amazon VPC
- Amazon ECS
- Amazon EC2
- Amazon RDS
- Amazon S3
- AWS Lambda

### DevOps & Infrastructure
- Docker
- Docker Compose
- Terraform
- GitHub Actions
- Git
- CI/CD Pipelines
- Infrastructure as Code (IaC)

---

## Repository Structure

```text
stockly-supply-chain/
├── apps/
│   └── dashboard/          # React frontend application
│
├── services/
│   ├── api-server/         # Inventory microservice
│   ├── publisher/          # Procurement microservice
│   └── simulator/          # Stock event simulator
│
├── terraform/              # AWS Infrastructure as Code
├── docker-compose.yml      # Local container orchestration
└── package.json            # Project dependencies
```

---

## DevOps Workflow

The project is designed around a modern DevOps workflow.

```text
Developer
    |
    v
Git Repository (GitHub)
    |
    v
GitHub Actions
    |
    +---- Automated Testing
    |
    +---- Build Application
    |
    +---- Build Docker Images
    |
    v
Container Registry
    |
    v
AWS Cloud Infrastructure
    |
    +---- Application Services
    |
    +---- Database
    |
    +---- Storage
    |
    v
Application Deployment
```

The intended workflow demonstrates how code changes can move from source control through automated validation and container builds into a cloud deployment environment.

---

## Infrastructure as Code

Terraform is used to define and manage the target cloud infrastructure.

The infrastructure configuration is intended to support:

- Cloud networking and VPC configuration.
- Compute resource provisioning.
- Container deployment infrastructure.
- Managed database resources.
- Storage infrastructure.
- Reproducible infrastructure environments.

### Terraform Workflow

```bash
cd terraform

terraform init
terraform validate
terraform plan
terraform apply
```

Infrastructure changes should be reviewed before applying them to a cloud environment.

---

## Containerization

Docker is used to package application services into consistent and portable environments.

Docker Compose provides a local development environment for running the required services and database dependencies.

Start the local infrastructure:

```bash
docker compose up -d
```

Stop the local infrastructure:

```bash
docker compose down
```

---

## CI/CD Pipeline

GitHub Actions is the planned CI/CD automation platform for this project.

The intended pipeline includes:

1. Source code integration through GitHub.
2. Automated code validation and testing.
3. Application build process.
4. Docker image creation.
5. Container image publishing.
6. Deployment to the target cloud environment.

The pipeline configuration will evolve as deployment automation is implemented.

---

## Local Development

### Prerequisites

- Node.js v20+
- npm
- Docker
- Docker Compose
- Git

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/cyctam/stockly-enterprise-platform.git
```

**2. Navigate to the project directory**

```bash
cd stockly-enterprise-platform
```

**3. Start the database infrastructure**

```bash
docker compose up -d postgres
```

**4. Install dependencies**

```bash
npm install
```

### Run the Services

Start each service in a separate terminal.

**Inventory Service**

```bash
npm run start --workspace=services/api-server
```

**Procurement Service**

```bash
npm run start --workspace=services/publisher
```

**Frontend Dashboard**

```bash
npm run dev --workspace=apps/dashboard
```

Open the dashboard:

```text
http://localhost:5173
```

---

## Environment Configuration

Each service may require environment-specific configuration.

Create the required `.env` files in the corresponding service directories.

Use `.env.example` files as configuration references when available.

Never commit sensitive information such as:

- AWS access keys.
- Database credentials.
- API secrets.
- Authentication tokens.
- Private environment variables.

---

## Project Goals & Learning Outcomes

Through this project, the main engineering objectives are:

- Understand cloud-native application architecture.
- Implement microservices communication.
- Containerize distributed applications.
- Automate infrastructure provisioning using Terraform.
- Build CI/CD workflows with GitHub Actions.
- Understand AWS networking and cloud resources.
- Explore application deployment and cloud operations.
- Apply DevOps principles to a practical engineering project.

---


---

## Infrastructure & Deployment Strategy

Stockly is designed with a cloud-native deployment approach to support scalability, reliability, and maintainability.

The deployment strategy focuses on:

- Containerized application services using Docker.
- Cloud infrastructure provisioning through Terraform.
- Automated build and deployment workflows using GitHub Actions.
- Managed database infrastructure using Amazon RDS.
- Isolated networking through Amazon VPC.
- Scalable application hosting using Amazon ECS.

The infrastructure is structured to support consistent environments across local development, testing, and cloud deployment.

## Future Engineering Improvements

The following improvements represent potential next steps for expanding the platform:

- **Monitoring & Observability** — Integrate Prometheus and Grafana for infrastructure and application monitoring.
- **Centralized Logging** — Implement centralized log collection and analysis.
- **Auto Scaling** — Configure automatic scaling for containerized services.
- **Security Hardening** — Improve IAM policies, secrets management, and network security.
- **Infrastructure Automation** — Expand Terraform modules and reusable infrastructure configurations.
- **Deployment Strategy** — Explore rolling deployments and blue-green deployment approaches.
- **Disaster Recovery** — Introduce database backup and recovery strategies.

---
