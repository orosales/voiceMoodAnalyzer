# Oracle Cloud Infrastructure (OCI) Setup Guide

This guide walks you through setting up Oracle Cloud Free Tier for deploying the VoiceMoodAnalyzer application.

## Table of Contents
1. [Create OCI Account](#1-create-oci-account)
2. [Generate API Keys](#2-generate-api-keys)
3. [Configure Terraform](#3-configure-terraform)
4. [Deploy Infrastructure](#4-deploy-infrastructure)
5. [Verify Deployment](#5-verify-deployment)
6. [Troubleshooting](#troubleshooting)

---

## 1. Create OCI Account

### Step 1.1: Sign Up for Oracle Cloud Free Tier

1. Go to [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)
2. Click **Start for free**
3. Fill in your information:
   - Email address
   - Country/Territory
   - Name and phone number
4. Verify your email and phone number
5. Set up payment method (required but **you won't be charged** for free tier resources)

### Step 1.2: Wait for Account Approval

- Approval typically takes **a few minutes to 24 hours**
- You'll receive an email when your account is ready
- Check spam folder if you don't see the email

### Step 1.3: Sign In to OCI Console

1. Go to [https://cloud.oracle.com/](https://cloud.oracle.com/)
2. Enter your **Cloud Account Name** (tenancy name from registration email)
3. Click **Continue**
4. Sign in with your Oracle Cloud credentials

---

## 2. Generate API Keys

### Step 2.1: Create API Key Pair

**On Linux/Mac:**
```bash
# Create directory for OCI keys
mkdir -p ~/.oci

# Generate API key pair
openssl genrsa -out ~/.oci/oci_api_key.pem 2048

# Set proper permissions
chmod 600 ~/.oci/oci_api_key.pem

# Generate public key
openssl rsa -pubout -in ~/.oci/oci_api_key.pem -out ~/.oci/oci_api_key_public.pem
```

**On Windows (PowerShell):**
```powershell
# Create directory
New-Item -ItemType Directory -Force -Path $env:USERPROFILE\.oci

# Generate keys (requires OpenSSL)
openssl genrsa -out $env:USERPROFILE\.oci\oci_api_key.pem 2048
openssl rsa -pubout -in $env:USERPROFILE\.oci\oci_api_key.pem -out $env:USERPROFILE\.oci\oci_api_key_public.pem
```

### Step 2.2: Upload Public Key to OCI

1. In OCI Console, click your **user icon** (top right) → **User Settings**
2. Under **Resources** (left sidebar), click **API Keys**
3. Click **Add API Key**
4. Select **Paste Public Key**
5. Copy content of `~/.oci/oci_api_key_public.pem`:
   ```bash
   cat ~/.oci/oci_api_key_public.pem
   ```
6. Paste the public key and click **Add**

### Step 2.3: Save Configuration Details

After adding the API key, OCI shows a configuration file preview. **Copy these values** (you'll need them for Terraform):

```ini
[DEFAULT]
user=ocid1.user.oc1..aaaaaaaa...
fingerprint=aa:bb:cc:dd:ee:ff:00:11:22:33:44:55:66:77:88:99
tenancy=ocid1.tenancy.oc1..aaaaaaaa...
region=us-ashburn-1
key_file=<path to your private keyfile>
```

---

## 3. Configure Terraform

### Step 3.1: Get Compartment OCID

1. In OCI Console, click **☰ Menu** → **Identity & Security** → **Compartments**
2. You'll see **(root)** compartment with an OCID like `ocid1.tenancy.oc1..aaaaaaaa...`
3. **For free tier, use your tenancy OCID as compartment OCID**
4. Copy this value

### Step 3.2: Create terraform.tfvars

1. Navigate to the `terraform/` directory:
   ```bash
   cd terraform/
   ```

2. Copy the example file:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

3. Edit `terraform.tfvars` with your values:
   ```hcl
   # OCI Authentication
   tenancy_ocid     = "ocid1.tenancy.oc1..aaaaaaaa..."      # From Step 2.3
   user_ocid        = "ocid1.user.oc1..aaaaaaaa..."         # From Step 2.3
   fingerprint      = "aa:bb:cc:dd:ee:ff:..."               # From Step 2.3
   private_key_path = "/home/yourname/.oci/oci_api_key.pem" # Path to private key
   region           = "us-ashburn-1"                        # From Step 2.3
   compartment_ocid = "ocid1.tenancy.oc1..aaaaaaaa..."      # Same as tenancy_ocid for root

   # Instance Configuration (Free Tier Defaults)
   instance_display_name  = "voice-mood-analyzer"
   instance_shape         = "VM.Standard.A1.Flex"  # ARM free tier
   instance_ocpus         = 4                       # Max free tier OCPUs
   instance_memory_in_gbs = 24                      # Max free tier RAM
   boot_volume_size_in_gbs = 100                    # 100GB boot volume

   # SSH Configuration
   ssh_public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQD... your-email@example.com"
   ```

### Step 3.3: Generate SSH Key for Instance Access

**If you don't have an SSH key:**
```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/oci_voice_mood -C "voice-mood-oci"
```

**Get your public key:**
```bash
cat ~/.ssh/oci_voice_mood.pub
```

Copy the entire output and paste it as `ssh_public_key` in `terraform.tfvars`.

---

## 4. Deploy Infrastructure

### Step 4.1: Initialize Terraform

```bash
cd terraform/
terraform init
```

Expected output:
```
Initializing the backend...
Initializing provider plugins...
- Finding oracle/oci versions matching "~> 5.0"...
Terraform has been successfully initialized!
```

### Step 4.2: Validate Configuration

```bash
terraform validate
```

Expected output:
```
Success! The configuration is valid.
```

### Step 4.3: Plan Deployment

```bash
terraform plan
```

Review the resources that will be created:
- Virtual Cloud Network (VCN)
- Subnet
- Internet Gateway
- Security List (firewall rules)
- Compute Instance (VM.Standard.A1.Flex)
- Public IP

### Step 4.4: Apply Configuration

```bash
terraform apply
```

Type `yes` when prompted.

**Deployment time:** ~5-10 minutes

### Step 4.5: Save Outputs

After successful deployment, Terraform displays outputs:

```
Outputs:

application_url = "http://XXX.XXX.XXX.XXX"
instance_public_ip = "XXX.XXX.XXX.XXX"
reserved_public_ip = "XXX.XXX.XXX.XXX"
ssh_connection = "ssh -i ~/.ssh/your-private-key ubuntu@XXX.XXX.XXX.XXX"
```

**Save the public IP** - you'll need it for GitHub Actions.

---

## 5. Verify Deployment

### Step 5.1: SSH into Instance

```bash
ssh -i ~/.ssh/oci_voice_mood ubuntu@<PUBLIC_IP>
```

### Step 5.2: Check Docker Installation

```bash
docker --version
docker compose version
```

Expected output:
```
Docker version 24.0.x
Docker Compose version v2.x.x
```

### Step 5.3: Verify Cloud-Init Completion

```bash
cloud-init status
```

Wait until you see:
```
status: done
```

### Step 5.4: Create Application Directory

```bash
cd /opt/voice-mood-analyzer
ls -la
```

You should see an empty directory (created by Terraform cloud-init).

---

## Troubleshooting

### Issue: "Out of capacity for shape VM.Standard.A1.Flex"

**Cause:** ARM instances are in high demand in some regions.

**Solutions:**
1. Try different regions in `terraform.tfvars`:
   ```hcl
   region = "us-phoenix-1"    # Try Phoenix
   region = "eu-frankfurt-1"  # Try Frankfurt
   region = "ap-mumbai-1"     # Try Mumbai
   ```

2. Use script to auto-retry:
   ```bash
   for i in {1..10}; do
     terraform apply -auto-approve && break
     echo "Retry $i/10..."
     sleep 60
   done
   ```

### Issue: "Service error: NotAuthorizedOrNotFound"

**Cause:** Incorrect compartment OCID or permissions.

**Solution:**
- For free tier, use **tenancy OCID** as **compartment OCID**
- Verify OCIDs in `terraform.tfvars` match OCI Console

### Issue: "Invalid API key"

**Cause:** API key or fingerprint mismatch.

**Solution:**
1. Verify fingerprint matches in OCI Console:
   - Click user icon → User Settings → API Keys
   - Compare fingerprint with `terraform.tfvars`

2. Regenerate keys if needed (Step 2.1-2.2)

### Issue: Can't SSH into instance

**Cause:** Security list or wrong SSH key.

**Solution:**
1. Check security list allows port 22 from your IP
2. Verify you're using the correct private key:
   ```bash
   ssh -i ~/.ssh/oci_voice_mood ubuntu@<IP>
   ```

### Issue: "PrincipalNotFound" error

**Cause:** User doesn't have required permissions.

**Solution:**
- Ensure you're signed in as the correct user
- Contact your OCI administrator if using organization account

---

## Free Tier Limits Reference

| Resource | Free Tier Limit |
|----------|-----------------|
| **Compute (ARM)** | 4 OCPUs, 24GB RAM total |
| **Boot Volumes** | 200GB total across all instances |
| **Block Volumes** | 200GB total |
| **Outbound Data Transfer** | 10TB/month |
| **Load Balancers** | 1 instance (10Mbps) |
| **VCNs** | 2 VCNs |

**Note:** Our deployment uses:
- 4 OCPUs, 24GB RAM (maximum free tier compute)
- 100GB boot volume (50% of free tier storage)
- 1 VCN with public subnet

---

## Next Steps

After successful OCI setup:
1. Continue to [CI/CD Setup Guide](./CICD.md)
2. Configure GitHub Actions secrets
3. Deploy your application

---

## Additional Resources

- [OCI Documentation](https://docs.oracle.com/en-us/iaas/Content/home.htm)
- [OCI Free Tier FAQ](https://www.oracle.com/cloud/free/faq.html)
- [Terraform OCI Provider](https://registry.terraform.io/providers/oracle/oci/latest/docs)
- [OCI Always Free Resources](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm)
