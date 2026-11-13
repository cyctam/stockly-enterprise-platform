output "nat_instance_id" {
  description = "ID of the NAT instance"
  value       = module.nat.instance_id
}

output "nat_public_ip" {
  description = "Public IP of the NAT instance"
  value       = module.nat.instance_public_ip
}

output "nat_private_ip" {
  description = "Private IP of the NAT instance"
  value       = module.nat.instance_private_ip
}

output "nat_security_group_id" {
  description = "Security group ID of the NAT instance"
  value       = module.nat_sg.security_group_id
}
