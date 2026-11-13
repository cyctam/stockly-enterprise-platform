variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "lks"
}

variable "nat_ami" {
  description = "AMI ID for the NAT host"
  type        = string
  default     = "ami-020cba7c55df1f615"
}

variable "nat_instance_type" {
  description = "EC2 instance type for NAT host"
  type        = string
  default     = "t3.micro"
}

variable "nat_key_name" {
  description = "Name of the key pair for NAT host"
  type        = string
  default     = "vockey"
}

variable "nat_root_volume_size" {
  description = "Size of the root volume in GB for NAT host"
  type        = number
  default     = 20
}

variable "nat_root_volume_type" {
  description = "Type of the root volume for NAT host"
  type        = string
  default     = "gp3"
}

variable "nat_root_volume_encrypted" {
  description = "Whether to encrypt the root volume for NAT host"
  type        = bool
  default     = true
}
