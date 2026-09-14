using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KajBazar.Core.DTOs;
using KajBazar.Core.Entities;
using KajBazar.Core.Enums;

namespace KajBazar.Core.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(Guid id);
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByPhoneAsync(string phone);
        Task<User?> GetWithRolesByEmailAsync(string email);
        Task<User?> GetWithRolesByIdAsync(Guid id);
        Task AddAsync(User user);
        Task UpdateAsync(User user);
        Task AssignRoleAsync(Guid userId, string roleName);
        Task<int> GetTotalUsersCountAsync();
    }

    public interface IServiceProviderRepository
    {
        Task<ServiceProviderProfile?> GetByIdAsync(Guid profileId);
        Task<ServiceProviderProfile?> GetByUserIdAsync(Guid userId);
        Task<(IEnumerable<ServiceProviderProfile> Workers, int TotalCount)> SearchWorkersAsync(
            string? categoryName, 
            int? districtId, 
            int? upazilaId, 
            decimal? minRating, 
            int page = 1, 
            int pageSize = 12);
        Task<IEnumerable<ServiceProviderProfile>> GetPendingWorkersAsync();
        Task AddAsync(ServiceProviderProfile profile);
        Task UpdateAsync(ServiceProviderProfile profile);
        Task UpdateStatusAsync(Guid profileId, VerificationStatus status);
        Task SetCategoriesAsync(Guid profileId, IEnumerable<int> categoryIds);
        Task<int> GetTotalWorkersCountAsync();
        Task<int> GetVerifiedWorkersCountAsync();
        Task<int> GetPendingVerificationCountAsync();
    }

    public interface IReviewRepository
    {
        Task<Review?> GetByIdAsync(Guid reviewId);
        Task<IEnumerable<Review>> GetByWorkerProfileIdAsync(Guid workerProfileId);
        Task<Review?> GetByUserAndWorkerAsync(Guid consumerId, Guid workerProfileId);
        Task<bool> HasUserReviewedWorkerAsync(Guid consumerId, Guid workerProfileId);
        Task AddOrUpdateReviewAsync(Review review);
        Task<int> GetTotalReviewsCountAsync();
    }

    public interface IRecommendationRepository
    {
        Task<CommunityRecommendation?> GetByIdAsync(Guid recommendationId);
        Task<IEnumerable<CommunityRecommendation>> GetPendingAsync();
        Task<IEnumerable<CommunityRecommendation>> GetByUserIdAsync(Guid userId);
        Task AddAsync(CommunityRecommendation recommendation);
        Task UpdateStatusAsync(Guid recommendationId, RecommendationStatus status, Guid adminId);
        Task<int> GetPendingRecommendationCountAsync();
    }

    public interface ICategoryRepository
    {
        Task<IEnumerable<Category>> GetAllActiveAsync();
        Task<Category?> GetByIdAsync(int categoryId);
        Task<Category?> GetByNameAsync(string categoryName);
        Task AddAsync(Category category);
    }

    public interface IGeographyRepository
    {
        Task<IEnumerable<District>> GetAllDistrictsAsync();
        Task<IEnumerable<Upazila>> GetUpazilasByDistrictIdAsync(int districtId);
        Task<District?> GetDistrictByIdAsync(int districtId);
        Task<Upazila?> GetUpazilaByIdAsync(int upazilaId);
    }

    public interface IAdminAuditLogRepository
    {
        Task LogAsync(Guid adminUserId, string action, string entityName, Guid? entityId, string? details);
        Task<IEnumerable<AdminAuditLog>> GetRecentLogsAsync(int count = 50);
        Task<AdminDashboardStatsDto> GetDashboardStatsAsync();
    }

    public interface IAuthService
    {
        string HashPassword(string password);
        bool VerifyPassword(string password, string passwordHash);
        string GenerateJwtToken(User user, string roleName);
    }
}
