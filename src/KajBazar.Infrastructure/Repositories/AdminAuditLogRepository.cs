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
