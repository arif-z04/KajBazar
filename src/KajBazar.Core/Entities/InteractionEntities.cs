using System;
using KajBazar.Core.Enums;

namespace KajBazar.Core.Entities
{
    public class Review
    {
        public Guid ReviewId { get; set; } = Guid.NewGuid();

        public Guid ConsumerId { get; set; }
        public virtual User Consumer { get; set; } = null!;

        public Guid WorkerProfileId { get; set; }
        public virtual ServiceProviderProfile WorkerProfile { get; set; } = null!;

        public int Rating { get; set; }
        public string? Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class CommunityRecommendation
    {
        public Guid RecommendationId { get; set; } = Guid.NewGuid();

        public Guid RecommendedByUserId { get; set; }
        public virtual User RecommendedByUser { get; set; } = null!;

        public string WorkerName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;

        public int CategoryId { get; set; }
        public virtual Category Category { get; set; } = null!;

        public int DistrictId { get; set; }
        public virtual District District { get; set; } = null!;

        public int UpazilaId { get; set; }
        public virtual Upazila Upazila { get; set; } = null!;

        public string? Notes { get; set; }
        public RecommendationStatus Status { get; set; } = RecommendationStatus.Pending;

        public Guid? ReviewedByAdminId { get; set; }
        public virtual User? ReviewedByAdmin { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Report
    {
        public Guid ReportId { get; set; } = Guid.NewGuid();
        public Guid ReportedByUserId { get; set; }
        public virtual User ReportedByUser { get; set; } = null!;

        public Guid TargetUserId { get; set; }
        public virtual User TargetUser { get; set; } = null!;

        public string Reason { get; set; } = string.Empty;
        public ReportStatus Status { get; set; } = ReportStatus.Open;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class AdminAuditLog
    {
        public Guid LogId { get; set; } = Guid.NewGuid();
        public Guid AdminUserId { get; set; }
        public virtual User AdminUser { get; set; } = null!;

        public string Action { get; set; } = string.Empty;
        public string EntityName { get; set; } = string.Empty;
        public Guid? EntityId { get; set; }
        public string? Details { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
