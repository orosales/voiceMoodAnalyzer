# OCI Authentication
variable "tenancy_ocid" {
  description = "OCI Tenancy OCID"
  type        = string
}

variable "user_ocid" {
  description = "OCI User OCID"
  type        = string
}

variable "fingerprint" {
  description = "Fingerprint of the OCI API key"
  type        = string
}

variable "private_key_path" {
  description = "Path to OCI API private key"
  type        = string
}

variable "region" {
  description = "OCI region"
  type        = string
  default     = "us-ashburn-1"
}

variable "compartment_ocid" {
  description = "OCI Compartment OCID (use tenancy OCID for root compartment)"
  type        = string
}

# Instance Configuration
variable "instance_display_name" {
  description = "Display name for the compute instance"
  type        = string
  default     = "voice-mood-analyzer"
}

variable "instance_shape" {
  description = "Instance shape (VM.Standard.A1.Flex for ARM free tier)"
  type        = string
  default     = "VM.Standard.A1.Flex"
}

variable "instance_ocpus" {
  description = "Number of OCPUs (free tier allows up to 4)"
  type        = number
  default     = 4
}

variable "instance_memory_in_gbs" {
  description = "Amount of memory in GB (free tier allows up to 24GB)"
  type        = number
  default     = 24
}

variable "boot_volume_size_in_gbs" {
  description = "Boot volume size in GB (free tier allows up to 200GB total)"
  type        = number
  default     = 100
}

# SSH Configuration
variable "ssh_public_key" {
  description = "SSH public key for instance access"
  type        = string
}

# Networking
variable "vcn_cidr_block" {
  description = "CIDR block for Virtual Cloud Network"
  type        = string
  default     = "10.0.0.0/16"
}

variable "subnet_cidr_block" {
  description = "CIDR block for public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

# Application Configuration
variable "app_ports" {
  description = "List of application ports to open"
  type        = list(number)
  default     = [22, 80, 443]
}
