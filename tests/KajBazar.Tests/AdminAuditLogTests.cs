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
