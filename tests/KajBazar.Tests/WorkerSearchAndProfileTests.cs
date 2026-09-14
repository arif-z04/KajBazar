using System;
using System.Collections.Generic;
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
    public class WorkerSearchAndProfileTests
    {
        private KajBazarDbContext GetInMemoryDbContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<KajBazarDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;

            var context = new KajBazarDbContext(options);

            // Seed sample data
            var district1 = new District { DistrictId = 1, DistrictName = "Patuakhali" };
            var district2 = new District { DistrictId = 2, DistrictName = "Dhaka" };
            context.Districts.AddRange(district1, district2);

            var upazila1 = new Upazila { UpazilaId = 1, DistrictId = 1, UpazilaName = "Dumki" };
            var upazila2 = new Upazila { UpazilaId = 2, DistrictId = 1, UpazilaName = "Mirzaganj" };
            var upazila3 = new Upazila { UpazilaId = 3, DistrictId = 2, UpazilaName = "Dhanmondi" };
            context.Upazilas.AddRange(upazila1, upazila2, upazila3);

            var catElectrician = new Category { CategoryId = 1, CategoryName = "Electrician", IsActive = true };
            var catPlumber = new Category { CategoryId = 2, CategoryName = "Plumber", IsActive = true };
            context.Categories.AddRange(catElectrician, catPlumber);

            // Worker 1: Verified Electrician in Dumki, Patuakhali (Rating 4.8)
            var user1 = new User { UserId = Guid.NewGuid(), FullName = "Karim Electrician", Email = "karim@test.com", PhoneNumber = "01811111111", IsActive = true };
            var profile1 = new ServiceProviderProfile
            {
                ProfileId = Guid.NewGuid(),
                UserId = user1.UserId,
                User = user1,
                DistrictId = 1,
                District = district1,
                UpazilaId = 1,
                Upazila = upazila1,
                Bio = "Master Electrician",
                ExperienceYears = 8,
                HourlyRate = 350,
                VerificationStatus = VerificationStatus.Verified,
                AverageRating = 4.8m,
                TotalReviews = 5
            };
            var wc1 = new WorkerCategory { ProfileId = profile1.ProfileId, CategoryId = 1, Category = catElectrician, Profile = profile1 };
            profile1.WorkerCategories.Add(wc1);

            // Worker 2: Pending Electrician in Dumki, Patuakhali
            var user2 = new User { UserId = Guid.NewGuid(), FullName = "Pending Worker", Email = "pending@test.com", PhoneNumber = "01822222222", IsActive = true };
            var profile2 = new ServiceProviderProfile
            {
                ProfileId = Guid.NewGuid(),
                UserId = user2.UserId,
                User = user2,
                DistrictId = 1,
                District = district1,
                UpazilaId = 1,
                Upazila = upazila1,
                Bio = "Pending Worker",
                ExperienceYears = 3,
                HourlyRate = 250,
                VerificationStatus = VerificationStatus.Pending,
                AverageRating = 0m,
                TotalReviews = 0
            };
            var wc2 = new WorkerCategory { ProfileId = profile2.ProfileId, CategoryId = 1, Category = catElectrician, Profile = profile2 };
            profile2.WorkerCategories.Add(wc2);

            // Worker 3: Verified Plumber in Dhanmondi, Dhaka (Rating 4.0)
            var user3 = new User { UserId = Guid.NewGuid(), FullName = "Rahim Plumber", Email = "rahim@test.com", PhoneNumber = "01833333333", IsActive = true };
            var profile3 = new ServiceProviderProfile
            {
                ProfileId = Guid.NewGuid(),
                UserId = user3.UserId,
                User = user3,
                DistrictId = 2,
                District = district2,
                UpazilaId = 3,
                Upazila = upazila3,
                Bio = "Licensed Plumber",
                ExperienceYears = 5,
                HourlyRate = 400,
                VerificationStatus = VerificationStatus.Verified,
                AverageRating = 4.0m,
                TotalReviews = 2
            };
            var wc3 = new WorkerCategory { ProfileId = profile3.ProfileId, CategoryId = 2, Category = catPlumber, Profile = profile3 };
            profile3.WorkerCategories.Add(wc3);

            context.Users.AddRange(user1, user2, user3);
            context.ServiceProviderProfiles.AddRange(profile1, profile2, profile3);
            context.SaveChanges();

            return context;
        }

        [Fact]
        public async Task SearchWorkers_ReturnsOnlyVerifiedWorkers_BR03()
        {
            // Arrange
            var db = GetInMemoryDbContext(Guid.NewGuid().ToString());
            var repo = new ServiceProviderRepository(db);

            // Act
            var (workers, totalCount) = await repo.SearchWorkersAsync(null, null, null, null);

            // Assert: Worker 2 is PENDING, so only 2 verified workers must be returned
            Assert.Equal(2, totalCount);
            Assert.All(workers, w => Assert.Equal(VerificationStatus.Verified, w.VerificationStatus));
        }

        [Fact]
        public async Task SearchWorkers_FiltersByCategoryCorrectly_BR05()
        {
            // Arrange
            var db = GetInMemoryDbContext(Guid.NewGuid().ToString());
            var repo = new ServiceProviderRepository(db);

            // Act
            var (workers, totalCount) = await repo.SearchWorkersAsync("Electrician", null, null, null);

            // Assert: Only Karim Electrician should be returned
            Assert.Equal(1, totalCount);
            Assert.Equal("Karim Electrician", workers.First().User.FullName);
        }

        [Fact]
        public async Task SearchWorkers_FiltersByDistrictAndUpazila_BR05()
        {
            // Arrange
            var db = GetInMemoryDbContext(Guid.NewGuid().ToString());
            var repo = new ServiceProviderRepository(db);

            // Act: Patuakhali (districtId = 1), Dumki (upazilaId = 1)
            var (workers, totalCount) = await repo.SearchWorkersAsync(null, 1, 1, null);

            // Assert
            Assert.Equal(1, totalCount);
            Assert.Equal("Dumki", workers.First().Upazila.UpazilaName);
        }

        [Fact]
        public async Task SearchWorkers_FiltersByMinimumRating()
        {
            // Arrange
            var db = GetInMemoryDbContext(Guid.NewGuid().ToString());
            var repo = new ServiceProviderRepository(db);

            // Act: MinRating 4.5
            var (workers, totalCount) = await repo.SearchWorkersAsync(null, null, null, 4.5m);

            // Assert: Only Karim (4.8) returned, Rahim (4.0) excluded
            Assert.Equal(1, totalCount);
            Assert.Equal(4.8m, workers.First().AverageRating);
        }

        [Fact]
        public async Task UpdateStatusAsync_SetsVerificationStatusAndTimestamp_BR10()
        {
            // Arrange
            var db = GetInMemoryDbContext(Guid.NewGuid().ToString());
            var repo = new ServiceProviderRepository(db);
            var pendingWorker = await db.ServiceProviderProfiles.FirstAsync(w => w.VerificationStatus == VerificationStatus.Pending);

            // Act: Admin approves worker
            await repo.UpdateStatusAsync(pendingWorker.ProfileId, VerificationStatus.Verified);

            // Assert
            var updated = await repo.GetByIdAsync(pendingWorker.ProfileId);
            Assert.NotNull(updated);
            Assert.Equal(VerificationStatus.Verified, updated.VerificationStatus);
            Assert.NotNull(updated.VerifiedAt);
        }
    }
}
