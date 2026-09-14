using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using KajBazar.Core.Entities;
using KajBazar.Core.Enums;

namespace KajBazar.Infrastructure.Data
{
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

            // Configure Enum Value Converters to match PostgreSQL CHECK constraints (Uppercase)
            var verificationConverter = new ValueConverter<VerificationStatus, string>(
                v => v.ToString().ToUpperInvariant(),
                v => Enum.Parse<VerificationStatus>(v, true)
            );

            var recommendationConverter = new ValueConverter<RecommendationStatus, string>(
                v => v.ToString().ToUpperInvariant(),
                v => Enum.Parse<RecommendationStatus>(v, true)
            );

            var reportConverter = new ValueConverter<ReportStatus, string>(
                v => v == ReportStatus.UnderReview ? "UNDER_REVIEW" : v.ToString().ToUpperInvariant(),
                v => v == "UNDER_REVIEW" ? ReportStatus.UnderReview : Enum.Parse<ReportStatus>(v, true)
            );

            // 1. Roles
            modelBuilder.Entity<Role>(entity =>
            {
                entity.ToTable("roles");
                entity.HasKey(e => e.RoleId);
                entity.Property(e => e.RoleId).HasColumnName("role_id").ValueGeneratedOnAdd();
                entity.Property(e => e.RoleName).HasColumnName("role_name").HasMaxLength(50).IsRequired();
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.HasIndex(e => e.RoleName).IsUnique();
            });

