# Endfield Ltd Supply Chain Dashboard

A lightweight cloud-native supply chain management demo application for building and factory materials such as cement, coal, steel, sand, and Originium.

It uses a serverless-first architecture with small Nest.js microservices, React frontend, AWS Lambda background jobs, and AWS managed services.

---

## Features

* Inventory tracking
* Low stock alerts
* Purchase request workflow
* Stock inflow simulation
* Dashboard summaries
* Material stock movement logs
* Cloud-native deployment architecture

---

## Tech Stack

### Frontend

* React Router
* Amplify hosting
* REST API integration

### Backend

* Nest.js Inventory Service
* Nest.js Procurement Service
* Dockerized microservices
* ECS / ECS Service Connect ready

### Serverless

* AWS Lambda
* EventBridge scheduled CRON trigger
* SQS queue integration

### Data Storage

* RDS for relational business data
* DynamoDB for alerts and logs
* S3 for report exports and static assets

---

# Project Structure

```text
endfield-supply-chain/
├── Backend
│   ├── lambdas
│   │   ├── libs
│   │   │   └── materialPool.js
│   │   ├── README.md
│   │   ├── sqsToInventory
│   │   │   └── index.js
│   │   └── stockInflow
│   │       └── index.js
│   └── microservice
│       ├── inventory-service
│       │   ├── Dockerfile
│       │   ├── jest.config.js
│       │   ├── nest-cli.json
│       │   ├── package.json
│       │   ├── package-lock.json
│       │   ├── src
│           ├── .env.example
│       │   ├── tsconfig.build.json
│       │   └── tsconfig.json
│       └── procurement-service
│           ├── Dockerfile
│           ├── jest.config.js
│           ├── nest-cli.json
│           ├── package.json
│           ├── package-lock.json
│           ├── src
│           ├── .env.example
│           ├── tsconfig.build.json
│           └── tsconfig.json
├── Frontend
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── src
│   ├── tailwind.config.js
│   └── vite.config.js
├── infrastructure
│   ├── modules
│   └── stacks
└── README.md
```

---

# Core Services

## Frontend

The frontend provides:

* Login page
* Dashboard page
* Materials list
* Material detail page
* Purchase request pages
* Stock inflow logs
* Alerts page

## Inventory Service

Responsible for:

* Material CRUD
* Stock in and stock out
* Stock movement history
* Low stock alert generation
* Dashboard summaries

## Procurement Service

Responsible for:

* Purchase request creation
* Purchase request listing
* Status updates
* Approval and receiving workflow

## Lambda Stock Simulator

Responsible for:

* Simulating incoming material deliveries
* Sending stock inflow events to Inventory Service or SQS
* Running on EventBridge CRON schedule

---

# Docker Deployment

## Prerequisites

* Docker
* Docker Compose
* Node.js 20+
* npm or pnpm

---

## Sample docker-compose.yml

```yaml
version: '3.9'

services:
  frontend:
    build:
      context: ./frontend
    ports:
      - "3000:3000"
    env_file:
      - ./frontend/.env
    depends_on:
      - inventory-service
      - procurement-service

  inventory-service:
    build:
      context: ./inventory-service
    ports:
      - "3001:3000"
    env_file:
      - ./inventory-service/.env

  procurement-service:
    build:
      context: ./procurement-service
    ports:
      - "3002:3000"
    env_file:
      - ./procurement-service/.env

  lambda-stock-simulator:
    build:
      context: ./lambda-stock-simulator
    env_file:
      - ./lambda-stock-simulator/.env
    depends_on:
      - inventory-service
```

---

## Run Locally

```bash
# Build all services
Docker Compose build

# Start all services
Docker Compose up

# Run detached
Docker Compose up -d

# Stop all services
Docker Compose down
```

---

# Sample Dockerfiles

## Frontend Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host"]
```

## Nest.js Service Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

## Lambda Simulator Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "start"]
```


# Sample Frontend .env

```env
# Inventory Service
VITE_INVENTORY_API_BASE_URL=http://localhost:4001

# Procurement Service
VITE_PROCUREMENT_API_BASE_URL=http://localhost:4002
```

---

# Sample Inventory Service .env

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=inventory
DB_SYNC=false
DB_LOGGING=true
PORT=3000
```

---

# Sample Procurement Service .env

```env
PORT=3000
INVENTORY_GRPC_URL=localhost:50051
REQUIRE_LOW_STOCK_REQUEST=true
PURCHASE_RECEIVED_QUEUE_URL=""
STOCK_EVENTS_QUEUE_URL=""
STOCK_EVENTS_CONSUMER_ENABLED=true
AWS_REGION=
AWS_DEFAULT_REGION=

```

---

# Lambda stockInflow .env

```env
USE_SQS=true
SQS_QUEUE_URL=
LOG_LEVEL= debug/info/warn/error
MATERIAL_POOL= (Optional)
```

---

# Lambda sqsToInventory .env

```env
ALB_URL=
```

---

# Suggested Demo Workflow

1. Open the frontend dashboard.
2. Show materials with low stock.
3. Create a purchase request.
4. Trigger or wait for Lambda stock simulation.
5. Show stock increasing automatically.
6. Show alerts being resolved.
7. Show purchase request lifecycle.

---

# License

This project is intended for educational, demo, and competition use.
