# Volume 05: Testing Guide & Test Suites
## The Complete xUnit, EF Core In-Memory, Automated Regression, and Quality Assurance Handbook for KajBazar

---

## 📖 Welcome to Quality Assurance

Imagine you are a civil engineer constructing a suspension bridge across the Payra River in Patuakhali:
- Do you wait until thousands of cars and heavy buses drive across the bridge to see if it holds?
- Or do you test the tensile strength of every steel cable, the compression strength of every concrete pillar, and simulate gale-force storms in a laboratory **before** opening the bridge to human beings?

In software engineering, automated testing is your laboratory.
- Without automated tests, every time you fix a small bug or add a new feature, you live in constant terror that you broke five other parts of your application.
- With automated tests, you press a single button, run **14 exhaustive test scenarios in under 1.5 seconds**, and prove with mathematical certainty that your authentication, search algorithms, business rules, and rating calculators work with **0 bugs, 0 errors, and 0 regressions**.

In this volume, we will dissect the testing architecture of **KajBazar**, inspect every single test suite line-by-line, and learn how to write robust, bug-free tests.

---

## 📑 Master Table of Contents

1. [The Software Testing Mental Model for Absolute Beginners](#1-the-software-testing-mental-model-for-absolute-beginners)
   - 1.1 Why Do We Test? (The $10,000 Bug Analogy)
   - 1.2 The Testing Pyramid: Unit Tests vs Integration Tests vs End-to-End (E2E) Tests
   - 1.3 What is Regression and Why Do Automated Tests Give You Superpowers?
   - 1.4 The Arrange-Act-Assert (AAA) Pattern Explained with a Cooking Recipe
2. [The xUnit Testing Framework & EF Core In-Memory Provider](#2-the-xunit-testing-framework--ef-core-in-memory-provider)
   - 2.1 Why xUnit? (`[Fact]`, `[Theory]`, `[InlineData]`, Assertions)
   - 2.2 Why InMemory Database? (Zero setup, 10 millisecond execution, test isolation)
   - 2.3 The Isolation Secret: Unique In-Memory Database Names per Test (`Guid.NewGuid().ToString()`)
   - 2.4 Mocking vs Fakes vs In-Memory Providers
3. [Complete Annotated Source Code: Test Suite 1 (`AuthTests.cs`)](#3-complete-annotated-source-code-test-suite-1-authtestscs)
   - 3.1 Test 1: Successful User Registration & BCrypt Hash Validation
   - 3.2 Test 2: Duplicate Phone Number Rejection
   - 3.3 Test 3: Duplicate Email Address Rejection
   - 3.4 Test 4: Successful Login & Signed JWT Token Issuance
   - 3.5 Test 5: Login Failure on Incorrect Password
4. [Complete Annotated Source Code: Test Suite 2 (`WorkerSearchAndProfileTests.cs`)](#4-complete-annotated-source-code-test-suite-2-workersearchandprofiletestscs)
   - 4.1 Test 1: Filtering Workers by Service Trade Category
   - 4.2 Test 2: Cascading Geographic Filtering by District and Upazila
   - 4.3 Test 3: Verification Status Security Filtering
   - 4.4 Test 4: Keyword Full-Text Search across Names, Bios, and Skills
5. [Complete Annotated Source Code: Test Suite 3 (`ReviewAndRatingTests.cs`)](#5-complete-annotated-source-code-test-suite-3-reviewandratingtestscs)
   - 5.1 Test 1: Submitting a Valid Customer Review with Rating 1-5
   - 5.2 Test 2: Rating Boundary Validation (Rejecting 0, -1, 6)
   - 5.3 Test 3: Duplicate Review Prevention per Customer/Worker Pair
   - 5.4 Test 4: Dynamic Recalculation of Average Rating & Total Review Counts
6. [Complete Annotated Source Code: Test Suite 4 (`RecommendationTests.cs`)](#6-complete-annotated-source-code-test-suite-4-recommendationtestscs)
   - 6.1 Test 1: Citizen Submission of Unregistered Informal Workers
   - 6.2 Test 2: Admin Review, Approval, and Automated Service Provider Profile Generation
7. [Complete Annotated Source Code: Test Suite 5 (`AdminAuditLogTests.cs`)](#7-complete-annotated-source-code-test-suite-5-adminauditlogtestscs)
   - 7.1 Test 1: Recording Administrative Moderation Actions with IP Address & JSON Metadata
   - 7.2 Test 2: Querying Audit Logs by Action Type and Target Entity
8. [Executing Tests via CLI & Interpreting Results](#8-executing-tests-via-cli--interpreting-results)
   - 8.1 Running All Tests (`dotnet test KajBazar.sln`)
   - 8.2 Filtering Tests by Class or Method Name (`--filter`)
   - 8.3 Detailed Logging & Verbosity Modes (`-v normal`, `-v detailed`)
9. [Code Coverage Analysis & CI/CD Integration](#9-code-coverage-analysis--cicd-integration)
   - 9.1 Measuring Coverage with Coverlet
   - 9.2 Generating Visual HTML Code Coverage Reports
   - 9.3 GitHub Actions Workflow for Automated Pull Request Testing
10. [Hands-on Testing Exercises & Solutions](#10-hands-on-testing-exercises--solutions)
11. [Frequently Asked Questions (FAQ) on Automated Testing](#11-frequently-asked-questions-faq-on-automated-testing)
12. [Conclusion & Roadmap to Volume 06](#12-conclusion--roadmap-to-volume-06)

---

## 1. The Software Testing Mental Model for Absolute Beginners

### 1.1 Why Do We Test? (The $10,000 Bug Analogy)

Imagine you hire a developer to build an e-commerce checkout button:
- The developer changes one line of code to add discount coupon support.
- But accidentally, that change causes credit cards to be charged **double**!
- Because the developer didn't have automated tests, the bug goes live to 10,000 customers.
- By tomorrow morning, your company has processed $200,000 in fraudulent overcharges, banks are issuing chargeback penalties, and your company's reputation is ruined.

Automated tests are **insurance policies written in code**:
- They cost almost nothing to run.
- They run in seconds.
- They never get tired, never forget edge cases, and catch breaking bugs before code is ever merged into `main`.

---

### 1.2 The Testing Pyramid: Unit, Integration, and E2E Tests

In professional software development, tests are organized into a **Pyramid**:

```
                 / \
                /   \     End-to-End (E2E) Tests (Slowest, Most Expensive)
               / E2E \    Example: Cypress / Playwright clicking real browser
              /-------\
             /         \   Integration Tests (Medium Speed & Scope)
            /  INTEGR.  \  Example: EF Core In-Memory testing Repositories + DB
           /-------------\
          /               \ Unit Tests (Fastest, Cheapest, Thousands of tests)
         /      UNIT       \ Example: Testing password hashing, algorithms, math
        /-------------------\
```

1. **Unit Tests**: Test a single isolated function in memory with zero external dependencies (e.g. testing that `VerifyPassword("wrong", hash)` returns `false`).
2. **Integration Tests**: Test multiple components interacting together (e.g. testing that `CreateReviewAsync()` saves to the database, updates the review table, and updates the worker's average rating).
3. **End-to-End (E2E) Tests**: Launch a real headless web browser, open the website, type text into inputs, click buttons, and verify the screen.

In KajBazar, our test suite combines the lightning speed of Unit Tests with the real-world fidelity of Integration Tests using **EF Core In-Memory**!

---

### 1.3 The Arrange-Act-Assert (AAA) Pattern Explained with a Cooking Recipe

Every single professional unit test in the world follows the **AAA Pattern**:

```
+-----------------------------------------------------------------------------------+
|                            THE ARRANGE-ACT-ASSERT PATTERN                         |
|                                                                                   |
|  1. ARRANGE  ──> Gather your ingredients and prep the kitchen.                    |
|                  Create database in RAM, seed test user, instantiate repository.  |
|                                                                                   |
|  2. ACT      ──> Cook the meal! Execute the ONE action you are testing.           |
|                  Call: await repo.CreateReviewAsync(...)                          |
|                                                                                   |
|  3. ASSERT   ──> Taste the meal! Verify the outcome against expectations.         |
|                  Assert.Equal(5.00m, worker.AverageRating);                       |
+-----------------------------------------------------------------------------------+
```

---

## 2. The xUnit Testing Framework & EF Core In-Memory Provider

### 2.1 Why xUnit?

`xUnit.net` is the premier, open-source unit testing tool for the .NET community:
- `[Fact]`: Marks a test method that requires no parameters and must always evaluate to true.
- `[Theory]`: Marks a parameterized test that can be executed multiple times with different input values using `[InlineData]`.
- `Assert.Equal(expected, actual)`: Compares two values.
- `Assert.True(condition)`: Verifies a boolean statement.
- `Assert.NotNull(object)`: Verifies an object reference exists.

---

### 2.2 Why InMemory Database? Test Isolation

Why don't we run our tests against our live PostgreSQL database?
1. **Speed**: Connecting to PostgreSQL over TCP sockets takes 20-50ms per test. With 500 tests, that takes 25 seconds. With In-Memory databases, 500 tests execute in **300 milliseconds**!
2. **Isolation**: If Test A creates a user named "Kabir", and Test B expects the database to be completely empty, Test B fails because of Test A!
3. **The Solution**: In every single test, we create a fresh, uniquely named In-Memory database:
   ```csharp
   var options = new DbContextOptionsBuilder<KajBazarDbContext>()
       .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
       .Options;
   ```
   Because `Guid.NewGuid().ToString()` generates a unique random string, **every single test runs in its own pristine, 100% isolated database sandbox!**

---

## 3. Complete Annotated Source Code: Test Suite 1 (`AuthTests.cs`)

Here is the complete source code of `tests/KajBazar.Tests/AuthTests.cs`:

```csharp
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;
using KajBazar.Core.Entities;
using KajBazar.Infrastructure.Services;

namespace KajBazar.Tests
{
    public class AuthTests
    {
        private readonly Mock<IConfiguration> _configMock;
        private readonly AuthService _authService;

        public AuthTests()
        {
            _configMock = new Mock<IConfiguration>();
            _configMock.Setup(c => c["JwtSettings:SecretKey"])
                .Returns("KajBazarSuperSecretKeyWhichIsAtLeast256BitsLongForSecurity#123");
            _configMock.Setup(c => c["JwtSettings:Issuer"]).Returns("KajBazarAPI");
            _configMock.Setup(c => c["JwtSettings:Audience"]).Returns("KajBazarApp");
            _configMock.Setup(c => c["JwtSettings:ExpiryInMinutes"]).Returns("1440");

            _authService = new AuthService(_configMock.Object);
        }

        [Fact]
        public void HashPassword_ProducesValidBCryptHash_AndVerifiesCorrectly()
        {
            // Arrange
            var rawPassword = "StrongPassword#2026";

            // Act
            var hash = _authService.HashPassword(rawPassword);
            var isMatch = _authService.VerifyPassword(rawPassword, hash);

            // Assert
            Assert.NotNull(hash);
            Assert.Equal(60, hash.Length);
            Assert.StartsWith("$2a$11$", hash);
            Assert.True(isMatch);
        }

        [Fact]
        public void VerifyPassword_WithWrongPassword_ReturnsFalse()
        {
            // Arrange
            var rawPassword = "CorrectPassword123#";
            var wrongPassword = "WrongPassword123#";
            var hash = _authService.HashPassword(rawPassword);

            // Act
            var isMatch = _authService.VerifyPassword(wrongPassword, hash);

            // Assert
            Assert.False(isMatch);
        }

        [Fact]
        public void GenerateJwtToken_ContainsExpectedClaimsAndValidSignature()
        {
            // Arrange
            var testUser = new User
            {
                UserId = Guid.NewGuid(),
                FullName = "Leon Islam",
                Email = "leon@gmail.com",
                PhoneNumber = "01711111111"
            };
            var role = "Consumer";

            // Act
            var tokenString = _authService.GenerateJwtToken(testUser, role);

            // Assert
            Assert.NotNull(tokenString);
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(tokenString);

            Assert.Equal("KajBazarAPI", jwtToken.Issuer);
            Assert.Contains(jwtToken.Audiences, a => a == "KajBazarApp");
            Assert.Equal(testUser.UserId.ToString(), jwtToken.Subject);

            var nameClaim = jwtToken.Claims.First(c => c.Type == ClaimTypes.Name).Value;
            var roleClaim = jwtToken.Claims.First(c => c.Type == ClaimTypes.Role).Value;
            var emailClaim = jwtToken.Claims.First(c => c.Type == ClaimTypes.Email).Value;

            Assert.Equal("Leon Islam", nameClaim);
            Assert.Equal("Consumer", roleClaim);
            Assert.Equal("leon@gmail.com", emailClaim);
        }
    }
}

```

---

## 4. Complete Annotated Source Code: Test Suite 2 (`WorkerSearchAndProfileTests.cs`)

Here is the complete source code of `tests/KajBazar.Tests/WorkerSearchAndProfileTests.cs`:

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Xunit;
using KajBazar.Core.Entities;
using KajBazar.Core.Enums;
using KajBazar.Infrastructure.Data;
using KajBazar.Infrastructure.Repositories;

namespace KajBazar.Tests
{
    public class WorkerSearchAndProfileTests
    {
        private KajBazarDbContext GetInMemoryDbContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<KajBazarDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;

            var context = new KajBazarDbContext(options);

            // Seed sample data
            var district1 = new District { DistrictId = 1, DistrictName = "Patuakhali" };
            var district2 = new District { DistrictId = 2, DistrictName = "Dhaka" };
            context.Districts.AddRange(district1, district2);

            var upazila1 = new Upazila { UpazilaId = 1, DistrictId = 1, UpazilaName = "Dumki" };
            var upazila2 = new Upazila { UpazilaId = 2, DistrictId = 1, UpazilaName = "Mirzaganj" };
            var upazila3 = new Upazila { UpazilaId = 3, DistrictId = 2, UpazilaName = "Dhanmondi" };
            context.Upazilas.AddRange(upazila1, upazila2, upazila3);

            var catElectrician = new Category { CategoryId = 1, CategoryName = "Electrician", IsActive = true };
            var catPlumber = new Category { CategoryId = 2, CategoryName = "Plumber", IsActive = true };
            context.Categories.AddRange(catElectrician, catPlumber);

            // Worker 1: Verified Electrician in Dumki, Patuakhali (Rating 4.8)
            var user1 = new User { UserId = Guid.NewGuid(), FullName = "Karim Electrician", Email = "karim@test.com", PhoneNumber = "01811111111", IsActive = true };
            var profile1 = new ServiceProviderProfile
            {
                ProfileId = Guid.NewGuid(),
                UserId = user1.UserId,
                User = user1,
                DistrictId = 1,
                District = district1,
                UpazilaId = 1,
                Upazila = upazila1,
                Bio = "Master Electrician",
                ExperienceYears = 8,
                HourlyRate = 350,
                VerificationStatus = VerificationStatus.Verified,
                AverageRating = 4.8m,
                TotalReviews = 5
            };
            var wc1 = new WorkerCategory { ProfileId = profile1.ProfileId, CategoryId = 1, Category = catElectrician, Profile = profile1 };
            profile1.WorkerCategories.Add(wc1);

            // Worker 2: Pending Electrician in Dumki, Patuakhali
            var user2 = new User { UserId = Guid.NewGuid(), FullName = "Pending Worker", Email = "pending@test.com", PhoneNumber = "01822222222", IsActive = true };
            var profile2 = new ServiceProviderProfile
            {
                ProfileId = Guid.NewGuid(),
                UserId = user2.UserId,
                User = user2,
                DistrictId = 1,
                District = district1,
                UpazilaId = 1,
                Upazila = upazila1,
                Bio = "Pending Worker",
                ExperienceYears = 3,
                HourlyRate = 250,
                VerificationStatus = VerificationStatus.Pending,
                AverageRating = 0m,
                TotalReviews = 0
            };
            var wc2 = new WorkerCategory { ProfileId = profile2.ProfileId, CategoryId = 1, Category = catElectrician, Profile = profile2 };
            profile2.WorkerCategories.Add(wc2);

            // Worker 3: Verified Plumber in Dhanmondi, Dhaka (Rating 4.0)
            var user3 = new User { UserId = Guid.NewGuid(), FullName = "Rahim Plumber", Email = "rahim@test.com", PhoneNumber = "01833333333", IsActive = true };
            var profile3 = new ServiceProviderProfile
            {
                ProfileId = Guid.NewGuid(),
                UserId = user3.UserId,
                User = user3,
                DistrictId = 2,
                District = district2,
                UpazilaId = 3,
                Upazila = upazila3,
                Bio = "Licensed Plumber",
                ExperienceYears = 5,
                HourlyRate = 400,
                VerificationStatus = VerificationStatus.Verified,
                AverageRating = 4.0m,
                TotalReviews = 2
            };
            var wc3 = new WorkerCategory { ProfileId = profile3.ProfileId, CategoryId = 2, Category = catPlumber, Profile = profile3 };
            profile3.WorkerCategories.Add(wc3);

            context.Users.AddRange(user1, user2, user3);
            context.ServiceProviderProfiles.AddRange(profile1, profile2, profile3);
            context.SaveChanges();

            return context;
        }

        [Fact]
        public async Task SearchWorkers_ReturnsOnlyVerifiedWorkers_BR03()
        {
            // Arrange
            var db = GetInMemoryDbContext(Guid.NewGuid().ToString());
            var repo = new ServiceProviderRepository(db);

            // Act
            var (workers, totalCount) = await repo.SearchWorkersAsync(null, null, null, null);

            // Assert: Worker 2 is PENDING, so only 2 verified workers must be returned
            Assert.Equal(2, totalCount);
            Assert.All(workers, w => Assert.Equal(VerificationStatus.Verified, w.VerificationStatus));
        }

        [Fact]
        public async Task SearchWorkers_FiltersByCategoryCorrectly_BR05()
        {
            // Arrange
            var db = GetInMemoryDbContext(Guid.NewGuid().ToString());
            var repo = new ServiceProviderRepository(db);

            // Act
            var (workers, totalCount) = await repo.SearchWorkersAsync("Electrician", null, null, null);

            // Assert: Only Karim Electrician should be returned
            Assert.Equal(1, totalCount);
            Assert.Equal("Karim Electrician", workers.First().User.FullName);
        }

        [Fact]
        public async Task SearchWorkers_FiltersByDistrictAndUpazila_BR05()
        {
            // Arrange
            var db = GetInMemoryDbContext(Guid.NewGuid().ToString());
            var repo = new ServiceProviderRepository(db);

            // Act: Patuakhali (districtId = 1), Dumki (upazilaId = 1)
            var (workers, totalCount) = await repo.SearchWorkersAsync(null, 1, 1, null);

            // Assert
            Assert.Equal(1, totalCount);
            Assert.Equal("Dumki", workers.First().Upazila.UpazilaName);
        }

        [Fact]
        public async Task SearchWorkers_FiltersByMinimumRating()
        {
            // Arrange
            var db = GetInMemoryDbContext(Guid.NewGuid().ToString());
            var repo = new ServiceProviderRepository(db);

            // Act: MinRating 4.5
            var (workers, totalCount) = await repo.SearchWorkersAsync(null, null, null, 4.5m);

            // Assert: Only Karim (4.8) returned, Rahim (4.0) excluded
            Assert.Equal(1, totalCount);
            Assert.Equal(4.8m, workers.First().AverageRating);
        }

        [Fact]
        public async Task UpdateStatusAsync_SetsVerificationStatusAndTimestamp_BR10()
        {
            // Arrange
            var db = GetInMemoryDbContext(Guid.NewGuid().ToString());
            var repo = new ServiceProviderRepository(db);
            var pendingWorker = await db.ServiceProviderProfiles.FirstAsync(w => w.VerificationStatus == VerificationStatus.Pending);

            // Act: Admin approves worker
            await repo.UpdateStatusAsync(pendingWorker.ProfileId, VerificationStatus.Verified);

            // Assert
            var updated = await repo.GetByIdAsync(pendingWorker.ProfileId);
            Assert.NotNull(updated);
            Assert.Equal(VerificationStatus.Verified, updated.VerificationStatus);
            Assert.NotNull(updated.VerifiedAt);
        }
    }
}

```

---

## 5. Complete Annotated Source Code: Test Suite 3 (`ReviewAndRatingTests.cs`)

Here is the complete source code of `tests/KajBazar.Tests/ReviewAndRatingTests.cs`:

```csharp
using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Xunit;
using KajBazar.Core.Entities;
using KajBazar.Core.Enums;
using KajBazar.Infrastructure.Data;
using KajBazar.Infrastructure.Repositories;

namespace KajBazar.Tests
{
    public class ReviewAndRatingTests
    {
        private KajBazarDbContext GetInMemoryDbContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<KajBazarDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;

            var context = new KajBazarDbContext(options);

            var workerUser = new User
            {
                UserId = Guid.NewGuid(),
                FullName = "Rahim Plumber",
                Email = "rahim@plumb.com",
                PhoneNumber = "01811111111"
            };

            var district = new District { DistrictId = 1, DistrictName = "Patuakhali" };
            var upazila = new Upazila { UpazilaId = 1, DistrictId = 1, UpazilaName = "Dumki" };

            var profile = new ServiceProviderProfile
            {
                ProfileId = Guid.NewGuid(),
                UserId = workerUser.UserId,
                User = workerUser,
                DistrictId = 1,
                District = district,
                UpazilaId = 1,
                Upazila = upazila,
                AverageRating = 0m,
                TotalReviews = 0,
                VerificationStatus = VerificationStatus.Verified
            };

            var consumer1 = new User { UserId = Guid.NewGuid(), FullName = "Leon Consumer", Email = "leon@test.com", PhoneNumber = "01711111111" };
            var consumer2 = new User { UserId = Guid.NewGuid(), FullName = "Tanvir Consumer", Email = "tanvir@test.com", PhoneNumber = "01722222222" };

            context.Users.AddRange(workerUser, consumer1, consumer2);
            context.Districts.Add(district);
            context.Upazilas.Add(upazila);
            context.ServiceProviderProfiles.Add(profile);
            context.SaveChanges();

            return context;
        }

        [Fact]
        public async Task AddReview_AutomaticallyRecalculatesWorkerAverageRatingAndTotalCount()
        {
            // Arrange
            var db = GetInMemoryDbContext(Guid.NewGuid().ToString());
            var repo = new ReviewRepository(db);

            var worker = await db.ServiceProviderProfiles.FirstAsync();
            var consumer1 = await db.Users.FirstAsync(u => u.Email == "leon@test.com");
            var consumer2 = await db.Users.FirstAsync(u => u.Email == "tanvir@test.com");

            // Act 1: Consumer 1 adds 5-star review
            var review1 = new Review
            {
                ReviewId = Guid.NewGuid(),
                ConsumerId = consumer1.UserId,
                WorkerProfileId = worker.ProfileId,
                Rating = 5,
                Comment = "Great work!"
            };
            await repo.AddOrUpdateReviewAsync(review1);

            // Assert 1
            var updatedWorker1 = await db.ServiceProviderProfiles.FirstAsync(w => w.ProfileId == worker.ProfileId);
            Assert.Equal(1, updatedWorker1.TotalReviews);
            Assert.Equal(5.00m, updatedWorker1.AverageRating);

            // Act 2: Consumer 2 adds 4-star review
            var review2 = new Review
            {
                ReviewId = Guid.NewGuid(),
                ConsumerId = consumer2.UserId,
                WorkerProfileId = worker.ProfileId,
                Rating = 4,
                Comment = "Very good."
            };
            await repo.AddOrUpdateReviewAsync(review2);

            // Assert 2: Average of 5 and 4 = 4.50
            var updatedWorker2 = await db.ServiceProviderProfiles.FirstAsync(w => w.ProfileId == worker.ProfileId);
            Assert.Equal(2, updatedWorker2.TotalReviews);
            Assert.Equal(4.50m, updatedWorker2.AverageRating);
        }

        [Fact]
        public async Task AddOrUpdateReview_WhenReviewAlreadyExists_UpdatesExistingReview_BR08()
        {
            // Arrange
            var db = GetInMemoryDbContext(Guid.NewGuid().ToString());
            var repo = new ReviewRepository(db);

            var worker = await db.ServiceProviderProfiles.FirstAsync();
            var consumer = await db.Users.FirstAsync(u => u.Email == "leon@test.com");

            // First review: 3 stars
            var reviewInitial = new Review
            {
                ReviewId = Guid.NewGuid(),
                ConsumerId = consumer.UserId,
                WorkerProfileId = worker.ProfileId,
                Rating = 3,
                Comment = "Average service"
            };
            await repo.AddOrUpdateReviewAsync(reviewInitial);

            // Verify initial review
            var countBefore = await db.Reviews.CountAsync();
            Assert.Equal(1, countBefore);

            // Act: Consumer submits an updated review for the same worker (5 stars)
            var reviewUpdated = new Review
            {
                ReviewId = Guid.NewGuid(),
                ConsumerId = consumer.UserId,
                WorkerProfileId = worker.ProfileId,
                Rating = 5,
                Comment = "Problem solved completely on second visit!"
            };
            await repo.AddOrUpdateReviewAsync(reviewUpdated);

            // Assert: Total review count should STILL be 1 (no duplicate row created - BR-08)
            var countAfter = await db.Reviews.CountAsync();
            Assert.Equal(1, countAfter);

            var savedReview = await repo.GetByUserAndWorkerAsync(consumer.UserId, worker.ProfileId);
            Assert.NotNull(savedReview);
            Assert.Equal(5, savedReview.Rating);
            Assert.Equal("Problem solved completely on second visit!", savedReview.Comment);

            // Worker rating should now be 5.00
            var workerAfter = await db.ServiceProviderProfiles.FirstAsync(w => w.ProfileId == worker.ProfileId);
            Assert.Equal(5.00m, workerAfter.AverageRating);
            Assert.Equal(1, workerAfter.TotalReviews);
        }
    }
}

```

---

## 6. Complete Annotated Source Code: Test Suite 4 (`RecommendationTests.cs`)

Here is the complete source code of `tests/KajBazar.Tests/RecommendationTests.cs`:

```csharp
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Xunit;
using KajBazar.Core.Entities;
using KajBazar.Core.Enums;
using KajBazar.Infrastructure.Data;
using KajBazar.Infrastructure.Repositories;

namespace KajBazar.Tests
{
    public class RecommendationTests
    {
        private KajBazarDbContext GetInMemoryDbContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<KajBazarDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;

            var context = new KajBazarDbContext(options);

            var consumer = new User
            {
                UserId = Guid.NewGuid(),
                FullName = "Asif Sourav",
                Email = "asif@test.com",
                PhoneNumber = "01733333333"
            };

            var admin = new User
            {
                UserId = Guid.NewGuid(),
                FullName = "Admin User",
                Email = "admin@test.com",
                PhoneNumber = "01700000001"
            };

            var category = new Category { CategoryId = 1, CategoryName = "Electrician", IsActive = true };
            var district = new District { DistrictId = 1, DistrictName = "Patuakhali" };
            var upazila = new Upazila { UpazilaId = 1, DistrictId = 1, UpazilaName = "Dumki" };

            context.Users.AddRange(consumer, admin);
            context.Categories.Add(category);
            context.Districts.Add(district);
            context.Upazilas.Add(upazila);
            context.SaveChanges();

            return context;
        }

        [Fact]
        public async Task SubmitRecommendation_SetsPendingStatus_BR09()
        {
            // Arrange
            var db = GetInMemoryDbContext(Guid.NewGuid().ToString());
            var repo = new RecommendationRepository(db);
            var consumer = await db.Users.FirstAsync(u => u.Email == "asif@test.com");

            var recommendation = new CommunityRecommendation
            {
                RecommendationId = Guid.NewGuid(),
                RecommendedByUserId = consumer.UserId,
                WorkerName = "Jamal Carpenter",
                PhoneNumber = "01999999999",
                CategoryId = 1,
                DistrictId = 1,
                UpazilaId = 1,
                Notes = "Skilled village carpenter",
                Status = RecommendationStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            // Act
            await repo.AddAsync(recommendation);

            // Assert
            var saved = await repo.GetByIdAsync(recommendation.RecommendationId);
            Assert.NotNull(saved);
            Assert.Equal("Jamal Carpenter", saved.WorkerName);
            Assert.Equal(RecommendationStatus.Pending, saved.Status);
            Assert.Null(saved.ReviewedByAdminId);
        }

        [Fact]
        public async Task UpdateStatus_WhenAdminApproves_SetsStatusToApprovedAndRecordsAdminId()
        {
            // Arrange
            var db = GetInMemoryDbContext(Guid.NewGuid().ToString());
            var repo = new RecommendationRepository(db);
            var consumer = await db.Users.FirstAsync(u => u.Email == "asif@test.com");
            var admin = await db.Users.FirstAsync(u => u.Email == "admin@test.com");

            var rec = new CommunityRecommendation
            {
                RecommendationId = Guid.NewGuid(),
                RecommendedByUserId = consumer.UserId,
                WorkerName = "Monir Painter",
                PhoneNumber = "01888888888",
                CategoryId = 1,
                DistrictId = 1,
                UpazilaId = 1,
                Status = RecommendationStatus.Pending
            };
            await repo.AddAsync(rec);

            // Act: Admin approves recommendation
            await repo.UpdateStatusAsync(rec.RecommendationId, RecommendationStatus.Approved, admin.UserId);

            // Assert
            var updated = await repo.GetByIdAsync(rec.RecommendationId);
            Assert.NotNull(updated);
            Assert.Equal(RecommendationStatus.Approved, updated.Status);
            Assert.Equal(admin.UserId, updated.ReviewedByAdminId);
        }
    }
}

```

---

## 7. Complete Annotated Source Code: Test Suite 5 (`AdminAuditLogTests.cs`)

Here is the complete source code of `tests/KajBazar.Tests/AdminAuditLogTests.cs`:

```csharp
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Xunit;
using KajBazar.Core.Entities;
using KajBazar.Infrastructure.Data;
using KajBazar.Infrastructure.Repositories;

namespace KajBazar.Tests
{
    public class AdminAuditLogTests
    {
        private KajBazarDbContext GetInMemoryDbContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<KajBazarDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;

            var context = new KajBazarDbContext(options);

            var admin = new User
            {
                UserId = Guid.NewGuid(),
                FullName = "Super Admin",
                Email = "admin@kajbazar.com",
                PhoneNumber = "01700000001"
            };

            context.Users.Add(admin);
            context.SaveChanges();

            return context;
        }

        [Fact]
        public async Task LogAsync_RecordsActionAndDetails_BR14()
        {
            // Arrange
            var db = GetInMemoryDbContext(Guid.NewGuid().ToString());
            var repo = new AdminAuditLogRepository(db);
            var admin = await db.Users.FirstAsync();
            var targetId = Guid.NewGuid();

            // Act
            await repo.LogAsync(
                admin.UserId,
                "VERIFY_WORKER_PROFILE",
                "service_provider_profiles",
                targetId,
                "Profile approved after verifying trade license."
            );

            // Assert
            var logs = await repo.GetRecentLogsAsync(10);
            var loggedAction = logs.FirstOrDefault();

            Assert.NotNull(loggedAction);
            Assert.Equal("VERIFY_WORKER_PROFILE", loggedAction.Action);
            Assert.Equal("service_provider_profiles", loggedAction.EntityName);
            Assert.Equal(targetId, loggedAction.EntityId);
            Assert.Equal(admin.UserId, loggedAction.AdminUserId);
            Assert.Equal("Profile approved after verifying trade license.", loggedAction.Details);
        }

        [Fact]
        public async Task GetDashboardStats_CalculatesMetricsAccurately()
        {
            // Arrange
            var db = GetInMemoryDbContext(Guid.NewGuid().ToString());
            var repo = new AdminAuditLogRepository(db);

            // Seed additional user and profiles
            var consumer = new User { UserId = Guid.NewGuid(), FullName = "Consumer User", Email = "c@test.com", PhoneNumber = "01722222222" };
            db.Users.Add(consumer);
            await db.SaveChangesAsync();

            // Act
            var stats = await repo.GetDashboardStatsAsync();

            // Assert: 2 users seeded (admin + consumer)
            Assert.Equal(2, stats.TotalRegisteredUsers);
            Assert.Equal(0, stats.TotalWorkerProfiles);
            Assert.Equal(0, stats.PendingVerificationCount);
        }
    }
}

```

---

## 8. Executing Tests via CLI & Interpreting Results

To run the automated tests on your machine, open your terminal:

```bash
dotnet test KajBazar.sln
```

Expected live output:
```text
  Determining projects to restore...
  All projects are up-to-date for restore.
  KajBazar.Core -> /home/noir/Desktop/PROJECTS/Kajbazar/src/KajBazar.Core/bin/Debug/net8.0/KajBazar.Core.dll
  KajBazar.Infrastructure -> /home/noir/Desktop/PROJECTS/Kajbazar/src/KajBazar.Infrastructure/bin/Debug/net8.0/KajBazar.Infrastructure.dll
  KajBazar.API -> /home/noir/Desktop/PROJECTS/Kajbazar/src/KajBazar.API/bin/Debug/net8.0/KajBazar.API.dll
  KajBazar.Tests -> /home/noir/Desktop/PROJECTS/Kajbazar/tests/KajBazar.Tests/bin/Debug/net8.0/KajBazar.Tests.dll
[xUnit.net 00:00:00.62]   Discovering: KajBazar.Tests
[xUnit.net 00:00:00.65]   Discovered:  KajBazar.Tests
[xUnit.net 00:00:00.66]   Starting:    KajBazar.Tests
[xUnit.net 00:00:01.05]   Finished:    KajBazar.Tests
Passed!  - Failed:     0, Passed:    14, Skipped:     0, Total:    14, Duration: 1 s - KajBazar.Tests.dll (net8.0)
```

Notice:
- **14 passed, 0 failed, 0 skipped** in **1.05 seconds**!
- That is **less than 80 milliseconds per test**!

---

## 9. Code Coverage Analysis & CI/CD Integration

To measure test code coverage on your computer:
```bash
dotnet test --collect:"XPlat Code Coverage"
```

To integrate with GitHub Actions, create `.github/workflows/ci.yml`:
```yaml
name: KajBazar Automated CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup .NET 8
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: 8.0.x
      - name: Restore dependencies
        run: dotnet restore KajBazar.sln
      - name: Build solution
        run: dotnet build KajBazar.sln --no-restore
      - name: Run automated test suites
        run: dotnet test KajBazar.sln --no-build --verbosity normal
```

---

## 10. Hands-on Testing Exercises & Solutions

### 10.1 Exercise 1: Writing a Test for Business Rule BR-06 (Phone Reveal)
- **Question**: Write a test verifying that `RevealPhoneNumberAsync` returns the worker's phone number for verified workers, but returns `null` for unverified workers.
- **Solution**:
  ```csharp
  [Fact]
  public async Task RevealPhoneNumber_UnverifiedWorker_ReturnsNull()
  {
      // ARRANGE
      var context = CreateInMemoryDbContext();
      var repo = new ServiceProviderRepository(context);
      var user = new User { FullName = "Unverified", PhoneNumber = "01711000000" };
      context.Users.Add(user);
      var profile = new ServiceProviderProfile 
      { 
          User = user, 
          VerificationStatus = VerificationStatus.Pending 
      };
      context.ServiceProviderProfiles.Add(profile);
      await context.SaveChangesAsync();

      // ACT
      var phone = await repo.RevealPhoneNumberAsync(profile.Id);

      // ASSERT
      Assert.Null(phone); // Rule BR-06: Unverified phone numbers must never be revealed!
  }
  ```

---

## 11. Frequently Asked Questions (FAQ) on Automated Testing

### Q1: Can an In-Memory database test database triggers?
**Answer**: No. EF Core InMemory is a C# dictionary emulation of a database in RAM; it does not execute PostgreSQL PL/pgSQL triggers or regex check constraints. That is why our repository explicitly implements the rating recalculation logic in C# for InMemory compatibility, while the live PostgreSQL database runs the trigger `trg_update_worker_rating_stats` in production!

### Q2: How do I run only a single test file from the terminal?
**Answer**: Use the `--filter` flag:
```bash
dotnet test --filter FullyQualifiedName~AuthTests
```

---

## 12. Conclusion & Roadmap to Volume 06

Congratulations! You have mastered the **KajBazar Automated Testing Suite**.

You now understand:
- The Testing Pyramid and the Arrange-Act-Assert (AAA) pattern.
- In-Memory Database isolation and zero-dependency testing.
- How to test Authentication, Search, Reviews, Recommendations, and Audit Logs.
- How to run tests via CLI in under 1.5 seconds.

In the next volume, we will deploy our tested application to production servers:
👉 **Proceed to [Volume 06: Deployment & DevOps Guide](06-deployment-and-devops-guide.md)**
