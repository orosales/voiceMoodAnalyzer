# Deployment Guide - Azure VM

This guide walks you through deploying VoiceMoodAnalyzer to an Azure Virtual Machine.

## Prerequisites

- Azure subscription
- SSH client installed
- OpenAI API key

## Step 1: Create Azure VM

### Option A: Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource" → "Virtual Machine"
3. Configure:
   - **Image**: Ubuntu Server 22.04 LTS
   - **Size**: Standard_D4s_v3 (4 vCPUs, 16GB RAM) or larger
   - **Authentication**: SSH public key
   - **Inbound ports**: 22 (SSH), 80 (HTTP), 443 (HTTPS)
4. Click "Review + Create"

### Option B: Azure CLI

```bash
# Create resource group
az group create --name VoiceMoodAnalyzer-RG --location eastus

# Create VM
az vm create \
  --resource-group VoiceMoodAnalyzer-RG \
  --name VoiceMoodAnalyzer-VM \
  --image UbuntuLTS \
  --size Standard_D4s_v3 \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-sku Standard

# Open ports
az vm open-port --resource-group VoiceMoodAnalyzer-RG --name VoiceMoodAnalyzer-VM --port 80 --priority 1001
az vm open-port --resource-group VoiceMoodAnalyzer-RG --name VoiceMoodAnalyzer-VM --port 443 --priority 1002

# Get public IP
az vm show --resource-group VoiceMoodAnalyzer-RG --name VoiceMoodAnalyzer-VM -d --query publicIps -o tsv
```

## Step 2: Connect to VM

```bash
# SSH into your VM
ssh azureuser@<YOUR_VM_PUBLIC_IP>
```

## Step 3: Install Docker

```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# Apply group changes
newgrp docker

# Verify installation
docker --version
docker compose version
```

## Step 4: Deploy Application

### Clone Repository

```bash
# If using Git
git clone <YOUR_REPOSITORY_URL>
cd voice-mood-analyzer

# OR upload files using SCP
# On your local machine:
scp -r voice-mood-analyzer azureuser@<YOUR_VM_PUBLIC_IP>:~/
```

### Configure Environment

```bash
cd voice-mood-analyzer

# Edit .env file
nano .env
```

Update the following in `.env`:
```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

Save and exit (Ctrl+X, then Y, then Enter)

### Start Services

```bash
# Make start script executable
chmod +x start.sh

# Start all services
./start.sh

# Or manually:
docker compose up -d --build
```

### Monitor Deployment

```bash
# Watch all logs
docker compose logs -f

# Watch specific service
docker compose logs -f backend

# Check container status
docker compose ps
```

## Step 5: Configure Firewall (Optional)

```bash
# Enable UFW firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Check status
sudo ufw status
```

## Step 6: Set Up Domain (Optional)

### Configure DNS

1. Go to your domain registrar
2. Add an A record pointing to your VM's public IP
3. Example: `voicemood.yourdomain.com` → `YOUR_VM_PUBLIC_IP`

### Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Stop containers temporarily
cd ~/voice-mood-analyzer
docker compose down

# Generate certificate
sudo certbot certonly --standalone -d voicemood.yourdomain.com

# Update nginx configuration (in frontend/nginx.conf)
# Add SSL configuration

# Restart containers
docker compose up -d
```

## Step 7: Verify Deployment

### Check Services

```bash
# Check if all containers are running
docker compose ps

# Expected output:
# NAME                    STATUS
# voice-mood-backend      Up
# voice-mood-frontend     Up
# voice-mood-postgres     Up (healthy)
```

### Test Endpoints

```bash
# Test backend health
curl http://localhost:8000/

# Test from external machine
curl http://<YOUR_VM_PUBLIC_IP>:8000/

# Test frontend
curl http://<YOUR_VM_PUBLIC_IP>/
```

### Access Application

Open your browser and navigate to:
- `http://<YOUR_VM_PUBLIC_IP>`
- Or `http://voicemood.yourdomain.com` (if using custom domain)

## Step 8: Set Up Auto-Start on Reboot

```bash
# Create systemd service
sudo nano /etc/systemd/system/voicemoodanalyzer.service
```

Add the following content:

