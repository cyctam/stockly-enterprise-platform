variable "project_name" {
  description = "Name of the project that owns this RDS instance"
  type        = string
}

variable "identifier" {
  description = "Logical identifier/name used for RDS-related resources"
  type        = string
}

variable "engine" {
  description = "Database engine (e.g., postgres, mysql, mariadb)"
  type        = string
  default     = "postgres"
}

variable "engine_version" {
  description = "Full version of the database engine (e.g., 14.11)"
  type        = string
  default     = "14.11"
}

variable "major_engine_version" {
  description = "Major engine version for option group (e.g., 14)"
  type        = string
  default     = "14"
}

variable "instance_class" {
  description = "RDS instance class (e.g., db.t3.micro)"
  type        = string
  default     = "db.t3.micro"
}

variable "allocated_storage" {
  description = "The allocated storage in gigabytes"
  type        = number
  default     = 20
}

variable "max_allocated_storage" {
  description = "The upper limit to which Amazon RDS can automatically scale the storage"
  type        = number
  default     = null
}

variable "storage_type" {
  description = "Type of storage (standard, gp2, gp3, io1)"
  type        = string
  default     = "gp3"
}

variable "storage_encrypted" {
  description = "Specifies whether the DB instance is encrypted"
  type        = bool
  default     = true
}

variable "kms_key_id" {
  description = "The ARN for the KMS encryption key, when storage_encrypted is true"
  type        = string
  default     = null
}

variable "multi_az" {
  description = "Specifies if the RDS instance is multi-AZ"
  type        = bool
  default     = false
}

variable "username" {
  description = "Master username for the database"
  type        = string
}

variable "password" {
  description = "Master password for the database"
  type        = string
  sensitive   = true
}

variable "port" {
  description = "The port on which the DB accepts connections"
  type        = number
  default     = 5432
}

variable "db_name" {
  description = "Name of the initial database to create"
  type        = string
  default     = null
}

variable "parameter_group_name" {
  description = "Name of the DB parameter group to associate (if not created by this module)"
  type        = string
  default     = null
}

variable "parameter_group_family" {
  description = "Family of the DB parameter group (e.g., postgres14) when creating a parameter group"
  type        = string
  default     = "postgres14"
}

variable "option_group_name" {
  description = "Name of the DB option group to associate (if not created by this module)"
  type        = string
  default     = null
}

variable "maintenance_window" {
  description = "Preferred maintenance window in UTC (e.g., sun:23:00-mon:01:30)"
  type        = string
  default     = null
}

variable "backup_window" {
  description = "Preferred backup window in UTC (e.g., 03:00-06:00)"
  type        = string
  default     = null
}

variable "backup_retention_period" {
  description = "The days to retain backups for. 0 to disable automated backups"
  type        = number
  default     = 7
}

variable "deletion_protection" {
  description = "If the DB instance should have deletion protection enabled"
  type        = bool
  default     = true
}

variable "copy_tags_to_snapshot" {
  description = "Copy all instance tags to snapshots"
  type        = bool
  default     = true
}

variable "auto_minor_version_upgrade" {
  description = "Indicates that minor engine upgrades are applied automatically"
  type        = bool
  default     = true
}

variable "availability_zone" {
  description = "The AZ for the RDS instance. If not set, AWS will choose"
  type        = string
  default     = null
}

variable "db_subnet_group_name" {
  description = "Name of DB subnet group to use instead of creating a new one"
  type        = string
  default     = null
}

variable "subnet_ids" {
  description = "List of subnet IDs for DB subnet group creation (if db_subnet_group_name is not provided)"
  type        = list(string)
  default     = []
}

variable "create_db_subnet_group" {
  description = "Whether to create a DB subnet group from subnet_ids"
  type        = bool
  default     = false
}

variable "vpc_security_group_ids" {
  description = "List of VPC security groups to associate with the RDS instance"
  type        = list(string)
  default     = []
}

variable "publicly_accessible" {
  description = "Bool to control if instance is publicly accessible"
  type        = bool
  default     = false
}

variable "monitoring_interval" {
  description = "The interval, in seconds, between points when Enhanced Monitoring metrics are collected. 0 disables monitoring."
  type        = number
  default     = 0
}

variable "monitoring_role_arn" {
  description = "IAM role ARN for Enhanced Monitoring"
  type        = string
  default     = null
}

variable "performance_insights_enabled" {
  description = "Specifies whether Performance Insights are enabled"
  type        = bool
  default     = false
}

variable "performance_insights_kms_key_id" {
  description = "The ARN for the KMS key to encrypt Performance Insights data"
  type        = string
  default     = null
}

variable "performance_insights_retention_period" {
  description = "The amount of time in days to retain Performance Insights data"
  type        = number
  default     = 7
}

variable "apply_immediately" {
  description = "Specifies whether modifications are applied immediately or during the next maintenance window"
  type        = bool
  default     = false
}

variable "iam_database_authentication_enabled" {
  description = "Specifies whether IAM database authentication is enabled"
  type        = bool
  default     = false
}

variable "delete_automated_backups" {
  description = "Specifies whether to remove automated backups immediately after the DB instance is deleted"
  type        = bool
  default     = true
}

variable "skip_final_snapshot" {
  description = "Determines whether a final DB snapshot is created before the DB instance is deleted"
  type        = bool
  default     = false
}

variable "iops" {
  description = "The amount of provisioned IOPS. Required for certain storage types."
  type        = number
  default     = null
}

variable "storage_throughput" {
  description = "The storage throughput value for the DB instance (for gp3 storage type)"
  type        = number
  default     = null
}

variable "read_replica_count" {
  description = "Number of read replicas to create"
  type        = number
  default     = 0
}

variable "read_replica_instance_class" {
  description = "Instance class to use for read replicas (defaults to primary instance_class when empty)"
  type        = string
  default     = ""
}

variable "create_db_parameter_group" {
  description = "Whether to create a DB parameter group"
  type        = bool
  default     = false
}

variable "parameter_overrides" {
  description = "Map of parameter override objects for the DB parameter group. Each value should contain name and value."
  type = map(object({
    name  = string
    value = string
  }))
  default = {}
}

variable "create_option_group" {
  description = "Whether to create a DB option group"
  type        = bool
  default     = false
}

variable "option_group_options" {
  description = "Map of options to configure in the option group"
  type = map(object({
    option_name                    = string
    port                           = optional(number)
    version                        = optional(string)
    db_security_group_memberships  = optional(list(string))
    vpc_security_group_memberships = optional(list(string))
    option_settings = optional(map(object({
      name  = string
      value = string
    })))
  }))
  default = {}
}

variable "prevent_destroy" {
  description = "Whether to add a lifecycle rule to prevent accidental destroy of the DB instance"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Additional tags for the RDS resources"
  type        = map(string)
  default     = {}
}
