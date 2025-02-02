---
title: Running NVIDIA NIMs on Kubernetes - A Technical Guide
slug: nvidia-nims-digitalocean-kubernetes
date: 2025-02-02T00:00:00.000Z
excerpt: A comprehensive guide to deploying NVIDIA Neural Interface Models (NIMs) on DigitalOcean Kubernetes, covering GPU infrastructure setup, observability implementation, and model deployment using Llama 3.1 as an example.
category: "Cloud Architecture, Language Models"
---

This guide demonstrates how to run NVIDIA Neural Interface Models (NIMs) on DigitalOcean Kubernetes, specifically focusing on deploying Meta's Llama 3.1 model. We'll cover setting up GPU-enabled infrastructure, implementing observability, and configuring shared storage for model deployment.

## Infrastructure Overview

We'll be utilizing:

- DigitalOcean Droplets with GPU capabilities
- DigitalOcean Kubernetes (DOKS)
- NVIDIA NIM microservices for model deployment
- Grafana and Prometheus for GPU metrics monitoring
- NVIDIA GPU Operator for GPU management in Kubernetes

## Prerequisites

1. Sign up at build.nvidia.com (use business email for self-hosting capabilities)
2. Enable GPU droplets in DigitalOcean control panel:
   - Navigate to Settings → Feature Preview
   - Enable GPU droplets feature

## Creating a GPU-Enabled Kubernetes Cluster

Create a cluster using the DOCTL command line tool:

```bash
doctl kubernetes cluster create gpu-cluster \
  --region tor1 \
  --node-pool "name=gpu-worker-pool;size=gpu-h100-1;count=1"
```

The cluster will be provisioned with:

- Region: Toronto (tor1)
- Node pool: GPU worker pool
- Hardware: NVIDIA H100 GPU node
- Count: 1 node (sufficient for Llama 3.1 8B model)

### GPU Node Verification

The GPU nodes come with specific labels and taints:

- Labels: 
  - gpu.brand=nvidia
  - gpu.model=h100
- Taint: nvidia.com/gpu=no-schedule

## Setting Up Observability

### Installing Required Components

1. Deploy Metrics Server
2. Install Prometheus Stack with GPU metric scraping capabilities
3. Configure Grafana dashboards for GPU monitoring

The observability stack provides insights into:

- GPU temperature
- Power usage
- Clock speeds
- Utilization
- Frame buffer memory usage

## NVIDIA GPU Operator Deployment

The GPU Operator automates the management of NVIDIA software components:

- Container toolkit
- Kubernetes device plugin
- Node feature discovery
- GPU feature discovery
- DCGM exporter

Note: DigitalOcean GPU nodes come pre-installed with required drivers (CUDA driver version 550.90.07).

## Configuring Shared Storage

For multi-node deployments, shared storage is crucial for model access. We'll set up SMB storage:

1. Create a DigitalOcean droplet in the same VPC as the Kubernetes cluster
2. Attach a volume (500GB recommended for model storage)
3. Install and configure Samba server
4. Create Kubernetes PersistentVolumeClaims for model storage

### Storage Configuration Steps:

1. Install CSI driver for SMB
2. Create necessary Kubernetes secrets for SMB authentication
3. Configure firewall rules for secure access
4. Mount and export volumes for Kubernetes access

## Deploying Llama 3.1

### Prerequisites:

1. Create NVIDIA registry secrets in Kubernetes
2. Set up namespace for NIMs
3. Configure PVC for model storage

### Deployment Process:

1. Use Helm chart for deployment
2. Monitor model download and initialization
3. Verify deployment using built-in Helm tests

The deployment creates:

- NIM service on port 8000
- PVC for model storage
- GPU resource limits (1 GPU for 8B model)

## Interacting with the Model

The deployed model can be accessed via:

1. Direct HTTP POST requests
2. OpenAI-compatible tools (e.g., Misty)
3. Custom applications using the exposed API endpoint

## Performance Monitoring

Monitor deployment performance through Grafana dashboards:

- GPU memory utilization
- Power consumption
- Temperature metrics
- Processing speeds

## Additional Resources

For more advanced deployments:

- Performance testing scripts available in the repository
- Benchmark results for single and multi-node deployments
- Prerequisites for Llama 3.1 70B deployment on multiple nodes

## Acknowledgments

Documentation and implementation by Bikram Gupta (Lead Product Manager) and Jack Pearce (Solutions Architect) at DigitalOcean.