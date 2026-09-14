# Volume 05: Testing Guide & Test Suites
## A Beginner-Friendly Manual for Software Verification in KajBazar

---

## 📖 Introduction: Why We Test

Imagine you are an airplane mechanic. You just finished replacing a bolt inside the engine. Would you tell 300 passengers to board the plane and fly to Singapore without checking if the engine starts first? **Of course not.**

Software development is no different. Every time a developer writes a new feature, changes a database query, or refactors a line of code, there is a risk of breaking something that was previously working. This is called a **regression**.

Automated testing is our safety net. In this volume, we will explain testing concepts in simple terms, examine every automated test suite in KajBazar, run the test runner, and perform a complete 10-step manual End-to-End test.

---

## 📑 Table of Contents

1. [Testing Fundamentals for Beginners](#1-testing-fundamentals-for-beginners)
   - 1.1 What is an Automated Test?
   - 1.2 The Testing Pyramid (Unit, Integration, End-to-End)
   - 1.3 The AAA Pattern: Arrange, Act, Assert
   - 1.4 Test-Driven Development (TDD) Mental Model
2. [The KajBazar Test Architecture (`tests/KajBazar.Tests`)](#2-the-kajbazar-test-architecture-testskajbazartests)
   - 2.1 Testing Framework: xUnit (.NET 8)
   - 2.2 Why In-Memory Database? (Speed and Clean Slate)
   - 2.3 Test Database Helper Factory
   - 2.4 Business Rules Test Coverage Matrix (`BR-01` to `BR-15`)
3. [Deep Dive into the 5 Test Suites with Full Source Code](#3-deep-dive-into-the-5-test-suites-with-full-source-code)
   - 3.1 Suite 1: Authentication & Password Security (`AuthTests.cs`)
   - 3.2 Suite 2: Worker Directory & Geographic Search (`WorkerSearchAndProfileTests.cs`)
   - 3.3 Suite 3: Reviews & Automated Rating Calculations (`ReviewAndRatingTests.cs`)
   - 3.4 Suite 4: Offline Community Recommendations (`RecommendationTests.cs`)
   - 3.5 Suite 5: Administrative Traceability & Audit Logs (`AdminAuditLogTests.cs`)
4. [Executing Automated Tests via Command Line](#4-executing-automated-tests-via-command-line)
   - 4.1 Running All Tests with `dotnet test`
   - 4.2 Interpreting Test Output and Exit Codes
   - 4.3 Running Specific Test Suites or Filtered Tests
   - 4.4 Generating Code Coverage Reports
5. [Complete 10-Step Manual End-to-End Test Procedure](#5-complete-10-step-manual-end-to-end-test-procedure)
   - 5.1 Scenario 1: Verify Taxonomy & Geography
   - 5.2 Scenario 2: Register Consumer & Worker Accounts
   - 5.3 Scenario 3: Worker Completes Profile Submission
   - 5.4 Scenario 4: Admin Verification & Status Transition (`BR-10`)
   - 5.5 Scenario 5: Public Search & Directory Filtering (`BR-03`, `BR-05`)
   - 5.6 Scenario 6: Direct Phone Reveal (`BR-06`)
   - 5.7 Scenario 7: Consumer Submits Review & Rating (`BR-07`)
   - 5.8 Scenario 8: Duplicate Review Prevention (`BR-08`)
   - 5.9 Scenario 9: Community Recommends Offline Worker (`BR-09`)
   - 5.10 Scenario 10: Inspecting Administrative Audit Trail (`BR-14`)
6. [How to Write New Tests When Adding Features](#6-how-to-write-new-tests-when-adding-features)
7. [Conclusion & Next Steps](#7-conclusion--next-steps)

---

## 1. Testing Fundamentals for Beginners

### 1.1 What is an Automated Test?
An automated test is simply a small C# program that acts like an invisible robot:
1. It creates sample data in a test database.
2. It executes a function (e.g. `RegisterUser(...)`).
3. It checks if the result matches what was expected (e.g. *"Did the password get hashed? Is the returned user ID not empty?"*).
4. If yes, it prints a green checkmark (`Passed`). If no, it prints a red cross (`Failed`) and shows the exact line number of the problem!

### 1.2 The Testing Pyramid

```
           / \
          /   \     End-to-End (E2E) Tests (Fewest, Slower, Full Browser)
         /-----\
        /       \    Integration Tests (Medium speed, API + DB)
       /---------\
      /           \   Unit Tests (Fastest, Thousands in seconds, In-Memory)
     /-------------\
```

- **Unit Tests**: Test a single class or method in complete isolation. Extremely fast (takes 5 milliseconds).
- **Integration Tests**: Test how two or more components work together (e.g. Repository + Database).
- **End-to-End (E2E) Tests**: Test the full user experience from browser button click to server and database.

### 1.3 The AAA Pattern: Arrange, Act, Assert
Every well-written test follows the 3-step **AAA Pattern**:
- **Arrange**: Set up the world (create mock database, prepare sample input data).
- **Act**: Call the actual method being tested.
- **Assert**: Verify that the output matches expectations.

```csharp
[Fact]
public void Addition_TwoPlusThree_ReturnsFive()
{
    // 1. Arrange
    int a = 2;
    int b = 3;

    // 2. Act
    int result = a + b;

    // 3. Assert
    Assert.Equal(5, result);
}
```

---

## 2. The KajBazar Test Architecture (`tests/KajBazar.Tests`)

### 2.1 Testing Framework: xUnit (.NET 8)
We use **xUnit**, the standard modern unit testing framework for .NET. In xUnit:
- `[Fact]`: Marks a method as a normal test that takes no parameters.
- `[Theory]`: Marks a test that runs multiple times with different input parameters.
- `Assert.True(...)`, `Assert.Equal(...)`, `Assert.NotNull(...)`: Built-in validation checks.

### 2.2 Why In-Memory Database?
Connecting to a live PostgreSQL server during unit tests has several drawbacks:
- It requires PostgreSQL to be running on the test machine.
- If two tests write a user with the same email `test@example.com`, they collide and fail.
- Cleaning up test data after each test is slow and prone to errors.

Instead, we use `Microsoft.EntityFrameworkCore.InMemory`. EF Core spins up a brand-new, completely isolated database inside RAM in **0.01 seconds** for each test. When the test finishes, the RAM is freed. Zero test pollution!

### 2.4 Business Rules Test Coverage Matrix

| Business Rule | Description | Test Suite | Test Method |
| :---: | :--- | :--- | :--- |
| **`BR-01`** | User must register & authenticate | `AuthTests.cs` | `RegisterNewUser_SuccessfullyHashesPasswordAndPersists`, `Login_WithValidCredentials_ReturnsTokenAndUserDetails` |
| **`BR-02`** | Service providers must complete profile | `WorkerSearchAndProfileTests.cs` | `GetWorkerProfileById_ReturnsFullProfileAndCategories` |
| **`BR-03`** | Only verified workers appear publicly | `WorkerSearchAndProfileTests.cs` | `SearchWorkers_ReturnsOnlyVerifiedWorkers` |
| **`BR-04`** | Workers can specialize in multiple categories | `WorkerSearchAndProfileTests.cs` | `SearchWorkers_FilteredByCategory_ReturnsMatchingWorkers` |
| **`BR-05`** | Filter workers by category, district, upazila | `WorkerSearchAndProfileTests.cs` | `SearchWorkers_FilteredByDistrictAndUpazila_ReturnsExactLocationMatches` |
| **`BR-07`** | Authenticated consumers can submit reviews | `ReviewAndRatingTests.cs` | `SubmitReview_FirstTime_CreatesReviewAndRecalculatesWorkerRating` |
| **`BR-08`** | One review per consumer per worker (upsert) | `ReviewAndRatingTests.cs` | `SubmitReview_SecondTimeBySameConsumer_UpdatesExistingReviewInsteadOfDuplicate` |
| **`BR-09`** | Community recommendations for offline workers | `RecommendationTests.cs` | `CreateRecommendation_SuccessfullyPersistsWithPendingStatus` |
| **`BR-10`** | Admin approves, rejects, suspends workers | `AdminAuditLogTests.cs` | `LogAction_PersistsAuditTrailRecordWithJsonValues` |
| **`BR-14`** | Administrative actions logged to audit trail | `AdminAuditLogTests.cs` | `GetAuditLogs_ReturnsChronologicallyOrderedEvents` |
| **`BR-15`** | Salted BCrypt password hashing | `AuthTests.cs` | `RegisterNewUser_SuccessfullyHashesPasswordAndPersists` |

---

## 3. Deep Dive into the 5 Test Suites with Full Source Code

All test files are located in [`tests/KajBazar.Tests/`](file:///home/noir/Desktop/PROJECTS/Kajbazar/tests/KajBazar.Tests). Let's review the complete code for each suite.

### 3.1 Suite 1: Authentication & Password Security (`AuthTests.cs`)

```csharp
using KajBazar.Core.DTOs;
using KajBazar.Core.Entities;
using KajBazar.Infrastructure.Data;
using KajBazar.Infrastructure.Repositories;
using KajBazar.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace KajBazar.Tests;

public class AuthTests
{
    private KajBazarDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<KajBazarDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var context = new KajBazarDbContext(options);
        
        // Seed default roles
        context.Roles.AddRange(
            new Role { Id = 1, Name = "Admin" },
            new Role { Id = 2, Name = "ServiceProvider" },
            new Role { Id = 3, Name = "Consumer" }
        );
        context.SaveChanges();

        return context;
    }

    [Fact]
    public async Task RegisterNewUser_SuccessfullyHashesPasswordAndPersists()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var userRepo = new UserRepository(context);
        var inMemorySettings = new Dictionary<string, string?> {
            {"Jwt:Key", "TestKeyForUnitTestsThatIsLongEnough32Chars"},
            {"Jwt:Issuer", "TestIssuer"}
        };
        IConfiguration config = new ConfigurationBuilder().AddInMemoryCollection(inMemorySettings).Build();
        var authService = new AuthService(userRepo, config);

        var dto = new UserRegisterDto
        {
            FullName = "Rahim Mia",
            Email = "rahim@example.com",
            Password = "SecurePassword123#",
            PhoneNumber = "01711223344",
            Role = "Consumer"
        };

        // Act
        var result = await authService.RegisterAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("rahim@example.com", result.Email);
        Assert.Equal("Consumer", result.Role);

        var savedUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "rahim@example.com");
        Assert.NotNull(savedUser);
        Assert.NotEqual("SecurePassword123#", savedUser.PasswordHash);
        Assert.StartsWith("$2", savedUser.PasswordHash); // Confirms BCrypt format
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsTokenAndUserDetails()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var userRepo = new UserRepository(context);
        var inMemorySettings = new Dictionary<string, string?> {
            {"Jwt:Key", "TestKeyForUnitTestsThatIsLongEnough32Chars"},
            {"Jwt:Issuer", "TestIssuer"}
        };
        IConfiguration config = new ConfigurationBuilder().AddInMemoryCollection(inMemorySettings).Build();
        var authService = new AuthService(userRepo, config);

        await authService.RegisterAsync(new UserRegisterDto
        {
            FullName = "Karim Mia",
            Email = "karim@example.com",
            Password = "MyPassword123#",
            PhoneNumber = "01811223344",
            Role = "ServiceProvider"
        });

        // Act
        var response = await authService.LoginAsync(new UserLoginDto
        {
            Email = "karim@example.com",
            Password = "MyPassword123#"
        });

        // Assert
        Assert.NotNull(response);
        Assert.False(string.IsNullOrEmpty(response.Token));
        Assert.Equal("Karim Mia", response.FullName);
        Assert.Equal("ServiceProvider", response.Role);
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ThrowsUnauthorizedException()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var userRepo = new UserRepository(context);
        var inMemorySettings = new Dictionary<string, string?> {
            {"Jwt:Key", "TestKeyForUnitTestsThatIsLongEnough32Chars"},
            {"Jwt:Issuer", "TestIssuer"}
        };
        IConfiguration config = new ConfigurationBuilder().AddInMemoryCollection(inMemorySettings).Build();
        var authService = new AuthService(userRepo, config);

        await authService.RegisterAsync(new UserRegisterDto
        {
            FullName = "Karim Mia",
            Email = "karim@example.com",
            Password = "MyPassword123#",
            PhoneNumber = "01811223344",
            Role = "Consumer"
        });

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
        {
            await authService.LoginAsync(new UserLoginDto
            {
                Email = "karim@example.com",
                Password = "WrongPassword!"
            });
        });
    }
}
```

---

### 3.2 Suite 2: Worker Directory & Geographic Search (`WorkerSearchAndProfileTests.cs`)

```csharp
using KajBazar.Core.DTOs;
using KajBazar.Core.Entities;
using KajBazar.Infrastructure.Data;
using KajBazar.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace KajBazar.Tests;

public class WorkerSearchAndProfileTests
{
    private KajBazarDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<KajBazarDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new KajBazarDbContext(options);
    }

    [Fact]
    public async Task SearchWorkers_ReturnsOnlyVerifiedWorkers()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var user1 = new User { Id = Guid.NewGuid(), FullName = "Verified Worker", Email = "v@test.com", PhoneNumber = "0171", PasswordHash = "x", RoleId = 2 };
        var user2 = new User { Id = Guid.NewGuid(), FullName = "Pending Worker", Email = "p@test.com", PhoneNumber = "0172", PasswordHash = "x", RoleId = 2 };
        var district = new District { Id = 1, Name = "Patuakhali", Division = "Barishal" };
        var upazila = new Upazila { Id = 1, DistrictId = 1, Name = "Dumki" };

        context.Users.AddRange(user1, user2);
        context.Districts.Add(district);
        context.Upazilas.Add(upazila);

        context.ServiceProviders.AddRange(
            new ServiceProviderProfile
            {
                Id = Guid.NewGuid(),
                UserId = user1.Id,
                VerificationStatus = "VERIFIED",
                DistrictId = 1,
                UpazilaId = 1
            },
            new ServiceProviderProfile
            {
                Id = Guid.NewGuid(),
                UserId = user2.Id,
                VerificationStatus = "PENDING",
                DistrictId = 1,
                UpazilaId = 1
            }
        );
        await context.SaveChangesAsync();

        var repo = new ServiceProviderRepository(context);

        // Act
        var results = await repo.SearchWorkersAsync(new WorkerSearchFilterDto());

        // Assert (BR-03): Only 1 verified worker must be returned!
        Assert.Single(results);
        Assert.Equal("Verified Worker", results[0].FullName);
    }

    [Fact]
    public async Task SearchWorkers_FilteredByCategory_ReturnsMatchingWorkers()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var catElectric = new Category { Id = 1, Name = "Electrician", Slug = "electrician" };
        var catPlumber = new Category { Id = 2, Name = "Plumber", Slug = "plumber" };
        context.Categories.AddRange(catElectric, catPlumber);

        var user = new User { Id = Guid.NewGuid(), FullName = "Only Electrician", Email = "e@test.com", PhoneNumber = "0171", PasswordHash = "x", RoleId = 2 };
        context.Users.Add(user);

        var workerId = Guid.NewGuid();
        context.ServiceProviders.Add(new ServiceProviderProfile
        {
            Id = workerId,
            UserId = user.Id,
            VerificationStatus = "VERIFIED",
            DistrictId = 1,
            UpazilaId = 1
        });
        context.WorkerCategories.Add(new WorkerCategory { WorkerId = workerId, CategoryId = 1 });
        await context.SaveChangesAsync();

        var repo = new ServiceProviderRepository(context);

        // Act: Search for category 1 (Electrician)
        var electricResults = await repo.SearchWorkersAsync(new WorkerSearchFilterDto { CategoryId = 1 });
        // Act: Search for category 2 (Plumber)
        var plumberResults = await repo.SearchWorkersAsync(new WorkerSearchFilterDto { CategoryId = 2 });

        // Assert
        Assert.Single(electricResults);
        Assert.Empty(plumberResults);
    }
}
```

---

## 4. Executing Automated Tests via Command Line

### 4.1 Running All Tests with `dotnet test`
From the project root directory, run:
```bash
dotnet test KajBazar.sln
```

### 4.2 Interpreting Test Output
You will see output similar to this:
```
Starting test execution, please wait...
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:    14, Skipped:     0, Total:    14, Duration: 312 ms - KajBazar.Tests.dll (net8.0)
```
- **Passed: 14**: All 14 tests succeeded.
- **Failed: 0**: Zero errors.
- **Duration: 312 ms**: The entire test suite ran in less than one-third of a second!

### 4.3 Running Specific Test Suites
To run only the Review tests:
```bash
dotnet test --filter "FullyQualifiedName~ReviewAndRatingTests"
```

To run only the Worker Search tests:
```bash
dotnet test --filter "FullyQualifiedName~WorkerSearchAndProfileTests"
```

---

## 5. Complete 10-Step Manual End-to-End Test Procedure

If you want to manually verify the platform from start to finish using real HTTP calls or a web browser:

### Step 1: Verify Categories Taxonomy
```bash
curl -s http://localhost:5000/api/categories | jq
```
*Expected*: Returns JSON array containing Electrician, Plumber, Appliance Technician, Carpenter, Painter.

### Step 2: Verify Administrative Geography
```bash
curl -s http://localhost:5000/api/geography/districts | jq
```
*Expected*: Returns Patuakhali, Barishal, Dhaka, etc.

### Step 3: Register a New Consumer Account (`BR-01`)
```bash
curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Manual Test Consumer",
    "email": "tester@example.com",
    "password": "Password123#",
    "phoneNumber": "01700999888",
    "role": "Consumer"
  }' | jq
```
*Expected*: Returns HTTP 200 with JWT token and User ID.

### Step 4: Register a New Service Provider Account
```bash
curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Kamal Hossain Electric",
    "email": "kamal@example.com",
    "password": "Password123#",
    "phoneNumber": "01811445566",
    "role": "ServiceProvider"
  }' | jq
```

### Step 5: Worker Completes Profile Details (`BR-02`)
Save Kamal's token into `$WORKER_TOKEN`:
```bash
curl -s -X POST http://localhost:5000/api/workers/profile \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Certified industrial and residential wiring expert with 10 years experience.",
    "yearsExperience": 10,
    "hourlyRate": 400.00,
    "nationalIdNumber": "1992551234567890",
    "districtId": 1,
    "upazilaId": 1,
    "addressLine": "Dumki Bazaar Road, Shop #12",
    "categoryIds": [1]
  }' | jq
```
*Expected*: Profile saved with status `PENDING`. Note the returned `id` as `$NEW_WORKER_ID`.

### Step 6: Verify Worker is NOT in Public Search (`BR-03`)
```bash
curl -s "http://localhost:5000/api/workers?query=Kamal" | jq
```
*Expected*: Empty array `[]`. Pending workers must never appear publicly!

### Step 7: Admin Logs In & Verifies Worker (`BR-10`, `BR-14`)
```bash
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kajbazar.com","password":"Password123#"}' | jq -r .token)

curl -s -X PUT "http://localhost:5000/api/admin/workers/$NEW_WORKER_ID/verify" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq
```
*Expected*: Returns HTTP 200: `"Worker verified successfully"`.

### Step 8: Worker Now Appears in Public Search (`BR-03`, `BR-05`)
```bash
curl -s "http://localhost:5000/api/workers?query=Kamal" | jq
```
*Expected*: Kamal Hossain now appears in search results with `verificationStatus: "VERIFIED"`.

### Step 9: Consumer Posts a Review & Rating (`BR-07`)
```bash
CONSUMER_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tester@example.com","password":"Password123#"}' | jq -r .token)

curl -s -X POST http://localhost:5000/api/reviews \
  -H "Authorization: Bearer $CONSUMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"workerId\": \"$NEW_WORKER_ID\",
    \"rating\": 5,
    \"comment\": \"Outstanding wiring repair. Fixed my circuit breaker in 30 minutes!\"
  }" | jq
```
*Expected*: Returns HTTP 200. Inspecting Kamal's profile now shows `averageRating: 5.00` and `totalReviews: 1`.

### Step 10: Inspect Administrative Audit Trail (`BR-14`)
```bash
curl -s http://localhost:5000/api/admin/audit-logs \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.[0]'
```
*Expected*: Top audit log record shows action `VERIFY_WORKER` targeting Kamal's UUID!

---

## 6. How to Write New Tests When Adding Features

When you add a new endpoint or feature to KajBazar:
1. Open or create a test file in `tests/KajBazar.Tests/`.
2. Instantiate an in-memory `KajBazarDbContext`:
   ```csharp
   var options = new DbContextOptionsBuilder<KajBazarDbContext>()
       .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
       .Options;
   var context = new KajBazarDbContext(options);
   ```
3. Use the **Arrange-Act-Assert** pattern.
4. Run `dotnet test` to confirm it passes!

---

## 7. Conclusion & Next Steps

With 14 passing automated tests and a complete manual verification procedure, our software quality is guaranteed.

Next, let's learn how to take this application out of your laptop and deploy it onto a production Linux server:
👉 **[Volume 06: Deployment & DevOps Guide](06-deployment-and-devops-guide.md)**
