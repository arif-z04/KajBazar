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