            // 2. Users
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");
                entity.HasKey(e => e.UserId);
                entity.Property(e => e.UserId).HasColumnName("user_id").ValueGeneratedOnAdd();
                entity.Property(e => e.FullName).HasColumnName("full_name").HasMaxLength(100).IsRequired();
                entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(150).IsRequired();
                entity.Property(e => e.PhoneNumber).HasColumnName("phone_number").HasMaxLength(20).IsRequired();
                entity.Property(e => e.PasswordHash).HasColumnName("password_hash").HasMaxLength(255).IsRequired();
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.PhoneNumber).IsUnique();
            });

            // 3. UserRoles
            modelBuilder.Entity<UserRole>(entity =>
            {
                entity.ToTable("user_roles");
                entity.HasKey(ur => new { ur.UserId, ur.RoleId });
                entity.Property(ur => ur.UserId).HasColumnName("user_id");
                entity.Property(ur => ur.RoleId).HasColumnName("role_id");

                entity.HasOne(ur => ur.User)
                    .WithMany(u => u.UserRoles)
                    .HasForeignKey(ur => ur.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ur => ur.Role)
                    .WithMany(r => r.UserRoles)
                    .HasForeignKey(ur => ur.RoleId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // 4. Districts
            modelBuilder.Entity<District>(entity =>
            {
                entity.ToTable("districts");
                entity.HasKey(d => d.DistrictId);
                entity.Property(d => d.DistrictId).HasColumnName("district_id").ValueGeneratedOnAdd();
                entity.Property(d => d.DistrictName).HasColumnName("district_name").HasMaxLength(100).IsRequired();
                entity.HasIndex(d => d.DistrictName).IsUnique();
            });

            // 5. Upazilas
            modelBuilder.Entity<Upazila>(entity =>
            {
                entity.ToTable("upazilas");
                entity.HasKey(u => u.UpazilaId);
                entity.Property(u => u.UpazilaId).HasColumnName("upazila_id").ValueGeneratedOnAdd();
                entity.Property(u => u.DistrictId).HasColumnName("district_id");
                entity.Property(u => u.UpazilaName).HasColumnName("upazila_name").HasMaxLength(100).IsRequired();

                entity.HasOne(u => u.District)
                    .WithMany(d => d.Upazilas)
                    .HasForeignKey(u => u.DistrictId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(u => new { u.DistrictId, u.UpazilaName }).IsUnique();
            });

            // 6. Categories
            modelBuilder.Entity<Category>(entity =>
            {
                entity.ToTable("categories");
                entity.HasKey(c => c.CategoryId);
                entity.Property(c => c.CategoryId).HasColumnName("category_id").ValueGeneratedOnAdd();
                entity.Property(c => c.CategoryName).HasColumnName("category_name").HasMaxLength(100).IsRequired();
                entity.Property(c => c.Description).HasColumnName("description");
                entity.Property(c => c.IconUrl).HasColumnName("icon_url").HasMaxLength(255);
                entity.Property(c => c.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(c => c.CreatedAt).HasColumnName("created_at");
                entity.HasIndex(c => c.CategoryName).IsUnique();
            });

            // 7. ServiceProviderProfiles
            modelBuilder.Entity<ServiceProviderProfile>(entity =>
            {
                entity.ToTable("service_provider_profiles");
                entity.HasKey(sp => sp.ProfileId);
                entity.Property(sp => sp.ProfileId).HasColumnName("profile_id").ValueGeneratedOnAdd();
                entity.Property(sp => sp.UserId).HasColumnName("user_id");
                entity.Property(sp => sp.DistrictId).HasColumnName("district_id");
                entity.Property(sp => sp.UpazilaId).HasColumnName("upazila_id");
                entity.Property(sp => sp.Bio).HasColumnName("bio");
                entity.Property(sp => sp.ExperienceYears).HasColumnName("experience_years").HasDefaultValue(0);
                entity.Property(sp => sp.HourlyRate).HasColumnName("hourly_rate").HasColumnType("numeric(10,2)");
                entity.Property(sp => sp.VerificationStatus)
                    .HasColumnName("verification_status")
                    .HasConversion(verificationConverter)
                    .HasMaxLength(20);
                entity.Property(sp => sp.VerifiedAt).HasColumnName("verified_at");
                entity.Property(sp => sp.AverageRating).HasColumnName("average_rating").HasColumnType("numeric(3,2)").HasDefaultValue(0.00m);
                entity.Property(sp => sp.TotalReviews).HasColumnName("total_reviews").HasDefaultValue(0);
                entity.Property(sp => sp.CreatedAt).HasColumnName("created_at");
                entity.Property(sp => sp.UpdatedAt).HasColumnName("updated_at");

                entity.HasOne(sp => sp.User)
                    .WithOne(u => u.ServiceProviderProfile)
                    .HasForeignKey<ServiceProviderProfile>(sp => sp.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(sp => sp.District)
                    .WithMany(d => d.Profiles)
                    .HasForeignKey(sp => sp.DistrictId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(sp => sp.Upazila)
                    .WithMany(u => u.Profiles)
                    .HasForeignKey(sp => sp.UpazilaId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(sp => new { sp.VerificationStatus, sp.DistrictId, sp.UpazilaId });
            });

            // 8. WorkerCategories
            modelBuilder.Entity<WorkerCategory>(entity =>
            {
                entity.ToTable("worker_categories");
                entity.HasKey(wc => new { wc.ProfileId, wc.CategoryId });
                entity.Property(wc => wc.ProfileId).HasColumnName("profile_id");
                entity.Property(wc => wc.CategoryId).HasColumnName("category_id");

                entity.HasOne(wc => wc.Profile)
                    .WithMany(p => p.WorkerCategories)
                    .HasForeignKey(wc => wc.ProfileId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(wc => wc.Category)
                    .WithMany(c => c.WorkerCategories)
                    .HasForeignKey(wc => wc.CategoryId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // 9. Reviews
            modelBuilder.Entity<Review>(entity =>
            {
                entity.ToTable("reviews");
                entity.HasKey(r => r.ReviewId);
                entity.Property(r => r.ReviewId).HasColumnName("review_id").ValueGeneratedOnAdd();
                entity.Property(r => r.ConsumerId).HasColumnName("consumer_id");
                entity.Property(r => r.WorkerProfileId).HasColumnName("worker_profile_id");
                entity.Property(r => r.Rating).HasColumnName("rating");
                entity.Property(r => r.Comment).HasColumnName("comment");
                entity.Property(r => r.CreatedAt).HasColumnName("created_at");
                entity.Property(r => r.UpdatedAt).HasColumnName("updated_at");

                entity.HasOne(r => r.Consumer)
                    .WithMany(u => u.ReviewsWritten)
                    .HasForeignKey(r => r.ConsumerId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(r => r.WorkerProfile)
                    .WithMany(p => p.Reviews)
                    .HasForeignKey(r => r.WorkerProfileId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Enforce BR-08 (Unique review per consumer per worker)
                entity.HasIndex(r => new { r.ConsumerId, r.WorkerProfileId }).IsUnique();
                entity.HasIndex(r => new { r.WorkerProfileId, r.Rating });
            });

            // 10. CommunityRecommendations
            modelBuilder.Entity<CommunityRecommendation>(entity =>
            {
                entity.ToTable("community_recommendations");
                entity.HasKey(cr => cr.RecommendationId);
                entity.Property(cr => cr.RecommendationId).HasColumnName("recommendation_id").ValueGeneratedOnAdd();
                entity.Property(cr => cr.RecommendedByUserId).HasColumnName("recommended_by_user_id");
                entity.Property(cr => cr.WorkerName).HasColumnName("worker_name").HasMaxLength(100).IsRequired();
                entity.Property(cr => cr.PhoneNumber).HasColumnName("phone_number").HasMaxLength(20).IsRequired();
                entity.Property(cr => cr.CategoryId).HasColumnName("category_id");
                entity.Property(cr => cr.DistrictId).HasColumnName("district_id");
                entity.Property(cr => cr.UpazilaId).HasColumnName("upazila_id");
                entity.Property(cr => cr.Notes).HasColumnName("notes");
                entity.Property(cr => cr.Status)
                    .HasColumnName("status")
                    .HasConversion(recommendationConverter)
                    .HasMaxLength(20);
                entity.Property(cr => cr.ReviewedByAdminId).HasColumnName("reviewed_by_admin_id");
                entity.Property(cr => cr.CreatedAt).HasColumnName("created_at");

                entity.HasOne(cr => cr.RecommendedByUser)
                    .WithMany(u => u.SubmittedRecommendations)
                    .HasForeignKey(cr => cr.RecommendedByUserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(cr => cr.Category)
                    .WithMany()
                    .HasForeignKey(cr => cr.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(cr => cr.District)
                    .WithMany()
                    .HasForeignKey(cr => cr.DistrictId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(cr => cr.Upazila)
                    .WithMany()
                    .HasForeignKey(cr => cr.UpazilaId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(cr => cr.ReviewedByAdmin)
                    .WithMany()
                    .HasForeignKey(cr => cr.ReviewedByAdminId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // 11. Reports
            modelBuilder.Entity<Report>(entity =>
            {
                entity.ToTable("reports");
                entity.HasKey(rep => rep.ReportId);
                entity.Property(rep => rep.ReportId).HasColumnName("report_id").ValueGeneratedOnAdd();
                entity.Property(rep => rep.ReportedByUserId).HasColumnName("reported_by_user_id");
                entity.Property(rep => rep.TargetUserId).HasColumnName("target_user_id");
                entity.Property(rep => rep.Reason).HasColumnName("reason").IsRequired();
                entity.Property(rep => rep.Status)
                    .HasColumnName("status")
                    .HasConversion(reportConverter)
                    .HasMaxLength(20);
                entity.Property(rep => rep.CreatedAt).HasColumnName("created_at");

                entity.HasOne(rep => rep.ReportedByUser)
                    .WithMany()
                    .HasForeignKey(rep => rep.ReportedByUserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(rep => rep.TargetUser)
                    .WithMany()
                    .HasForeignKey(rep => rep.TargetUserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // 12. AdminAuditLogs
            modelBuilder.Entity<AdminAuditLog>(entity =>
            {
                entity.ToTable("admin_audit_logs");
                entity.HasKey(al => al.LogId);
                entity.Property(al => al.LogId).HasColumnName("log_id").ValueGeneratedOnAdd();
                entity.Property(al => al.AdminUserId).HasColumnName("admin_user_id");
                entity.Property(al => al.Action).HasColumnName("action").HasMaxLength(100).IsRequired();
                entity.Property(al => al.EntityName).HasColumnName("entity_name").HasMaxLength(50).IsRequired();
                entity.Property(al => al.EntityId).HasColumnName("entity_id");
                entity.Property(al => al.Details).HasColumnName("details");
                entity.Property(al => al.Timestamp).HasColumnName("timestamp");

                entity.HasOne(al => al.AdminUser)
                    .WithMany()
                    .HasForeignKey(al => al.AdminUserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
