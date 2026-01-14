# Distributed LLM-As-A-Service

A horizontally scalable LLM inference platform built with modern distributed systems principles. This project demonstrates hands-on expertise in full-stack development, container orchestration, and microservices architecture.


## Key Features

- **Horizontal Auto-Scaling** — Backend pods automatically scale between 2-4 replicas based on CPU utilization via Kubernetes HPA
- **Load Balancing** — Traefik Ingress distributes traffic across multiple pod replicas
- **Self-Healing** — Liveness and readiness probes ensure unhealthy pods are automatically restarted
- **API Gateway** — Single entry point routing `/api/*` to backend and `/` to frontend
- **Context-Aware Chat** — Maintains conversation history with configurable context window trimming
- **Externalized Configuration** — Environment variables managed via Kubernetes ConfigMaps
- **Multi-Stage Docker Builds** — Optimized container images for both frontend and backend


## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React, Vite, Nginx |
| **Backend** | FastAPI, Python |
| **LLM Inference** | Ollama (qwen2.5:0.5b) |
| **Containerization** | Docker, Docker Compose |
| **Orchestration** | Kubernetes (k3d) |
| **Ingress** | Traefik |
| **Auto-Scaling** | Horizontal Pod Autoscaler (HPA) |


## Architecture Overview


```
┌─────────────────────────────────────────────────────────────────────┐
│                         Kubernetes Cluster                          │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Traefik Ingress Controller                 │  │
│  │                         (Port 80)                             │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                    │ /api/*              │ /*                       │
│                    ▼                     ▼                          │
│  ┌────────────────────────┐   ┌────────────────────────┐            │
│  │    Backend Service     │   │   Frontend Service     │            │
│  │     (ClusterIP)        │   │     (ClusterIP)        │            │
│  └────────────────────────┘   └────────────────────────┘            │
│           │                            │                            │
│           ▼                            ▼                            │
│  ┌────────────────────────┐   ┌────────────────────────┐            │
│  │   Backend Pods (2-4)   │   │  Frontend Pods (2)     │            │
│  │   FastAPI + Uvicorn    │   │  Nginx + React         │            │
│  │   [HPA: 50% CPU]       │   │                        │            │
│  └────────────────────────┘   └────────────────────────┘            │
│           │                                                         │
└───────────│─────────────────────────────────────────────────────────┘
            │ HTTP (via host.k3d.internal)
            ▼
    ┌────────────────────────┐
    │    Ollama (Host)       │
    │   LLM Inference        │
    │   Port 11434           │
    └────────────────────────┘
```

**Traffic Flow:**
1. User accesses `http://localhost` → Traefik Ingress
2. Ingress routes `/` to Frontend Service, `/api/*` to Backend Service
3. Services load-balance requests across healthy pods
4. Backend communicates with Ollama on host for LLM inference
5. Response flows back through the same path

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app, CORS, health check
│   │   └── routes/
│   │       └── chat.py       # Chat endpoint with context trimming
│   ├── Dockerfile          
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main chat application
│   │   └── components/       # React components
│   ├── Dockerfile            
│   └── nginx.conf            
│
├── k8s/
│   ├── namespace.yaml        # llm-as-a-service namespace
│   ├── ingress.yaml          # Traefik routing rules
│   ├── backend/
│   │   ├── configmap.yaml    # Environment variables
│   │   ├── deployment.yaml   # Pod spec with probes & resources
│   │   ├── service.yaml      # ClusterIP service
│   │   └── hpa.yaml          # Auto-scaler (2-4 replicas)
│   └── frontend/
│       ├── deployment.yaml   # Pod spec with probes
│       └── service.yaml      # ClusterIP service
│
└── docker-compose.yml       
```


## Getting Started

Clone the repo. Then:

### Option 1: Docker Compose (Development)

```bash
# Start all services
docker-compose up --build

# Access the application
open http://localhost:3000
```

### Option 2: Kubernetes (Production-like)

```bash
# 1. Start Ollama on host
ollama serve

# 2. Create k3d cluster with port mapping
k3d cluster create llm-cluster -p "80:80@loadbalancer"

# 3. Build and import images
docker-compose build
k3d image import distributed-llm-as-a-service-backend:latest -c llm-cluster
k3d image import distributed-llm-as-a-service-frontend:latest -c llm-cluster

# 4. Deploy to Kubernetes
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/ingress.yaml

# 5. Access the application
open http://localhost
```

### Verify Deployment

```bash
# Check all resources
kubectl get all -n llm-as-a-service

# Check HPA status
kubectl get hpa -n llm-as-a-service

# View pod logs
kubectl logs -l app=backend -n llm-as-a-service
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send message with conversation history |
| `GET` | `/health` | Health check for liveness/readiness probes |

### Chat Request Example

```json
POST /api/chat
{
  "messages": [
    { "role": "user", "content": "Hello!" },
    { "role": "assistant", "content": "Hi there!" },
    { "role": "user", "content": "How are you?" }
  ]
}
```

## Configuration

Environment variables managed via ConfigMap:

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_URL` | `http://host.k3d.internal:11434` | Ollama inference endpoint |
| `MODEL_NAME` | `qwen2.5:0.5b` | LLM model to use |
| `MAX_CONTEXT_MESSAGES` | `20` | Max messages sent to LLM for context |

## Future Goals

This is an ongoing project developed with an initial goal of getting hands-on experience on the infrastructure side of things. As such, there are plently of shortcomings. I plan on adding the following features in the future:

- Server-Sent Events (SSE) for real-time token streaming from LLM
- PostgreSQL for persistent chat history, and manage stateful database workloads in K8s accordingly
- Implement Prometheus+Grafana dashboards for monitoring 
- Implement OpenTelemetry for tracing
- User authentication, maybe using OAuth
- Move Ollama into the K8s cluster with GPU provisions
- Cloud migration (thinking of GCP for this one)
- Multi-model support