```ini
[Unit]
Description=VoiceMoodAnalyzer Docker Compose Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/azureuser/voice-mood-analyzer
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
User=azureuser

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable voicemoodanalyzer

# Test service
sudo systemctl start voicemoodanalyzer
sudo systemctl status voicemoodanalyzer
```

## Maintenance

### Update Application

```bash
cd ~/voice-mood-analyzer

# Pull latest changes (if using Git)
git pull

# Rebuild and restart
docker compose down
docker compose up -d --build
```

### View Logs

```bash
# All logs
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100

# Specific service
docker compose logs -f backend
```

### Backup Database

```bash
# Create backup
docker compose exec postgres pg_dump -U postgres mito_books > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker compose exec -T postgres psql -U postgres mito_books < backup_20240101_120000.sql
```

### Monitor Resources

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check Docker resource usage
docker stats
```

### Clean Up

```bash
# Remove unused Docker images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused containers
docker container prune
```

## Troubleshooting

### Backend Not Starting

```bash
# Check backend logs
docker compose logs backend

# Common issues:
# 1. Missing OPENAI_API_KEY - check .env file
# 2. Database connection - ensure postgres is healthy
# 3. Model download timeout - increase timeout or retry
```

### Frontend Not Accessible

```bash
# Check nginx logs
docker compose logs frontend

# Check if port 80 is open
sudo netstat -tlnp | grep :80

# Restart frontend
docker compose restart frontend
```

### Database Connection Issues

```bash
# Check postgres health
docker compose exec postgres pg_isready -U postgres

# Restart postgres
docker compose restart postgres

# Reset database (WARNING: deletes all data)
docker compose down -v
docker compose up -d
```

### High Memory Usage

```bash
# Check which container is using memory
docker stats

# Restart specific container
docker compose restart backend

# Adjust Docker memory limits in docker-compose.yml if needed
```

## Performance Optimization

### Enable GPU Support (if VM has GPU)

1. Install NVIDIA drivers on VM
2. Install nvidia-docker2
3. Update docker-compose.yml backend service:

```yaml
backend:
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: 1
            capabilities: [gpu]
```

### Increase Workers

Edit `backend/app.py` CMD in Dockerfile:
```dockerfile
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

## Security Best Practices

1. **Change default passwords**: Update PostgreSQL password in .env
2. **Use HTTPS**: Install SSL certificate with Let's Encrypt
3. **Firewall**: Enable UFW and restrict access
4. **Update regularly**: Keep system and Docker images updated
5. **Monitoring**: Set up monitoring and alerting
6. **Backups**: Schedule regular database backups
7. **API key security**: Use Azure Key Vault for secrets
8. **Rate limiting**: Implement rate limiting in nginx
9. **CORS**: Configure proper CORS origins in production
10. **Logging**: Set up centralized logging

## Scaling Considerations

### Vertical Scaling
- Upgrade VM size for more CPU/RAM
- Recommended: Standard_D8s_v3 (8 vCPUs, 32GB RAM) for high traffic

### Horizontal Scaling
- Use Azure Load Balancer
- Deploy multiple backend instances
- Use Azure Database for PostgreSQL (managed service)
- Use Azure Container Instances or AKS for orchestration

### CDN Integration
- Use Azure CDN for static assets
- Reduce latency for global users

## Cost Optimization

1. Use Azure Reserved Instances for 1-3 year commitments (save up to 72%)
2. Stop VM during non-business hours if applicable
3. Use Azure Spot VMs for non-critical workloads
4. Monitor and optimize resource usage
5. Use managed PostgreSQL only if scaling requirements justify cost

## Support

For deployment issues:
- Check logs: `docker compose logs -f`
- Review README.md for troubleshooting
- Check Azure VM metrics in Azure Portal

---

Deployment checklist:
- [ ] VM created and accessible
- [ ] Docker and Docker Compose installed
- [ ] Application cloned/uploaded
- [ ] .env configured with OpenAI API key
- [ ] Containers started successfully
- [ ] Application accessible from browser
- [ ] SSL certificate configured (if using custom domain)
- [ ] Auto-start service enabled
- [ ] Backups scheduled
- [ ] Monitoring configured
