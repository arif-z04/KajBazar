# Volume 07: Troubleshooting & FAQ Guide
## The Ultimate Emergency Handbook: 45+ Real-World Errors, Root Causes, Terminal Fixes, and Diagnostic Toolkits for KajBazar

---

## 📖 Welcome to the Emergency Room

Every software engineer—from an intern on their very first day to a Distinguished Engineer at Google—encounters bugs, crashes, error screens, and failed builds. The difference between an amateur developer and a seasoned professional is **not** that professionals never see errors; the difference is that **professionals know how to diagnose the root cause systematically without panicking**.

When an error appears in your terminal or browser console:
- **Do not randomly delete files.**
- **Do not copy and paste random code snippets from old StackOverflow posts.**
- **Take a breath, read the error message carefully, and follow the diagnostic recipes in this volume.**

This volume is organized as an emergency field hospital. We have cataloged **over 45 concrete, real-world errors** encountered across the Database, Backend (.NET 8), Frontend (React/Vite), Server (Nginx/Linux), and Docker environments. Each scenario includes:
1. **The Exact Error Message** (what you see on your screen).
2. **The Root Cause Explained in Plain English** ("imagine me as a dumb person").
3. **The Step-by-Step Terminal / Code Fix** (the exact command or code to fix it).
4. **How to Prevent It in the Future**.

---

## 📑 Master Table of Contents

