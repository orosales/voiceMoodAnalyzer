output "instance_id" {
  description = "OCID of the compute instance"
  value       = oci_core_instance.voice_mood_instance.id
}

output "instance_public_ip" {
  description = "Public IP address of the instance"
  value       = oci_core_instance.voice_mood_instance.public_ip
}

output "reserved_public_ip" {
  description = "Reserved public IP address"
  value       = oci_core_public_ip.voice_mood_public_ip.ip_address
}

output "instance_state" {
  description = "State of the instance"
  value       = oci_core_instance.voice_mood_instance.state
}

output "ssh_connection" {
  description = "SSH connection command"
  value       = "ssh -i ~/.ssh/your-private-key ubuntu@${oci_core_instance.voice_mood_instance.public_ip}"
}

output "vcn_id" {
  description = "OCID of the Virtual Cloud Network"
  value       = oci_core_vcn.voice_mood_vcn.id
}

output "subnet_id" {
  description = "OCID of the public subnet"
  value       = oci_core_subnet.voice_mood_subnet.id
}

output "application_url" {
  description = "URL to access the application"
  value       = "http://${oci_core_instance.voice_mood_instance.public_ip}"
}
