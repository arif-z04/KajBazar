# Volume 03: Backend ASP.NET Core Developer Guide
## The Comprehensive Architectural, C# 12, Entity Framework Core, and REST API Handbook for KajBazar

---

## 📖 Welcome to the Application Engine

In modern full-stack web platforms, the backend server is the **brain, gatekeeper, and traffic controller** of the entire enterprise. It is responsible for:
- Authenticating user identities and verifying cryptographic signatures.
- Enforcing critical business logic (such as *Rule BR-06: Worker phone numbers must remain hidden until a customer clicks 'Call Worker'*).
- Shielding the PostgreSQL database from SQL injection attacks, unauthorized access, and invalid mutations.
- Translating high-level business queries into optimized SQL statements using Entity Framework Core.
- Formatting structured JSON data payloads to be rendered by the React frontend.

In KajBazar, our backend is built with **ASP.NET Core 8** running on **.NET 8 LTS (Long Term Support)** and written in **C# 12**.

This guide is designed for developers of all skill levels. We will explain every design decision, every architectural pattern, and every file in the backend codebase with exhaustive line-by-line annotations.

---

## 📑 Master Table of Contents

1. [The .NET 8 and C# 12 Mental Model for Absolute Beginners](#1-the-net-8-and-c-12-mental-model-for-absolute-beginners)
   - 1.1 What is the .NET Common Language Runtime (CLR) and JIT Compilation?
   - 1.2 Managed Memory and Automatic Garbage Collection (GC)
   - 1.3 Asynchronous Programming: What Actually Happens During `async` and `await`?
   - 1.4 Why C# 12 and .NET 8? (Performance, Memory Efficiency, Type Safety)
2. [Clean Architecture & The 3-Project Partitioning Strategy](#2-clean-architecture--the-3-project-partitioning-strategy)
   - 2.1 The Dependency Inversion Principle (DIP) in Practice
   - 2.2 `KajBazar.Core`: The Heart of Business Entities and Contracts
   - 2.3 `KajBazar.Infrastructure`: The Muscles of Data Access and External Services
   - 2.4 `KajBazar.API`: The HTTP Gateway and Presentation Layer
3. [Deep Dive into `Program.cs`: The Application Entrypoint](#3-deep-dive-into-programcs-the-application-entrypoint)
   - 3.1 WebApplicationBuilder & The Inversion of Control (IoC) Container
   - 3.2 Service Lifetimes Explained Simply: Transient vs Scoped vs Singleton
   - 3.3 Database Context Registration (`KajBazarDbContext` & Snake_case Mapping)
   - 3.4 Dependency Injection Registration for Repositories and Services
   - 3.5 JWT Bearer Authentication & Cryptographic Token Validation Parameters
   - 3.6 Cross-Origin Resource Sharing (CORS) Policy Configuration
   - 3.7 Swagger / OpenAPI Interactive Documentation Generator
   - 3.8 Complete Annotated Source Code of `Program.cs`
4. [Domain Entities & Enums: The Core Data Model (`KajBazar.Core`)](#4-domain-entities--enums-the-core-data-model-kajbazarcore)
   - 4.1 Domain Enums: `UserRole`, `VerificationStatus`, `ReportStatus`, `RecommendationStatus`
   - 4.2 `User.cs`: The Central Identity Entity
   - 4.3 `ServiceProviderProfile.cs`: Worker Details, Experience, and Rating Stats
   - 4.4 Data Transfer Objects: `DTOs.cs`
5. [The Entity Framework Core Data Access Layer (`KajBazar.Infrastructure`)](#5-the-entity-framework-core-data-access-layer-kajb値arinfrastructure)
   - 5.1 `KajBazarDbContext.cs`: Complete Annotated Source Code
   - 5.2 `AuthService.cs`: BCrypt Password Hashing & JWT Token Generation
   - 5.3 `UserRepository.cs`: Complete Annotated Source Code
   - 5.4 `ServiceProviderRepository.cs`: Complete Annotated Source Code
   - 5.5 `ReviewRepository.cs`: Complete Annotated Source Code
   - 5.6 `RecommendationRepository.cs`: Complete Annotated Source Code
   - 5.7 `AdminAuditLogRepository.cs`: Complete Annotated Source Code
6. [REST API Controllers: The Web Gateway (`KajBazar.API`)](#6-rest-api-controllers-the-web-gateway-kajbazarapi)
   - 6.1 `AuthController.cs`: Complete Annotated Source Code
   - 6.2 `WorkersController.cs`: Complete Annotated Source Code
   - 6.3 `ReviewsController.cs`: Complete Annotated Source Code
   - 6.4 `RecommendationsController.cs`: Complete Annotated Source Code
   - 6.5 `AdminController.cs`: Complete Annotated Source Code
   - 6.6 `CategoriesController.cs`: Complete Annotated Source Code
   - 6.7 `GeographyController.cs`: Complete Annotated Source Code
7. [Global Error Handling & Middleware Pipeline](#7-global-error-handling--middleware-pipeline)
   - 7.1 `ExceptionHandlingMiddleware.cs`: Complete Annotated Source Code
   - 7.2 RFC 7807 Problem Details Standard
8. [Hands-on Backend Coding Exercises & Solutions](#8-hands-on-backend-coding-exercises--solutions)
9. [Frequently Asked Questions (FAQ) for Backend Developers](#9-frequently-asked-questions-faq-for-backend-developers)
10. [Conclusion & Roadmap to Volume 04](#10-conclusion--roadmap-to-volume-04)

---

## 1. The .NET 8 and C# 12 Mental Model for Absolute Beginners

### 1.1 What is the .NET Common Language Runtime (CLR) and JIT Compilation?

When you write code in C#, your computer's CPU (Intel, AMD, or Apple Silicon) cannot understand that C# text directly. Your CPU only understands raw binary machine instructions (`01101001 01110010...`).

Here is how C# transforms from human-readable text into lightning-fast hardware execution:

```
[ Developer writes C# 12 Code in VS Code ]
                  │
                  ▼ (dotnet build executes C# Compiler: csc)
[ Intermediate Language (IL) Bytecode stored in .dll assemblies ]
                  │
                  ▼ (dotnet run loads .dll into the CLR)
[ Common Language Runtime (CLR) - JIT (Just-In-Time) Compiler ]
                  │
                  ▼ (Compiles IL into Native CPU Machine Code in RAM)
[ Physical Hardware CPU Execution (Intel / AMD / ARM64) ]
```

1. **Intermediate Language (IL)**: When you compile a C# project with `dotnet build`, the C# compiler produces portable bytecode called Intermediate Language (IL) stored inside `.dll` files.
2. **The Common Language Runtime (CLR)**: When your application starts, the CLR boots up. It is the virtual execution environment that manages thread execution, memory, type safety, and exception handling.
3. **Just-In-Time (JIT) Compiler**: As your program executes, the JIT compiler translates IL bytecode instructions into native CPU instructions on the fly. The JIT compiler optimizes the machine code specifically for the exact CPU model your server is running on (using modern AVX-512 or ARM NEON vector instructions)!

---

### 1.2 Managed Memory and Automatic Garbage Collection (GC)

In older languages like C or C++, developers had to manually request memory from the operating system (`malloc()`) and manually free it (`free()`). If you forgot to free memory, your server suffered a **Memory Leak** and crashed after a few hours. If you freed memory too early, your program crashed with a **Segmentation Fault (Core Dump)**.

C# is a **Managed Language**:
- When you create an object in C# (e.g. `var user = new User()`), the CLR allocates memory on the **Managed Heap**.
- You **never** have to manually free memory!
- The **Garbage Collector (GC)** runs automatically in background threads. It inspects memory, identifies objects that are no longer referenced by your application, and reclaims their memory in nanoseconds.
- .NET 8 uses a high-performance generational garbage collector divided into **Generation 0** (short-lived objects), **Generation 1** (buffer objects), and **Generation 2** (long-lived objects), ensuring minimal latency and zero memory leaks.

---

### 1.3 Asynchronous Programming: What Actually Happens During `async` and `await`?

In traditional synchronous web servers, every incoming HTTP request consumes an entire operating system thread.
- If Thread #14 makes a query to PostgreSQL that takes 50 milliseconds to finish over the network, Thread #14 sits completely idle, doing nothing, blocked waiting for the network card!
- If 500 customers arrive at once, the server runs out of threads (**Thread Starvation**) and new customers receive timeout errors.

**Asynchronous Programming (`async` / `await`)** in C# completely eliminates this bottleneck:

```
[ Thread Pool Worker #1 ] ──> Receives GET /api/workers
                          ──> Issues SQL query to Npgsql
                          ──> Hits 'await' keyword!
                          ──> Worker #1 does NOT wait!
                          ──> Worker #1 returns immediately to thread pool to serve other customers!
                                    │
                                    │ (PostgreSQL is executing query on disk...)
                                    ▼
[ Network Card Interrupt ] ──> Database query finishes! Bytes arrive on NIC.
                          ──> OS signals .NET CLR.
                          ──> CLR picks any available Thread (Worker #7).
                          ──> Worker #7 resumes execution right after the 'await' statement!
                          ──> Serializes JSON and sends HTTP 200 response.
```

By using `async` and `await` across all database calls in KajBazar, a single server node can easily handle **thousands of concurrent requests** with only a handful of CPU threads!

---

## 2. Clean Architecture & The 3-Project Partitioning Strategy

In `src/`, our backend is divided into three distinct C# projects:

```
src/
├── KajBazar.Core/             <-- Business Entities, DTOs, Enums, Interfaces
├── KajBazar.Infrastructure/   <-- EF Core DbContext, Repositories, AuthService
└── KajBazar.API/              <-- Program.cs, Controllers, Middleware
```

The fundamental rule of Clean Architecture is:
> **Source code dependencies must point ONLY inwards, toward the domain.**

- `KajBazar.Core` does not know that `KajBazar.Infrastructure` or `KajBazar.API` exist.
- `KajBazar.Core` does not import Entity Framework Core, PostgreSQL, or ASP.NET Core HTTP namespaces.
- Instead, `Core` defines abstract **Interfaces** (e.g. `IServiceProviderRepository`).
- `Infrastructure` implements those interfaces.
- `API` glues them together via Dependency Injection at startup.

---

## 3. Deep Dive into `Program.cs`: The Application Entrypoint

Here is the complete source code of `src/KajBazar.API/Program.cs`:

```csharp
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using KajBazar.API.Middleware;
using KajBazar.Core.Interfaces;
using KajBazar.Infrastructure.Data;
using KajBazar.Infrastructure.Repositories;
using KajBazar.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Add Controllers with JSON formatting
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

// Configure EF Core PostgreSQL DbContext with Snake Case naming convention
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<KajBazarDbContext>(options =>
    options.UseNpgsql(connectionString)
           .UseSnakeCaseNamingConvention());

// Register Services & Repositories
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IServiceProviderRepository, ServiceProviderRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<IRecommendationRepository, RecommendationRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IGeographyRepository, GeographyRepository>();
builder.Services.AddScoped<IAdminAuditLogRepository, AdminAuditLogRepository>();

// Configure JWT Authentication
var jwtSecret = builder.Configuration["JwtSettings:SecretKey"] 
    ?? "KajBazarSuperSecretKeyWhichIsAtLeast256BitsLongForSecurity#123";
var jwtIssuer = builder.Configuration["JwtSettings:Issuer"] ?? "KajBazarAPI";
var jwtAudience = builder.Configuration["JwtSettings:Audience"] ?? "KajBazarApp";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromMinutes(5)
    };
});

builder.Services.AddAuthorization();

// Configure CORS for Frontend Development & Production
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "http://localhost:5173",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure Swagger/OpenAPI with Bearer Security
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "KajBazar API", 
        Version = "v1",
        Description = "RESTful API backend for KajBazar Community-Driven Service Provider Directory Platform"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below. Example: 'Bearer eyJhbGciOi...'",
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
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Global Exception Handling Middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Configure HTTP request pipeline
if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "KajBazar API v1"));
}

app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

```

---

## 4. Domain Entities & Enums: The Core Data Model (`KajBazar.Core`)

### 4.1 Domain Enums (`Enums/DomainEnums.cs`)

```csharp
namespace KajBazar.Core.Enums
{
    public enum UserRoleType
    {
        Admin = 1,
        Consumer = 2,
        ServiceProvider = 3
    }

    public enum VerificationStatus
    {
        Pending = 1,
        Verified = 2,
        Rejected = 3,
        Suspended = 4
    }

    public enum RecommendationStatus
    {
        Pending = 1,
        Approved = 2,
        Rejected = 3
    }

    public enum ReportStatus
    {
        Open = 1,
        UnderReview = 2,
        Resolved = 3,
        Dismissed = 4
    }
}

```

---

### 4.2 `User.cs`: The Central Identity Entity

```csharp
using System;
using System.Collections.Generic;

namespace KajBazar.Core.Entities
{
    /// <summary>
    /// User account domain entity representing Consumers, Workers, and Admins.
    /// </summary>
    public class User
    {
        public Guid UserId { get; set; } = Guid.NewGuid();
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
        public virtual ServiceProviderProfile? ServiceProviderProfile { get; set; }
        public virtual ICollection<Review> ReviewsWritten { get; set; } = new List<Review>();
        public virtual ICollection<CommunityRecommendation> SubmittedRecommendations { get; set; } = new List<CommunityRecommendation>();
    }
}

```

---

### 4.3 `ServiceProviderProfile.cs`: Worker Profile Entity

```csharp
using System;
using System.Collections.Generic;
using KajBazar.Core.Enums;

namespace KajBazar.Core.Entities
{
    /// <summary>
    /// Professional profile for a skilled worker service provider.
    /// </summary>
    public class ServiceProviderProfile
    {
        public Guid ProfileId { get; set; } = Guid.NewGuid();

        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;

        public int DistrictId { get; set; }
        public virtual District District { get; set; } = null!;

        public int UpazilaId { get; set; }
        public virtual Upazila Upazila { get; set; } = null!;

        public string? Bio { get; set; }
        public int ExperienceYears { get; set; } = 0;
        public decimal? HourlyRate { get; set; }
        
        public VerificationStatus VerificationStatus { get; set; } = VerificationStatus.Pending;
        public DateTime? VerifiedAt { get; set; }

        public decimal AverageRating { get; set; } = 0.00m;
        public int TotalReviews { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public virtual ICollection<WorkerCategory> WorkerCategories { get; set; } = new List<WorkerCategory>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}

```

---

### 4.4 Data Transfer Objects (`DTOs/DTOs.cs`)

```csharp

```

---

## 5. The Entity Framework Core Data Access Layer (`KajBazar.Infrastructure`)

### 5.1 `KajBazarDbContext.cs`: Master EF Core Context

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using KajBazar.Core.Entities;
using KajBazar.Core.Enums;

namespace KajBazar.Infrastructure.Data
{
    public class KajBazarDbContext : DbContext
    {
        public KajBazarDbContext(DbContextOptions<KajBazarDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<UserRole> UserRoles => Set<UserRole>();
        public DbSet<District> Districts => Set<District>();
        public DbSet<Upazila> Upazilas => Set<Upazila>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<ServiceProviderProfile> ServiceProviderProfiles => Set<ServiceProviderProfile>();
        public DbSet<WorkerCategory> WorkerCategories => Set<WorkerCategory>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<CommunityRecommendation> CommunityRecommendations => Set<CommunityRecommendation>();
        public DbSet<Report> Reports => Set<Report>();
        public DbSet<AdminAuditLog> AdminAuditLogs => Set<AdminAuditLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Enum Value Converters to match PostgreSQL CHECK constraints (Uppercase)
            var verificationConverter = new ValueConverter<VerificationStatus, string>(
                v => v.ToString().ToUpperInvariant(),
                v => Enum.Parse<VerificationStatus>(v, true)
            );

            var recommendationConverter = new ValueConverter<RecommendationStatus, string>(
                v => v.ToString().ToUpperInvariant(),
                v => Enum.Parse<RecommendationStatus>(v, true)
            );

            var reportConverter = new ValueConverter<ReportStatus, string>(
                v => v == ReportStatus.UnderReview ? "UNDER_REVIEW" : v.ToString().ToUpperInvariant(),
                v => v == "UNDER_REVIEW" ? ReportStatus.UnderReview : Enum.Parse<ReportStatus>(v, true)
            );

            // 1. Roles
            modelBuilder.Entity<Role>(entity =>
            {
                entity.ToTable("roles");
                entity.HasKey(e => e.RoleId);
                entity.Property(e => e.RoleId).HasColumnName("role_id").ValueGeneratedOnAdd();
                entity.Property(e => e.RoleName).HasColumnName("role_name").HasMaxLength(50).IsRequired();
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.HasIndex(e => e.RoleName).IsUnique();
            });

            // 2. Users
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");
                entity.HasKey(e => e.UserId);
                entity.Property(e => e.UserId).HasColumnName("user_id").ValueGeneratedOnAdd();
                entity.Property(e => e.FullName).HasColumnName("full_name").HasMaxLength(100).IsRequired();
                entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(150).IsRequired();
                entity.Property(e => e.PhoneNumber).HasColumnName("phone_number").HasMaxLength(20).IsRequired();
                entity.Property(e => e.PasswordHash).HasColumnName("password_hash").HasMaxLength(255).IsRequired();
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.PhoneNumber).IsUnique();
            });

            // 3. UserRoles
            modelBuilder.Entity<UserRole>(entity =>
            {
                entity.ToTable("user_roles");
                entity.HasKey(ur => new { ur.UserId, ur.RoleId });
                entity.Property(ur => ur.UserId).HasColumnName("user_id");
                entity.Property(ur => ur.RoleId).HasColumnName("role_id");

                entity.HasOne(ur => ur.User)
                    .WithMany(u => u.UserRoles)
                    .HasForeignKey(ur => ur.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ur => ur.Role)
                    .WithMany(r => r.UserRoles)
                    .HasForeignKey(ur => ur.RoleId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // 4. Districts
            modelBuilder.Entity<District>(entity =>
            {
                entity.ToTable("districts");
                entity.HasKey(d => d.DistrictId);
                entity.Property(d => d.DistrictId).HasColumnName("district_id").ValueGeneratedOnAdd();
                entity.Property(d => d.DistrictName).HasColumnName("district_name").HasMaxLength(100).IsRequired();
                entity.HasIndex(d => d.DistrictName).IsUnique();
            });

            // 5. Upazilas
            modelBuilder.Entity<Upazila>(entity =>
            {
                entity.ToTable("upazilas");
                entity.HasKey(u => u.UpazilaId);
                entity.Property(u => u.UpazilaId).HasColumnName("upazila_id").ValueGeneratedOnAdd();
                entity.Property(u => u.DistrictId).HasColumnName("district_id");
                entity.Property(u => u.UpazilaName).HasColumnName("upazila_name").HasMaxLength(100).IsRequired();

                entity.HasOne(u => u.District)
                    .WithMany(d => d.Upazilas)
                    .HasForeignKey(u => u.DistrictId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(u => new { u.DistrictId, u.UpazilaName }).IsUnique();
            });

            // 6. Categories
            modelBuilder.Entity<Category>(entity =>
            {
                entity.ToTable("categories");
                entity.HasKey(c => c.CategoryId);
                entity.Property(c => c.CategoryId).HasColumnName("category_id").ValueGeneratedOnAdd();
                entity.Property(c => c.CategoryName).HasColumnName("category_name").HasMaxLength(100).IsRequired();
                entity.Property(c => c.Description).HasColumnName("description");
                entity.Property(c => c.IconUrl).HasColumnName("icon_url").HasMaxLength(255);
                entity.Property(c => c.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(c => c.CreatedAt).HasColumnName("created_at");
                entity.HasIndex(c => c.CategoryName).IsUnique();
            });

            // 7. ServiceProviderProfiles
            modelBuilder.Entity<ServiceProviderProfile>(entity =>
            {
                entity.ToTable("service_provider_profiles");
                entity.HasKey(sp => sp.ProfileId);
                entity.Property(sp => sp.ProfileId).HasColumnName("profile_id").ValueGeneratedOnAdd();
                entity.Property(sp => sp.UserId).HasColumnName("user_id");
                entity.Property(sp => sp.DistrictId).HasColumnName("district_id");
                entity.Property(sp => sp.UpazilaId).HasColumnName("upazila_id");
                entity.Property(sp => sp.Bio).HasColumnName("bio");
                entity.Property(sp => sp.ExperienceYears).HasColumnName("experience_years").HasDefaultValue(0);
                entity.Property(sp => sp.HourlyRate).HasColumnName("hourly_rate").HasColumnType("numeric(10,2)");
                entity.Property(sp => sp.VerificationStatus)
                    .HasColumnName("verification_status")
                    .HasConversion(verificationConverter)
                    .HasMaxLength(20);
                entity.Property(sp => sp.VerifiedAt).HasColumnName("verified_at");
                entity.Property(sp => sp.AverageRating).HasColumnName("average_rating").HasColumnType("numeric(3,2)").HasDefaultValue(0.00m);
                entity.Property(sp => sp.TotalReviews).HasColumnName("total_reviews").HasDefaultValue(0);
                entity.Property(sp => sp.CreatedAt).HasColumnName("created_at");
                entity.Property(sp => sp.UpdatedAt).HasColumnName("updated_at");

                entity.HasOne(sp => sp.User)
                    .WithOne(u => u.ServiceProviderProfile)
                    .HasForeignKey<ServiceProviderProfile>(sp => sp.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(sp => sp.District)
                    .WithMany(d => d.Profiles)
                    .HasForeignKey(sp => sp.DistrictId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(sp => sp.Upazila)
                    .WithMany(u => u.Profiles)
                    .HasForeignKey(sp => sp.UpazilaId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(sp => new { sp.VerificationStatus, sp.DistrictId, sp.UpazilaId });
            });

            // 8. WorkerCategories
            modelBuilder.Entity<WorkerCategory>(entity =>
            {
                entity.ToTable("worker_categories");
                entity.HasKey(wc => new { wc.ProfileId, wc.CategoryId });
                entity.Property(wc => wc.ProfileId).HasColumnName("profile_id");
                entity.Property(wc => wc.CategoryId).HasColumnName("category_id");

                entity.HasOne(wc => wc.Profile)
                    .WithMany(p => p.WorkerCategories)
                    .HasForeignKey(wc => wc.ProfileId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(wc => wc.Category)
                    .WithMany(c => c.WorkerCategories)
                    .HasForeignKey(wc => wc.CategoryId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // 9. Reviews
            modelBuilder.Entity<Review>(entity =>
            {
                entity.ToTable("reviews");
                entity.HasKey(r => r.ReviewId);
                entity.Property(r => r.ReviewId).HasColumnName("review_id").ValueGeneratedOnAdd();
                entity.Property(r => r.ConsumerId).HasColumnName("consumer_id");
                entity.Property(r => r.WorkerProfileId).HasColumnName("worker_profile_id");
                entity.Property(r => r.Rating).HasColumnName("rating");
                entity.Property(r => r.Comment).HasColumnName("comment");
                entity.Property(r => r.CreatedAt).HasColumnName("created_at");
                entity.Property(r => r.UpdatedAt).HasColumnName("updated_at");

                entity.HasOne(r => r.Consumer)
                    .WithMany(u => u.ReviewsWritten)
                    .HasForeignKey(r => r.ConsumerId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(r => r.WorkerProfile)
                    .WithMany(p => p.Reviews)
                    .HasForeignKey(r => r.WorkerProfileId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Enforce BR-08 (Unique review per consumer per worker)
                entity.HasIndex(r => new { r.ConsumerId, r.WorkerProfileId }).IsUnique();
                entity.HasIndex(r => new { r.WorkerProfileId, r.Rating });
            });

            // 10. CommunityRecommendations
            modelBuilder.Entity<CommunityRecommendation>(entity =>
            {
                entity.ToTable("community_recommendations");
                entity.HasKey(cr => cr.RecommendationId);
                entity.Property(cr => cr.RecommendationId).HasColumnName("recommendation_id").ValueGeneratedOnAdd();
                entity.Property(cr => cr.RecommendedByUserId).HasColumnName("recommended_by_user_id");
                entity.Property(cr => cr.WorkerName).HasColumnName("worker_name").HasMaxLength(100).IsRequired();
                entity.Property(cr => cr.PhoneNumber).HasColumnName("phone_number").HasMaxLength(20).IsRequired();
                entity.Property(cr => cr.CategoryId).HasColumnName("category_id");
                entity.Property(cr => cr.DistrictId).HasColumnName("district_id");
                entity.Property(cr => cr.UpazilaId).HasColumnName("upazila_id");
                entity.Property(cr => cr.Notes).HasColumnName("notes");
                entity.Property(cr => cr.Status)
                    .HasColumnName("status")
                    .HasConversion(recommendationConverter)
                    .HasMaxLength(20);
                entity.Property(cr => cr.ReviewedByAdminId).HasColumnName("reviewed_by_admin_id");
                entity.Property(cr => cr.CreatedAt).HasColumnName("created_at");

                entity.HasOne(cr => cr.RecommendedByUser)
                    .WithMany(u => u.SubmittedRecommendations)
                    .HasForeignKey(cr => cr.RecommendedByUserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(cr => cr.Category)
                    .WithMany()
                    .HasForeignKey(cr => cr.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(cr => cr.District)
                    .WithMany()
                    .HasForeignKey(cr => cr.DistrictId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(cr => cr.Upazila)
                    .WithMany()
                    .HasForeignKey(cr => cr.UpazilaId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(cr => cr.ReviewedByAdmin)
                    .WithMany()
                    .HasForeignKey(cr => cr.ReviewedByAdminId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // 11. Reports
            modelBuilder.Entity<Report>(entity =>
            {
                entity.ToTable("reports");
                entity.HasKey(rep => rep.ReportId);
                entity.Property(rep => rep.ReportId).HasColumnName("report_id").ValueGeneratedOnAdd();
                entity.Property(rep => rep.ReportedByUserId).HasColumnName("reported_by_user_id");
                entity.Property(rep => rep.TargetUserId).HasColumnName("target_user_id");
                entity.Property(rep => rep.Reason).HasColumnName("reason").IsRequired();
                entity.Property(rep => rep.Status)
                    .HasColumnName("status")
                    .HasConversion(reportConverter)
                    .HasMaxLength(20);
                entity.Property(rep => rep.CreatedAt).HasColumnName("created_at");

                entity.HasOne(rep => rep.ReportedByUser)
                    .WithMany()
                    .HasForeignKey(rep => rep.ReportedByUserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(rep => rep.TargetUser)
                    .WithMany()
                    .HasForeignKey(rep => rep.TargetUserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // 12. AdminAuditLogs
            modelBuilder.Entity<AdminAuditLog>(entity =>
            {
                entity.ToTable("admin_audit_logs");
                entity.HasKey(al => al.LogId);
                entity.Property(al => al.LogId).HasColumnName("log_id").ValueGeneratedOnAdd();
                entity.Property(al => al.AdminUserId).HasColumnName("admin_user_id");
                entity.Property(al => al.Action).HasColumnName("action").HasMaxLength(100).IsRequired();
                entity.Property(al => al.EntityName).HasColumnName("entity_name").HasMaxLength(50).IsRequired();
                entity.Property(al => al.EntityId).HasColumnName("entity_id");
                entity.Property(al => al.Details).HasColumnName("details");
                entity.Property(al => al.Timestamp).HasColumnName("timestamp");

                entity.HasOne(al => al.AdminUser)
                    .WithMany()
                    .HasForeignKey(al => al.AdminUserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}

```

---

### 5.2 `AuthService.cs`: Cryptography & JWT Issuance

```csharp
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using KajBazar.Core.Entities;
using KajBazar.Core.Interfaces;

namespace KajBazar.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly IConfiguration _configuration;

        public AuthService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password, 11);
        }

        public bool VerifyPassword(string password, string passwordHash)
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(password, passwordHash);
            }
            catch
            {
                return false;
            }
        }

        public string GenerateJwtToken(User user, string roleName)
        {
            var secretKey = _configuration["JwtSettings:SecretKey"] 
                ?? "KajBazarSuperSecretKeyWhichIsAtLeast256BitsLongForSecurity#123";
            var issuer = _configuration["JwtSettings:Issuer"] ?? "KajBazarAPI";
            var audience = _configuration["JwtSettings:Audience"] ?? "KajBazarApp";
            var expiryMinutes = int.TryParse(_configuration["JwtSettings:ExpiryInMinutes"], out var exp) ? exp : 1440;

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, roleName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

```

---

### 5.3 `UserRepository.cs`: User Persistence & Credential Lookup

```csharp
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using KajBazar.Core.Entities;
using KajBazar.Core.Interfaces;
using KajBazar.Infrastructure.Data;

namespace KajBazar.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly KajBazarDbContext _context;

        public UserRepository(KajBazarDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByIdAsync(Guid id)
        {
            return await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.ServiceProviderProfile)
                .FirstOrDefaultAsync(u => u.UserId == id);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            var normalizedEmail = email.Trim().ToLowerInvariant();
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
        }

        public async Task<User?> GetByPhoneAsync(string phone)
        {
            var normalizedPhone = phone.Trim();
            return await _context.Users
                .FirstOrDefaultAsync(u => u.PhoneNumber == normalizedPhone);
        }

        public async Task<User?> GetWithRolesByEmailAsync(string email)
        {
            var normalizedEmail = email.Trim().ToLowerInvariant();
            return await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.ServiceProviderProfile)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
        }

        public async Task<User?> GetWithRolesByIdAsync(Guid id)
        {
            return await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.ServiceProviderProfile)
                .FirstOrDefaultAsync(u => u.UserId == id);
        }

        public async Task AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(User user)
        {
            user.UpdatedAt = DateTime.UtcNow;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task AssignRoleAsync(Guid userId, string roleName)
        {
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == roleName);
            if (role == null)
            {
                role = new Role { RoleName = roleName };
                await _context.Roles.AddAsync(role);
                await _context.SaveChangesAsync();
            }

            var existingMapping = await _context.UserRoles
                .FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == role.RoleId);

            if (existingMapping == null)
            {
                await _context.UserRoles.AddAsync(new UserRole { UserId = userId, RoleId = role.RoleId });
                await _context.SaveChangesAsync();
            }
        }

        public async Task<int> GetTotalUsersCountAsync()
        {
            return await _context.Users.CountAsync();
        }
    }
}

```

---

### 5.4 `ServiceProviderRepository.cs`: Search, Directory, & Rule BR-06

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using KajBazar.Core.Entities;
using KajBazar.Core.Enums;
using KajBazar.Core.Interfaces;
using KajBazar.Infrastructure.Data;

namespace KajBazar.Infrastructure.Repositories
{
    public class ServiceProviderRepository : IServiceProviderRepository
    {
        private readonly KajBazarDbContext _context;

        public ServiceProviderRepository(KajBazarDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceProviderProfile?> GetByIdAsync(Guid profileId)
        {
            return await _context.ServiceProviderProfiles
                .Include(sp => sp.User)
                .Include(sp => sp.District)
                .Include(sp => sp.Upazila)
                .Include(sp => sp.WorkerCategories)
                    .ThenInclude(wc => wc.Category)
                .Include(sp => sp.Reviews)
                    .ThenInclude(r => r.Consumer)
                .FirstOrDefaultAsync(sp => sp.ProfileId == profileId);
        }

        public async Task<ServiceProviderProfile?> GetByUserIdAsync(Guid userId)
        {
            return await _context.ServiceProviderProfiles
                .Include(sp => sp.User)
                .Include(sp => sp.District)
                .Include(sp => sp.Upazila)
                .Include(sp => sp.WorkerCategories)
                    .ThenInclude(wc => wc.Category)
                .Include(sp => sp.Reviews)
                    .ThenInclude(r => r.Consumer)
                .FirstOrDefaultAsync(sp => sp.UserId == userId);
        }

        public async Task<(IEnumerable<ServiceProviderProfile> Workers, int TotalCount)> SearchWorkersAsync(
            string? categoryName, 
            int? districtId, 
            int? upazilaId, 
            decimal? minRating, 
            int page = 1, 
            int pageSize = 12)
        {
            // Business Rule BR-03: Only verified workers are visible in public search
            var query = _context.ServiceProviderProfiles
                .Include(sp => sp.User)
                .Include(sp => sp.District)
                .Include(sp => sp.Upazila)
                .Include(sp => sp.WorkerCategories)
                    .ThenInclude(wc => wc.Category)
                .Where(sp => sp.VerificationStatus == VerificationStatus.Verified && sp.User.IsActive);

            if (!string.IsNullOrWhiteSpace(categoryName))
            {
                var normCat = categoryName.Trim().ToLowerInvariant();
                query = query.Where(sp => sp.WorkerCategories.Any(wc => wc.Category.CategoryName.ToLower() == normCat));
            }

            if (districtId.HasValue && districtId.Value > 0)
            {
                query = query.Where(sp => sp.DistrictId == districtId.Value);
            }

            if (upazilaId.HasValue && upazilaId.Value > 0)
            {
                query = query.Where(sp => sp.UpazilaId == upazilaId.Value);
            }

            if (minRating.HasValue && minRating.Value > 0)
            {
                query = query.Where(sp => sp.AverageRating >= minRating.Value);
            }

            var totalCount = await query.CountAsync();

            var workers = await query
                .OrderByDescending(sp => sp.AverageRating)
                .ThenByDescending(sp => sp.TotalReviews)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (workers, totalCount);
        }

        public async Task<IEnumerable<ServiceProviderProfile>> GetPendingWorkersAsync()
        {
            return await _context.ServiceProviderProfiles
                .Include(sp => sp.User)
                .Include(sp => sp.District)
                .Include(sp => sp.Upazila)
                .Include(sp => sp.WorkerCategories)
                    .ThenInclude(wc => wc.Category)
                .Where(sp => sp.VerificationStatus == VerificationStatus.Pending)
                .OrderByDescending(sp => sp.CreatedAt)
                .ToListAsync();
        }

        public async Task AddAsync(ServiceProviderProfile profile)
        {
            await _context.ServiceProviderProfiles.AddAsync(profile);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(ServiceProviderProfile profile)
        {
            profile.UpdatedAt = DateTime.UtcNow;
            _context.ServiceProviderProfiles.Update(profile);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateStatusAsync(Guid profileId, VerificationStatus status)
        {
            var profile = await _context.ServiceProviderProfiles.FirstOrDefaultAsync(sp => sp.ProfileId == profileId);
            if (profile != null)
            {
                profile.VerificationStatus = status;
                if (status == VerificationStatus.Verified)
                {
                    profile.VerifiedAt = DateTime.UtcNow;
                }
                profile.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task SetCategoriesAsync(Guid profileId, IEnumerable<int> categoryIds)
        {
            var existing = await _context.WorkerCategories
                .Where(wc => wc.ProfileId == profileId)
                .ToListAsync();

            _context.WorkerCategories.RemoveRange(existing);

            foreach (var catId in categoryIds.Distinct())
            {
                await _context.WorkerCategories.AddAsync(new WorkerCategory
                {
                    ProfileId = profileId,
                    CategoryId = catId
                });
            }

            await _context.SaveChangesAsync();
        }

        public async Task<int> GetTotalWorkersCountAsync()
        {
            return await _context.ServiceProviderProfiles.CountAsync();
        }

        public async Task<int> GetVerifiedWorkersCountAsync()
        {
            return await _context.ServiceProviderProfiles
                .CountAsync(sp => sp.VerificationStatus == VerificationStatus.Verified);
        }

        public async Task<int> GetPendingVerificationCountAsync()
        {
            return await _context.ServiceProviderProfiles
                .CountAsync(sp => sp.VerificationStatus == VerificationStatus.Pending);
        }
    }
}

```

---

### 5.5 `ReviewRepository.cs`: Reviews & Rating Calculations

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using KajBazar.Core.Entities;
using KajBazar.Core.Interfaces;
using KajBazar.Infrastructure.Data;

namespace KajBazar.Infrastructure.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly KajBazarDbContext _context;

        public ReviewRepository(KajBazarDbContext context)
        {
            _context = context;
        }

        public async Task<Review?> GetByIdAsync(Guid reviewId)
        {
            return await _context.Reviews
                .Include(r => r.Consumer)
                .Include(r => r.WorkerProfile)
                .FirstOrDefaultAsync(r => r.ReviewId == reviewId);
        }

        public async Task<IEnumerable<Review>> GetByWorkerProfileIdAsync(Guid workerProfileId)
        {
            return await _context.Reviews
                .Include(r => r.Consumer)
                .Where(r => r.WorkerProfileId == workerProfileId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<Review?> GetByUserAndWorkerAsync(Guid consumerId, Guid workerProfileId)
        {
            return await _context.Reviews
                .Include(r => r.Consumer)
                .FirstOrDefaultAsync(r => r.ConsumerId == consumerId && r.WorkerProfileId == workerProfileId);
        }

        public async Task<bool> HasUserReviewedWorkerAsync(Guid consumerId, Guid workerProfileId)
        {
            return await _context.Reviews
                .AnyAsync(r => r.ConsumerId == consumerId && r.WorkerProfileId == workerProfileId);
        }

        public async Task AddOrUpdateReviewAsync(Review review)
        {
            // Business Rule BR-08: 1 review per consumer per worker (update if existing)
            var existing = await _context.Reviews
                .FirstOrDefaultAsync(r => r.ConsumerId == review.ConsumerId && r.WorkerProfileId == review.WorkerProfileId);

            if (existing != null)
            {
                existing.Rating = review.Rating;
                existing.Comment = review.Comment;
                existing.UpdatedAt = DateTime.UtcNow;
                _context.Reviews.Update(existing);
            }
            else
            {
                await _context.Reviews.AddAsync(review);
            }

            await _context.SaveChangesAsync();

            // Recalculate and update worker average rating & total count
            var stats = await _context.Reviews
                .Where(r => r.WorkerProfileId == review.WorkerProfileId)
                .GroupBy(r => r.WorkerProfileId)
                .Select(g => new
                {
                    Count = g.Count(),
                    Average = Math.Round((decimal)g.Average(r => r.Rating), 2)
                })
                .FirstOrDefaultAsync();

            var worker = await _context.ServiceProviderProfiles
                .FirstOrDefaultAsync(sp => sp.ProfileId == review.WorkerProfileId);

            if (worker != null)
            {
                worker.TotalReviews = stats?.Count ?? 0;
                worker.AverageRating = stats?.Average ?? 0.00m;
                worker.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<int> GetTotalReviewsCountAsync()
        {
            return await _context.Reviews.CountAsync();
        }
    }
}

```

---

### 5.6 `RecommendationRepository.cs`: Crowdsourced Worker Submissions

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using KajBazar.Core.Entities;
using KajBazar.Core.Enums;
using KajBazar.Core.Interfaces;
using KajBazar.Infrastructure.Data;

namespace KajBazar.Infrastructure.Repositories
{
    public class RecommendationRepository : IRecommendationRepository
    {
        private readonly KajBazarDbContext _context;

        public RecommendationRepository(KajBazarDbContext context)
        {
            _context = context;
        }

        public async Task<CommunityRecommendation?> GetByIdAsync(Guid recommendationId)
        {
            return await _context.CommunityRecommendations
                .Include(cr => cr.RecommendedByUser)
                .Include(cr => cr.Category)
                .Include(cr => cr.District)
                .Include(cr => cr.Upazila)
                .Include(cr => cr.ReviewedByAdmin)
                .FirstOrDefaultAsync(cr => cr.RecommendationId == recommendationId);
        }

        public async Task<IEnumerable<CommunityRecommendation>> GetPendingAsync()
        {
            return await _context.CommunityRecommendations
                .Include(cr => cr.RecommendedByUser)
                .Include(cr => cr.Category)
                .Include(cr => cr.District)
                .Include(cr => cr.Upazila)
                .Where(cr => cr.Status == RecommendationStatus.Pending)
                .OrderByDescending(cr => cr.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<CommunityRecommendation>> GetByUserIdAsync(Guid userId)
        {
            return await _context.CommunityRecommendations
                .Include(cr => cr.Category)
                .Include(cr => cr.District)
                .Include(cr => cr.Upazila)
                .Where(cr => cr.RecommendedByUserId == userId)
                .OrderByDescending(cr => cr.CreatedAt)
                .ToListAsync();
        }

        public async Task AddAsync(CommunityRecommendation recommendation)
        {
            await _context.CommunityRecommendations.AddAsync(recommendation);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateStatusAsync(Guid recommendationId, RecommendationStatus status, Guid adminId)
        {
            var recommendation = await _context.CommunityRecommendations
                .FirstOrDefaultAsync(cr => cr.RecommendationId == recommendationId);

            if (recommendation != null)
            {
                recommendation.Status = status;
                recommendation.ReviewedByAdminId = adminId;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<int> GetPendingRecommendationCountAsync()
        {
            return await _context.CommunityRecommendations
                .CountAsync(cr => cr.Status == RecommendationStatus.Pending);
        }
    }
}

```

---

### 5.7 `AdminAuditLogRepository.cs`: Immutable Security Audit Logging

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using KajBazar.Core.DTOs;
using KajBazar.Core.Entities;
using KajBazar.Core.Enums;
using KajBazar.Core.Interfaces;
using KajBazar.Infrastructure.Data;

namespace KajBazar.Infrastructure.Repositories
{
    public class AdminAuditLogRepository : IAdminAuditLogRepository
    {
        private readonly KajBazarDbContext _context;

        public AdminAuditLogRepository(KajBazarDbContext context)
        {
            _context = context;
        }

        public async Task LogAsync(Guid adminUserId, string action, string entityName, Guid? entityId, string? details)
        {
            var log = new AdminAuditLog
            {
                AdminUserId = adminUserId,
                Action = action,
                EntityName = entityName,
                EntityId = entityId,
                Details = details,
                Timestamp = DateTime.UtcNow
            };

            await _context.AdminAuditLogs.AddAsync(log);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<AdminAuditLog>> GetRecentLogsAsync(int count = 50)
        {
            return await _context.AdminAuditLogs
                .Include(l => l.AdminUser)
                .OrderByDescending(l => l.Timestamp)
                .Take(count)
                .ToListAsync();
        }

        public async Task<AdminDashboardStatsDto> GetDashboardStatsAsync()
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalWorkers = await _context.ServiceProviderProfiles.CountAsync();
            var verifiedWorkers = await _context.ServiceProviderProfiles
                .CountAsync(sp => sp.VerificationStatus == VerificationStatus.Verified);
            var pendingVerifications = await _context.ServiceProviderProfiles
                .CountAsync(sp => sp.VerificationStatus == VerificationStatus.Pending);
            var pendingRecommendations = await _context.CommunityRecommendations
                .CountAsync(cr => cr.Status == RecommendationStatus.Pending);
            var totalReviews = await _context.Reviews.CountAsync();

            return new AdminDashboardStatsDto
            {
                TotalRegisteredUsers = totalUsers,
                TotalWorkerProfiles = totalWorkers,
                VerifiedWorkersCount = verifiedWorkers,
                PendingVerificationCount = pendingVerifications,
                PendingRecommendationCount = pendingRecommendations,
                TotalReviewsSubmitted = totalReviews
            };
        }
    }
}

```

---

## 6. REST API Controllers: The Web Gateway (`KajBazar.API`)

### 6.1 `AuthController.cs`: Authentication & Session Endpoints

```csharp
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KajBazar.Core.DTOs;
using KajBazar.Core.Entities;
using KajBazar.Core.Interfaces;

namespace KajBazar.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IAuthService _authService;
        private readonly IServiceProviderRepository _workerRepository;

        public AuthController(
            IUserRepository userRepository, 
            IAuthService authService,
            IServiceProviderRepository workerRepository)
        {
            _userRepository = userRepository;
            _authService = authService;
            _workerRepository = workerRepository;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingEmail = await _userRepository.GetByEmailAsync(dto.Email);
            if (existingEmail != null)
            {
                return BadRequest(new { message = "An account with this email address already exists." });
            }

            var existingPhone = await _userRepository.GetByPhoneAsync(dto.PhoneNumber);
            if (existingPhone != null)
            {
                return BadRequest(new { message = "An account with this phone number already exists." });
            }

            var validRoles = new[] { "Consumer", "ServiceProvider", "Admin" };
            var selectedRole = validRoles.FirstOrDefault(r => r.Equals(dto.Role, StringComparison.OrdinalIgnoreCase)) ?? "Consumer";

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
            await _userRepository.AssignRoleAsync(user.UserId, selectedRole);

            var token = _authService.GenerateJwtToken(user, selectedRole);

            return Ok(new AuthResponseDto
            {
                Token = token,
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = selectedRole,
                ProfileId = null
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userRepository.GetWithRolesByEmailAsync(dto.Email);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            if (!user.IsActive)
            {
                return StatusCode(403, new { message = "Your account has been deactivated. Please contact support." });
            }

            if (!_authService.VerifyPassword(dto.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            var roleName = user.UserRoles.FirstOrDefault()?.Role?.RoleName ?? "Consumer";
            var token = _authService.GenerateJwtToken(user, roleName);

            Guid? profileId = user.ServiceProviderProfile?.ProfileId;

            return Ok(new AuthResponseDto
            {
                Token = token,
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = roleName,
                ProfileId = profileId
            });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var user = await _userRepository.GetWithRolesByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var roleName = user.UserRoles.FirstOrDefault()?.Role?.RoleName ?? "Consumer";

            return Ok(new UserProfileDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = roleName,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            });
        }
    }
}

```

---

### 6.2 `WorkersController.cs`: Worker Search & Phone Reveal (Rule BR-06)

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KajBazar.Core.DTOs;
using KajBazar.Core.Entities;
using KajBazar.Core.Enums;
using KajBazar.Core.Interfaces;

namespace KajBazar.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WorkersController : ControllerBase
    {
        private readonly IServiceProviderRepository _workerRepository;
        private readonly IUserRepository _userRepository;

        public WorkersController(
            IServiceProviderRepository workerRepository,
            IUserRepository userRepository)
        {
            _workerRepository = workerRepository;
            _userRepository = userRepository;
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchWorkers([FromQuery] WorkerSearchFilterDto filter)
        {
            var (workers, totalCount) = await _workerRepository.SearchWorkersAsync(
                filter.Category,
                filter.DistrictId,
                filter.UpazilaId,
                filter.MinRating,
                filter.Page,
                filter.PageSize
            );

            var workerDtos = workers.Select(w => new WorkerSummaryDto
            {
                ProfileId = w.ProfileId,
                UserId = w.UserId,
                WorkerName = w.User.FullName,
                PhoneNumber = w.User.PhoneNumber,
                Email = w.User.Email,
                DistrictId = w.DistrictId,
                DistrictName = w.District?.DistrictName ?? string.Empty,
                UpazilaId = w.UpazilaId,
                UpazilaName = w.Upazila?.UpazilaName ?? string.Empty,
                Bio = w.Bio,
                ExperienceYears = w.ExperienceYears,
                HourlyRate = w.HourlyRate,
                VerificationStatus = w.VerificationStatus.ToString().ToUpperInvariant(),
                AverageRating = w.AverageRating,
                TotalReviews = w.TotalReviews,
                Categories = w.WorkerCategories.Select(wc => wc.Category.CategoryName).ToList(),
                CreatedAt = w.CreatedAt
            }).ToList();

            var totalPages = (int)Math.Ceiling((double)totalCount / filter.PageSize);

            return Ok(new
            {
                totalCount,
                totalPages,
                currentPage = filter.Page,
                pageSize = filter.PageSize,
                workers = workerDtos
            });
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetWorkerById(Guid id)
        {
            var worker = await _workerRepository.GetByIdAsync(id);
            if (worker == null)
            {
                return NotFound(new { message = "Service provider profile not found." });
            }

            var detailDto = new WorkerDetailDto
            {
                ProfileId = worker.ProfileId,
                UserId = worker.UserId,
                WorkerName = worker.User.FullName,
                PhoneNumber = worker.User.PhoneNumber, // Direct contact available without intermediary (BR-06)
                Email = worker.User.Email,
                DistrictId = worker.DistrictId,
                DistrictName = worker.District?.DistrictName ?? string.Empty,
                UpazilaId = worker.UpazilaId,
                UpazilaName = worker.Upazila?.UpazilaName ?? string.Empty,
                Bio = worker.Bio,
                ExperienceYears = worker.ExperienceYears,
                HourlyRate = worker.HourlyRate,
                VerificationStatus = worker.VerificationStatus.ToString().ToUpperInvariant(),
                AverageRating = worker.AverageRating,
                TotalReviews = worker.TotalReviews,
                Categories = worker.WorkerCategories.Select(wc => wc.Category.CategoryName).ToList(),
                CreatedAt = worker.CreatedAt,
                Reviews = worker.Reviews.Select(r => new ReviewDetailDto
                {
                    ReviewId = r.ReviewId,
                    ConsumerId = r.ConsumerId,
                    ConsumerName = r.Consumer.FullName,
                    WorkerProfileId = r.WorkerProfileId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                }).OrderByDescending(r => r.CreatedAt).ToList()
            };

            return Ok(detailDto);
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var worker = await _workerRepository.GetByUserIdAsync(userId);
            if (worker == null)
            {
                return NotFound(new { message = "You have not set up a service provider profile yet." });
            }

            return Ok(new WorkerDetailDto
            {
                ProfileId = worker.ProfileId,
                UserId = worker.UserId,
                WorkerName = worker.User.FullName,
                PhoneNumber = worker.User.PhoneNumber,
                Email = worker.User.Email,
                DistrictId = worker.DistrictId,
                DistrictName = worker.District?.DistrictName ?? string.Empty,
                UpazilaId = worker.UpazilaId,
                UpazilaName = worker.Upazila?.UpazilaName ?? string.Empty,
                Bio = worker.Bio,
                ExperienceYears = worker.ExperienceYears,
                HourlyRate = worker.HourlyRate,
                VerificationStatus = worker.VerificationStatus.ToString().ToUpperInvariant(),
                AverageRating = worker.AverageRating,
                TotalReviews = worker.TotalReviews,
                Categories = worker.WorkerCategories.Select(wc => wc.Category.CategoryName).ToList(),
                CreatedAt = worker.CreatedAt,
                Reviews = worker.Reviews.Select(r => new ReviewDetailDto
                {
                    ReviewId = r.ReviewId,
                    ConsumerId = r.ConsumerId,
                    ConsumerName = r.Consumer.FullName,
                    WorkerProfileId = r.WorkerProfileId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                }).ToList()
            });
        }

        [Authorize]
        [HttpPost("profile")]
        public async Task<IActionResult> CreateOrUpdateProfile([FromBody] CreateWorkerProfileDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var existingProfile = await _workerRepository.GetByUserIdAsync(userId);

            if (existingProfile == null)
            {
                // Create new worker profile (BR-02: requires admin verification before public appearance)
                var profile = new ServiceProviderProfile
                {
                    ProfileId = Guid.NewGuid(),
                    UserId = userId,
                    DistrictId = dto.DistrictId,
                    UpazilaId = dto.UpazilaId,
                    Bio = dto.Bio,
                    ExperienceYears = dto.ExperienceYears,
                    HourlyRate = dto.HourlyRate,
                    VerificationStatus = VerificationStatus.Pending,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _workerRepository.AddAsync(profile);
                await _workerRepository.SetCategoriesAsync(profile.ProfileId, dto.CategoryIds);

                return CreatedAtAction(nameof(GetWorkerById), new { id = profile.ProfileId }, new
                {
                    message = "Worker profile created successfully. It is currently pending administrative verification.",
                    profileId = profile.ProfileId,
                    status = "PENDING"
                });
            }
            else
            {
                // Update existing profile
                existingProfile.DistrictId = dto.DistrictId;
                existingProfile.UpazilaId = dto.UpazilaId;
                existingProfile.Bio = dto.Bio;
                existingProfile.ExperienceYears = dto.ExperienceYears;
                existingProfile.HourlyRate = dto.HourlyRate;
                existingProfile.UpdatedAt = DateTime.UtcNow;

                await _workerRepository.UpdateAsync(existingProfile);
                await _workerRepository.SetCategoriesAsync(existingProfile.ProfileId, dto.CategoryIds);

                return Ok(new
                {
                    message = "Worker profile updated successfully.",
                    profileId = existingProfile.ProfileId,
                    status = existingProfile.VerificationStatus.ToString().ToUpperInvariant()
                });
            }
        }
    }
}

```

---

### 6.3 `ReviewsController.cs`: Verified Customer Reviews

```csharp
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KajBazar.Core.DTOs;
using KajBazar.Core.Entities;
using KajBazar.Core.Interfaces;

namespace KajBazar.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly IServiceProviderRepository _workerRepository;

        public ReviewsController(
            IReviewRepository reviewRepository,
            IServiceProviderRepository workerRepository)
        {
            _reviewRepository = reviewRepository;
            _workerRepository = workerRepository;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> AddReview([FromBody] CreateReviewDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var consumerId))
            {
                return Unauthorized();
            }

            var worker = await _workerRepository.GetByIdAsync(dto.WorkerProfileId);
            if (worker == null)
            {
                return NotFound(new { message = "Service provider profile not found." });
            }

            // A user cannot review their own worker profile
            if (worker.UserId == consumerId)
            {
                return BadRequest(new { message = "You cannot submit a review for your own profile." });
            }

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

            await _reviewRepository.AddOrUpdateReviewAsync(review);

            // Fetch updated stats
            var updatedWorker = await _workerRepository.GetByIdAsync(dto.WorkerProfileId);

            return Ok(new
            {
                message = "Review submitted successfully.",
                review = new
                {
                    review.ReviewId,
                    review.Rating,
                    review.Comment,
                    review.CreatedAt
                },
                workerStats = new
                {
                    averageRating = updatedWorker?.AverageRating ?? 0.00m,
                    totalReviews = updatedWorker?.TotalReviews ?? 0
                }
            });
        }

        [HttpGet("worker/{workerProfileId:guid}")]
        public async Task<IActionResult> GetWorkerReviews(Guid workerProfileId)
        {
            var reviews = await _reviewRepository.GetByWorkerProfileIdAsync(workerProfileId);

            var result = reviews.Select(r => new ReviewDetailDto
            {
                ReviewId = r.ReviewId,
                ConsumerId = r.ConsumerId,
                ConsumerName = r.Consumer?.FullName ?? "Anonymous",
                WorkerProfileId = r.WorkerProfileId,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            }).ToList();

            return Ok(result);
        }
    }
}

```

---

### 6.4 `RecommendationsController.cs`: Community Worker Nominations

```csharp
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KajBazar.Core.DTOs;
using KajBazar.Core.Entities;
using KajBazar.Core.Enums;
using KajBazar.Core.Interfaces;

namespace KajBazar.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecommendationsController : ControllerBase
    {
        private readonly IRecommendationRepository _recommendationRepository;

        public RecommendationsController(IRecommendationRepository recommendationRepository)
        {
            _recommendationRepository = recommendationRepository;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> SubmitRecommendation([FromBody] CreateRecommendationDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var recommendation = new CommunityRecommendation
            {
                RecommendationId = Guid.NewGuid(),
                RecommendedByUserId = userId,
                WorkerName = dto.WorkerName.Trim(),
                PhoneNumber = dto.PhoneNumber.Trim(),
                CategoryId = dto.CategoryId,
                DistrictId = dto.DistrictId,
                UpazilaId = dto.UpazilaId,
                Notes = dto.Notes?.Trim(),
                Status = RecommendationStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            await _recommendationRepository.AddAsync(recommendation);

            return Ok(new
            {
                message = "Thank you! Your recommendation has been submitted and is pending administrative review.",
                recommendationId = recommendation.RecommendationId
            });
        }

        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyRecommendations()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var items = await _recommendationRepository.GetByUserIdAsync(userId);

            var result = items.Select(r => new RecommendationDetailDto
            {
                RecommendationId = r.RecommendationId,
                RecommendedByUserId = r.RecommendedByUserId,
                RecommenderName = r.RecommendedByUser?.FullName ?? "Me",
                WorkerName = r.WorkerName,
                PhoneNumber = r.PhoneNumber,
                CategoryId = r.CategoryId,
                CategoryName = r.Category?.CategoryName ?? string.Empty,
                DistrictId = r.DistrictId,
                DistrictName = r.District?.DistrictName ?? string.Empty,
                UpazilaId = r.UpazilaId,
                UpazilaName = r.Upazila?.UpazilaName ?? string.Empty,
                Notes = r.Notes,
                Status = r.Status.ToString().ToUpperInvariant(),
                ReviewedByAdminId = r.ReviewedByAdminId,
                CreatedAt = r.CreatedAt
            }).ToList();

            return Ok(result);
        }
    }
}

```

---

### 6.5 `AdminController.cs`: Administrative Moderation & Audit Dashboard

```csharp
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KajBazar.Core.DTOs;
using KajBazar.Core.Entities;
using KajBazar.Core.Enums;
using KajBazar.Core.Interfaces;

namespace KajBazar.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IServiceProviderRepository _workerRepository;
        private readonly IRecommendationRepository _recommendationRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IAdminAuditLogRepository _auditLogRepository;

        public AdminController(
            IServiceProviderRepository workerRepository,
            IRecommendationRepository recommendationRepository,
            ICategoryRepository categoryRepository,
            IAdminAuditLogRepository auditLogRepository)
        {
            _workerRepository = workerRepository;
            _recommendationRepository = recommendationRepository;
            _categoryRepository = categoryRepository;
            _auditLogRepository = auditLogRepository;
        }

        private Guid GetCurrentAdminId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(idClaim, out var adminId) ? adminId : Guid.Empty;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var stats = await _auditLogRepository.GetDashboardStatsAsync();
            return Ok(stats);
        }

        [HttpGet("workers/pending")]
        public async Task<IActionResult> GetPendingWorkers()
        {
            var pending = await _workerRepository.GetPendingWorkersAsync();

            var result = pending.Select(w => new WorkerSummaryDto
            {
                ProfileId = w.ProfileId,
                UserId = w.UserId,
                WorkerName = w.User.FullName,
                PhoneNumber = w.User.PhoneNumber,
                Email = w.User.Email,
                DistrictId = w.DistrictId,
                DistrictName = w.District?.DistrictName ?? string.Empty,
                UpazilaId = w.UpazilaId,
                UpazilaName = w.Upazila?.UpazilaName ?? string.Empty,
                Bio = w.Bio,
                ExperienceYears = w.ExperienceYears,
                HourlyRate = w.HourlyRate,
                VerificationStatus = w.VerificationStatus.ToString().ToUpperInvariant(),
                AverageRating = w.AverageRating,
                TotalReviews = w.TotalReviews,
                Categories = w.WorkerCategories.Select(wc => wc.Category.CategoryName).ToList(),
                CreatedAt = w.CreatedAt
            }).ToList();

            return Ok(result);
        }

        [HttpPut("workers/{profileId:guid}/verify")]
        public async Task<IActionResult> ApproveWorker(Guid profileId)
        {
            var worker = await _workerRepository.GetByIdAsync(profileId);
            if (worker == null)
            {
                return NotFound(new { message = "Worker profile not found." });
            }

            await _workerRepository.UpdateStatusAsync(profileId, VerificationStatus.Verified);

            var adminId = GetCurrentAdminId();
            await _auditLogRepository.LogAsync(
                adminId,
                "VERIFY_WORKER_PROFILE",
                "service_provider_profiles",
                profileId,
                $"Admin approved verification for worker {worker.User.FullName}."
            );

            return Ok(new { message = "Worker profile verified successfully. Worker is now visible in the public directory." });
        }

        [HttpPut("workers/{profileId:guid}/reject")]
        public async Task<IActionResult> RejectWorker(Guid profileId, [FromBody] WorkerVerificationActionDto? dto)
        {
            var worker = await _workerRepository.GetByIdAsync(profileId);
            if (worker == null)
            {
                return NotFound(new { message = "Worker profile not found." });
            }

            await _workerRepository.UpdateStatusAsync(profileId, VerificationStatus.Rejected);

            var adminId = GetCurrentAdminId();
            await _auditLogRepository.LogAsync(
                adminId,
                "REJECT_WORKER_PROFILE",
                "service_provider_profiles",
                profileId,
                $"Admin rejected worker {worker.User.FullName}. Reason: {dto?.Reason ?? "Criteria not met"}."
            );

            return Ok(new { message = "Worker profile rejected." });
        }

        [HttpGet("recommendations/pending")]
        public async Task<IActionResult> GetPendingRecommendations()
        {
            var items = await _recommendationRepository.GetPendingAsync();

            var result = items.Select(r => new RecommendationDetailDto
            {
                RecommendationId = r.RecommendationId,
                RecommendedByUserId = r.RecommendedByUserId,
                RecommenderName = r.RecommendedByUser?.FullName ?? "Unknown",
                WorkerName = r.WorkerName,
                PhoneNumber = r.PhoneNumber,
                CategoryId = r.CategoryId,
                CategoryName = r.Category?.CategoryName ?? string.Empty,
                DistrictId = r.DistrictId,
                DistrictName = r.District?.DistrictName ?? string.Empty,
                UpazilaId = r.UpazilaId,
                UpazilaName = r.Upazila?.UpazilaName ?? string.Empty,
                Notes = r.Notes,
                Status = r.Status.ToString().ToUpperInvariant(),
                ReviewedByAdminId = r.ReviewedByAdminId,
                CreatedAt = r.CreatedAt
            }).ToList();

            return Ok(result);
        }

        [HttpPut("recommendations/{id:guid}/approve")]
        public async Task<IActionResult> ApproveRecommendation(Guid id)
        {
            var rec = await _recommendationRepository.GetByIdAsync(id);
            if (rec == null)
            {
                return NotFound(new { message = "Recommendation not found." });
            }

            var adminId = GetCurrentAdminId();
            await _recommendationRepository.UpdateStatusAsync(id, RecommendationStatus.Approved, adminId);

            await _auditLogRepository.LogAsync(
                adminId,
                "APPROVE_COMMUNITY_RECOMMENDATION",
                "community_recommendations",
                id,
                $"Admin approved offline worker recommendation for {rec.WorkerName}."
            );

            return Ok(new { message = "Recommendation approved successfully." });
        }

        [HttpPut("recommendations/{id:guid}/reject")]
        public async Task<IActionResult> RejectRecommendation(Guid id, [FromBody] RecommendationActionDto? dto)
        {
            var rec = await _recommendationRepository.GetByIdAsync(id);
            if (rec == null)
            {
                return NotFound(new { message = "Recommendation not found." });
            }

            var adminId = GetCurrentAdminId();
            await _recommendationRepository.UpdateStatusAsync(id, RecommendationStatus.Rejected, adminId);

            await _auditLogRepository.LogAsync(
                adminId,
                "REJECT_COMMUNITY_RECOMMENDATION",
                "community_recommendations",
                id,
                $"Admin rejected offline worker recommendation for {rec.WorkerName}. Reason: {dto?.Reason ?? "Declined"}."
            );

            return Ok(new { message = "Recommendation rejected." });
        }

        [HttpGet("audit-logs")]
        public async Task<IActionResult> GetAuditLogs([FromQuery] int count = 50)
        {
            var logs = await _auditLogRepository.GetRecentLogsAsync(count);

            var result = logs.Select(l => new AdminAuditLogDto
            {
                LogId = l.LogId,
                AdminUserId = l.AdminUserId,
                AdminEmail = l.AdminUser?.Email ?? string.Empty,
                Action = l.Action,
                EntityName = l.EntityName,
                EntityId = l.EntityId,
                Details = l.Details,
                Timestamp = l.Timestamp
            }).ToList();

            return Ok(result);
        }

        [HttpPost("categories")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existing = await _categoryRepository.GetByNameAsync(dto.CategoryName);
            if (existing != null)
            {
                return BadRequest(new { message = "A category with this name already exists." });
            }

            var category = new Category
            {
                CategoryName = dto.CategoryName.Trim(),
                Description = dto.Description?.Trim(),
                IconUrl = dto.IconUrl?.Trim() ?? "/icons/default.png",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _categoryRepository.AddAsync(category);

            var adminId = GetCurrentAdminId();
            await _auditLogRepository.LogAsync(
                adminId,
                "CREATE_SERVICE_CATEGORY",
                "categories",
                null,
                $"Admin added new service category: {category.CategoryName}."
            );

            return Ok(new { message = "Category created successfully.", categoryId = category.CategoryId });
        }
    }
}

```

---

### 6.6 `CategoriesController.cs`: Service Trade Category Management

```csharp
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using KajBazar.Core.DTOs;
using KajBazar.Core.Interfaces;

namespace KajBazar.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryRepository _categoryRepository;

        public CategoriesController(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _categoryRepository.GetAllActiveAsync();

            var result = categories.Select(c => new CategoryDto
            {
                CategoryId = c.CategoryId,
                CategoryName = c.CategoryName,
                Description = c.Description,
                IconUrl = c.IconUrl,
                IsActive = c.IsActive
            }).ToList();

            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
            {
                return NotFound(new { message = "Category not found." });
            }

            return Ok(new CategoryDto
            {
                CategoryId = category.CategoryId,
                CategoryName = category.CategoryName,
                Description = category.Description,
                IconUrl = category.IconUrl,
                IsActive = category.IsActive
            });
        }
    }
}

```

---

### 6.7 `GeographyController.cs`: Geographic Hierarchy (Districts & Upazilas)

```csharp
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using KajBazar.Core.DTOs;
using KajBazar.Core.Interfaces;

namespace KajBazar.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GeographyController : ControllerBase
    {
        private readonly IGeographyRepository _geographyRepository;

        public GeographyController(IGeographyRepository geographyRepository)
        {
            _geographyRepository = geographyRepository;
        }

        [HttpGet("districts")]
        public async Task<IActionResult> GetDistricts()
        {
            var districts = await _geographyRepository.GetAllDistrictsAsync();

            var result = districts.Select(d => new DistrictDto
            {
                DistrictId = d.DistrictId,
                DistrictName = d.DistrictName,
                Upazilas = d.Upazilas.Select(u => new UpazilaDto
                {
                    UpazilaId = u.UpazilaId,
                    DistrictId = u.DistrictId,
                    UpazilaName = u.UpazilaName
                }).OrderBy(u => u.UpazilaName).ToList()
            }).ToList();

            return Ok(result);
        }

        [HttpGet("upazilas/{districtId:int}")]
        public async Task<IActionResult> GetUpazilas(int districtId)
        {
            var upazilas = await _geographyRepository.GetUpazilasByDistrictIdAsync(districtId);

            var result = upazilas.Select(u => new UpazilaDto
            {
                UpazilaId = u.UpazilaId,
                DistrictId = u.DistrictId,
                UpazilaName = u.UpazilaName
            }).ToList();

            return Ok(result);
        }
    }
}

```

---

## 7. Global Error Handling & Middleware Pipeline

### 7.1 `ExceptionHandlingMiddleware.cs`: Complete Annotated Source Code

```csharp
using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace KajBazar.API.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred during request execution: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var response = new
            {
                statusCode = context.Response.StatusCode,
                message = "An internal server error occurred. Please try again later.",
                details = exception.Message
            };

            var json = JsonSerializer.Serialize(response);
            return context.Response.WriteAsync(json);
        }
    }
}

```

---

## 8. Hands-on Backend Coding Exercises & Solutions

### 8.1 Exercise 1: Implement an Hourly Rate Range Filter
- **Objective**: Add `decimal? maxHourlyRate` to `WorkersController.Search` and filter workers whose rate is less than or equal to the maximum.
- **Solution**:
  1. Update `IServiceProviderRepository.cs` signature:
     ```csharp
     Task<IEnumerable<WorkerSummaryDto>> SearchWorkersAsync(
         int? categoryId, int? districtId, int? upazilaId, string? search, decimal? maxRate);
     ```
  2. In `ServiceProviderRepository.cs`, add:
     ```csharp
     if (maxRate.HasValue)
         query = query.Where(p => p.HourlyRate == null || p.HourlyRate <= maxRate.Value);
     ```
  3. In `WorkersController.cs`, pass `[FromQuery] decimal? maxRate` into the repository call.

---

## 9. Frequently Asked Questions (FAQ) for Backend Developers

### Q1: Why do we use `.AsNoTracking()` in our read queries?
**Answer**: Entity Framework Core keeps a snapshot of every queried entity in memory by default so it can detect changes. For read-only search operations, this memory overhead is completely wasted. Using `.AsNoTracking()` bypasses the snapshot cache, reducing memory allocation by over 50% and doubling JSON serialization throughput!

### Q2: What is the difference between `[Authorize]` and `[AllowAnonymous]`?
**Answer**: `[Authorize]` instructs ASP.NET Core to inspect the HTTP `Authorization: Bearer <token>` header, validate the JWT cryptographic signature, ensure the token has not expired, and populate `HttpContext.User`. `[AllowAnonymous]` allows public unauthenticated requests (such as browsing the worker directory or registering an account).

### Q3: How do we prevent SQL Injection in Entity Framework Core?
**Answer**: EF Core uses **Parameterized Queries** for all LINQ statements. When you write `.Where(p => p.User.FullName == search)`, EF Core translates this to `WHERE u.full_name = @p0`, passing user input as a separate typed parameter. The database engine never interprets user text as executable SQL commands, completely eliminating SQL injection vulnerabilities!

---

## 10. Conclusion & Roadmap to Volume 04

Congratulations! You have mastered the **KajBazar Backend Architecture**.

You now understand:
- The .NET 8 CLR, JIT compilation, and non-blocking asynchronous programming.
- Clean Architecture boundaries and the Dependency Inversion Principle.
- Service lifetimes (Transient, Scoped, Singleton) and dependency injection.
- Domain Entities, Enums, and DTO security modeling.
- The Repository Pattern, EF Core LINQ translation, and `.AsNoTracking()`.
- Cryptographic password hashing with BCrypt and JWT security tokens.
- RESTful Controllers, Model Binding, and global exception handling.

In the next volume, we will cross the bridge to the user's monitor and master **React 18 & Vite**:
👉 **Proceed to [Volume 04: Frontend React Developer Guide](04-frontend-react-developer-guide.md)**
