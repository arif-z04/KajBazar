# Volume 09: Security & Incident Response Guide
## The Complete Cybersecurity and Threat Defense Handbook for KajBazar

---

## 📖 Introduction: Security is Not an Afterthought

In the digital world, attacks are not launched by shadowy figures typing in dark rooms while green letters fall down a screen. Attacks are launched by **automated scripts and bots** scanning millions of web servers every single second, looking for:
- Default passwords (`admin / admin`).
- Unprotected database ports (`5432`).
- Missing authorization checks on sensitive endpoints.
- Vulnerable third-party packages.

If you build an application without thinking about security, you are building a bank with a vault made of cardboard.

In this volume, we will explain the threat model of KajBazar, analyze how we protect against the **OWASP Top 10** vulnerabilities, implement rate limiting and defensive HTTP headers, and provide a battle-tested **Incident Response Playbook**.

---

## 📑 Table of Contents

1. [The KajBazar Threat Model](#1-the-kajbazar-threat-model)
   - 1.1 Who Might Attack Us and Why?
   - 1.2 Core Assets We Must Protect
   - 1.3 The Principle of Defense-in-Depth
2. [OWASP Top 10 Defenses in KajBazar](#2-owasp-top-10-defenses-in-kajbazar)
   - 2.1 Injection Attacks (SQLi & XSS)
   - 2.2 Broken Authentication & Password Security (`BR-15`)
   - 2.3 Broken Object-Level Authorization (BOLA)
   - 2.4 Security Misconfiguration & Error Leakage
   - 2.5 Insecure Design & Business Logic Flaws
   - 2.6 Vulnerable and Outdated Components
   - 2.7 Identification and Authentication Failures
   - 2.8 Software and Data Integrity Failures
   - 2.9 Security Logging and Monitoring Failures (`BR-14`)
   - 2.10 Server-Side Request Forgery (SSRF)
3. [Authentication & Authorization Deep Dive](#3-authentication--authorization-deep-dive)
   - 3.1 BCrypt Hashing with Work Factor 11
   - 3.2 JWT Token Architecture & Tamper Resistance
   - 3.3 Enforcing Strict Role-Based Access Control (`BR-13`)
   - 3.4 Why Authorization Headers Immune to CSRF
4. [Protecting Against Phone Scraping & Abuse](#4-protecting-against-phone-scraping--abuse)
   - 4.1 The Phone Scraping Threat
   - 4.2 Rate Limiting in ASP.NET Core 8
   - 4.3 Captcha & Anomaly Detection
5. [Administrative Traceability: `admin_audit_logs` (`BR-14`)](#5-administrative-traceability-admin_audit_logs-br-14)
   - 5.1 Why Administrative Actions Must Be Audited
   - 5.2 Capturing IP Address, User Agent, and JSON Snapshots
   - 5.3 Tamper-Evident Audit Trails
6. [Hardening HTTP Headers in Nginx](#6-hardening-http-headers-in-nginx)
   - 6.1 Content-Security-Policy (CSP)
   - 6.2 Strict-Transport-Security (HSTS)
   - 6.3 X-Frame-Options (Clickjacking Prevention)
   - 6.4 X-Content-Type-Options (MIME Sniffing Defense)
7. [Incident Response Playbook (The 5-Step Crisis Plan)](#7-incident-response-playbook-the-5-step-crisis-plan)
   - 7.1 Phase 1: Identification & Triage
   - 7.2 Phase 2: Immediate Containment (IP Blocking & Key Rotation)
   - 7.3 Phase 3: Eradication
   - 7.4 Phase 4: Recovery & Verification
   - 7.5 Phase 5: Post-Incident Review & Blameless Post-Mortem
8. [Conclusion & Next Steps](#8-conclusion--next-steps)

---

## 1. The KajBazar Threat Model

### 1.1 Who Might Attack Us and Why?
1. **Automated Internet Bots**: Scanning for exposed `.env` files, open PostgreSQL ports, or unauthenticated Swagger documentation.
2. **Scraper Bots & Competitors**: Trying to harvest thousands of phone numbers and names of skilled workers in Bangladesh to sell to telemarketers or build a competing directory.
3. **Malicious or Disgruntled Users**: Submitting spam reviews or 1-star ratings to destroy a competitor's reputation.
4. **Credential Stuffers**: Using leaked password lists from other breaches to break into administrator or worker accounts.

### 1.2 Core Assets We Must Protect
- **User Passwords**: Must never be stored or transmitted in plain text.
- **Worker Personal Information**: National ID (NID) numbers must be strictly restricted to platform administrators.
- **Directory Integrity**: Only verified, legitimate tradespeople must appear in public search.
- **Audit Logs**: History of administrative decisions must be permanently recorded and tamper-proof.

### 1.3 The Principle of Defense-in-Depth
Never rely on a single wall to keep attackers out. In KajBazar:
1. **Wall 1 (Network)**: UFW firewall blocks all ports except 80, 443, and SSH.
2. **Wall 2 (Web Server)**: Nginx filters bad HTTP methods, enforces SSL, and restricts request sizes.
3. **Wall 3 (Application)**: ASP.NET Core validates JWT tokens, verifies roles, and sanitizes input DTOs.
4. **Wall 4 (Database)**: PostgreSQL enforces CHECK constraints, foreign keys, and executes rating triggers.

---

## 2. OWASP Top 10 Defenses in KajBazar

### 2.1 Injection Attacks (SQLi & XSS)
- **SQL Injection (SQLi)**: Attackers input SQL syntax into form fields.
  - *Our Defense*: We use **Entity Framework Core 8**. All queries are parameterized automatically. Even if a user enters `' OR '1'='1` as their name, the database engine treats it as a literal string of characters, never as executable code.
- **Cross-Site Scripting (XSS)**: Attackers inject `<script>alert('hacked')</script>` into a review.
  - *Our Defense*: React automatically escapes all string outputs in JSX. When React renders `{review.comment}`, it converts `<` to `&lt;` and `>` to `&gt;`, rendering it safely as visible text rather than executing it.

### 2.2 Broken Authentication & Password Security (`BR-15`)
- Insecure apps use MD5 or SHA256 without salt, allowing hackers to reverse passwords in milliseconds using Rainbow Tables.
- In KajBazar, we use **BCrypt with Work Factor 11**. Each password hash includes an embedded 128-bit cryptographically random salt and takes 2,048 computational rounds to evaluate.

### 2.3 Broken Object-Level Authorization (BOLA)
A common flaw in modern APIs is when User A edits User B's profile simply by changing an ID in the URL (`PUT /api/workers/profile/5`).
In KajBazar, we never trust the ID passed in the request body for self-service operations:
```csharp
// Safe: We extract the identity directly from the authenticated JWT token!
var currentUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
```

---

## 3. Authentication & Authorization Deep Dive

### 3.1 BCrypt Hashing Mechanics
```
[ User Enters "Secret123" ]
             │
             ▼
[ Generate Random 128-bit Salt: $2a$11$e8... ]
             │
             ▼
[ 2,048 Iterations of Blowfish Cipher ]
             │
             ▼
[ Output Hash: $2a$11$bRI6cgkzNa/xQbA.yLngd.I1FLEPmO4qxz.KOWf1kyi/./EmoUDRq ]
```
Because the salt is random, even if two users have the exact same password (`Password123#`), their stored hashes in the database look completely different!

### 3.2 JWT Token Architecture & Tamper Resistance
Our tokens are digitally signed with a 256-bit secret key using HMAC-SHA256. 
If an attacker intercepts a token and changes `"role": "Consumer"` to `"role": "Admin"`, the cryptographic signature will not match. The API server instantly rejects the token with `401 Unauthorized`.

### 3.3 Enforcing Role-Based Access Control (`BR-13`)
Endpoints are strictly protected using declarative C# attributes:
```csharp
[Authorize(Roles = "Admin")]
[HttpPut("workers/{id}/verify")]
public async Task<IActionResult> VerifyWorker(Guid id) { ... }
```

### 3.4 Why Bearer Tokens are Immune to CSRF
**Cross-Site Request Forgery (CSRF)** occurs when a malicious website causes a victim's browser to send unwanted requests with ambient authentication cookies.
Because KajBazar stores authentication tokens in JavaScript memory/localStorage and sends them via explicit `Authorization: Bearer <token>` headers, malicious third-party websites cannot trick the browser into automatically attaching the token!

---

## 4. Protecting Against Phone Scraping & Abuse

### 4.1 The Phone Scraping Threat
If a competitor runs a bot that loops through all worker profiles and collects their phone numbers, they can harvest your directory in minutes.

### 4.2 Rate Limiting in ASP.NET Core 8
To prevent abuse, we configure ASP.NET Core Rate Limiting in `Program.cs`:

```csharp
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("PublicSearchPolicy", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 60; // Max 60 requests per minute per IP
        opt.QueueLimit = 0;
    });

    options.AddFixedWindowLimiter("AuthPolicy", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(5);
        opt.PermitLimit = 10; // Max 10 login attempts per 5 minutes to stop brute-forcing
        opt.QueueLimit = 0;
    });
});
```

---

## 5. Administrative Traceability: `admin_audit_logs` (`BR-14`)

Every time an administrator:
1. Verifies a worker profile
2. Rejects or suspends a worker
3. Modifies taxonomy (categories/upazilas)
4. Deletes a flagged review

The action is permanently written to the `admin_audit_logs` table:
```csharp
await _auditRepo.LogAsync(
    adminId: currentAdminId,
    action: "VERIFY_WORKER_PROFILE",
    targetEntity: "service_provider_profiles",
    targetId: profileId,
    details: $"Admin verified worker {worker.User.FullName}."
);
```

Even if an administrator account is compromised, every single change can be identified, investigated, and reversed.

---

## 6. Hardening HTTP Headers in Nginx

Add these security headers to `/etc/nginx/sites-available/kajbazar.conf`:

```nginx
# 1. Prevent Clickjacking (disallow embedding site inside iframes)
add_header X-Frame-Options "SAMEORIGIN" always;

# 2. Prevent MIME-type sniffing
add_header X-Content-Type-Options "nosniff" always;

# 3. Enable browser XSS filtering
add_header X-XSS-Protection "1; mode=block" always;

# 4. Enforce HTTPS Strict Transport Security (HSTS) for 1 year
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# 5. Referrer Policy: Don't leak full URLs to external sites
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

---

## 7. Incident Response Playbook (The 5-Step Crisis Plan)

If you detect suspicious activity, a breach, or an active attack:

```
[ Phase 1: Identify ] ──► [ Phase 2: Contain ] ──► [ Phase 3: Eradicate ]
                                                            │
                                                            ▼
[ Phase 5: Post-Mortem ] ◄── [ Phase 4: Recover ] ◄─────────┘
```

### 7.1 Phase 1: Identification
- Look for sudden spikes in HTTP 401/403 errors or database connections.
- Check top requesting IP addresses in Nginx access logs:
  ```bash
  awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10
  ```

### 7.2 Phase 2: Immediate Containment
- **Block the Attacking IP**:
  ```bash
  sudo ufw insert 1 deny from 203.0.113.55 to any
  ```
- **Invalidate All Active Sessions (Emergency Token Revocation)**:
  Change the `Jwt:Key` in `appsettings.Production.json` and restart the API service:
  ```bash
  sudo systemctl restart kajbazar-api
  ```
  *Every issued JWT token is instantly rendered invalid, forcing all users and attackers to log in again.*

### 7.3 Phase 3: Eradication
- Identify the root vulnerability (e.g. outdated npm package or insecure endpoint).
- Deploy code fix to staging and run automated tests.
- Verify the vulnerability is sealed.

### 7.4 Phase 4: Recovery
- If database rows were modified or deleted, restore from the last clean snapshot taken before the incident.
- Monitor error rates for 48 hours.

### 7.5 Phase 5: Post-Mortem
Write an objective, blameless report answering:
1. What happened?
2. When was it detected?
3. What was the impact?
4. What preventive measures are being added so it can never happen again?

---

## 8. Next Steps

Your application is now guarded with enterprise-grade defenses.

Next, learn how to optimize KajBazar for maximum speed and scale to handle millions of queries:
👉 **[Volume 10: Performance Optimization & Scaling Guide](10-performance-optimization-and-scaling-guide.md)**
