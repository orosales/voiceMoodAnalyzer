# Terraform Configuration for Oracle Cloud Infrastructure

This directory contains Terraform configuration files to provision infrastructure for VoiceMoodAnalyzer on Oracle Cloud Free Tier.

## 📋 Prerequisites

1. **Oracle Cloud Account** - [Sign up here](https://www.oracle.com/cloud/free/)
2. **Terraform** - [Install Terraform](https://www.terraform.io/downloads) (v1.0+)
3. **OCI API Keys** - Follow [OCI Setup Guide](../docs/OCI_SETUP.md)

## 🚀 Quick Start

### 1. Configure Credentials

```bash
# Copy example configuration
cp terraform.tfvars.example terraform.tfvars

# Edit with your OCI credentials
nano terraform.tfvars
```

Required values:
- `tenancy_ocid` - Your OCI tenancy OCID
- `user_ocid` - Your user OCID
- `fingerprint` - API key fingerprint
- `private_key_path` - Path to your private key file
- `region` - OCI region (e.g., us-ashburn-1)
- `compartment_ocid` - Compartment OCID (use tenancy OCID for root)
- `ssh_public_key` - Your SSH public key for instance access

### 2. Initialize Terraform

```bash
terraform init
```

This downloads the OCI provider plugin.

### 3. Plan Deployment

```bash
terraform plan
```

Review the resources that will be created:
- 1 Virtual Cloud Network (VCN)
- 1 Subnet (public)
- 1 Internet Gateway
- 1 Route Table
- 1 Security List (firewall rules)
- 1 Compute Instance (VM.Standard.A1.Flex)
- 1 Reserved Public IP

### 4. Deploy Infrastructure

```bash
terraform apply
```

Type `yes` when prompted.

**Deployment time:** ~5-10 minutes

### 5. Get Connection Info

```bash
terraform output
```

Outputs:
```
application_url = "http://XXX.XXX.XXX.XXX"
instance_public_ip = "XXX.XXX.XXX.XXX"
ssh_connection = "ssh -i ~/.ssh/your-key ubuntu@XXX.XXX.XXX.XXX"
```

Save the `instance_public_ip` for GitHub Actions configuration.

## 📁 Files Description

| File | Description |
|------|-------------|
| `provider.tf` | OCI provider configuration |
| `variables.tf` | Input variables with descriptions |
| `main.tf` | Main infrastructure resources |
| `outputs.tf` | Output values after deployment |
| `terraform.tfvars.example` | Template for your credentials |

## 🔧 Configuration Options

### Instance Size

**Default:** VM.Standard.A1.Flex (4 OCPUs, 24GB RAM) - Maximum free tier

To use less resources:
```hcl
instance_ocpus         = 2    # 2 CPUs
instance_memory_in_gbs = 12   # 12GB RAM
```

⚠️ **Minimum requirements for ML models:** 2 OCPUs, 8GB RAM

### Storage

**Default:** 100GB boot volume (50% of free tier limit)

To adjust:
```hcl
boot_volume_size_in_gbs = 50  # Reduce to 50GB
```

### Region

**Default:** us-ashburn-1

Alternative free tier regions:
```hcl
region = "us-phoenix-1"    # Phoenix, AZ
region = "eu-frankfurt-1"  # Frankfurt, Germany
region = "ap-mumbai-1"     # Mumbai, India
```

## 🔥 Managing Infrastructure

### View Current State

```bash
terraform show
```

### Update Configuration

1. Edit `terraform.tfvars` or `main.tf`
2. Run `terraform plan` to preview changes
3. Run `terraform apply` to apply changes

### Destroy Resources

⚠️ **Warning:** This will delete all infrastructure!

```bash
terraform destroy
```

Type `yes` when prompted.

## 🐛 Troubleshooting

### Issue: "Out of capacity for shape VM.Standard.A1.Flex"

**Cause:** ARM instances are in high demand.

**Solution:**
```bash
# Try different region
terraform apply -var="region=us-phoenix-1"

# Or retry multiple times
for i in {1..5}; do
  terraform apply -auto-approve && break
  echo "Retry $i/5..."
  sleep 60
done
```

### Issue: "Service error: NotAuthorizedOrNotFound"

**Cause:** Wrong compartment OCID or permissions.

**Solution:**
- Use tenancy OCID as compartment OCID for free tier
- Verify OCIDs match in OCI Console

### Issue: "Invalid API key"

**Cause:** Fingerprint mismatch.

**Solution:**
```bash
# Get fingerprint from private key
openssl rsa -pubout -outform DER -in ~/.oci/oci_api_key.pem | openssl md5 -c

# Compare with OCI Console → User Settings → API Keys
```

### Issue: State Lock Error

**Cause:** Previous Terraform process didn't exit cleanly.

**Solution:**
```bash
terraform force-unlock <LOCK_ID>
```

## 🔐 Security Best Practices

### ✅ Do:
- Keep `terraform.tfvars` secure (already in .gitignore)
- Use strong SSH key passphrases
- Rotate API keys every 90 days
- Review security list rules before applying
- Use separate compartments for different environments

### ❌ Don't:
- Commit `terraform.tfvars` to Git
- Share API keys or private keys
- Use default passwords
- Open all ports in security lists

## 📊 Cost Estimation

### Free Tier Resources (Always Free)

| Resource | Limit | Our Usage | Status |
|----------|-------|-----------|--------|
| **Compute (ARM)** | 4 OCPUs, 24GB RAM | 4 OCPUs, 24GB RAM | ✅ 100% used |
| **Boot Volumes** | 200GB total | 100GB | ✅ 50% used |
| **Outbound Data** | 10TB/month | <1TB/month | ✅ <10% used |
| **VCNs** | 2 VCNs | 1 VCN | ✅ 50% used |

**Total Cost:** $0/month (within free tier limits)

## 🔄 CI/CD Integration

This Terraform configuration integrates with GitHub Actions:

1. **Manual Provisioning** (You do this once):
   ```bash
   terraform apply
   ```

2. **Automated Deployment** (GitHub Actions):
   - Uses the instance created by Terraform
   - Connects via SSH using GitHub Secrets
   - See [CICD.md](../docs/CICD.md) for setup

## 📚 Additional Resources

- [OCI Free Tier Documentation](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm)
- [Terraform OCI Provider](https://registry.terraform.io/providers/oracle/oci/latest/docs)
- [OCI Compute Shapes](https://docs.oracle.com/en-us/iaas/Content/Compute/References/computeshapes.htm)
- [Full Setup Guide](../docs/OCI_SETUP.md)

## 🤝 Support

- **Issues:** Check [docs/OCI_SETUP.md](../docs/OCI_SETUP.md) troubleshooting section
- **Terraform Issues:** [GitHub Issues](https://github.com/yourusername/voice-mood-analyzer/issues)
- **OCI Support:** [Oracle Cloud Support](https://support.oracle.com/)

---

**Next Steps:** After deploying infrastructure, proceed to [CI/CD Setup](../docs/CICD.md)
