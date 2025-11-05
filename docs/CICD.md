# CI/CD Setup Guide - GitHub Actions

This guide explains how to set up automated deployment for VoiceMoodAnalyzer using GitHub Actions, Docker Hub, and Oracle Cloud Infrastructure.

## Architecture Overview

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌─────────────┐
│   GitHub    │ ───> │GitHub Actions│ ───> │ Docker Hub  │ ───> │  OCI VM     │
│ (Push Code) │      │  (Build CI)  │      │  (Images)   │      │ (Deploy)    │
└─────────────┘      └──────────────┘      └─────────────┘      └─────────────┘
```

### Workflow Summary

1. **Build & Push** (`build-and-push.yml`):
   - Triggered on push to `main` branch
   - Builds multi-arch Docker images (ARM64 + AMD64)
   - Pre-bakes ML models into backend image (~3GB)
   - Pushes to Docker Hub with versioned tags

2. **Deploy to OCI** (`deploy-to-oci.yml`):
   - Triggered after successful build
   - SSHs to OCI instance
   - Pulls latest images from Docker Hub
   - Deploys with docker-compose
   - Runs health checks
   - Rollback on failure

---

## Prerequisites

Before starting, ensure you have:

- ✅ OCI instance deployed (see [OCI Setup Guide](./OCI_SETUP.md))
- ✅ Docker Hub account (free tier is fine)
- ✅ GitHub repository with this code
- ✅ OpenAI API key

---

## 1. Docker Hub Setup

### Step 1.1: Create Docker Hub Account

1. Go to [hub.docker.com](https://hub.docker.com/)
2. Sign up for free account
3. Verify your email

### Step 1.2: Generate Access Token

1. Click your profile icon → **Account Settings**
2. Go to **Security** tab
3. Click **New Access Token**
4. Set description: `GitHub Actions - VoiceMoodAnalyzer`
5. Set permissions: **Read, Write, Delete**
6. Click **Generate**
7. **Copy the token immediately** (you won't see it again!)

**Example token:** `dckr_pat_AbCdEfGhIjKlMnOpQrStUvWxYz`

### Step 1.3: Create Repositories (Optional)

Docker Hub will auto-create repositories on first push, but you can pre-create them:

1. Click **Repositories** → **Create Repository**
2. Create two repositories:
   - `voice-mood-backend` (public or private)
   - `voice-mood-frontend` (public or private)

---

## 2. GitHub Secrets Configuration

### Step 2.1: Navigate to Repository Settings

1. Go to your GitHub repository
2. Click **Settings** tab
3. In left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### Step 2.2: Add Required Secrets

Add the following secrets one by one:

#### Docker Hub Credentials

| Secret Name | Value | Example |
|-------------|-------|---------|
| `DOCKER_USERNAME` | Your Docker Hub username | `yourname` |
| `DOCKER_PASSWORD` | Access token from Step 1.2 | `dckr_pat_AbCdE...` |

#### OCI Deployment

| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `OCI_HOST` | Public IP of OCI instance | From Terraform output |
| `OCI_SSH_PRIVATE_KEY` | SSH private key content | See Step 2.3 below |

#### Application Secrets

| Secret Name | Value | Example |
|-------------|-------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-proj-...` |
| `POSTGRES_PASSWORD` | Strong database password | Generate: `openssl rand -base64 32` |

### Step 2.3: Adding SSH Private Key

**Get your SSH private key:**
```bash
cat ~/.ssh/oci_voice_mood
```

**Copy the ENTIRE output**, including:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

**Add to GitHub:**
1. Click **New repository secret**
2. Name: `OCI_SSH_PRIVATE_KEY`
3. Value: Paste the entire private key
4. Click **Add secret**

### Step 2.4: Verify All Secrets

You should have **6 secrets** total:
- ✅ DOCKER_USERNAME
- ✅ DOCKER_PASSWORD
- ✅ OCI_HOST
- ✅ OCI_SSH_PRIVATE_KEY
- ✅ OPENAI_API_KEY
- ✅ POSTGRES_PASSWORD

