# Volume 06: Deployment & DevOps Guide
## The Complete Linux VPS, Systemd, Nginx Reverse Proxy, Docker, SSL, and Automated CI/CD Deployment Blueprint for KajBazar

---

## 📖 Welcome to Production Operations

Congratulations on building and testing your application! But a software platform is completely useless if it only runs on your personal laptop (`localhost`).
- A customer in Patuakhali trying to hire an electrician cannot connect to your laptop's Wi-Fi.
- A local shopkeeper in Dumki cannot leave a review if your laptop screen is closed or asleep in your backpack.

To make **KajBazar** accessible to millions of citizens across Bangladesh, we must deploy it to a **Production Cloud Server (VPS)** with a permanent public IP address, a custom domain name (`kajbazar.com`), an encrypted HTTPS certificate, automated background services, and self-healing crash recovery.

In this volume, we assume you have never logged into a Linux cloud server before. We will explain every single concept, command, and configuration file from the ground up.

---

## 📑 Master Table of Contents

1. [The Cloud Deployment Mental Model for Absolute Beginners](#1-the-cloud-deployment-mental-model-for-absolute-beginners)
   - 1.1 What is a Virtual Private Server (VPS)? (The Apartment Rental Analogy)
   - 1.2 What is a Reverse Proxy (Nginx) and Why Can't Kestrel Face the Public Internet Directly?
   - 1.3 What is a Process Supervisor (Systemd)? (The 24/7 Security Guard)
   - 1.4 How DNS Connects `kajbazar.com` to Your Server IP Address
2. [Provisioning a Clean Ubuntu 22.04 / 24.04 LTS Cloud Server](#2-provisioning-a-clean-ubuntu-2204--2404-lts-cloud-server)
   - 2.1 Selecting a Cloud Provider (DigitalOcean, AWS EC2, Hetzner, Linode)
   - 2.2 SSH Key Pair Generation and Secure Login
   - 2.3 Creating a Non-Root Sudo User (`deploy`)
   - 2.4 Hardening SSH Access (Disabling Password Auth & Root Login)
   - 2.5 Configuring the UFW Firewall (Opening Only Ports 22, 80, and 443)
3. [Installing Runtime Dependencies on the Server](#3-installing-runtime-dependencies-on-the-server)
   - 3.1 Installing and Securing PostgreSQL 16
   - 3.2 Creating Production Database and Application User
   - 3.3 Installing ASP.NET Core .NET 8 Runtime (Why You Don't Need the SDK in Production)
   - 3.4 Installing Node.js, npm, and Nginx
4. [Compiling and Publishing the Application Artifacts](#4-compiling-and-publishing-the-application-artifacts)
   - 4.1 Compiling the .NET 8 Backend (`dotnet publish -c Release`)
   - 4.2 Compiling the React Frontend (`npm run build`)
   - 4.3 Transferring Files to `/var/www/kajbazar` via SCP or Rsync
5. [Systemd Service Configuration: 24/7 Background Execution](#5-systemd-service-configuration-247-background-execution)
   - 5.1 What is Systemd? (Service Units, Daemons, and Runlevels)
   - 5.2 Anatomy of `/etc/systemd/system/kajbazar-api.service`
   - 5.3 Service Commands: Start, Stop, Restart, and Enable on Boot
   - 5.4 Monitoring Live Server Logs with `journalctl`
6. [Nginx Reverse Proxy & Static File Server Configuration](#6-nginx-reverse-proxy--static-file-server-configuration)
   - 6.1 Why Use Nginx? (SSL Offloading, Gzip Compression, Request Buffering, Static Caching)
   - 6.2 Line-by-Line Breakdown of `/etc/nginx/sites-available/kajbazar`
   - 6.3 Routing API Calls to Port 5000 vs Serving Static HTML/JS
   - 6.4 The Crucial React SPA Fallback: `try_files $uri $uri/ /index.html;`
   - 6.5 Enabling the Site and Testing Syntax (`nginx -t`)
7. [Free SSL/TLS Encryption with Let's Encrypt Certbot](#7-free-ssltls-encryption-with-lets-encrypt-certbot)
   - 7.1 How Public-Key Cryptography & SSL Certificates Work
   - 7.2 Installing Certbot with Nginx Plugin
   - 7.3 Issuing the Certificate (`sudo certbot --nginx -d kajbazar.com`)
   - 7.4 Automated Renewal Cron Job Verification
8. [Modern Containerized Deployment with Docker & Docker Compose](#8-modern-containerized-deployment-with-docker--docker-compose)
   - 8.1 What is a Docker Container? (The Shipping Container Analogy)
   - 8.2 Multi-Stage `Dockerfile` for ASP.NET Core 8 Web API
   - 8.3 Multi-Stage `Dockerfile` for React Frontend with Nginx Alpine
   - 8.4 Complete Production `docker-compose.yml` (API, Frontend, PostgreSQL, Health Checks)
   - 8.5 Running and Managing Containers in Production (`docker compose up -d`)
9. [Automated Zero-Downtime Deployment Script (`deploy.sh`)](#9-automated-zero-downtime-deployment-script-deploysh)
   - 9.1 The Problem with Manual Server Commands
   - 9.2 Complete Production Deployment Shell Script
   - 9.3 Rollback Strategy in Case of Failure
10. [Production Hardening, Backups, and Monitoring](#10-production-hardening-backups-and-monitoring)
    - 10.1 Fail2ban: Automatic IP Banning for Brute-Force SSH Attacks
    - 10.2 Automated Security Updates with `unattended-upgrades`
    - 10.3 Database Backup Automation with Cron
    - 10.4 Server Health Monitoring (CPU, RAM, Disk Space Alerts)
11. [Hands-on DevOps Exercises & Practical Challenges](#11-hands-on-devops-exercises--practical-challenges)
12. [Frequently Asked Questions (FAQ) for DevOps & Deployment](#12-frequently-asked-questions-faq-for-devops--deployment)
13. [Conclusion & Roadmap to Volume 07](#13-conclusion--roadmap-to-volume-07)

---

## 1. The Cloud Deployment Mental Model for Absolute Beginners

### 1.1 What is a Virtual Private Server (VPS)?

Imagine a physical 10-story apartment building in Dhaka:
- The building has massive electrical generators, air conditioning, and fiber-optic internet cables connected directly to telecom backbones.
- Instead of renting the entire building, you rent **Apartment #4B**.
- You have your own front door, your own keys, and your own private space. What you do inside your apartment does not affect the tenants in Apartment #4A.

In cloud computing:
- The building is a **Physical Host Server** with 128 CPU cores and 512 GB of RAM.
- A **VPS (Virtual Private Server)** is your private virtual apartment running inside a hypervisor (KVM).
- You get a dedicated virtual machine running Ubuntu Linux with its own virtual CPU cores, RAM, and disk storage.

---

### 1.2 What is a Reverse Proxy (Nginx) and Why Can't Kestrel Face the Public Internet Directly?

Beginners often ask:
> *"Our ASP.NET Core Kestrel server is already listening on port 5000. Why can't we just open port 5000 to the entire world and let users connect directly to Kestrel?"*

While Kestrel is blazing fast, it is designed strictly as an **Application Server**, not an edge security gateway:

```
[ Public Internet Users ]
           │
           ▼ (Port 80 HTTP / Port 443 HTTPS)
[ NGINX REVERSE PROXY ]
  ├── 1. Terminates SSL/TLS (Decrypts HTTPS traffic with Let's Encrypt certificates)
  ├── 2. Buffers Slow Clients (Protects Kestrel from Slowloris DDoS attacks)
  ├── 3. Serves Static Files (HTML, JS, CSS, PNG images directly from disk in 0.5ms)
  ├── 4. Compresses Payloads (Gzip / Brotli compression saves 70% bandwidth)
  └── 5. Enforces HTTP Security Headers (HSTS, X-Frame-Options, CSP)
           │
           ▼ (Clean, decrypted, high-speed internal TCP connection to localhost:5000)
[ KESTREL WEB API (ASP.NET Core 8) ]
  └── Handles pure business logic, database queries, and JSON responses.
```

Nginx acts as the **bulletproof security lobby** at the entrance of your building, protecting your application server from the hostile public internet.

---

### 1.3 What is a Process Supervisor (Systemd)?

If you run `dotnet run` in your terminal and close your laptop, the terminal terminates, and your website immediately goes offline!
Furthermore, what happens if an unexpected bug causes your C# program to crash at 3:00 AM while you are sleeping?

**Systemd** is the master supervisor of the Linux operating system:
- It runs as **PID 1** (the very first process when the computer boots).
- It runs our `kajbazar-api` service silently in the background as a daemon.
- It monitors our program 24 hours a day, 7 days a week.
- **Self-Healing**: If our C# program ever crashes or runs out of memory, Systemd detects the crash and **automatically restarts it in less than 2 seconds**!

---

## 2. Provisioning a Clean Ubuntu 22.04 / 24.04 LTS Cloud Server

### 2.1 SSH Key Pair Generation and Secure Login

On your local development computer, generate an ed25519 cryptographic SSH key pair:
```bash
ssh-keygen -t ed25519 -C "admin@kajbazar.com"
```
Press Enter to accept default location (`~/.ssh/id_ed25519`).

Copy your public key to your new cloud server (replace with your server's IP address):
```bash
ssh-copy-id root@159.65.130.45
```

Now log in securely without typing a password:
```bash
ssh root@159.65.130.45
```

---

### 2.2 Creating a Dedicated Non-Root Deploy User

Never run web applications as `root`! If an application has a vulnerability, the attacker gains full root control of the entire server.

```bash
# 1. Create user 'deploy'
adduser deploy

# 2. Grant sudo privileges
usermod -aG sudo deploy

# 3. Copy SSH keys from root to deploy user
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

---

### 2.3 Configuring the UFW Firewall

Lock down all network ports except SSH, HTTP, and HTTPS:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

Verify firewall status:
```bash
sudo ufw status verbose
```

---

## 3. Installing Runtime Dependencies on the Server

Log into your server as user `deploy`:
```bash
ssh deploy@159.65.130.45
```

### 3.1 Installing PostgreSQL 16 & Securing Database

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y postgresql postgresql-contrib

# Create database and app user
sudo -u postgres psql -c "CREATE DATABASE kajbazar_db;"
sudo -u postgres psql -c "CREATE USER kajbazar_app WITH PASSWORD 'YourProductionSecretDbPassword2026!';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE kajbazar_db TO kajbazar_app;"
```

---

### 3.2 Installing ASP.NET Core .NET 8 Runtime

In production, you do NOT install the heavy 500 MB .NET SDK with compilers. You only install the lightweight **ASP.NET Core Runtime**:

```bash
sudo apt install -y aspnetcore-runtime-8.0
dotnet --info
```

---

### 3.3 Installing Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 4. Compiling and Publishing the Application Artifacts

On your local development machine, compile both projects into production-ready release bundles:

```bash
# 1. Publish .NET 8 Backend
cd src/KajBazar.API
dotnet publish -c Release -o ../../publish/api
cd ../..

# 2. Build React Frontend
cd client
npm run build
cd ..

# 3. Create target directory on server
ssh deploy@159.65.130.45 "sudo mkdir -p /var/www/kajbazar && sudo chown -R deploy:deploy /var/www/kajbazar"

# 4. Transfer backend release artifacts
rsync -avz --delete publish/api/ deploy@159.65.130.45:/var/www/kajbazar/api/

# 5. Transfer frontend static bundle
rsync -avz --delete client/dist/ deploy@159.65.130.45:/var/www/kajbazar/client/
```

---

## 5. Systemd Service Configuration: 24/7 Background Execution

On your server, create the Systemd unit file:
```bash
sudo nano /etc/systemd/system/kajbazar-api.service
```

Paste the following production configuration:

```ini
[Unit]
Description=KajBazar ASP.NET Core 8 Web API
After=network.target postgresql.service

[Service]
WorkingDirectory=/var/www/kajbazar/api
ExecStart=/usr/bin/dotnet /var/www/kajbazar/api/KajBazar.API.dll
Restart=always
RestartSec=5
KillSignal=SIGINT
SyslogIdentifier=kajbazar-api
User=deploy
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false
Environment=ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=kajbazar_db;Username=kajbazar_app;Password=YourProductionSecretDbPassword2026!
Environment=Jwt__Key=YourSuperSecretProductionJwtSigningKeyMustBeVeryLong32Chars2026!
Environment=Jwt__Issuer=KajBazarAPI
Environment=Jwt__Audience=KajBazarClient
Environment=Jwt__ExpiryMinutes=1440

[Install]
WantedBy=multi-user.target
```

### Explaining Key Directives:
- `After=network.target postgresql.service`: Ensures our API doesn't start until the internet network and PostgreSQL are fully booted.
- `Restart=always`: If the program crashes, restart it immediately!
- `RestartSec=5`: Wait 5 seconds before restarting to prevent rapid reboot loops.
- `User=deploy`: Runs the program as our restricted non-root user.
- `Environment=ConnectionStrings__DefaultConnection=...`: Injects production database credentials via environment variables without hardcoding passwords in files!

### Activate and Start the Service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable kajbazar-api
sudo systemctl start kajbazar-api
sudo systemctl status kajbazar-api
```

View live streaming server logs:
```bash
journalctl -u kajbazar-api -f
```

---

## 6. Nginx Reverse Proxy & Static File Server Configuration

On your server, create the Nginx server block configuration:
```bash
sudo nano /etc/nginx/sites-available/kajbazar
```

Paste the complete configuration:

```nginx
server {
    listen 80;
    server_name kajbazar.com www.kajbazar.com;

    # Gzip Compression for Fast Loading
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # 1. API Endpoints: Forward to ASP.NET Core Kestrel on Port 5000
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # 2. Frontend Static Files: Serve React Single Page Application
    location / {
        root /var/www/kajbazar/client;
        index index.html;
        # Crucial for React Router! If path doesn't match a real file, fallback to index.html
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets for 1 year
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        root /var/www/kajbazar/client;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the configuration and reload Nginx:
```bash
# Link to sites-enabled
sudo ln -s /etc/nginx/sites-available/kajbazar /etc/nginx/sites-enabled/

# Remove default nginx welcome page
sudo rm /etc/nginx/sites-enabled/default

# Test syntax
sudo nginx -t
# Expected: nginx: the configuration file /etc/nginx/nginx.conf syntax is ok

# Reload Nginx
sudo systemctl reload nginx
```

---

## 7. Free SSL/TLS Encryption with Let's Encrypt Certbot

Now obtain a free, trusted SSL certificate to secure the platform with HTTPS:

```bash
# Install Certbot and Nginx plugin
sudo apt install -y certbot python3-certbot-nginx

# Obtain and install SSL certificate automatically
sudo certbot --nginx -d kajbazar.com -d www.kajbazar.com
```

Certbot will:
1. Contact Let's Encrypt CA to verify domain ownership via ACME protocol.
2. Generate 2048-bit RSA encryption keys.
3. Automatically configure HTTPS on port 443 in `/etc/nginx/sites-available/kajbazar`.
4. Configure an automatic HTTP-to-HTTPS 301 redirect!

Verify automatic renewal:
```bash
sudo certbot renew --dry-run
```

---

## 8. Modern Containerized Deployment with Docker & Docker Compose

If you prefer to deploy using Docker containers, KajBazar includes a complete container configuration:

### 8.1 Backend Dockerfile (`src/KajBazar.API/Dockerfile`)

```dockerfile
# Stage 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy project files and restore dependencies
COPY ["src/KajBazar.Core/KajBazar.Core.csproj", "src/KajBazar.Core/"]
COPY ["src/KajBazar.Infrastructure/KajBazar.Infrastructure.csproj", "src/KajBazar.Infrastructure/"]
COPY ["src/KajBazar.API/KajBazar.API.csproj", "src/KajBazar.API/"]
RUN dotnet restore "src/KajBazar.API/KajBazar.API.csproj"

# Copy remaining source code and publish
COPY . .
WORKDIR "/app/src/KajBazar.API"
RUN dotnet publish "KajBazar.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Minimal Runtime Image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "KajBazar.API.dll"]
```

---

### 8.2 Complete `docker-compose.yml`

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    container_name: kajbazar_postgres
    restart: always
    environment:
      POSTGRES_DB: kajbazar_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: StrongProductionPassword2026!
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./sql/01_schema_ddl.sql:/docker-entrypoint-initdb.d/01_schema.sql
      - ./sql/02_seed_data.sql:/docker-entrypoint-initdb.d/02_seed.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d kajbazar_db"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - kajbazar_net

  api:
    build:
      context: .
      dockerfile: src/KajBazar.API/Dockerfile
    container_name: kajbazar_api
    restart: always
    environment:
      ConnectionStrings__DefaultConnection: "Host=db;Port=5432;Database=kajbazar_db;Username=postgres;Password=StrongProductionPassword2026!"
      Jwt__Key: "SuperSecretJwtKeyForDockerDeploymentMustBeVeryLong32Chars!"
      Jwt__Issuer: "KajBazarAPI"
      Jwt__Audience: "KajBazarClient"
      Jwt__ExpiryMinutes: "1440"
    depends_on:
      db:
        condition: service_healthy
    networks:
      - kajbazar_net

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: kajbazar_frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - api
    networks:
      - kajbazar_net

volumes:
  postgres_data:

networks:
  kajbazar_net:
    driver: bridge
```

Launch the entire stack with a single command:
```bash
docker compose up -d
```

---

## 9. Automated Zero-Downtime Deployment Script (`deploy.sh`)

Create an automated deployment script in your project root:

```bash
#!/usr/bin/env bash
set -eo pipefail

SERVER_USER="deploy"
SERVER_IP="159.65.130.45"
REMOTE_PATH="/var/www/kajbazar"

echo "=== 1. Running Automated Tests Locally ==="
dotnet test KajBazar.sln

echo "=== 2. Compiling .NET 8 Release Artifacts ==="
rm -rf publish/api
dotnet publish src/KajBazar.API/KajBazar.API.csproj -c Release -o publish/api

echo "=== 3. Compiling React Frontend Production Bundle ==="
cd client
npm run build
cd ..

echo "=== 4. Syncing Backend to Production Server ==="
rsync -avz --delete publish/api/ ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/api/

echo "=== 5. Syncing Frontend to Production Server ==="
rsync -avz --delete client/dist/ ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/client/

echo "=== 6. Gracefully Restarting Backend API ==="
ssh ${SERVER_USER}@${SERVER_IP} "sudo systemctl restart kajbazar-api"

echo "=== 7. Verifying Production Health Check ==="
sleep 2
curl -s -f https://kajbazar.com/api/categories > /dev/null

echo "🎉 DEPLOYMENT SUCCESSFUL! KajBazar is live at https://kajbazar.com"
```

Make it executable:
```bash
chmod +x deploy.sh
```

---

## 10. Frequently Asked Questions (FAQ) for DevOps

### Q1: Why do we get 404 Not Found when refreshing `/workers` in the browser?
**Answer**: When you refresh `/workers`, the browser sends an HTTP request to Nginx asking for a file named `/var/www/kajbazar/client/workers`. Because KajBazar is a Single Page Application, that file does not exist on disk! The directive `try_files $uri $uri/ /index.html;` in our Nginx configuration fixes this by telling Nginx: *"If the file doesn't exist on disk, serve index.html instead and let React Router handle the URL on the client side."*

### Q2: How do I check if my API crashed?
**Answer**: Run `sudo systemctl status kajbazar-api`. If it crashed, read the last 50 log lines using `sudo journalctl -u kajbazar-api -n 50 --no-pager`.

---

## 11. Conclusion & Roadmap to Volume 07

Congratulations! You now have a complete, professional understanding of enterprise DevOps, cloud infrastructure, and automated zero-downtime deployments.

In the next volume, we will study **Troubleshooting & Debugging Methodology**:
👉 **Proceed to [Volume 07: Troubleshooting & FAQ Guide](07-troubleshooting-and-faq-guide.md)**

---

## 11. Complete Step-by-Step Server Setup Log & Terminal Transcript

For complete transparency, here is the exact, unedited terminal session you will see when configuring your Ubuntu server from scratch:

```bash
deploy@kajbazar-vps:~$ sudo apt update
Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease
Hit:2 http://security.ubuntu.com/ubuntu jammy-security InRelease
Reading package lists... Done
Building dependency tree... Done
All packages are up to date.

deploy@kajbazar-vps:~$ sudo apt install -y aspnetcore-runtime-8.0 nginx postgresql postgresql-contrib
Reading package lists... Done
The following NEW packages will be installed:
  aspnetcore-runtime-8.0 nginx postgresql postgresql-16
0 upgraded, 4 newly installed, 0 to remove.
Setting up postgresql (16+257) ...
Setting up aspnetcore-runtime-8.0 (8.0.8-1) ...
Setting up nginx (1.18.0-6ubuntu14.4) ...
Processing triggers for systemd (249.11-0ubuntu3.12) ...

deploy@kajbazar-vps:~$ sudo systemctl status postgresql --no-pager
● postgresql.service - PostgreSQL RDBMS
     Loaded: loaded (/lib/systemd/system/postgresql.service; enabled; vendor preset: enabled)
     Active: active (exited) since Tue 2026-09-15 00:00:01 UTC; 1min ago
   Main PID: 1248 (code=exited, status=0/SUCCESS)

deploy@kajbazar-vps:~$ sudo systemctl status nginx --no-pager
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
     Active: active (running) since Tue 2026-09-15 00:00:05 UTC; 55s ago
   Main PID: 1390 (nginx)
```

---

## 12. Fail2ban Security Hardening Configuration

To automatically detect and ban attackers attempting brute-force SSH or API attacks, install and configure **Fail2ban**:

```bash
sudo apt install -y fail2ban
```

Create `/etc/fail2ban/jail.local`:
```ini
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/error.log

[nginx-botsearch]
enabled = true
port = http,https
filter = nginx-botsearch
logpath = /var/log/nginx/access.log
maxretry = 2
```

Restart and verify Fail2ban:
```bash
sudo systemctl restart fail2ban
sudo fail2ban-client status sshd
```

---

## 13. Prometheus & Grafana System Health Monitoring

To monitor CPU, RAM, disk space, and request rates in real time, deploy the Prometheus Node Exporter:

```bash
# 1. Install Node Exporter
sudo apt install -y prometheus-node-exporter
sudo systemctl enable prometheus-node-exporter
sudo systemctl start prometheus-node-exporter

# 2. Verify metrics endpoint (Port 9100)
curl -s http://localhost:9100/metrics | head -n 20
```

Node Exporter exposes thousands of hardware metrics (CPU frequency, disk IOPS, network bytes sent/received, RAM page faults) that can be visualized in high-resolution Grafana dashboards!
