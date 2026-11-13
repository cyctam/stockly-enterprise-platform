terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Data source to get base infrastructure outputs
data "terraform_remote_state" "base" {
  backend = "local"
  config = {
    path = "../base/terraform.tfstate"
  }
}

# NAT Security Group
module "nat_sg" {
  source = "../../modules/network/security-group"

  project_name        = var.project_name
  security_group_name = "nat-sg"
  security_group_type = "nat"
  description         = "Security group for NAT host"
  vpc_id              = data.terraform_remote_state.base.outputs.vpc_id

  ingress_rules = [
    {
      description = "All ports TCP from local network for NAT"
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = [data.terraform_remote_state.base.outputs.vpc_cidr_block]
    },
  ]

  egress_rules = [
    {
      description = "All outbound traffic"
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = ["0.0.0.0/0"]
    }
  ]

  tags = {
    Name    = "${var.project_name}-nat-sg"
    Project = var.project_name
    Owner   = "lks-team"
  }
}

# NAT EC2 Instance
module "nat" {
  source = "../../modules/compute/ec2"

  project_name                = var.project_name
  instance_name               = "nat-host"
  ami                         = var.nat_ami
  instance_type               = var.nat_instance_type
  key_name                    = var.nat_key_name
  security_group_ids          = [module.nat_sg.security_group_id]
  subnet_id                   = data.terraform_remote_state.base.outputs.public_subnet_1_id
  iam_instance_profile        = "EC2SSM"
  source_dest_check           = false
  root_volume_size            = var.nat_root_volume_size
  root_volume_type            = var.nat_root_volume_type
  root_volume_encrypted       = var.nat_root_volume_encrypted
  create_eip                  = true
  associate_public_ip_address = true
  user_data                   = templatefile("${path.module}/user_data.sh")
}

# Route table for private subnets to route through bastion host
resource "aws_route_table" "private_rt_with_nat" {
  vpc_id = data.terraform_remote_state.base.outputs.vpc_id

  route {
    cidr_block           = "0.0.0.0/0"
    network_interface_id = module.bastion.primary_network_interface_id
  }

  tags = {
    Name    = "${var.project_name}-private-rt-nat"
    Project = var.project_name
    Owner   = "lks-team"
  }
}

# Route table association for private subnet 1
resource "aws_route_table_association" "private_rta_1" {
  subnet_id      = data.terraform_remote_state.base.outputs.private_subnet_1_id
  route_table_id = aws_route_table.private_rt_with_nat.id
}

# Route table association for private subnet 2
resource "aws_route_table_association" "private_rta_2" {
  subnet_id      = data.terraform_remote_state.base.outputs.private_subnet_2_id
  route_table_id = aws_route_table.private_rt_with_nat.id
}
