# KajBazar - Class Diagrams

This document contains UML Class Diagrams for **KajBazar**, illustrating domain entities, service interfaces, repository abstractions, and API controllers.

---

## 1. Domain Model Class Diagram

```mermaid
classDiagram
    class User {
        +Guid UserId
        +string FullName
        +string Email
        +string PhoneNumber
        +string PasswordHash
        +bool IsActive
        +DateTime CreatedAt
        +DateTime UpdatedAt
        +ICollection~UserRole~ UserRoles
        +ServiceProviderProfile Profile
    }

    class Role {
        +int RoleId
        +string RoleName
        +ICollection~UserRole~ UserRoles
    }

    class UserRole {
        +Guid UserId
        +User User
        +int RoleId
        +Role Role
    }

    class ServiceProviderProfile {
        +Guid ProfileId
        +Guid UserId
        +User User
        +int DistrictId
        +District District
        +int UpazilaId
        +Upazila Upazila
        +string Bio
        +int ExperienceYears
        +decimal? HourlyRate
        +VerificationStatus VerificationStatus
        +DateTime? VerifiedAt
        +decimal AverageRating
        +int TotalReviews
        +ICollection~WorkerCategory~ WorkerCategories
        +ICollection~Review~ Reviews
    }

    class Category {
        +int CategoryId
        +string CategoryName
        +string Description
        +string IconUrl
        +bool IsActive
        +ICollection~WorkerCategory~ WorkerCategories
    }

    class WorkerCategory {
        +Guid ProfileId
        +ServiceProviderProfile Profile
        +int CategoryId
        +Category Category
    }

    class District {
        +int DistrictId
        +string DistrictName
        +ICollection~Upazila~ Upazilas
    }

    class Upazila {
        +int UpazilaId
        +int DistrictId
        +District District
        +string UpazilaName
    }

    class Review {
        +Guid ReviewId
        +Guid ConsumerId
        +User Consumer
        +Guid WorkerProfileId
        +ServiceProviderProfile WorkerProfile
        +int Rating
        +string Comment
        +DateTime CreatedAt
    }

    class CommunityRecommendation {
        +Guid RecommendationId
        +Guid RecommendedByUserId
        +User RecommendedByUser
        +string WorkerName
        +string PhoneNumber
        +int CategoryId
        +Category Category
        +int DistrictId
        +int UpazilaId
        +string Notes
        +RecommendationStatus Status
        +Guid? ReviewedByAdminId
        +DateTime CreatedAt
    }

    User "1" <--> "0..1" ServiceProviderProfile : has
    User "1" <--> "0..*" UserRole : belongs
    Role "1" <--> "0..*" UserRole : assigned
    ServiceProviderProfile "1" <--> "0..*" WorkerCategory : operates
    Category "1" <--> "0..*" WorkerCategory : includes
    District "1" <--> "0..*" Upazila : contains
    ServiceProviderProfile "1" <--> "0..*" Review : receives
    User "1" <--> "0..*" Review : writes
    User "1" <--> "0..*" CommunityRecommendation : submits
```

---

## 2. API Controllers & Repository Architecture Diagram

```mermaid
classDiagram
    class AuthController {
        -IUserRepository _userRepository
        -IJwtService _jwtService
        +Register(RegisterDto dto) Task~IActionResult~
        +Login(LoginDto dto) Task~IActionResult~
    }

    class WorkersController {
        -IServiceProviderRepository _workerRepository
        +SearchWorkers(WorkerSearchFilterDto filter) Task~IActionResult~
        +GetWorkerById(Guid id) Task~IActionResult~
        +UpdateProfile(Guid id, UpdateProfileDto dto) Task~IActionResult~
    }

    class ReviewsController {
        -IReviewRepository _reviewRepository
        +AddReview(CreateReviewDto dto) Task~IActionResult~
        +GetWorkerReviews(Guid workerProfileId) Task~IActionResult~
    }

    class AdminController {
        -IServiceProviderRepository _workerRepository
        -IRecommendationRepository _recommendationRepository
        +ApproveWorker(Guid profileId) Task~IActionResult~
        +RejectWorker(Guid profileId, string reason) Task~IActionResult~
        +ApproveRecommendation(Guid recommendationId) Task~IActionResult~
    }

    class IUserRepository {
        <<interface>>
        +GetByIdAsync(Guid id) Task~User~
        +GetByEmailAsync(string email) Task~User~
        +AddAsync(User user) Task
    }

    class IServiceProviderRepository {
        <<interface>>
        +SearchAsync(WorkerSearchFilter filter) Task~IEnumerable~ServiceProviderProfile~~
        +GetByIdAsync(Guid id) Task~ServiceProviderProfile~
        +UpdateVerificationStatusAsync(Guid id, VerificationStatus status) Task
    }

    class IReviewRepository {
        <<interface>>
        +AddReviewAsync(Review review) Task
        +GetByWorkerProfileIdAsync(Guid profileId) Task~IEnumerable~Review~~
        +ExistsAsync(Guid consumerId, Guid workerProfileId) Task~bool~
    }

    AuthController --> IUserRepository
    WorkersController --> IServiceProviderRepository
    ReviewsController --> IReviewRepository
    AdminController --> IServiceProviderRepository
```
