# Volume 07: Troubleshooting & FAQ Guide
## The "Don't Panic" Diagnostic Handbook for KajBazar

---

## 📖 Introduction: What to Do When Things Break

Every programmer in the world—even the most senior software engineers at Google or Microsoft—makes mistakes, hits unexpected error messages, and sees red text in the terminal. 

The difference between a stressed developer and a calm, successful developer is not that the successful developer never encounters bugs. It is that the successful developer knows **how to diagnose the problem systematically**.

Whenever an error occurs in KajBazar, remember the golden rule:
> **Computers do not have bad moods. Every single bug leaves a written clue in a log file.**

In this volume, we will give you a diagnostic toolkit and step-by-step solutions for 30 of the most common issues you will ever encounter while developing, operating, or deploying KajBazar.

---

## 📑 Table of Contents

1. [The 4-Step Emergency Diagnostic Checklist](#1-the-4-step-emergency-diagnostic-checklist)
   - 1.1 The Golden 10-Second System Triage
   - 1.2 The Diagnostic Flowchart
2. [Database Connection & SQL Errors (Issues 2.1 - 2.8)](#2-database-connection--sql-errors)
   - Issue 2.1: `Connection refused (127.0.0.1:5432)`
   - Issue 2.2: `Password authentication failed for user "postgres"`
   - Issue 2.3: `relation "users" does not exist (42P01)`
   - Issue 2.4: `violates check constraint "service_provider_profiles_verification_status_check"`
   - Issue 2.5: `duplicate key value violates unique constraint "users_email_key"`
   - Issue 2.6: `canceling statement due to statement timeout`
   - Issue 2.7: `database "kajbazar_db" does not exist`
   - Issue 2.8: `deadlock detected (40P01)`
3. [Backend .NET & C# API Errors (Issues 3.1 - 3.8)](#3-backend-net--c-api-errors)
   - Issue 3.1: `Port 5000 is already in use (Failed to bind to address)`
   - Issue 3.2: `401 Unauthorized when sending JWT token`
   - Issue 3.3: `403 Forbidden on Admin endpoint despite valid login`
   - Issue 3.4: `Unable to resolve service for type 'IUserRepository'`
   - Issue 3.5: `The JWT key is shorter than 256 bits (32 bytes)`
   - Issue 3.6: `CORS Policy Blocked: No 'Access-Control-Allow-Origin' header`
   - Issue 3.7: `dotnet: command not found`
   - Issue 3.8: `NullReferenceException: Object reference not set to an instance of an object`
4. [Frontend React & Vite Errors (Issues 4.1 - 4.7)](#4-frontend-react--vite-errors)
   - Issue 4.1: `NetworkError / Failed to fetch when calling API`
   - Issue 4.2: `Page refreshes to 404 Not Found on /directory or /admin in production`
   - Issue 4.3: `Address already in use :::5173`
   - Issue 4.4: `Cannot read properties of undefined (reading 'map')`
   - Issue 4.5: `The JSX syntax extension is not enabled in .js files`
   - Issue 4.6: `User gets logged out immediately on page refresh`
   - Issue 4.7: `React warning: Each child in a list should have a unique key prop`
5. [Server, Nginx & Systemd Errors (Issues 5.1 - 5.7)](#5-server-nginx--systemd-errors)
   - Issue 5.1: `502 Bad Gateway from Nginx`
   - Issue 5.2: `504 Gateway Timeout from Nginx`
   - Issue 5.3: `systemctl status kajbazar-api shows 'activating (auto-restart)' loop`
   - Issue 5.4: `Out of Memory (OOM Killer) terminates dotnet process`
   - Issue 5.5: `nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)`
   - Issue 5.6: `Permission denied on /var/www/kajbazar`
   - Issue 5.7: `Certbot fails: Could not bind to IPv4 or IPv6`
6. [Master Log Inspection Cheat Sheet](#6-master-log-inspection-cheat-sheet)
7. [Frequently Asked Questions (FAQ)](#7-frequently-asked-questions-faq)
8. [Conclusion & Next Steps](#8-conclusion--next-steps)

---

## 1. The 4-Step Emergency Diagnostic Checklist

### 1.1 The Golden 10-Second System Triage

Whenever the website fails to load or buttons stop responding, open a terminal and run these 4 diagnostic checks in order:

```bash
# Check 1: Is PostgreSQL database running?
sudo systemctl is-active postgresql

# Check 2: Is the backend .NET Web API running on port 5000?
curl -I http://127.0.0.1:5000/api/categories

# Check 3: Is Nginx running on port 80/443?
sudo systemctl is-active nginx

# Check 4: What is the most recent error log message from the API?
sudo journalctl -u kajbazar-api -n 20 --no-pager
```

By following this checklist, you can identify which component is down in less than 10 seconds!

---

## 2. Database Connection & SQL Errors

### Issue 2.1: `Connection refused (127.0.0.1:5432)`
- **Full Stack Trace**:
  ```
  Npgsql.NpgsqlException (0x80004005): Connection refused
   ---> System.Net.Sockets.SocketException (111): Connection refused
     at System.Net.Sockets.Socket.AwaitableSocketAsyncEventArgs.ThrowException(SocketError error, CancellationToken cancellationToken)
     at Npgsql.Internal.NpgsqlConnector.Connect(NpgsqlTimeout timeout)
  ```
- **Plain-English Meaning**: Your backend tried to call PostgreSQL on port 5432, but nobody answered the phone!
- **Root Cause**: The PostgreSQL database service is stopped, disabled, or listening on a different port.
- **Step-by-Step Fix**:
  ```bash
  # Check PostgreSQL status
  sudo systemctl status postgresql

  # Start service if inactive
  sudo systemctl start postgresql

  # Confirm it is listening on 5432
  sudo ss -tulpn | grep 5432
  ```

---

### Issue 2.2: `Password authentication failed for user "postgres"`
- **Full Stack Trace**:
  ```
  Npgsql.PostgresException (0x80004005): 28P01: password authentication failed for user "postgres"
     at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications)
     at Npgsql.Internal.NpgsqlConnector.Authenticate(String username, NpgsqlTimeout timeout, Boolean async, CancellationToken cancellationToken)
  ```
- **Plain-English Meaning**: You gave the right username (`postgres`), but the wrong password!
- **Root Cause**: The password in `appsettings.json` does not match the password stored inside the PostgreSQL user database.
- **Step-by-Step Fix**:
  Reset the PostgreSQL password to match your configuration:
  ```bash
  sudo -u postgres psql
  ALTER USER postgres WITH PASSWORD 'Password123#';
  \q
  ```
  Then update `appsettings.json`:
  ```json
  "DefaultConnection": "Host=localhost;Port=5432;Database=kajbazar_db;Username=postgres;Password=Password123#;"
  ```

---

### Issue 2.3: `relation "users" does not exist (42P01)`
- **Full Stack Trace**:
  ```
  Npgsql.PostgresException (0x80004005): 42P01: relation "users" does not exist
     at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(...)
     at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
  ```
- **Plain-English Meaning**: C# asked the database for the `users` table, but PostgreSQL could not find any table with that name!
- **Root Cause**: 
  1. The schema DDL has not been executed yet.
  2. Or Entity Framework looked for PascalCase `Users` without the lowercase snake_case converter.
- **Step-by-Step Fix**:
  1. Verify the database exists and has tables:
     ```bash
     psql -U postgres -d kajbazar_db -c "\dt"
     ```
  2. If empty, run the DDL script:
     ```bash
     psql -U postgres -d kajbazar_db -f sql/01_schema_ddl.sql
     psql -U postgres -d kajbazar_db -f sql/02_seed_data.sql
     ```
  3. Ensure `.UseSnakeCaseNamingConvention()` is registered in `Program.cs`.

---

### Issue 2.4: `violates check constraint "service_provider_profiles_verification_status_check"`
- **Full Stack Trace**:
  ```
  Npgsql.PostgresException (0x80004005): 23514: new row for relation "service_provider_profiles" violates check constraint "service_provider_profiles_verification_status_check"
  ```
- **Plain-English Meaning**: You tried to save a verification status that the database engine considers illegal!
- **Root Cause**: The column is constrained to `CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'))`. If code sends `'Approved'`, `'Active'`, or `'pending'` (lowercase), the check fails.
- **Step-by-Step Fix**: Always pass uppercase strings: `VerificationStatus.ToString().ToUpperInvariant()`.

---

### Issue 2.5: `duplicate key value violates unique constraint "users_email_key"`
- **Plain-English Meaning**: Someone tried to register with an email address that is already registered.
- **Step-by-Step Fix**: In `AuthController.cs`, query for existing accounts before attempting to insert:
  ```csharp
  var existing = await _userRepository.GetByEmailAsync(dto.Email);
  if (existing != null)
  {
      return BadRequest(new { message = "An account with this email already exists." });
  }
  ```

---

## 3. Backend .NET & C# API Errors

### Issue 3.1: `Port 5000 is already in use`
- **Full Error**: `System.IO.IOException: Failed to bind to address http://127.0.0.1:5000: address already in use.`
- **Plain-English Meaning**: Another program is already occupying door number 5000.
- **Step-by-Step Fix**:
  ```bash
  # Identify the process occupying port 5000
  sudo lsof -i :5000
  # Kill the stuck process by PID
  sudo kill -9 <PID>
  ```

---

### Issue 3.2: `401 Unauthorized when sending JWT token`
- **Plain-English Meaning**: The server looked at your token and said: *"I don't trust you."*
- **Causes & Fixes**:
  1. **Token Expired**: Check the `exp` claim in the token using `jwt.ms`. Re-login to get a fresh token.
  2. **Missing `Bearer ` Prefix**: In Axios, make sure there is a space:
     `config.headers.Authorization = 'Bearer ' + token;`
  3. **Secret Key Mismatch**: If `Jwt:Key` in `appsettings.json` was changed, old tokens become invalid. Re-login!

---

### Issue 3.3: `403 Forbidden on Admin endpoint`
- **Plain-English Meaning**: The server knows who you are, but you are not an Administrator!
- **Step-by-Step Fix**:
  Check the user's role in the database:
  ```sql
  SELECT u.email, r.role_name 
  FROM users u 
  JOIN user_roles ur ON u.user_id = ur.user_id 
  JOIN roles r ON ur.role_id = r.role_id 
  WHERE u.email = 'your_email@example.com';
  ```
  To promote an account to Admin:
  ```sql
  UPDATE user_roles 
  SET role_id = (SELECT role_id FROM roles WHERE role_name = 'Admin') 
  WHERE user_id = (SELECT user_id FROM users WHERE email = 'your_email@example.com');
  ```

---

### Issue 3.6: `CORS Policy Blocked`
- **Error in Browser Console**:
  `Access to XMLHttpRequest at 'http://localhost:5000/api/categories' from origin 'http://localhost:5173' has been blocked by CORS policy`
- **Fix**: In `Program.cs`, ensure `app.UseCors("AllowClientApp");` is placed **before** `app.UseAuthentication()` and `app.UseAuthorization()`.

---

## 4. Frontend React & Vite Errors

### Issue 4.2: `404 Not Found when refreshing browser in production`
- **Symptom**: Clicking navigation links works, but pressing `F5` on `https://kajbazar.com/directory` returns an Nginx 404 page.
- **Root Cause**: React Router is a client-side router. When you press refresh, the browser asks Nginx for a physical file named `/directory`, which does not exist on disk.
- **Step-by-Step Fix**: Add the `try_files` directive to Nginx:
  ```nginx
  location / {
      try_files $uri $uri/ /index.html;
  }
  ```

---

### Issue 4.4: `Cannot read properties of undefined (reading 'map')`
- **Symptom**: React component displays a white screen.
- **Root Cause**: The API response returned an error or null, and your component executed `categories.map(...)`.
- **Step-by-Step Fix**: Always provide default fallback empty arrays:
  ```jsx
  const [categories, setCategories] = useState([]);
  // In JSX render:
  {categories?.map((cat) => (
    <div key={cat.categoryId}>{cat.categoryName}</div>
  ))}
  ```

---

## 5. Server, Nginx & Systemd Errors

### Issue 5.1: `502 Bad Gateway from Nginx`
- **Plain-English Meaning**: Nginx received the user's request, but when Nginx knocked on Kestrel's door (`http://127.0.0.1:5000`), nobody answered!
- **Step-by-Step Fix**:
  ```bash
  # Check if backend service is running
  sudo systemctl status kajbazar-api
  # Restart service
  sudo systemctl restart kajbazar-api
  # Read live crash logs
  sudo journalctl -u kajbazar-api -n 30 --no-pager
  ```

---

## 6. Master Log Inspection Cheat Sheet

| Subsystem | Command |
| :--- | :--- |
| **Backend Live Logs** | `sudo journalctl -u kajbazar-api -f` |
| **Backend Last 50 Errors** | `sudo journalctl -u kajbazar-api -p err -n 50 --no-pager` |
| **Nginx Error Log** | `sudo tail -f /var/log/nginx/error.log` |
| **Nginx Access Log** | `sudo tail -f /var/log/nginx/access.log` |
| **PostgreSQL Error Log** | `sudo tail -f /var/log/postgresql/postgresql-15-main.log` |
| **System Out-of-Memory** | `sudo dmesg -T \| grep -i oom` |

---

## 7. Frequently Asked Questions (FAQ)

### Q1: Why do we use BCrypt instead of SHA-256?
**Answer**: SHA-256 is designed to be fast (computers can compute 1,000,000,000 SHA-256 hashes per second). This makes brute-force password cracking easy. BCrypt is intentionally slow and includes an embedded salt, making brute-force attacks impossible.

### Q2: Why does the system allow consumers to see phone numbers directly?
**Answer**: In Bangladesh, tradespeople (electricians, mechanics) do not use smartphones for in-app text chats. They prefer direct phone calls. KajBazar's core design principle is **zero middlemen, direct contact** (`BR-06`).

---

## 8. Next Steps

Now that you are equipped to handle any unexpected error, study how to maintain and evolve the application over the long term:
👉 **[Volume 08: Maintenance & Evolution Guide](08-maintenance-and-evolution-guide.md)**
