using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KajBazar.Core.Entities;
using KajBazar.Core.Enums;

namespace KajBazar.Core.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(Guid id);
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByPhoneAsync(string phone);
        Task AddAsync(User user);
        Task UpdateAsync(User user);
    }

    public interface IServiceProviderRepository
    {
        Task<ServiceProviderProfile?> GetByIdAsync(Guid profileId);
        Task<ServiceProviderProfile?> GetByUserIdAsync(Guid userId);
        Task<IEnumerable<ServiceProviderProfile>> SearchWorkersAsync(
            string? categoryName, 
            int? districtId, 
            int? upazilaId, 
            decimal? minRating, 
            int page = 1, 
            int pageSize = 10);
        Task AddAsync(ServiceProviderProfile profile);
        Task UpdateStatusAsync(Guid profileId, VerificationStatus status);
    }

    public interface IReviewRepository
    {
        Task<Review?> GetByIdAsync(Guid reviewId);
        Task<IEnumerable<Review>> GetByWorkerProfileIdAsync(Guid workerProfileId);
        Task<bool> HasUserReviewedWorkerAsync(Guid consumerId, Guid workerProfileId);
        Task AddOrUpdateReviewAsync(Review review);
    }

    public interface IRecommendationRepository
    {
        Task<CommunityRecommendation?> GetByIdAsync(Guid recommendationId);
        Task<IEnumerable<CommunityRecommendation>> GetPendingAsync();
        Task AddAsync(CommunityRecommendation recommendation);
        Task UpdateStatusAsync(Guid recommendationId, RecommendationStatus status, Guid adminId);
    }
}
