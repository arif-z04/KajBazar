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
