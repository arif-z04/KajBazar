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
