# Volume 08: Maintenance & Evolution Guide
## The Long-Term Operations and Feature Development Manual for KajBazar

---

## 📖 Introduction: Software is a Living Garden

Many beginner developers make the mistake of thinking: *"I deployed the application, so my job is finished!"*

In reality, deploying the application is only the **first day** of its life. Software is like a living garden. If you do not pull out the weeds (bugs), water the soil (security updates), and add new flowers (features), the garden will wither and die.

In this volume, we will explain how to maintain KajBazar over months and years, how to evolve the database schema safely without downtime, how to upgrade dependencies, and how to add brand-new features from scratch following our Clean Architecture patterns.

---

## 📑 Table of Contents

1. [The Philosophy of Sustainable Software](#1-the-philosophy-of-sustainable-software)
   - 1.1 What is Technical Debt?
   - 1.2 Semantic Versioning (SemVer: `MAJOR.MINOR.PATCH`)
   - 1.3 The Routine Maintenance Calendar
2. [Database Evolution: Zero-Downtime Schema Changes](#2-database-evolution-zero-downtime-schema-changes)
   - 2.1 Why Careless Schema Changes Destroy Production
   - 2.2 The 5 Golden Rules of Safe Database Migrations
   - 2.3 Concrete Example: Adding an "Emergency 24/7 Service" Flag
   - 2.4 Backing Out: Writing Rollback Scripts
3. [End-to-End Feature Development Blueprints](#3-end-to-end-feature-development-blueprints)
   - 3.1 Feature Blueprint 1: Worker Work Hours & Availability Schedule
   - 3.2 Feature Blueprint 2: Worker Portfolio Photos Showcase
   - 3.3 Feature Blueprint 3: SMS Notifications via Twilio / Banglalink API
4. [Dependency Auditing & Upgrades](#4-dependency-auditing--upgrades)
   - 4.1 Auditing NuGet Packages in .NET
   - 4.2 Auditing npm Dependencies in React
   - 4.3 Handling Breaking Changes
5. [Server Hygiene & Log Rotation](#5-server-hygiene--log-rotation)
   - 5.1 Preventing "Disk Full" Outages with `logrotate`
   - 5.2 Routine Linux Kernel & Package Updates
   - 5.3 Vacuuming and Database Statistics Refresh
6. [Application Health Checks & Uptime Monitoring](#6-application-health-checks--uptime-monitoring)
   - 6.1 Implementing the `/healthz` Health Check Endpoint
   - 6.2 External Uptime Monitoring (Uptime Kuma, Better Stack)
7. [Conclusion & Next Steps](#7-conclusion--next-steps)

---

## 1. The Philosophy of Sustainable Software

### 1.1 What is Technical Debt?
When you write messy code or rush a feature out without writing tests, you are taking out a financial loan. You get the feature right now, but you pay interest on it every single day in the form of bugs, slower development, and system crashes. Eventually, the interest becomes so expensive that nobody can modify the code without breaking the entire website.

In KajBazar, we keep technical debt near zero by adhering strictly to **Clean Architecture**, writing automated xUnit tests for every repository method, and maintaining comprehensive documentation.

### 1.2 Semantic Versioning (SemVer)
We version releases using three numbers: `v1.2.4`
- **MAJOR (1)**: Breaking changes that require users or clients to change how they interact (e.g., rewriting the entire API response structure).
- **MINOR (2)**: New features that are backward-compatible (e.g., adding an emergency service filter).
- **PATCH (4)**: Bug fixes and security patches that do not add new features.

### 1.3 The Routine Maintenance Calendar
| Frequency | Maintenance Task | Responsible Role |
| :--- | :--- | :--- |
| **Daily** | Check error logs (`journalctl -u kajbazar-api -n 50`) | DevOps / SysAdmin |
| **Weekly** | Run `VACUUM ANALYZE` on PostgreSQL | Database Admin |
| **Bi-Weekly** | Review pending offline worker recommendations | Operations Team |
| **Monthly** | Run `sudo apt update && sudo apt upgrade -y` | SysAdmin |
| **Quarterly** | Audit and upgrade NuGet and npm dependencies | Lead Developer |
| **Semi-Annually** | Perform a simulated disaster recovery restore drill | Whole Engineering Team |

---

## 2. Database Evolution: Zero-Downtime Schema Changes

### 2.1 Why Careless Schema Changes Destroy Production
If you run `ALTER TABLE service_provider_profiles DROP COLUMN hourly_rate;` while your API is running, the running C# application will immediately throw `NpgsqlException: column "hourly_rate" does not exist` on the next search request, crashing the site for all users!

### 2.2 The 5 Golden Rules of Safe Database Migrations
1. **Always Expand Before You Contract**: First add new columns, deploy code that writes to both old and new columns, migrate data, and only then drop the old column weeks later.
2. **Never Add a NOT NULL Column Without a DEFAULT Value**: Adding `NOT NULL` without a default fails immediately if existing rows exist.
3. **Always Back Up Before Running DDL**: Run `pg_dump` immediately before running any database migration script.
4. **Use `IF NOT EXISTS`**: Makes migration scripts safe to run multiple times (idempotent).
5. **Always Write a Rollback Script**: Before applying a migration, prepare the exact SQL script to undo it if something goes wrong.

---

## 3. End-to-End Feature Development Blueprints

### 3.1 Feature Blueprint 1: Worker Work Hours & Availability Schedule
Allows workers to specify which days of the week and hours they accept calls.

#### Step 1: SQL Migration
```sql
CREATE TABLE worker_business_hours (
    id SERIAL PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES service_provider_profiles(profile_id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    opens_at TIME NOT NULL DEFAULT '08:00:00',
    closes_at TIME NOT NULL DEFAULT '20:00:00',
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_worker_day UNIQUE (profile_id, day_of_week)
);
```

#### Step 2: C# Domain Entity
```csharp
namespace KajBazar.Core.Entities;

public class WorkerBusinessHours
{
    public int Id { get; set; }
    public Guid ProfileId { get; set; }
    public int DayOfWeek { get; set; }
    public TimeSpan OpensAt { get; set; } = new TimeSpan(8, 0, 0);
    public TimeSpan ClosesAt { get; set; } = new TimeSpan(20, 0, 0);
    public bool IsClosed { get; set; } = false;

    public virtual ServiceProviderProfile Profile { get; set; } = null!;
}
```

#### Step 3: Controller & Endpoint
```csharp
[HttpGet("{profileId:guid}/hours")]
public async Task<IActionResult> GetWorkerHours(Guid profileId)
{
    var hours = await _workerRepository.GetBusinessHoursAsync(profileId);
    return Ok(hours);
}
```

---

### 3.2 Feature Blueprint 2: Worker Portfolio Photos Showcase
Enables verified workers to upload photos of completed projects (e.g. electrical switchboards installed, plumbing fittings completed).

#### Step 1: SQL Migration Table
```sql
CREATE TABLE worker_portfolio_photos (
    photo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES service_provider_profiles(profile_id) ON DELETE CASCADE,
    photo_url VARCHAR(500) NOT NULL,
    caption VARCHAR(255),
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_portfolio_profile ON worker_portfolio_photos(profile_id);
```

#### Step 2: C# Domain Entity
```csharp
namespace KajBazar.Core.Entities;

public class WorkerPortfolioPhoto
{
    public Guid PhotoId { get; set; } = Guid.NewGuid();
    public Guid ProfileId { get; set; }
    public string PhotoUrl { get; set; } = string.Empty;
    public string? Caption { get; set; }
    public int DisplayOrder { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual ServiceProviderProfile Profile { get; set; } = null!;
}
```

---

## 4. Dependency Auditing & Upgrades

### 4.1 Auditing NuGet Packages in .NET
Check for security advisories and outdated packages:
```bash
# Check for vulnerable packages
dotnet list package --vulnerable

# Check for outdated packages
dotnet list package --outdated
```

To upgrade a package (e.g. `Npgsql.EntityFrameworkCore.PostgreSQL`):
```bash
dotnet add src/KajBazar.Infrastructure/KajBazar.Infrastructure.csproj package Npgsql.EntityFrameworkCore.PostgreSQL --version 8.0.4
```
*Always run `dotnet test` immediately after upgrading packages to verify nothing broke!*

### 4.2 Auditing npm Dependencies in React
Check for vulnerabilities in JavaScript packages:
```bash
cd client
npm audit

# Automatically fix non-breaking vulnerabilities
npm audit fix
```

---

## 5. Server Hygiene & Log Rotation

### 5.1 Preventing "Disk Full" Outages with `logrotate`
If Nginx or ASP.NET Core writes millions of lines to log files without cleaning them up, your server will eventually run out of disk space (`0 bytes available`). When this happens, PostgreSQL stops accepting writes, and the site crashes!

Configure `/etc/logrotate.d/kajbazar`:
```ini
/var/log/kajbazar/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 deploy www-data
    sharedscripts
}
```
*This automatically compresses logs daily and deletes logs older than 14 days.*

### 5.2 Vacuuming and Database Statistics Refresh
Every Sunday at 3:00 AM, run database maintenance:
```bash
psql -U postgres -d kajbazar_db -c "VACUUM (VERBOSE, ANALYZE);"
```

---

## 6. Application Health Checks & Uptime Monitoring

### 6.1 Implementing the `/healthz` Health Check Endpoint
Add standard ASP.NET Core Health Checks in `Program.cs`:
```csharp
builder.Services.AddHealthChecks()
    .AddNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")!);

// Map endpoint in pipeline
app.MapHealthChecks("/healthz");
```

Now, visiting `http://localhost:5000/healthz` returns `Healthy` in 1 millisecond if both the API and database are functioning properly.

### 6.2 External Uptime Monitoring
Connect a free uptime monitoring service (like Uptime Kuma or Better Stack) to ping `https://kajbazar.com/healthz` every 60 seconds. If the server fails to reply, it instantly sends an SMS or Telegram alert to your phone!

---

## 7. Next Steps

Your application is now built for long-term survival, smooth upgrades, and continuous feature delivery.

Next, study how to protect KajBazar from hackers, malicious attacks, and data breaches:
👉 **[Volume 09: Security & Incident Response Guide](09-security-and-incident-response-guide.md)**
