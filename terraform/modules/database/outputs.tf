output "db_instance_identifier" {
  description = "Identifier of the RDS instance"
  value       = aws_db_instance.this.id
}

output "db_instance_arn" {
  description = "ARN of the RDS instance"
  value       = aws_db_instance.this.arn
}

output "db_instance_endpoint" {
  description = "Connection endpoint for the RDS instance"
  value       = aws_db_instance.this.endpoint
}

output "db_instance_address" {
  description = "Hostname/address of the RDS instance"
  value       = aws_db_instance.this.address
}

output "db_instance_port" {
  description = "Port of the RDS instance"
  value       = aws_db_instance.this.port
}

output "db_instance_engine" {
  description = "Database engine of the RDS instance"
  value       = aws_db_instance.this.engine
}

output "db_instance_engine_version" {
  description = "Database engine version of the RDS instance"
  value       = aws_db_instance.this.engine_version
}

output "db_instance_username" {
  description = "Master username for the RDS instance (if managed by this module)"
  value       = aws_db_instance.this.username
  sensitive   = true
}

output "db_instance_password" {
  description = "Master password for the RDS instance (if managed by this module)"
  value       = aws_db_instance.this.password
  sensitive   = true
}

output "db_instance_database" {
  description = "Database name for the RDS instance"
  value       = aws_db_instance.this.db_name
}

output "db_instance_subnet_group_name" {
  description = "DB subnet group name associated with the RDS instance"
  value       = aws_db_instance.this.db_subnet_group_name
}

output "db_instance_vpc_security_group_ids" {
  description = "VPC security group IDs associated with the RDS instance"
  value       = aws_db_instance.this.vpc_security_group_ids
}

output "db_instance_backup_window" {
  description = "Backup window configured for the RDS instance"
  value       = aws_db_instance.this.backup_window
}

output "db_instance_maintenance_window" {
  description = "Maintenance window configured for the RDS instance"
  value       = aws_db_instance.this.maintenance_window
}

output "db_instance_storage_encrypted" {
  description = "Whether storage encryption is enabled for the RDS instance"
  value       = aws_db_instance.this.storage_encrypted
}

output "db_instance_kms_key_id" {
  description = "KMS key ID used for storage encryption (if any)"
  value       = aws_db_instance.this.kms_key_id
}

output "db_instance_monitoring_role_arn" {
  description = "Enhanced monitoring IAM role ARN (if enabled)"
  value       = aws_db_instance.this.monitoring_role_arn
}

output "db_instance_multi_az" {
  description = "Whether the RDS instance is configured as Multi-AZ"
  value       = aws_db_instance.this.multi_az
}

output "db_instance_tags" {
  description = "All tags applied to the RDS instance"
  value       = aws_db_instance.this.tags_all
}