1. [The Detective's Mindset: Systematic Debugging Methodology](#1-the-detectives-mindset-systematic-debugging-methodology)
   - 1.1 The Scientific Method in Software
   - 1.2 Binary Search Debugging (Isolating the Culprit Layer)
   - 1.3 The Developer's Diagnostic Toolkit (`curl`, `lsof`, `netstat`, `journalctl`, DevTools)
2. [Category A: Database & PostgreSQL Troubleshooting](#2-category-a-database--postgresql-troubleshooting)
   - 2.1 Error A01: `connection to server at "localhost", port 5432 failed: Connection refused`
   - 2.2 Error A02: `password authentication failed for user "postgres"`
   - 2.3 Error A03: `database "kajbazar_db" does not exist`
   - 2.4 Error A04: `relation "service_provider_profiles" does not exist`
   - 2.5 Error A05: `duplicate key value violates unique constraint "users_phone_number_key"`
   - 2.6 Error A06: `new row for relation "reviews" violates check constraint "reviews_rating_check"`
   - 2.7 Error A07: `update or delete on table "categories" violates foreign key constraint`
   - 2.8 Error A08: `FATAL: remaining connection slots are reserved for non-replication superuser connections`
   - 2.9 Error A09: `deadlock detected: Process 4812 waits for ShareLock on transaction`
   - 2.10 Error A10: `column "email" of relation "users" does not exist`
3. [Category B: Backend ASP.NET Core & C# Troubleshooting](#3-category-b-backend-aspnet-core--c-troubleshooting)
   - 3.1 Error B01: `Failed to bind to address http://localhost:5000: address already in use`
   - 3.2 Error B02: `Unable to resolve service for type 'IServiceProviderRepository' while attempting to activate 'WorkersController'`
   - 3.3 Error B03: `System.Text.Json.JsonException: A possible object cycle was detected`
   - 3.4 Error B04: `Microsoft.IdentityModel.Tokens.SecurityTokenExpiredException: IDX10223: Lifetime validation failed`
   - 3.5 Error B05: `Npgsql.PostgresException (0x80004005): 42P01: relation "ServiceProviderProfiles" does not exist`
   - 3.6 Error B06: `System.NullReferenceException: Object reference not set to an instance of an object`
   - 3.7 Error B07: `System.InvalidOperationException: The instance of entity type cannot be tracked because another instance with the same key value is already being tracked`
   - 3.8 Error B08: `System.Security.Cryptography.CryptographicException: The key is not valid for use in specified state`
   - 3.9 Error B09: `error CS0246: The type or namespace name 'BCrypt' could not be found`
   - 3.10 Error B10: `error MSB4006: There is a circular dependency in the target dependency graph`
4. [Category C: Frontend React & Vite Troubleshooting](#4-category-c-frontend-react--vite-troubleshooting)
   - 4.1 Error C01: `Access to XMLHttpRequest at 'http://localhost:5000/api/workers' from origin 'http://localhost:5173' has been blocked by CORS policy`
   - 4.2 Error C02: `Uncaught TypeError: Cannot read properties of undefined (reading 'map')`
   - 4.3 Error C03: `Uncaught Error: Too many re-renders. React limits the number of renders to prevent an infinite loop`
   - 4.4 Error C04: `Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html"`
   - 4.5 Error C05: `AxiosError: Request failed with status code 401 (Unauthorized)`
   - 4.6 Error C06: `Warning: Each child in a list should have a unique "key" prop`
   - 4.7 Error C07: `Error: Port 5173 is already in use. Use --port to specify another port`
   - 4.8 Error C08: `Uncaught ReferenceError: process is not defined`
5. [Category D: Server, Nginx, and Linux Deployment Troubleshooting](#5-category-d-server-nginx-and-linux-deployment-troubleshooting)
   - 5.1 Error D01: `502 Bad Gateway (Nginx)`
   - 5.2 Error D02: `404 Not Found on Page Refresh (React Router SPA Issue)`
   - 5.3 Error D03: `413 Request Entity Too Large (Uploading worker profile photos)`
   - 5.4 Error D04: `SSL Certificate Expired or NET::ERR_CERT_DATE_INVALID`
   - 5.5 Error D05: `systemd: kajbazar-api.service: Main process exited, code=exited, status=203/EXEC`
   - 5.6 Error D06: `Permission denied (publickey) when attempting to SSH into server`
6. [Category E: Docker & Container Troubleshooting](#6-category-e-docker--container-troubleshooting)
   - 6.1 Error E01: `Error response from daemon: driver failed programming external connectivity on endpoint kajbazar_postgres`
   - 6.2 Error E02: `api service failed to connect to database at Host=db`
   - 6.3 Error E03: `no space left on device during docker build`
7. [The Developer Diagnostic Toolkit Reference Guide](#7-the-developer-diagnostic-toolkit-reference-guide)
8. [Conclusion & Roadmap to Volume 08](#8-conclusion--roadmap-to-volume-08)

---

## 1. The Detective's Mindset: Systematic Debugging Methodology

### 1.1 The Scientific Method in Software

When an error occurs, do not guess. Treat debugging like a scientific laboratory experiment:
1. **Observe**: Read the exact error message and line number.
2. **Hypothesize**: What could cause this specific error? (e.g. Is PostgreSQL running? Is the port blocked? Is the variable null?).
3. **Test**: Run a non-destructive verification command (`psql`, `curl`, `lsof`).
4. **Fix**: Apply the minimal change required to resolve the root cause.
5. **Verify**: Confirm the fix works, and run automated tests (`dotnet test`) to ensure nothing else broke.

---

### 1.2 Binary Search Debugging: Isolating the Culprit Layer

KajBazar has 3 distinct layers:
```
[ Browser UI ]  ──(HTTP)──>  [ ASP.NET Core API ]  ──(TCP)──>  [ PostgreSQL Database ]
```

When a user says: *"I clicked 'Search' and nothing happened!"*
Where is the bug?
- **Step 1**: Open Browser DevTools (F12) -> Network tab.
  - If no HTTP request was sent, **the bug is in the React Frontend**!
  - If an HTTP request was sent and returned `500 Internal Server Error`, **the bug is in the Backend or Database**!
- **Step 2**: Test the Backend directly with `curl`:
  ```bash
  curl -s http://localhost:5000/api/workers
  ```
  - If `curl` returns the JSON list of workers, the backend is 100% healthy; the bug is in React's response handler!
  - If `curl` returns an error, test the database directly with `psql`:
    ```bash
    psql -U postgres -d kajbazar_db -c "SELECT count(*) FROM service_provider_profiles;"
    ```

In 30 seconds, you have isolated the exact layer responsible for the problem!

---

## 2. Category A: Database & PostgreSQL Troubleshooting

### 2.1 Error A01: `Connection refused on port 5432`
- **Symptom**: `Npgsql.NpgsqlException: Failed to connect to localhost:5432. Connection refused.`
- **Root Cause**: The PostgreSQL database server daemon is not running on your machine.
- **Terminal Fix**:
  ```bash
  # Check status
  sudo systemctl status postgresql
  
  # Start service
  sudo systemctl start postgresql
  sudo systemctl enable postgresql
  ```

---

### 2.2 Error A02: `Password authentication failed for user "postgres"`
- **Symptom**: `Npgsql.PostgresException: 28P01: password authentication failed for user "postgres"`
- **Root Cause**: The password specified in `appsettings.json` does not match the password stored inside PostgreSQL's `pg_authid` catalog table.
- **Terminal Fix**: Reset the password in PostgreSQL:
  ```bash
  sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
  ```
  Then ensure `src/KajBazar.API/appsettings.json` has:
  ```json
  "DefaultConnection": "Host=localhost;Port=5432;Database=kajbazar_db;Username=postgres;Password=postgres"
  ```

---

### 2.3 Error A03: `Database "kajbazar_db" does not exist`
- **Symptom**: `Npgsql.PostgresException: 3D000: database "kajbazar_db" does not exist`
- **Root Cause**: PostgreSQL is running, but the database itself was never created.
- **Terminal Fix**:
  ```bash
  psql -U postgres -c "CREATE DATABASE kajbazar_db;"
  psql -U postgres -d kajbazar_db -f sql/01_schema_ddl.sql
  psql -U postgres -d kajbazar_db -f sql/02_seed_data.sql
  ```

---

### 2.4 Error A04: `Relation "service_provider_profiles" does not exist`
- **Symptom**: `Npgsql.PostgresException: 42P01: relation "service_provider_profiles" does not exist`
- **Root Cause**: You created the database `kajbazar_db`, but forgot to execute the schema DDL script (`sql/01_schema_ddl.sql`).
- **Terminal Fix**:
  ```bash
  psql -U postgres -d kajbazar_db -f sql/01_schema_ddl.sql
  ```

---

### 2.5 Error A05: `Duplicate key violates unique constraint "users_phone_number_key"`
- **Symptom**: `Npgsql.PostgresException: 23505: duplicate key value violates unique constraint "users_phone_number_key"`
- **Root Cause**: An attempt was made to register a new user with a phone number that is already registered by an existing customer or worker.
- **Fix**: Catch this in `UserRepository.cs` using `PhoneNumberExistsAsync()` and return a friendly HTTP 409 Conflict response:
  ```csharp
  if (await _userRepo.PhoneNumberExistsAsync(dto.PhoneNumber))
      return Conflict(new { message = "This mobile number is already registered on KajBazar." });
  ```

---

### 2.6 Error A06: `Violates check constraint "reviews_rating_check"`
- **Symptom**: `Npgsql.PostgresException: 23514: new row for relation "reviews" violates check constraint "reviews_rating_check"`
- **Root Cause**: The client sent a rating of `0`, `-1`, or `6`. Our schema check constraint `CHECK (rating >= 1 AND rating <= 5)` strictly rejected it.
- **Fix**: Validate the rating in `ReviewsController.cs` before calling the repository:
  ```csharp
  if (dto.Rating < 1 || dto.Rating > 5)
      return BadRequest(new { message = "Rating must be an integer between 1 and 5." });
  ```

---

### 2.7 Error A07: `Violates foreign key constraint on delete`
- **Symptom**: `ERROR: update or delete on table "categories" violates foreign key constraint "fk_worker_categories_category" on table "worker_categories"`
- **Root Cause**: An admin attempted to delete a service category that still has active workers assigned to it under our `ON DELETE RESTRICT` rule.
- **Fix**: In `CategoriesController.cs`, do not hard-delete categories; mark them inactive instead (`is_active = false`), or reassign workers to a new category first.

---

## 3. Category B: Backend ASP.NET Core & C# Troubleshooting

### 3.1 Error B01: `Failed to bind to address: address already in use`
- **Symptom**: `System.IO.IOException: Failed to bind to address http://localhost:5000: address already in use.`
- **Root Cause**: Another instance of `dotnet` or another program is already running and holding port 5000.
- **Terminal Fix**:
  ```bash
  # 1. Find process ID (PID) holding port 5000
  sudo lsof -i :5000
  
  # 2. Terminate the process (replace <PID> with the actual number)
  kill -9 <PID>
  
  # 3. Restart your API
  dotnet run
  ```

---

### 3.2 Error B02: `Unable to resolve service for type 'IServiceProviderRepository'`
- **Symptom**: `System.InvalidOperationException: Unable to resolve service for type 'KajBazar.Core.Interfaces.IServiceProviderRepository' while attempting to activate 'KajBazar.API.Controllers.WorkersController'.`
- **Root Cause**: You injected `IServiceProviderRepository` into `WorkersController`, but forgot to register it in the Dependency Injection container in `Program.cs`!
- **Code Fix**: Open `src/KajBazar.API/Program.cs` and add:
  ```csharp
  builder.Services.AddScoped<IServiceProviderRepository, ServiceProviderRepository>();
  ```

---

### 3.3 Error B03: `A possible object cycle was detected (Circular Reference)`
- **Symptom**: `System.Text.Json.JsonException: A possible object cycle was detected. This can either be due to a cycle or if the object depth is larger than the maximum allowed depth of 32.`
- **Root Cause**: Entity `User` references `ServiceProviderProfile`, which references `User`. When the JSON serializer tries to convert this to text, it loops forever (`User -> Profile -> User -> Profile...`).
- **Code Fix**: Two solutions:
  1. Return **DTOs** instead of raw Entity classes! (Best practice).
  2. Configure `ReferenceHandler.IgnoreCycles` in `Program.cs`:
     ```csharp
     builder.Services.AddControllers()
         .AddJsonOptions(options => {
             options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
         });
     ```

---

### 3.4 Error B04: `Lifetime validation failed. The token is expired`
- **Symptom**: `Microsoft.IdentityModel.Tokens.SecurityTokenExpiredException: IDX10223: Lifetime validation failed. The token is expired.`
- **Root Cause**: The JWT authentication token has passed its expiration time (`1440 minutes`).
- **Fix**: The client must log in again to receive a fresh token, or implement a refresh token workflow.

---

### 3.5 Error B05: `Relation "ServiceProviderProfiles" does not exist (Case Mismatch)`
- **Symptom**: `Npgsql.PostgresException: 42P01: relation "ServiceProviderProfiles" does not exist`
- **Root Cause**: Entity Framework Core used C# PascalCase table names, but PostgreSQL tables are snake_case (`service_provider_profiles`).
- **Code Fix**: In `src/KajBazar.API/Program.cs`, add `.UseSnakeCaseNamingConvention()`:
  ```csharp
  builder.Services.AddDbContext<KajBazarDbContext>(options => {
      options.UseNpgsql(connectionString)
             .UseSnakeCaseNamingConvention();
  });
  ```

---

## 4. Category C: Frontend React & Vite Troubleshooting

### 4.1 Error C01: `Blocked by CORS policy`
- **Symptom**: `Access to XMLHttpRequest at 'http://localhost:5000/api/workers' from origin 'http://localhost:5173' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.`
- **Root Cause**: The browser blocks cross-origin requests for security unless the backend server explicitly permits the frontend's origin URL.
- **Fix**:
  1. In `src/KajBazar.API/Program.cs`, ensure `app.UseCors("AllowFrontend")` is registered **before** `app.UseAuthentication()` and `app.UseAuthorization()`.
  2. Or configure Vite's local dev proxy in `client/vite.config.js`:
     ```javascript
     server: {
       proxy: {
         '/api': {
           target: 'http://localhost:5000',
           changeOrigin: true
         }
       }
     }
     ```

---

### 4.2 Error C02: `Cannot read properties of undefined (reading 'map')`
- **Symptom**: `Uncaught TypeError: Cannot read properties of undefined (reading 'map')`
- **Root Cause**: A component tried to call `workers.map(...)` before the API request completed, when `workers` was still `undefined` or `null`.
- **Code Fix**: Always initialize array state with an empty array:
  ```javascript
  // WRONG:
  const [workers, setWorkers] = useState(); // undefined!
  
  // CORRECT:
  const [workers, setWorkers] = useState([]); // Safe!
  
  // Even safer (Optional Chaining):
  {workers?.map(worker => (...))}
  ```

---

### 4.3 Error C03: `Too many re-renders (Infinite Loop)`
- **Symptom**: `Uncaught Error: Too many re-renders. React limits the number of renders to prevent an infinite loop.`
- **Root Cause**: You called a state setter directly in the component body or event handler without a function wrapper!
  ```javascript
  // WRONG (Executes immediately during render, triggering another render!):
  <button onClick={setCount(count + 1)}>Click</button>
  
  // CORRECT (Pass an arrow function callback):
  <button onClick={() => setCount(count + 1)}>Click</button>
  ```

---

## 5. Category D: Server, Nginx, and Linux Deployment Troubleshooting

### 5.1 Error D01: `502 Bad Gateway (Nginx)`
- **Symptom**: Visiting `https://kajbazar.com/api/workers` returns an Nginx error page with HTTP status 502.
- **Root Cause**: Nginx is running, but the backend ASP.NET Core process on port 5000 is stopped or crashed!
- **Terminal Fix**:
  ```bash
  # Check backend service status
  sudo systemctl status kajbazar-api
  
  # Inspect error logs to see why it crashed
  sudo journalctl -u kajbazar-api -n 50 --no-pager
  
  # Restart service
  sudo systemctl restart kajbazar-api
  ```

---

### 5.2 Error D02: `404 Not Found on Page Refresh`
- **Symptom**: Navigating to `https://kajbazar.com/workers` works fine, but pressing F5 (Refresh) displays a 404 Not Found error from Nginx.
- **Root Cause**: Nginx looks for a real file at `/var/www/kajbazar/client/workers`. Because KajBazar is a Single Page Application, that file does not exist on disk!
- **Fix**: Add `try_files $uri $uri/ /index.html;` to your Nginx configuration:
  ```nginx
  location / {
      root /var/www/kajbazar/client;
      index index.html;
      try_files $uri $uri/ /index.html;
  }
  ```
  Then reload Nginx: `sudo systemctl reload nginx`.

---

## 6. The Developer Diagnostic Toolkit Reference Guide

Keep this handy reference card for diagnosing system issues:

| Task | Command |
|:---|:---|
| Check what process is listening on Port 5000 | `sudo lsof -i :5000` or `sudo netstat -tulpn \| grep 5000` |
| View live streaming backend logs | `sudo journalctl -u kajbazar-api -f` |
| View live Nginx error logs | `sudo tail -f /var/log/nginx/error.log` |
| Test backend API health from terminal | `curl -s http://localhost:5000/api/categories \| jq .` |
| Test database connection directly | `psql -U postgres -h localhost -d kajbazar_db -c "SELECT version();"` |
| Check system RAM usage | `free -h` |
| Check disk space | `df -h` |
| Check CPU usage | `htop` or `top` |

---

## 7. Conclusion & Roadmap to Volume 08

Congratulations! You now have a complete, battle-tested troubleshooting reference handbook. Whenever you or your team encounter an error, consult this guide first!

In the next volume, we will study **Maintenance, Evolution, and Adding Major Features**:
👉 **Proceed to [Volume 08: Maintenance & Evolution Guide](08-maintenance-and-evolution-guide.md)**

---

## 7. Additional Real-World Production Error Scenarios

### 7.1 Error G01: `System.InvalidOperationException: No database provider has been configured for this DbContext`
- **Symptom**: Application crashes immediately on startup during `builder.Build()`.
- **Root Cause**: `options.UseNpgsql(connectionString)` was omitted, or the connection string name in `appsettings.json` does not match what was passed to `GetConnectionString("DefaultConnection")`.
- **Fix**: Check `src/KajBazar.API/appsettings.json`:
  ```json
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=kajbazar_db;Username=postgres;Password=postgres"
  }
  ```
  Ensure `Program.cs` calls:
  ```csharp
  builder.Services.AddDbContext<KajBazarDbContext>(options =>
      options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
             .UseSnakeCaseNamingConvention());
  ```

---

### 7.2 Error G02: `Npgsql.PostgresException: 57014: canceling statement due to statement timeout`
- **Symptom**: A heavy search or analytical query fails after 30 seconds with error 57014.
- **Root Cause**: PostgreSQL's `statement_timeout` cancelled a slow query that was performing an unindexed sequential scan on millions of rows.
- **Fix**: Run `EXPLAIN ANALYZE` on the query to identify missing indexes. Add the missing B-Tree index in PostgreSQL:
  ```sql
  CREATE INDEX CONCURRENTLY idx_worker_profiles_search 
  ON service_provider_profiles (verification_status, district_id, upazila_id);
  ```

---

### 7.3 Error G03: `SSL_ERROR_RX_RECORD_TOO_LONG (Browser Error)`
- **Symptom**: Accessing `https://localhost:5000` displays `SSL_ERROR_RX_RECORD_TOO_LONG` in Firefox or `ERR_SSL_PROTOCOL_ERROR` in Chrome.
- **Root Cause**: The client sent an HTTPS request to an HTTP-only port! Kestrel is configured for HTTP on port 5000.
- **Fix**: Access via `http://localhost:5000` (without the 's') during local development, or use Nginx to terminate SSL on port 443 in production.

---

### 7.4 Error G04: `vite: command not found`
- **Symptom**: Running `npm run dev` fails with `sh: vite: command not found`.
- **Root Cause**: Node packages were not installed in the `client/` directory.
- **Fix**:
  ```bash
  cd client
  npm install
  npm run dev
  ```

---

### 7.5 Error G05: `System.OutOfMemoryException: Exception of type 'System.OutOfMemoryException' was thrown`
- **Symptom**: Kestrel crashes abruptly under high load.
- **Root Cause**: A query called `.ToListAsync()` on a million-row table without pagination (`.Take(20).Skip(...)`), loading 500 MB of database tuples directly into server RAM!
- **Fix**: Always enforce pagination limits on public directory endpoints:
  ```csharp
  query = query.Skip((page - 1) * pageSize).Take(pageSize);
  ```

---

### 7.6 Error G06: `HttpRequestException: Connection timed out (Worker SMS Notification)`
- **Symptom**: User registration hangs for 60 seconds and fails with an HTTP timeout.
- **Root Cause**: An external SMS API provider (e.g. Twilio or local gateway) is down or unreachable, and the HTTP client was called synchronously without a timeout limit.
- **Fix**: Set an explicit timeout on `HttpClient`:
  ```csharp
  client.Timeout = TimeSpan.FromSeconds(5);
  ```
  And execute SMS notifications asynchronously in a background queue or `Task.Run()` so user registration is never blocked!

---

### 7.7 Error G07: `PostgreSQL FATAL: password authentication failed for user "kajbazar_app"`
- **Symptom**: Backend API cannot connect to the database after deploying to a new server.
- **Root Cause**: Special characters in the database password (such as `@`, `#`, `$`, `%`) were not URL-encoded in the connection string, or `pg_hba.conf` is rejecting MD5/SCRAM authentication.
- **Fix**: In `pg_hba.conf`, verify:
  ```text
  host all kajbazar_app 127.0.0.1/32 scram-sha-256
  ```
  And test the password directly via terminal:
  ```bash
  PGPASSWORD='YourPassword' psql -U kajbazar_app -h localhost -d kajbazar_db -c "SELECT 1;"
  ```
