using Microsoft.EntityFrameworkCore;
using KajBazar.Core.Entities;

namespace KajBazar.Infrastructure.Data
{
    /// <summary>
    /// Entity Framework Core DbContext mapping PostgreSQL tables to KajBazar domain entities.
    /// </summary>
    public class KajBazarDbContext : DbContext
    {
        public KajBazarDbContext(DbContextOptions<KajBazarDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<UserRole> UserRoles => Set<UserRole>();
        public DbSet<District> Districts => Set<District>();
        public DbSet<Upazila> Upazilas => Set<Upazila>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<ServiceProviderProfile> ServiceProviderProfiles => Set<ServiceProviderProfile>();
        public DbSet<WorkerCategory> WorkerCategories => Set<WorkerCategory>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<CommunityRecommendation> CommunityRecommendations => Set<CommunityRecommendation>();
        public DbSet<Report> Reports => Set<Report>();
        public DbSet<AdminAuditLog> AdminAuditLogs => Set<AdminAuditLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Composite Primary Key for UserRoles
            modelBuilder.Entity<UserRole>()
                .HasKey(ur => new { ur.UserId, ur.RoleId });

            // Composite Primary Key for WorkerCategories
            modelBuilder.Entity<WorkerCategory>()
                .HasKey(wc => new { wc.ProfileId, wc.CategoryId });

            // Unique Constraint for Review (1 review per consumer per worker - BR-08)
            modelBuilder.Entity<Review>()
                .HasIndex(r => new { r.ConsumerId, r.WorkerProfileId })
                .IsUnique();

            // Additional indexes
            modelBuilder.Entity<ServiceProviderProfile>()
                .HasIndex(sp => new { sp.VerificationStatus, sp.DistrictId, sp.UpazilaId });
        }
    }
}
