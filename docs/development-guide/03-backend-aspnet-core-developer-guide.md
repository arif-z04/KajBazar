# Volume 03: Backend ASP.NET Core 8 Developer Guide
## The Complete Handbook for the KajBazar Web API Server

---

## 📖 Introduction: The Engine Under the Hood

If the database is the locked vault where our company's treasures are stored, then the **Backend API** is the security team, receptionist, cashier, and manager all rolled into one.

In this volume, we will dissect the **ASP.NET Core 8 Web API** backend of KajBazar. We will explain everything from basic C# syntax and Dependency Injection to JWT authentication, EF Core data mapping, and every single REST API endpoint available in the system.

---

## 📑 Table of Contents

1. [ASP.NET Core 8 & C# Fundamentals for Beginners](#1-aspnet-core-8--c-fundamentals-for-beginners)
   - 1.1 What is ASP.NET Core?
   - 1.2 The Kestrel Web Server
   - 1.3 What is a REST API Endpoint?
   - 1.4 Dependency Injection: The "Toolbox" Analogy
   - 1.5 Asynchronous Programming (`async` / `await` and `Task<T>`)
2. [The Backend Project Structure (Clean Architecture)](#2-the-backend-project-structure-clean-architecture)
   - 2.1 Layer 1: `KajBazar.Core` (The Domain Contracts)
   - 2.2 Layer 2: `KajBazar.Infrastructure` (Data Access & Services)
   - 2.3 Layer 3: `KajBazar.API` (Web Controllers & Middleware)
   - 2.4 Why We Use DTOs Instead of Exposing Database Entities
3. [Startup Configuration & Middleware Pipeline (`Program.cs`)](#3-startup-configuration--middleware-pipeline-programcs)
   - 3.1 Service Registration & Dependency Injection Container
   - 3.2 CORS (Cross-Origin Resource Sharing) Configuration
   - 3.3 JWT Bearer Authentication Middleware
   - 3.4 Interactive Swagger / OpenAPI Documentation
   - 3.5 Global Error Handling: `ExceptionHandlingMiddleware`
4. [Authentication, Password Security & JWT Tokens](#4-authentication-password-security--jwt-tokens)
   - 4.1 BCrypt Password Hashing with Salt
   - 4.2 How JSON Web Tokens (JWT) Work (Header, Payload, Signature)
   - 4.3 Generating the Token (`AuthService.cs`)
   - 4.4 Enforcing Role-Based Access Control (`[Authorize(Roles = "...")]`)
5. [Data Access Layer: Entity Framework Core 8](#5-data-access-layer-entity-framework-core-8)
   - 5.1 The `KajBazarDbContext`
   - 5.2 Snake-Case Database Naming Convention
   - 5.3 Value Converters for Postgres Enum Strings
   - 5.4 Repositories: Bridging C# and SQL
6. [Complete Controller-by-Controller & Endpoint Reference](#6-complete-controller-by-controller--endpoint-reference)
   - 6.1 `AuthController` (`/api/auth`)
   - 6.2 `WorkersController` (`/api/workers`)
   - 6.3 `ReviewsController` (`/api/reviews`)
   - 6.4 `RecommendationsController` (`/api/recommendations`)
   - 6.5 `AdminController` (`/api/admin`)
   - 6.6 `CategoriesController` (`/api/categories`)
   - 6.7 `GeographyController` (`/api/geography`)
7. [Testing Endpoints via Command Line (`curl`)](#7-testing-endpoints-via-command-line-curl)
8. [Summary & Next Steps](#8-summary--next-steps)

---

## 1. ASP.NET Core 8 & C# Fundamentals for Beginners

### 1.1 What is ASP.NET Core?
ASP.NET Core is Microsoft's high-performance, open-source, cross-platform framework for building modern web applications. In independent TechEmpower benchmarks, ASP.NET Core regularly ranks among the fastest web frameworks in the world, processing millions of requests per second with tiny memory usage.

### 1.2 The Kestrel Web Server
When you run `dotnet run` inside `src/KajBazar.API`, .NET launches **Kestrel**. 
Kestrel is an ultra-fast, lightweight web server written in C#. It binds to a network port (e.g. port `5000`), listens for incoming TCP socket connections, parses the HTTP text arriving from browsers, and hands it off to your C# code.

### 1.3 What is a REST API Endpoint?
A **REST API (Representational State Transfer Application Programming Interface)** is a structured way for programs to talk to each other.
Instead of sending back a visual web page with buttons and images, a REST API sends back raw **data** formatted as JSON.

An **endpoint** is a specific URL combined with an HTTP verb:
- `GET /api/categories` $\rightarrow$ "Give me all service categories."
- `POST /api/auth/login` $\rightarrow$ "Check these credentials and log me in."

### 1.4 Dependency Injection: The "Toolbox" Analogy

Imagine you are a carpenter who builds wooden chairs:
- **The Bad Way (No Dependency Injection)**: Every time someone orders a chair, you pause, drive to the hardware store, buy a new hammer, drive back, hit one nail, throw the hammer away, and repeat. In software, this is typing `new UserRepository()` inside every single controller method. It wastes memory and makes testing impossible!
- **The Good Way (Dependency Injection)**: You hire an assistant who owns a master toolbox. When you are hired as the chair maker, your boss hands you the hammer right at your workstation. You just use it.
In ASP.NET Core, the **Service Container** is that assistant. In `Program.cs`, we tell it once:
```csharp
builder.Services.AddScoped<IUserRepository, UserRepository>();
```
Now, whenever any Controller needs an `IUserRepository`, ASP.NET automatically passes it in via the constructor!

### 1.5 Asynchronous Programming (`async` / `await`)
When a database query takes 10 milliseconds to run, what should the web server do?
- **Synchronous (Bad)**: The server thread freezes and does nothing for 10 milliseconds. If 100 users query at the same time, all 100 threads freeze, and the server runs out of memory!
- **Asynchronous (`async/await`) (Good)**: The thread hands the query off to the operating system network card, says *"Wake me up when PostgreSQL answers"*, and immediately goes to serve other users! This allows a single small server to handle tens of thousands of concurrent connections.

---

## 2. The Backend Project Structure (Clean Architecture)

```
src/
├── KajBazar.Core/                  # Pure C# Domain Layer
│   ├── Entities/                   # Database Models
│   │   ├── User.cs
│   │   ├── ServiceProviderProfile.cs
│   │   ├── Review.cs
│   │   ├── Recommendation.cs
│   │   └── AdminAuditLog.cs
│   ├── DTOs/                       # Data Transfer Objects
│   │   ├── AuthDtos.cs
│   │   ├── WorkerDtos.cs
│   │   ├── ReviewDtos.cs
│   │   └── AdminDtos.cs
│   └── Interfaces/                 # Repository Contracts
│       └── RepositoryInterfaces.cs
├── KajBazar.Infrastructure/        # Data Access & External Services
│   ├── Data/
│   │   └── KajBazarDbContext.cs    # EF Core DbContext
│   ├── Repositories/               # Repository Implementations
│   │   ├── UserRepository.cs
│   │   ├── ServiceProviderRepository.cs
│   │   └── ...
│   └── Services/
│       └── AuthService.cs          # BCrypt & JWT implementation
└── KajBazar.API/                   # Presentation Layer
    ├── Controllers/                # REST API Endpoints
    ├── Middleware/                 # Error handling & interceptors
    ├── Program.cs                  # Startup & DI Registration
    └── appsettings.json            # Configuration settings
```

### 2.1 Layer 1: `KajBazar.Core`
This is the heart of the application. It contains no database connection strings, no ASP.NET packages, and no HTTP references. It simply defines:
1. **Entities**: How a `User` or `Review` is structured in memory.
2. **DTOs (Data Transfer Objects)**: Lightweight objects designed specifically for network transfer. For example, `UserLoginDto` contains only `Email` and `Password`. We never expose the internal database `password_hash` column to the internet!
3. **Interfaces**: C# interfaces like `IUserRepository` that declare *what* methods exist (`GetByEmailAsync`, `CreateAsync`), without caring *how* they are implemented.

### 2.2 Layer 2: `KajBazar.Infrastructure`
This layer handles the dirty work of communicating with the outside world:
- It uses **Entity Framework Core 8** to connect to PostgreSQL.
- It contains concrete repository classes (`UserRepository.cs`, `ServiceProviderRepository.cs`) that execute SQL commands.
- It contains `AuthService.cs` which hashes passwords using BCrypt and generates JWT tokens.

### 2.3 Layer 3: `KajBazar.API`
This is the layer that communicates with clients (browsers, mobile apps):
- It contains **Controllers** that accept HTTP requests.
- It enforces security via `[Authorize]` attributes.
- It maps incoming JSON bodies to C# DTOs.

### 2.4 Why We Use DTOs Instead of Exposing Database Entities
A **DTO (Data Transfer Object)** is a plain C# object created specifically to carry data between the client and server.
- **Security**: If you returned the `User` database entity directly, you might accidentally include the `PasswordHash` field in the JSON response! With a `UserResponseDto`, you only include `Id`, `FullName`, `Email`, and `Role`.
- **Decoupling**: If you rename a column in the database, the frontend doesn't break because the DTO keeps the same JSON property names.

---

## 3. Startup Configuration & Middleware Pipeline (`Program.cs`)

When the API launches, execution begins in [`src/KajBazar.API/Program.cs`](file:///home/noir/Desktop/PROJECTS/Kajbazar/src/KajBazar.API/Program.cs). Let's examine the full implementation:

```csharp
using System.Text;
using KajBazar.API.Middleware;
using KajBazar.Core.Interfaces;
using KajBazar.Infrastructure.Data;
using KajBazar.Infrastructure.Repositories;
using KajBazar.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Configuration with Npgsql and Snake-Case Naming
builder.Services.AddDbContext<KajBazarDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .UseSnakeCaseNamingConvention());

// 2. Register Repositories and Services with Scoped Lifetime
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IServiceProviderRepository, ServiceProviderRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<IRecommendationRepository, RecommendationRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IGeographyRepository, GeographyRepository>();
builder.Services.AddScoped<IAdminAuditLogRepository, AdminAuditLogRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();

// 3. Configure Controllers and JSON Serialization
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 4. Configure Swagger with JWT Bearer Support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "KajBazar API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// 5. Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClientApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 6. Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "KajBazarSuperSecretKeyForJwtAuthentication2026";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "KajBazarAPI";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtIssuer,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// 7. Configure HTTP Request Pipeline
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowClientApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

---

## 4. Authentication, Password Security & JWT Tokens

### 4.1 BCrypt Password Hashing with Salt
Passwords are **never** stored in plain text. Even if a hacker steals the database, they will only see random gibberish like:
`$2a$11$bRI6cgkzNa/xQbA.yLngd.I1FLEPmO4qxz.KOWf1kyi/./EmoUDRq`

- **Salt**: A random 128-bit string added to each password before hashing, defeating Rainbow Table attacks.
- **Cost Factor 11**: Forces the computer to perform $2^{11} = 2,048$ cryptographic rounds, making brute-force cracking mathematically infeasible.

We hash passwords using [`BCrypt.Net-Next`](file:///home/noir/Desktop/PROJECTS/Kajbazar/src/KajBazar.Infrastructure/Services/AuthService.cs):
```csharp
string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 11);
bool isValid = BCrypt.Net.BCrypt.Verify(passwordAttempt, user.PasswordHash);
```

### 4.2 How JSON Web Tokens (JWT) Work
A JWT is a secure digital passport. It has three parts separated by dots (`.`) formatted as Base64 text:
`HEADER.PAYLOAD.SIGNATURE`

1. **Header**: Declares algorithm (`HMAC-SHA256`).
2. **Payload (Claims)**: Contains identity data:
   - `nameidentifier`: User UUID
   - `email`: `user@example.com`
   - `role`: `Consumer` or `Admin` or `ServiceProvider`
   - `exp`: Expiration timestamp (e.g. 7 days from now)
3. **Signature**: A cryptographic hash generated using our server's private secret key. If a user modifies their role from `Consumer` to `Admin` in their browser, the signature becomes invalid, and the API instantly rejects the request with `401 Unauthorized`!

---

## 5. Data Access Layer: Entity Framework Core 8

### 5.1 The `KajBazarDbContext`
The `DbContext` acts as a high-level bridge between C# and PostgreSQL.
Located in [`src/KajBazar.Infrastructure/Data/KajBazarDbContext.cs`](file:///home/noir/Desktop/PROJECTS/Kajbazar/src/KajBazar.Infrastructure/Data/KajBazarDbContext.cs):

```csharp
public class KajBazarDbContext : DbContext
{
    public KajBazarDbContext(DbContextOptions<KajBazarDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<ServiceProviderProfile> ServiceProviders { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<WorkerCategory> WorkerCategories { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<Recommendation> Recommendations { get; set; }
    public DbSet<District> Districts { get; set; }
    public DbSet<Upazila> Upazilas { get; set; }
    public DbSet<AdminAuditLog> AdminAuditLogs { get; set; }
    
    // Fluent API configuration...
}
```

### 5.2 Snake-Case Database Naming Convention
PostgreSQL by standard convention uses lowercase snake_case for table and column names (`phone_number`, `created_at`). C# uses PascalCase (`PhoneNumber`, `CreatedAt`).
By configuring:
```csharp
options.UseSnakeCaseNamingConvention();
```
EF Core automatically and invisibly handles this translation.

---

## 6. Complete Controller-by-Controller & Endpoint Reference

Here is the complete catalog of all 7 REST Controllers and their endpoints:

### 6.1 `AuthController` (`/api/auth`)
| Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new Consumer or ServiceProvider account (`BR-01`). |
| `POST` | `/api/auth/login` | Public | Authenticate credentials and receive JWT Bearer token. |
| `GET` | `/api/auth/me` | Authenticated | Fetch current user's profile details and permissions. |

#### Full Implementation Walkthrough:
```csharp
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IAuthService _authService;

    public AuthController(IUserRepository userRepository, IAuthService authService)
    {
        _userRepository = userRepository;
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var existingEmail = await _userRepository.GetByEmailAsync(dto.Email);
        if (existingEmail != null)
            return BadRequest(new { message = "An account with this email address already exists." });

        var existingPhone = await _userRepository.GetByPhoneAsync(dto.PhoneNumber);
        if (existingPhone != null)
            return BadRequest(new { message = "An account with this phone number already exists." });

        var user = new User
        {
            UserId = Guid.NewGuid(),
            FullName = dto.FullName.Trim(),
            Email = dto.Email.Trim().ToLowerInvariant(),
            PhoneNumber = dto.PhoneNumber.Trim(),
            PasswordHash = _authService.HashPassword(dto.Password),
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);
        await _userRepository.AssignRoleAsync(user.UserId, dto.Role ?? "Consumer");

        var token = _authService.GenerateJwtToken(user, dto.Role ?? "Consumer");

        return Ok(new AuthResponseDto
        {
            Token = token,
            UserId = user.UserId,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            Role = dto.Role ?? "Consumer"
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        var user = await _userRepository.GetWithRolesByEmailAsync(dto.Email);
        if (user == null || !_authService.VerifyPassword(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password." });

        if (!user.IsActive)
            return StatusCode(403, new { message = "Your account has been deactivated." });

        var roleName = user.UserRoles.FirstOrDefault()?.Role?.RoleName ?? "Consumer";
        var token = _authService.GenerateJwtToken(user, roleName);

        return Ok(new AuthResponseDto
        {
            Token = token,
            UserId = user.UserId,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            Role = roleName
        });
    }
}
```

---

### 6.2 `WorkersController` (`/api/workers`)
| Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/workers/search` | Public | Search verified workers by Category, District, Upazila, and min rating (`BR-03`, `BR-05`). |
| `GET` | `/api/workers/{id}` | Public | Get full worker profile, trade list, rating stats, and reviews (`BR-06`). |
| `POST` | `/api/workers/profile` | Authenticated | Create or update worker professional profile (`BR-02`). |
| `GET` | `/api/workers/me` | Authenticated | Fetch the authenticated worker's own profile. |

#### Full Implementation Walkthrough:
```csharp
[ApiController]
[Route("api/[controller]")]
public class WorkersController : ControllerBase
{
    private readonly IServiceProviderRepository _workerRepository;

    public WorkersController(IServiceProviderRepository workerRepository)
    {
        _workerRepository = workerRepository;
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchWorkers([FromQuery] WorkerSearchFilterDto filter)
    {
        var (workers, totalCount) = await _workerRepository.SearchWorkersAsync(
            filter.Category, filter.DistrictId, filter.UpazilaId, filter.MinRating, filter.Page, filter.PageSize);

        var workerDtos = workers.Select(w => new WorkerSummaryDto
        {
            ProfileId = w.ProfileId,
            UserId = w.UserId,
            WorkerName = w.User.FullName,
            PhoneNumber = w.User.PhoneNumber, // Direct phone reveal (BR-06)
            Email = w.User.Email,
            DistrictName = w.District?.DistrictName ?? string.Empty,
            UpazilaName = w.Upazila?.UpazilaName ?? string.Empty,
            HourlyRate = w.HourlyRate,
            AverageRating = w.AverageRating,
            TotalReviews = w.TotalReviews,
            Categories = w.WorkerCategories.Select(wc => wc.Category.CategoryName).ToList()
        }).ToList();

        return Ok(new { totalCount, workers = workerDtos });
    }
}
```

---

### 6.3 `ReviewsController` (`/api/reviews`)
| Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/reviews` | Authenticated | Submit a rating (1-5) and feedback for a worker (`BR-07`, `BR-08`). |
| `GET` | `/api/reviews/worker/{workerProfileId}` | Public | Get all approved reviews for a specific worker. |

#### Full Implementation Walkthrough:
```csharp
[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewRepository _reviewRepository;
    private readonly IServiceProviderRepository _workerRepository;

    public ReviewsController(IReviewRepository reviewRepository, IServiceProviderRepository workerRepository)
    {
        _reviewRepository = reviewRepository;
        _workerRepository = workerRepository;
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> AddReview([FromBody] CreateReviewDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var consumerId)) return Unauthorized();

        var worker = await _workerRepository.GetByIdAsync(dto.WorkerProfileId);
        if (worker == null) return NotFound(new { message = "Worker not found." });

        if (worker.UserId == consumerId)
            return BadRequest(new { message = "You cannot review your own profile." });

        var review = new Review
        {
            ReviewId = Guid.NewGuid(),
            ConsumerId = consumerId,
            WorkerProfileId = dto.WorkerProfileId,
            Rating = dto.Rating,
            Comment = dto.Comment?.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Enforces BR-08: Add or update single review per consumer
        await _reviewRepository.AddOrUpdateReviewAsync(review);

        var updatedWorker = await _workerRepository.GetByIdAsync(dto.WorkerProfileId);

        return Ok(new
        {
            message = "Review submitted successfully.",
            averageRating = updatedWorker?.AverageRating ?? 0.00m,
            totalReviews = updatedWorker?.TotalReviews ?? 0
        });
    }
}
```

---

### 6.4 `RecommendationsController` (`/api/recommendations`)
| Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/recommendations` | Authenticated | Recommend an offline tradesperson for admin onboarding (`BR-09`). |
| `GET` | `/api/recommendations` | Admin | View pending community recommendations. |
| `PUT` | `/api/recommendations/{id}/status` | Admin | Update status (`PENDING`, `CONTACTED`, `ONBOARDED`, `REJECTED`). |

---

### 6.5 `AdminController` (`/api/admin`)
| Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Admin | Dashboard summary counts (total users, workers, reviews, pending). |
| `GET` | `/api/admin/workers/pending` | Admin | List all workers awaiting verification approval (`BR-10`). |
| `PUT` | `/api/admin/workers/{profileId}/verify` | Admin | Approve worker profile and log audit action (`BR-10`, `BR-14`). |
| `PUT` | `/api/admin/workers/{profileId}/reject` | Admin | Reject worker profile with explanation note. |
| `PUT` | `/api/admin/workers/{profileId}/suspend` | Admin | Suspend an active worker due to policy violations. |
| `GET` | `/api/admin/audit-logs` | Admin | Retrieve administrative audit trail (`BR-14`). |

---

### 6.6 `CategoriesController` (`/api/categories`)
| Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Public | Get all active service categories. |
| `POST` | `/api/categories` | Admin | Create a new service trade category (`BR-11`). |

---

### 6.7 `GeographyController` (`/api/geography`)
| Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/geography/districts` | Public | List all administrative districts. |
| `GET` | `/api/geography/districts/{id}/upazilas` | Public | List all upazilas in a specific district. |
| `POST` | `/api/geography/districts` | Admin | Add a new district (`BR-11`). |
| `POST` | `/api/geography/upazilas` | Admin | Add a new upazila under a district (`BR-11`). |

---

## 7. Testing Endpoints via Command Line (`curl`)

You can test all endpoints without opening a browser using `curl`:

### Test 1: Fetch Public Categories
```bash
curl -s http://localhost:5000/api/categories | jq
```

### Test 2: Search Verified Electricians
```bash
curl -s "http://localhost:5000/api/workers/search?category=Electrician" | jq
```

### Test 3: Log In as Admin and Extract JWT
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kajbazar.com","password":"Password123#"}' | jq -r .token)

echo "Received Token: $TOKEN"
```

### Test 4: Access Protected Admin Dashboard Using Token
```bash
curl -s http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 8. Summary & Next Steps

The backend API is robust, modular, secure, and fully documented.

Now, let's explore how our React frontend builds an intuitive, responsive user interface on top of these endpoints:
👉 **[Volume 04: Frontend React Developer Guide](04-frontend-react-developer-guide.md)**
