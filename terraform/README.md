# LKS Infrastructure as Code

This directory contains the Terraform Infrastructure as Code (IaC) for the LKS project, organized using a modular, stack-based approach.

## Architecture

The infrastructure is organized into **stacks** and **modules**:

### Stacks
- **Base Stack** (`stacks/base/`) - Foundation infrastructure (VPC, Security Groups)
- **NAT Stack** (`stacks/bastion/`) - Bastion host with NAT gateway and VPN

### Modules
- **Network Modules** (`modules/network/`) - VPC, Security Groups
- **Compute Modules** (`modules/compute/`) - Reusable EC2 instances

## Quick Start

### Deploy Infrastructure
```bash
cd stacks/base && terrfaform
```

### Check Status
```bash
./deploy.sh status
```

### Destroy Infrastructure
```bash
./deploy.sh destroy all
```

# List state for all stacks
./lkstf.sh state-list

# Clean up .terraform directories
./lkstf.sh clean
```

### Individual Stack Commands
```bash
# Navigate to a specific stack
cd stacks/base

# Initialize
terraform init

# Format
terraform fmt

# Validate
terraform validate

# Plan
terraform plan

# Apply
terraform apply

# Show outputs
terraform output
```

## Prerequisites

1. **Terraform** (>= 1.0)
2. **AWS CLI** configured with appropriate credentials
