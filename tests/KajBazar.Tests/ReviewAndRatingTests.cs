using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Xunit;
using KajBazar.Core.Entities;
using KajBazar.Core.Enums;
using KajBazar.Infrastructure.Data;
using KajBazar.Infrastructure.Repositories;

namespace KajBazar.Tests
{
    public class ReviewAndRatingTests
    {
        private KajBazarDbContext GetInMemoryDbContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<KajBazarDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;

            var context = new KajBazarDbContext(options);

            var workerUser = new User
            {
                UserId = Guid.NewGuid(),
                FullName = "Rahim Plumber",
                Email = "rahim@plumb.com",
                PhoneNumber = "01811111111"
            };

            var district = new District { DistrictId = 1, DistrictName = "Patuakhali" };
            var upazila = new Upazila { UpazilaId = 1, DistrictId = 1, UpazilaName = "Dumki" };

            var profile = new ServiceProviderProfile
            {
                ProfileId = Guid.NewGuid(),
                UserId = workerUser.UserId,
                User = workerUser,
                DistrictId = 1,
                District = district,
                UpazilaId = 1,
                Upazila = upazila,
                AverageRating = 0m,
                TotalReviews = 0,
                VerificationStatus = VerificationStatus.Verified
            };

            var consumer1 = new User { UserId = Guid.NewGuid(), FullName = "Leon Consumer", Email = "leon@test.com", PhoneNumber = "01711111111" };
            var consumer2 = new User { UserId = Guid.NewGuid(), FullName = "Tanvir Consumer", Email = "tanvir@test.com", PhoneNumber = "01722222222" };

            context.Users.AddRange(workerUser, consumer1, consumer2);
            context.Districts.Add(district);
            context.Upazilas.Add(upazila);
            context.ServiceProviderProfiles.Add(profile);
            context.SaveChanges();

            return context;
        }

        [Fact]
        public async Task AddReview_AutomaticallyRecalculatesWorkerAverageRatingAndTotalCount()
        {
            // Arrange
            var db = GetInMemoryDbContext(Guid.NewGuid().ToString());
            var repo = new ReviewRepository(db);

            var worker = await db.ServiceProviderProfiles.FirstAsync();
            var consumer1 = await db.Users.FirstAsync(u => u.Email == "leon@test.com");
            var consumer2 = await db.Users.FirstAsync(u => u.Email == "tanvir@test.com");

            // Act 1: Consumer 1 adds 5-star review
            var review1 = new Review
            {
                ReviewId = Guid.NewGuid(),
                ConsumerId = consumer1.UserId,
                WorkerProfileId = worker.ProfileId,
                Rating = 5,
                Comment = "Great work!"
            };
            await repo.AddOrUpdateReviewAsync(review1);

            // Assert 1
            var updatedWorker1 = await db.ServiceProviderProfiles.FirstAsync(w => w.ProfileId == worker.ProfileId);
            Assert.Equal(1, updatedWorker1.TotalReviews);
            Assert.Equal(5.00m, updatedWorker1.AverageRating);

            // Act 2: Consumer 2 adds 4-star review
            var review2 = new Review
            {
                ReviewId = Guid.NewGuid(),
                ConsumerId = consumer2.UserId,
                WorkerProfileId = worker.ProfileId,
                Rating = 4,
                Comment = "Very good."
            };
            await repo.AddOrUpdateReviewAsync(review2);

            // Assert 2: Average of 5 and 4 = 4.50
            var updatedWorker2 = await db.ServiceProviderProfiles.FirstAsync(w => w.ProfileId == worker.ProfileId);
            Assert.Equal(2, updatedWorker2.TotalReviews);
            Assert.Equal(4.50m, updatedWorker2.AverageRating);
        }

        [Fact]
        public async Task AddOrUpdateReview_WhenReviewAlreadyExists_UpdatesExistingReview_BR08()
        {
            // Arrange
            var db = GetInMemoryDbContext(Guid.NewGuid().ToString());
            var repo = new ReviewRepository(db);

            var worker = await db.ServiceProviderProfiles.FirstAsync();
            var consumer = await db.Users.FirstAsync(u => u.Email == "leon@test.com");

            // First review: 3 stars
            var reviewInitial = new Review
            {
                ReviewId = Guid.NewGuid(),
                ConsumerId = consumer.UserId,
                WorkerProfileId = worker.ProfileId,
                Rating = 3,
                Comment = "Average service"
            };
            await repo.AddOrUpdateReviewAsync(reviewInitial);

            // Verify initial review
            var countBefore = await db.Reviews.CountAsync();
            Assert.Equal(1, countBefore);

            // Act: Consumer submits an updated review for the same worker (5 stars)
            var reviewUpdated = new Review
            {
                ReviewId = Guid.NewGuid(),
                ConsumerId = consumer.UserId,
                WorkerProfileId = worker.ProfileId,
                Rating = 5,
                Comment = "Problem solved completely on second visit!"
            };
            await repo.AddOrUpdateReviewAsync(reviewUpdated);

            // Assert: Total review count should STILL be 1 (no duplicate row created - BR-08)
            var countAfter = await db.Reviews.CountAsync();
            Assert.Equal(1, countAfter);

            var savedReview = await repo.GetByUserAndWorkerAsync(consumer.UserId, worker.ProfileId);
            Assert.NotNull(savedReview);
            Assert.Equal(5, savedReview.Rating);
            Assert.Equal("Problem solved completely on second visit!", savedReview.Comment);

            // Worker rating should now be 5.00
            var workerAfter = await db.ServiceProviderProfiles.FirstAsync(w => w.ProfileId == worker.ProfileId);
            Assert.Equal(5.00m, workerAfter.AverageRating);
            Assert.Equal(1, workerAfter.TotalReviews);
        }
    }
}
