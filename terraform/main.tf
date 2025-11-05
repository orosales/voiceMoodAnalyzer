# Data source to get available availability domains
data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}

# Get the latest Ubuntu 22.04 ARM image
data "oci_core_images" "ubuntu_images" {
  compartment_id           = var.compartment_ocid
  operating_system         = "Canonical Ubuntu"
  operating_system_version = "22.04"
  shape                    = var.instance_shape
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

# Virtual Cloud Network (VCN)
resource "oci_core_vcn" "voice_mood_vcn" {
  compartment_id = var.compartment_ocid
  display_name   = "${var.instance_display_name}-vcn"
  cidr_blocks    = [var.vcn_cidr_block]
  dns_label      = "voicemood"
}

# Internet Gateway
resource "oci_core_internet_gateway" "voice_mood_ig" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.voice_mood_vcn.id
  display_name   = "${var.instance_display_name}-ig"
  enabled        = true
}

# Route Table
resource "oci_core_route_table" "voice_mood_rt" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.voice_mood_vcn.id
  display_name   = "${var.instance_display_name}-rt"

  route_rules {
    network_entity_id = oci_core_internet_gateway.voice_mood_ig.id
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
  }
}

# Security List
resource "oci_core_security_list" "voice_mood_sl" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.voice_mood_vcn.id
  display_name   = "${var.instance_display_name}-sl"

  # Egress: Allow all outbound traffic
  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
    stateless   = false
  }

  # Ingress: SSH (22)
  ingress_security_rules {
    protocol  = "6" # TCP
    source    = "0.0.0.0/0"
    stateless = false

    tcp_options {
      min = 22
      max = 22
    }
  }

  # Ingress: HTTP (80)
  ingress_security_rules {
    protocol  = "6" # TCP
    source    = "0.0.0.0/0"
    stateless = false

    tcp_options {
      min = 80
      max = 80
    }
  }

  # Ingress: HTTPS (443)
  ingress_security_rules {
    protocol  = "6" # TCP
    source    = "0.0.0.0/0"
    stateless = false

    tcp_options {
      min = 443
      max = 443
    }
  }

  # Ingress: ICMP for ping
  ingress_security_rules {
    protocol  = "1" # ICMP
    source    = "0.0.0.0/0"
    stateless = false

    icmp_options {
      type = 3
      code = 4
    }
  }
}

# Public Subnet
resource "oci_core_subnet" "voice_mood_subnet" {
  compartment_id      = var.compartment_ocid
  vcn_id              = oci_core_vcn.voice_mood_vcn.id
  cidr_block          = var.subnet_cidr_block
  display_name        = "${var.instance_display_name}-subnet"
  dns_label           = "public"
  route_table_id      = oci_core_route_table.voice_mood_rt.id
  security_list_ids   = [oci_core_security_list.voice_mood_sl.id]
  prohibit_public_ip_on_vnic = false
}

# Cloud-init script to install Docker and Docker Compose
locals {
  cloud_init = <<-EOF
    #cloud-config
    package_update: true
    package_upgrade: true

    packages:
      - apt-transport-https
      - ca-certificates
      - curl
      - gnupg
      - lsb-release
      - git

    runcmd:
      # Install Docker
      - curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
      - sh /tmp/get-docker.sh
      - usermod -aG docker ubuntu

      # Install Docker Compose
      - mkdir -p /usr/local/lib/docker/cli-plugins
      - curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-aarch64" -o /usr/local/lib/docker/cli-plugins/docker-compose
      - chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

      # Enable Docker service
      - systemctl enable docker
      - systemctl start docker

      # Create application directory
      - mkdir -p /opt/voice-mood-analyzer
      - chown ubuntu:ubuntu /opt/voice-mood-analyzer

      # Install useful utilities
      - apt-get install -y htop ncdu

      # Setup log rotation for Docker
      - |
        cat > /etc/docker/daemon.json << 'DOCKEREOF'
        {
          "log-driver": "json-file",
          "log-opts": {
            "max-size": "10m",
            "max-file": "3"
          }
        }
        DOCKEREOF
      - systemctl restart docker

    final_message: "Voice Mood Analyzer instance ready after $UPTIME seconds"
  EOF
}

# Compute Instance
resource "oci_core_instance" "voice_mood_instance" {
  compartment_id      = var.compartment_ocid
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  display_name        = var.instance_display_name
  shape               = var.instance_shape

  # Shape config for flexible shapes
  shape_config {
    ocpus         = var.instance_ocpus
    memory_in_gbs = var.instance_memory_in_gbs
  }

  # Boot volume
  source_details {
    source_type             = "image"
    source_id               = data.oci_core_images.ubuntu_images.images[0].id
    boot_volume_size_in_gbs = var.boot_volume_size_in_gbs
  }

  # Networking
  create_vnic_details {
    subnet_id        = oci_core_subnet.voice_mood_subnet.id
    display_name     = "${var.instance_display_name}-vnic"
    assign_public_ip = true
    hostname_label   = "voicemood"
  }

  # SSH key
  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    user_data           = base64encode(local.cloud_init)
  }

  # Preserve boot volume on instance termination
  preserve_boot_volume = false

  # Lifecycle
  timeouts {
    create = "20m"
  }
}

# Reserved Public IP (optional, for stable IP address)
resource "oci_core_public_ip" "voice_mood_public_ip" {
  compartment_id = var.compartment_ocid
  lifetime       = "RESERVED"
  display_name   = "${var.instance_display_name}-public-ip"

  lifecycle {
    ignore_changes = [private_ip_id]
  }
}
