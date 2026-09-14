# Volume 06: Production Deployment & DevOps Guide
## Step-by-Step Server Setup, Reverse Proxy, SSL, and Automated Deployment

---

## 📖 Introduction: Taking Your App to the World

Building an application on your personal laptop (`localhost`) is only half the journey. A website that only runs on your machine cannot help a single homeowner in Patuakhali find an electrician.

To make KajBazar accessible to the public, we must **deploy** it to a production Linux server connected to the internet 24 hours a day, 365 days a year.

In this volume, we will explain everything about servers, DNS, Nginx reverse proxies, SSL encryption, Systemd background services, and automated CI/CD pipelines as if you have never managed a server before.

---

## 📑 Table of Contents

1. [Deployment Mental Model for Beginners](#1-deployment-mental-model-for-beginners)
   - 1.1 Development vs. Production: What is the Difference?
   - 1.2 What is a VPS (Virtual Private Server)?
   - 1.3 How DNS Works (Domain Name to IP Address)
   - 1.4 Why We Need Nginx in Front of Kestrel
   - 1.5 What is a Systemd Service?
2. [Production Architecture Overview](#2-production-architecture-overview)
   - 2.1 The Production Traffic Flow
   - 2.2 Port & Security Perimeter Map
3. [Step 1: Server Provisioning & Linux Hardening](#3-step-1-server-provisioning--linux-hardening)
   - 3.1 Renting an Ubuntu 22.04 / 24.04 LTS Server
   - 3.2 Setting Up Non-Root User & SSH Keys
   - 3.3 Configuring the UFW Firewall
4. [Step 2: Installing Runtime Dependencies](#4-step-2-installing-runtime-dependencies)
   - 4.1 Installing ASP.NET Core 8 Runtime
   - 4.2 Installing PostgreSQL 15+ & Client Tools
   - 4.3 Installing Nginx Web Server
   - 4.4 Installing Node.js & npm (or building locally)
5. [Step 3: Hardened Production Database Setup](#5-step-3-hardened-production-database-setup)
   - 5.1 Creating `kajbazar_db` and Restricted Application User
   - 5.2 Running DDL Schema and Initial Seed Data
   - 5.3 Verifying Database Connections
6. [Step 4: Publishing & Configuring the ASP.NET Core API](#6-step-4-publishing--configuring-the-aspnet-core-api)
   - 6.1 Compiling with `dotnet publish -c Release`
   - 6.2 Setting Up `/var/www/kajbazar/api` Directory
   - 6.3 Configuring `appsettings.Production.json` & Environment Variables
   - 6.4 Creating the Systemd Background Service (`kajbazar-api.service`)
   - 6.5 Managing the Service (`systemctl` & `journalctl`)
7. [Step 5: Building & Deploying the React Frontend](#7-step-5-building--deploying-the-react-frontend)
   - 7.1 Compiling Optimized Assets with `npm run build`
   - 7.2 Deploying to `/var/www/kajbazar/client`
   - 7.3 Proper Linux Permissions (`chown -R www-data:www-data`)
8. [Step 6: Nginx Reverse Proxy & Static Hosting Configuration](#8-step-6-nginx-reverse-proxy--static-hosting-configuration)
   - 8.1 Why Kestrel Shouldn't Face the Internet Directly
   - 8.2 The Complete `kajbazar.conf` Server Block
   - 8.3 Handling Single Page Application Routing (`try_files`)
   - 8.4 Proxying `/api` Requests to Port 5000 with Headers
   - 8.5 Testing & Reloading Nginx
9. [Step 7: Free SSL/TLS Encryption with Let's Encrypt (Certbot)](#9-step-7-free-ssltls-encryption-with-lets-encrypt-certbot)
   - 9.1 Installing Certbot
   - 9.2 Generating Free HTTPS Certificates
   - 9.3 Testing Automated Certificate Renewal
10. [Step 8: Automated Continuous Deployment (CI/CD) with GitHub Actions](#10-step-8-automated-continuous-deployment-cicd-with-github-actions)
    - 10.1 What is CI/CD?
    - 10.2 Production `.github/workflows/deploy.yml` Pipeline
11. [Summary & Verification Checklist](#11-summary--verification-checklist)

---

## 1. Deployment Mental Model for Beginners

### 1.1 Development vs. Production: What is the Difference?
- **Development (`localhost`)**: You run the app on your personal laptop. If an error occurs, you see a detailed error screen. Speed doesn't matter as much, and only you have access.
- **Production (`https://kajbazar.com`)**: The app is hosted on a high-speed server in a data center. It must handle thousands of simultaneous users, withstand cyberattacks, run 24/7 without crashing, and never expose sensitive passwords or database connection strings.

### 1.2 What is a VPS (Virtual Private Server)?
A VPS is a virtual computer inside a giant data center (provided by DigitalOcean, Hetzner, AWS, Linode, etc.). You get an IP address (like `159.65.130.45`), an SSH password or key, and a blank Linux operating system.

### 1.3 How DNS Works
Humans cannot remember `159.65.130.45`. They remember `kajbazar.com`.
The **Domain Name System (DNS)** is the internet's phone book. When you buy a domain name (from Namecheap or Cloudflare), you add an **A Record**:
`kajbazar.com` $\rightarrow$ `159.65.130.45`.

### 1.4 Why We Need Nginx in Front of Kestrel
Kestrel is great at executing C# code, but it is not optimized to handle the messy public internet:
- **Nginx** handles SSL/TLS certificate negotiation.
- **Nginx** serves static files (HTML, CSS, images) directly from disk in 1 millisecond without waking up C#.
- **Nginx** buffers slow client connections so your backend server doesn't get overloaded.
- **Nginx** acts as a reverse proxy: requests to `/api/*` are forwarded to Kestrel, while all other requests serve the React frontend.

---

## 2. Production Architecture Overview

```
                               THE PUBLIC INTERNET
                                       │
                         HTTPS Request (Port 443)
                                       ▼
+─────────────────────────────────────────────────────────────────────────────+
| PRODUCTION LINUX SERVER (Ubuntu 22.04 LTS - 159.65.130.45)                  |
|                                                                             |
|  [ UFW Firewall: Only Ports 22 (SSH), 80 (HTTP), 443 (HTTPS) Allowed ]      |
|                                                                             |
|  [ Nginx Web Server & Reverse Proxy (Port 80/443) ]                         |
|    │                                                                        |
|    ├─ Static Routes (/) ─────────► /var/www/kajbazar/client/dist/           |
|    │                                (React 18 HTML/JS/CSS Bundle)           |
|    │                                                                        |
|    └─ API Routes (/api/*) ───────► Reverse Proxy to http://127.0.0.1:5000   |
|                                     │                                       |
|                                     ▼                                       |
|  [ Kestrel ASP.NET Core 8 API ] (Port 5000 - Localhost Only)                |
|    - Managed by Systemd Service: kajbazar-api.service                       |
|    - Auto-restarts if memory crashes or server reboots                      |
|    - Runs as dedicated 'deploy' system user (No root!)                      |
|                                     │                                       |
|                                     ▼                                       |
|  [ PostgreSQL 15+ Database ] (Port 5432 - Localhost Only)                   |
|    - Database: kajbazar_db                                                  |
|    - App User: kajbazar_app (Restricted Least Privilege)                    |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 3. Step 1: Server Provisioning & Linux Hardening

### 3.1 Renting a Server
Choose any standard Linux VPS:
- 2 vCPU, 4 GB RAM, 40 GB SSD (costs ~$10-$15/month on Hetzner or DigitalOcean).
- Operating System: **Ubuntu 22.04 LTS** or **Ubuntu 24.04 LTS**.

### 3.2 Setting Up Non-Root User
Never run production applications as `root`!
Log into your server via SSH:
```bash
ssh root@YOUR_SERVER_IP

# Create a dedicated deploy user
adduser deploy
usermod -aG sudo deploy

# Copy authorized SSH keys to deploy user
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# Log out and log back in as deploy
exit
ssh deploy@YOUR_SERVER_IP
```

### 3.3 Configuring the UFW Firewall
Block all ports except SSH, HTTP, and HTTPS:
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 4. Step 2: Installing Runtime Dependencies

Run these commands on your Ubuntu server:

```bash
sudo apt update && sudo apt upgrade -y

# 1. Install ASP.NET Core 8 Runtime
sudo apt install -y aspnetcore-runtime-8.0

# 2. Install PostgreSQL 15+
sudo apt install -y postgresql postgresql-contrib

# 3. Install Nginx
sudo apt install -y nginx

# 4. Install Certbot for free SSL certificates
sudo apt install -y certbot python3-certbot-nginx

# 5. Verify installations
dotnet --info
psql --version
nginx -v
```

---

## 5. Step 3: Hardened Production Database Setup

### 5.1 Create Database & Restricted App User
```bash
sudo -u postgres psql
```

Inside the PostgreSQL shell:
```sql
-- Create database
CREATE DATABASE kajbazar_db;

-- Create application user with strong password
CREATE USER kajbazar_app WITH PASSWORD 'CHANGE_THIS_TO_A_SECURE_RANDOM_PASSWORD_123!';

-- Grant permissions
GRANT CONNECT ON DATABASE kajbazar_db TO kajbazar_app;
\c kajbazar_db

GRANT USAGE ON SCHEMA public TO kajbazar_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO kajbazar_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO kajbazar_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO kajbazar_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO kajbazar_app;
\q
```

### 5.2 Execute DDL & Seed Scripts
Copy your `sql/` folder to the server and run:
```bash
psql -U postgres -d kajbazar_db -f sql/01_schema_ddl.sql
psql -U postgres -d kajbazar_db -f sql/02_seed_data.sql
```

---

## 6. Step 4: Publishing & Configuring the ASP.NET Core API

### 6.1 Compiling with `dotnet publish -c Release`
On your local machine (or CI/CD server):
```bash
dotnet publish src/KajBazar.API/KajBazar.API.csproj -c Release -o ./publish_api
```

Copy the compiled files to the server:
```bash
rsync -avz ./publish_api/ deploy@YOUR_SERVER_IP:/var/www/kajbazar/api/
```

### 6.2 Set Up Production Configuration
Create `/var/www/kajbazar/api/appsettings.Production.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=kajbazar_db;Username=kajbazar_app;Password=CHANGE_THIS_TO_A_SECURE_RANDOM_PASSWORD_123!;"
  },
  "Jwt": {
    "Key": "A_VERY_LONG_SECURE_64_CHARACTER_RANDOM_STRING_FOR_KAJBAZAR_PROD_KEY",
    "Issuer": "KajBazarAPI"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### 6.4 Creating the Systemd Background Service
To keep the API running forever and restart automatically if the server reboots, create a Systemd service:

```bash
sudo nano /etc/systemd/system/kajbazar-api.service
```

Paste this configuration:
```ini
[Unit]
Description=KajBazar ASP.NET Core 8 Web API
After=network.target postgresql.service

[Service]
WorkingDirectory=/var/www/kajbazar/api
ExecStart=/usr/bin/dotnet /var/www/kajbazar/api/KajBazar.API.dll
Restart=always
# Restart service after 5 seconds if dotnet crashes
RestartSec=5
KillSignal=SIGINT
SyslogIdentifier=kajbazar-api
User=deploy
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false
Environment=ASPNETCORE_URLS=http://127.0.0.1:5000

[Install]
WantedBy=multi-user.target
```

### 6.5 Enabling and Starting the Service
```bash
# Reload systemd to recognize new file
sudo systemctl daemon-reload

# Enable service to start automatically on boot
sudo systemctl enable kajbazar-api

# Start the service now
sudo systemctl start kajbazar-api

# Check running status
sudo systemctl status kajbazar-api
```

To view live server logs:
```bash
sudo journalctl -u kajbazar-api -f
```

---

## 7. Step 5: Building & Deploying the React Frontend

### 7.1 Compile Frontend
On your local machine:
```bash
cd client
# Build static production bundle
npm run build
```

### 7.2 Copy to Server
```bash
rsync -avz client/dist/ deploy@YOUR_SERVER_IP:/var/www/kajbazar/client/
```

### 7.3 Set Proper Permissions
```bash
sudo chown -R www-data:www-data /var/www/kajbazar/client
sudo chmod -R 755 /var/www/kajbazar/client
```

---

## 8. Step 6: Nginx Reverse Proxy Configuration

Create the Nginx site configuration:
```bash
sudo nano /etc/nginx/sites-available/kajbazar.conf
```

Paste this production configuration:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name kajbazar.com www.kajbazar.com;

    # 1. Serve React Frontend Static Files
    root /var/www/kajbazar/client;
    index index.html;

    # Gzip compression for high-speed page loads
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    # Handle React Router client-side routes (SPA fallback)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 2. Proxy REST API calls to Kestrel ASP.NET Core
    location /api/ {
        proxy_pass         http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection keep-alive;
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   X-Real-IP $remote_addr;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout    60s;
        proxy_read_timeout    60s;
    }

    # Cache static assets (CSS, JS, images) for 30 days
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
    }
}
```

Enable the configuration and reload Nginx:
```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/kajbazar.conf /etc/nginx/sites-enabled/

# Remove default site if present
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration syntax
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 9. Step 7: Free SSL/TLS Encryption with Let's Encrypt

Certbot automatically obtains a trusted HTTPS certificate and configures Nginx for you:

```bash
sudo certbot --nginx -d kajbazar.com -d www.kajbazar.com
```
When prompted:
1. Enter your email for urgent renewal notices.
2. Accept terms of service.
3. Choose option to redirect all HTTP traffic to HTTPS automatically.

Test automated renewal (Certbot sets up a cron job automatically):
```bash
sudo certbot renew --dry-run
```

Your website is now secured with **A+ grade SSL encryption**!

---

## 10. Step 8: Automated CI/CD with GitHub Actions

Instead of manually running `rsync` every time you write code, we can automate deployment using **GitHub Actions**.

Create `.github/workflows/deploy.yml` in your repository:

```yaml
name: Build, Test & Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test_and_deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout Code
      uses: actions/checkout@v4

    # Step 1: Set up .NET and run all tests
    - name: Setup .NET 8
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: '8.0.x'

    - name: Run Test Suite
      run: dotnet test KajBazar.sln -c Release

    # Step 2: Publish API
    - name: Publish Web API
      run: dotnet publish src/KajBazar.API/KajBazar.API.csproj -c Release -o ./publish_api

    # Step 3: Set up Node.js and build React frontend
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 20

    - name: Build Frontend Client
      run: |
        cd client
        npm ci
        npm run build

    # Step 4: Deploy to Linux Server via SSH
    - name: Deploy via SSH
      uses: appleboy/ssh-action@v1.0.3
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: deploy
        key: ${{ secrets.SERVER_SSH_KEY }}
        script: |
          sudo systemctl stop kajbazar-api
          sudo systemctl start kajbazar-api
```

---

## 11. Summary & Verification Checklist

Before announcing your site to users, verify the following:

- [ ] `curl -I https://kajbazar.com` returns `HTTP/2 200`.
- [ ] `curl -I https://kajbazar.com/api/workers` returns `HTTP/2 200`.
- [ ] Direct HTTP requests (`http://kajbazar.com`) automatically redirect to `https://`.
- [ ] Systemd service shows `active (running)`: `sudo systemctl status kajbazar-api`.
- [ ] Browser console on `https://kajbazar.com` shows zero CORS or script errors.

---

## 12. Next Steps

Your application is now live on the global internet!

Next, study common production issues and how to fix them quickly:
👉 **[Volume 07: Troubleshooting & FAQ Guide](07-troubleshooting-and-faq-guide.md)**
