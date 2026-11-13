# AWS RDS Module - main.tf

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

# Primary RDS Subnet Group
resource "aws_db_subnet_group" "this" {
  count       = var.create_db_subnet_group ? 1 : 0
  name        = "${var.project_name}subnet-group"
  description = "RDS subnet group for ${var.project_name}-${var.identifier}"
  subnet_ids  = var.subnet_ids

  tags = merge(
    {
      Name    = "${var.project_name}-subnet-group"
      Project = var.project_name
      Owner   = "lks-team"
    },
    var.tags,
  )
}

# Optional RDS Parameter Group
resource "aws_db_parameter_group" "this" {
  count       = var.create_db_parameter_group ? 1 : 0
  name        = "${var.project_name}-params"
  family      = var.parameter_group_family
  description = "RDS parameter group for ${var.project_name}-${var.identifier}"

  dynamic "parameter" {
    for_each = var.parameter_overrides
    content {
      name  = parameter.value.name
      value = parameter.value.value
    }
  }

  tags = merge(
    {
      Name    = "${var.project_name}-params"
      Project = var.project_name
      Owner   = "lks-team"
    },
    var.tags,
  )
}

# Optional RDS Option Group (for engines that support it)
resource "aws_db_option_group" "this" {
  count                    = var.create_option_group ? 1 : 0
  name                     = "${var.project_name}-options"
  engine_name              = var.engine
  major_engine_version     = var.major_engine_version
  option_group_description = "RDS option group for ${var.project_name}-${var.identifier}"

  dynamic "option" {
    for_each = var.option_group_options
    content {
      option_name = option.value.option_name

      dynamic "option_settings" {
        for_each = lookup(option.value, "option_settings", {})
        content {
          name  = option_settings.value.name
          value = option_settings.value.value
        }
      }

      # Some options may require VPC-specific settings; allow passing raw config
      port                           = lookup(option.value, "port", null)
      version                        = lookup(option.value, "version", null)
      db_security_group_memberships  = lookup(option.value, "db_security_group_memberships", null)
      vpc_security_group_memberships = lookup(option.value, "vpc_security_group_memberships", null)
    }
  }

  tags = merge(
    {
      Name    = "${var.project_name}-options"
      Project = var.project_name
      Owner   = "lks-team"
    },
    var.tags,
  )
}

# Primary RDS Instance (or first instance in a cluster, when using non-cluster engine)
resource "aws_db_instance" "this" {
  # Core identity / engine
  identifier     = "${var.project_name}-${var.identifier}"
  engine         = var.engine
  engine_version = var.engine_version
  instance_class = var.instance_class

  # Auth
  username = var.username
  password = var.password

  # Storage
  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type          = var.storage_type
  storage_encrypted     = var.storage_encrypted
  kms_key_id            = var.kms_key_id

  # Network
  vpc_security_group_ids = var.vpc_security_group_ids
  db_subnet_group_name   = var.create_db_subnet_group ? aws_db_subnet_group.this[0].name : var.db_subnet_group_name

  # Connectivity
  publicly_accessible = var.publicly_accessible
  port                = var.port

  # Maintenance / backups
  backup_retention_period         = var.backup_retention_period
  backup_window                   = var.backup_window
  maintenance_window              = var.maintenance_window
  auto_minor_version_upgrade      = var.auto_minor_version_upgrade
  deletion_protection             = var.deletion_protection
  copy_tags_to_snapshot           = true
  multi_az                        = var.multi_az
  performance_insights_enabled    = var.performance_insights_enabled
  performance_insights_kms_key_id = var.performance_insights_kms_key_id
  monitoring_interval             = var.monitoring_interval
  monitoring_role_arn             = var.monitoring_role_arn

  # DB details
  db_name                   = var.db_name
  parameter_group_name      = var.create_db_parameter_group ? aws_db_parameter_group.this[0].name : var.parameter_group_name
  option_group_name         = var.create_option_group ? aws_db_option_group.this[0].name : var.option_group_name
  apply_immediately         = var.apply_immediately
  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${var.project_name}-${var.identifier}-final-snapshot"

  # IOPS / storage throughput (for relevant storage types)
  iops               = var.iops
  storage_throughput = var.storage_throughput

  # Timeouts
  delete_automated_backups = var.delete_automated_backups

  # Tags
  tags = merge(
    {
      Name    = "${var.project_name}-${var.identifier}"
      Project = var.project_name
      Owner   = "lks-team"
    },
    var.tags,
  )

  lifecycle {
    prevent_destroy = false
  }
}

# Optional Read Replica(s)
resource "aws_db_instance" "read_replica" {
  count = var.read_replica_count

  identifier          = "${var.project_name}-${var.identifier}-ro-${count.index}"
  replicate_source_db = aws_db_instance.this.id

  instance_class = var.read_replica_instance_class != "" ? var.read_replica_instance_class : var.instance_class

  # Network
  vpc_security_group_ids = var.vpc_security_group_ids
  db_subnet_group_name   = var.create_db_subnet_group ? aws_db_subnet_group.this[0].name : var.db_subnet_group_name
  publicly_accessible    = var.publicly_accessible
  port                   = var.port

  # Maintenance / backups
  auto_minor_version_upgrade      = var.auto_minor_version_upgrade
  maintenance_window              = var.maintenance_window
  performance_insights_enabled    = var.performance_insights_enabled
  performance_insights_kms_key_id = var.performance_insights_kms_key_id
  monitoring_interval             = var.monitoring_interval
  monitoring_role_arn             = var.monitoring_role_arn
  apply_immediately               = var.apply_immediately

  tags = merge(
    {
      Name    = "${var.project_name}-${var.identifier}-ro-${count.index}"
      Project = var.project_name
      Owner   = "lks-team"
      Role    = "replica"
    },
    var.tags,
  )

  lifecycle {
    prevent_destroy = false
  }
}