---

## 3. Test CI/CD Pipeline

### Step 3.1: Trigger First Build

**Option A: Push to main branch**
```bash
git add .
git commit -m "ci: setup GitHub Actions deployment"
git push origin main
```

**Option B: Manual trigger**
1. Go to **Actions** tab in GitHub
2. Select **Build and Push Docker Images** workflow
3. Click **Run workflow** → **Run workflow**

### Step 3.2: Monitor Build Progress

1. Go to **Actions** tab
2. Click on the running workflow
3. Expand job steps to see progress:
   - Checkout code
   - Set up Docker Buildx
   - Build backend (20-30 minutes for first build with ML models)
   - Build frontend (5-10 minutes)
   - Push to Docker Hub

**Expected build time:**
- First build: ~35-45 minutes (ML model downloads)
- Subsequent builds: ~10-15 minutes (cached layers)

### Step 3.3: Verify Images on Docker Hub

1. Go to [hub.docker.com](https://hub.docker.com/)
2. Check your repositories:
   - `yourname/voice-mood-backend:latest` (~3GB)
   - `yourname/voice-mood-frontend:latest` (~50MB)

### Step 3.4: Monitor Deployment

After build completes, the deployment workflow triggers automatically:

1. Go to **Actions** tab
2. Click **Deploy to Oracle Cloud** workflow
3. Watch deployment steps:
   - Setup SSH
   - Copy files to server
   - Pull images (~5-10 minutes for first pull)
   - Deploy containers
   - Health checks
   - Cleanup

**Expected deployment time:** 10-15 minutes

### Step 3.5: Verify Application

**Check deployment status:**
```bash
ssh -i ~/.ssh/oci_voice_mood ubuntu@<OCI_HOST>
cd /opt/voice-mood-analyzer
docker compose ps
```

Expected output:
```
NAME                       STATUS          PORTS
voice-mood-backend         Up (healthy)    0.0.0.0:8000->8000/tcp
voice-mood-frontend        Up (healthy)    0.0.0.0:80->80/tcp
voice-mood-postgres        Up (healthy)    0.0.0.0:5432->5432/tcp
```

**Test the application:**
```bash
curl http://<OCI_HOST>
curl http://<OCI_HOST>:8000
```

**Open in browser:**
```
http://<OCI_HOST>
```

---

## 4. Workflow Customization

### 4.1: Change Deployment Trigger

**Default:** Auto-deploy on successful build

**Option A: Manual deployment only**

Edit `.github/workflows/deploy-to-oci.yml`:
```yaml
on:
  workflow_dispatch:  # Only manual trigger
    inputs:
      image_tag:
        description: 'Docker image tag to deploy'
        required: false
        default: 'latest'
```

**Option B: Deploy only on tags**
```yaml
on:
  push:
    tags:
      - 'v*'  # Deploy only on version tags like v1.0.0
```

### 4.2: Build Optimization

**Skip ML model download for faster builds:**

Edit `backend/Dockerfile` and comment out:
```dockerfile
# RUN python -c "\
# from transformers import Wav2Vec2ForSequenceClassification...
```

⚠️ **Trade-off:** Faster builds (~10 min) but slower first startup (~15 min)

### 4.3: Multi-Environment Setup

**Add staging environment:**

1. Create new OCI instance for staging
2. Add secrets with prefix:
   - `STAGING_OCI_HOST`
   - `STAGING_OCI_SSH_PRIVATE_KEY`
3. Duplicate `deploy-to-oci.yml` as `deploy-staging.yml`
4. Update secrets references

---

## 5. Monitoring & Maintenance

### 5.1: Check Deployment Logs

**View GitHub Actions logs:**
```
GitHub → Actions → [Workflow Run] → [Job] → [Step]
```

**View application logs on server:**
```bash
ssh -i ~/.ssh/oci_voice_mood ubuntu@<OCI_HOST>
cd /opt/voice-mood-analyzer

# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### 5.2: Manual Deployment

**If GitHub Actions fails, deploy manually:**
```bash
# SSH to server
ssh -i ~/.ssh/oci_voice_mood ubuntu@<OCI_HOST>
cd /opt/voice-mood-analyzer

# Pull latest images
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull

# Restart services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Check health
docker compose ps
```

### 5.3: Rollback Deployment

**Rollback to previous version:**
```bash
# SSH to server
ssh -i ~/.ssh/oci_voice_mood ubuntu@<OCI_HOST>
cd /opt/voice-mood-analyzer

# Update .env with previous tag
echo "IMAGE_TAG=main-abc1234" > .env

# Pull specific version
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull

# Deploy
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 5.4: Disk Space Monitoring

**Check disk usage:**
```bash
df -h
docker system df
```

**Clean up old images:**
```bash
docker image prune -a -f
docker system prune -a -f
```

---

## 6. Troubleshooting

### Issue: "Build times out after 60 minutes"

**Cause:** ML model downloads take too long.

**Solutions:**
1. Increase GitHub Actions timeout:
   ```yaml
   jobs:
     build-and-push:
       timeout-minutes: 120  # Increase from 60
   ```

2. Use self-hosted runner on faster network

### Issue: "Permission denied (publickey)"

**Cause:** SSH key mismatch or wrong format.

**Solution:**
1. Verify `OCI_SSH_PRIVATE_KEY` secret matches public key on OCI instance
2. Ensure no extra spaces/newlines when copying key
3. Check SSH key format (should be OpenSSH format)

### Issue: "docker: command not found" on OCI instance

**Cause:** Cloud-init not completed.

**Solution:**
```bash
# SSH to instance
ssh -i ~/.ssh/oci_voice_mood ubuntu@<OCI_HOST>

# Check cloud-init status
cloud-init status

# If still running, wait:
cloud-init status --wait

# Manually install Docker if needed:
curl -fsSL https://get.docker.com | sh
```

### Issue: Health checks fail during deployment

**Cause:** Services not ready or configuration error.

**Solution:**
1. Check logs:
   ```bash
   docker compose logs backend
   ```

2. Verify environment variables:
   ```bash
   cat .env
   ```

3. Check OpenAI API key is valid:
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```

### Issue: "Failed to push image: denied"

**Cause:** Docker Hub authentication failed.

**Solution:**
1. Verify `DOCKER_PASSWORD` is access token (not password)
2. Regenerate access token on Docker Hub
3. Update GitHub secret

---

## 7. Cost Optimization Tips

### Reduce Build Frequency

**Only build on specific paths:**
```yaml
on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'
      - 'frontend/**'
      - 'docker-compose*.yml'
```

### Use Docker Layer Caching

Already configured in workflows:
```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

### Schedule Deployments

**Deploy only during specific hours:**
```yaml
on:
  schedule:
    - cron: '0 1 * * *'  # Daily at 1 AM UTC
```

---

## 8. Security Best Practices

### ✅ Do:
- Rotate secrets regularly (every 90 days)
- Use strong PostgreSQL passwords (32+ characters)
- Keep Docker images updated
- Monitor GitHub Actions logs for errors
- Restrict SSH access to specific IPs in OCI Security List

### ❌ Don't:
- Commit secrets to repository
- Use default passwords in production
- Share Docker Hub access tokens
- Disable SSL/TLS verification
- Store private keys in plaintext on local machine

---

## Next Steps

After successful CI/CD setup:
1. ✅ Test application thoroughly
2. ✅ Set up monitoring (optional)
3. ✅ Configure SSL/TLS with Let's Encrypt
4. ✅ Set up database backups
5. ✅ Document API endpoints

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [OCI Compute Documentation](https://docs.oracle.com/en-us/iaas/Content/Compute/home.htm)
