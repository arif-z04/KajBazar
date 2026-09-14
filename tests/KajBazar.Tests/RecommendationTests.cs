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
