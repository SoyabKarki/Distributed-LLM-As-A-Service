#!/bin/bash

# Check if CI passed
gh run list --branch main --limit 1 --json conclusion | grep -q '"success"' || exit 1

# Build images
docker compose build

# Check if cluster is running, start if not
if ! k3d cluster list | grep -q "llm-cluster.*1/1"; then
    echo "Starting k3d cluster..."
    k3d cluster start llm-cluster
    sleep 2
fi

# Deploy
kubectl apply -f k8s/ --validate=false