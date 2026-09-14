# KajBazar - Class Diagrams

This document contains UML Class Diagrams for **KajBazar**, illustrating domain entities, service interfaces, repository abstractions, and API controllers.

---

## 1. Domain Model Class Diagram

```mermaid
classDiagram
    class User {
        +Guid Id
        +string FullName
        +string Email
        +string PhoneNumber
        +string PasswordHash
        +int RoleId
        +Role Role
        +int? DistrictId
        +int? UpazilaId
        +bool IsActive
        +DateTime CreatedAt
        +DateTime UpdatedAt
        +ServiceProviderProfile? ServiceProvider
        +ICollection~Review~ Reviews
    }

    class Role {
        +int Id
        +string Name
        +string? Description
        +DateTime CreatedAt
        +ICollection~User~ Users
    }

    class ServiceProviderProfile {
        +Guid Id
        +Guid UserId
        +User? User
        +string? Bio
        +int YearsExperience
        +decimal HourlyRate
        +string AvailabilityStatus
        +string VerificationStatus
        +string? NationalIdNumber
        +int DistrictId
        +District? District
        +int UpazilaId
        +Upazila? Upazila
        +string? AddressLine
        +decimal AverageRating
        +int TotalReviews
        +DateTime? VerifiedAt
        +Guid? VerifiedByAdminId
        +DateTime CreatedAt
        +DateTime UpdatedAt
        +ICollection~WorkerCategory~ WorkerCategories
        +ICollection~Review~ Reviews
    }

    class Category {
        +int Id
        +string Name
        +string Slug
        +string? Description
        +string IconName
        +bool IsActive
        +DateTime CreatedAt
        +ICollection~WorkerCategory~ WorkerCategories
    }

    class WorkerCategory {
        +int Id
        +Guid WorkerId
        +ServiceProviderProfile? Worker
        +int CategoryId
        +Category? Category
        +bool IsPrimary
        +DateTime CreatedAt
    }

    class District {
        +int Id
        +string Name
        +string Division
        +DateTime CreatedAt
        +ICollection~Upazila~ Upazilas
    }

    class Upazila {
        +int Id
        +int DistrictId
        +District? District
        +string Name
        +DateTime CreatedAt
    }

    class Review {
        +Guid Id
        +Guid WorkerId
        +ServiceProviderProfile? Worker
        +Guid ConsumerId
        +User? Consumer
        +int Rating
        +string? Comment
        +bool IsFlagged
        +DateTime CreatedAt
        +DateTime UpdatedAt
    }

    class Recommendation {
        +Guid Id
        +Guid? RecommenderUserId
        +User? RecommenderUser
        +string WorkerName
        +string PhoneNumber
        +string Trade
        +int? DistrictId
        +int? UpazilaId
        +string? Notes
        +string Status
        +Guid? ReviewedByAdminId
        +string? ReviewNotes
        +DateTime CreatedAt
        +DateTime UpdatedAt
    }

    class AdminAuditLog {
        +Guid Id
        +Guid AdminUserId
        +User? AdminUser
        +string Action
        +string EntityName
        +string EntityId
        +string? OldValues
        +string? NewValues
        +string? IpAddress
        +string? UserAgent
        +DateTime CreatedAt
    }

    User "1" --> "1" Role : Has
    User "1" --> "0..1" ServiceProviderProfile : Has Profile
    ServiceProviderProfile "1" --> "*" WorkerCategory : Specializes
    Category "1" --> "*" WorkerCategory : Mapped
    District "1" --> "*" Upazila : Contains
    ServiceProviderProfile "*" --> "1" District : Located In
    ServiceProviderProfile "*" --> "1" Upazila : Operating In
    ServiceProviderProfile "1" --> "*" Review : Receives
    User "1" --> "*" Review : Writes
    User "1" --> "*" Recommendation : Submits
    User "1" --> "*" AdminAuditLog : Audits
```

---

## 2. Architecture & Service Layer Class Diagram

```mermaid
classDiagram
    class IUserRepository {
        <<interface>>
        +GetByIdAsync(id) Task~User?~
        +GetByEmailAsync(email) Task~User?~
        +CreateAsync(user) Task~User~
        +UpdateAsync(user) Task
    }

    class IServiceProviderRepository {
        <<interface>>
        +GetByIdAsync(id) Task~ServiceProviderProfile?~
        +GetByUserIdAsync(userId) Task~ServiceProviderProfile?~
        +SearchWorkersAsync(filter) Task~List~WorkerSummaryDto~~
        +CreateOrUpdateProfileAsync(profile, categoryIds) Task~ServiceProviderProfile~
        +VerifyWorkerAsync(id, adminId) Task~bool~
        +RejectWorkerAsync(id, adminId, reason) Task~bool~
        +SuspendWorkerAsync(id, adminId, reason) Task~bool~
    }

    class IReviewRepository {
        <<interface>>
        +GetByWorkerIdAsync(workerId) Task~List~ReviewDto~~
        +CreateOrUpdateReviewAsync(workerId, consumerId, rating, comment) Task~Review~
        +DeleteReviewAsync(reviewId) Task~bool~
    }

    class IRecommendationRepository {
        <<interface>>
        +CreateAsync(recommendation) Task~Recommendation~
        +GetAllAsync(status) Task~List~RecommendationDto~~
        +UpdateStatusAsync(id, status, adminId, notes) Task~bool~
    }

    class IAuthService {
        <<interface>>
        +RegisterAsync(dto) Task~AuthResponseDto~
        +LoginAsync(dto) Task~AuthResponseDto~
    }

    class AuthService {
        -IUserRepository _userRepo
        -IConfiguration _config
        +RegisterAsync(dto) Task~AuthResponseDto~
        +LoginAsync(dto) Task~AuthResponseDto~
    }

    class WorkersController {
        -IServiceProviderRepository _workerRepo
        +GetWorkers(filter) Task~IActionResult~
        +GetWorkerById(id) Task~IActionResult~
        +CreateOrUpdateProfile(dto) Task~IActionResult~
    }

    class ReviewsController {
        -IReviewRepository _reviewRepo
        +CreateReview(dto) Task~IActionResult~
        +GetWorkerReviews(workerId) Task~IActionResult~
        +DeleteReview(id) Task~IActionResult~
    }

    IAuthService <|.. AuthService
    WorkersController --> IServiceProviderRepository
    ReviewsController --> IReviewRepository
```
