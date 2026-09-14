using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace KajBazar.Core.DTOs
{
    public class AdminDashboardStatsDto
    {
        public int TotalRegisteredUsers { get; set; }
        public int TotalWorkerProfiles { get; set; }
        public int VerifiedWorkersCount { get; set; }
        public int PendingVerificationCount { get; set; }
        public int PendingRecommendationCount { get; set; }
        public int TotalReviewsSubmitted { get; set; }
    }

    public class WorkerVerificationActionDto
    {
        [Required]
        [RegularExpression("^(VERIFIED|REJECTED|SUSPENDED)$", ErrorMessage = "Action must be VERIFIED, REJECTED, or SUSPENDED")]
        public string Action { get; set; } = "VERIFIED";

        public string? Reason { get; set; }
    }

    public class RecommendationActionDto
    {
        [Required]
        [RegularExpression("^(APPROVED|REJECTED)$", ErrorMessage = "Action must be APPROVED or REJECTED")]
        public string Action { get; set; } = "APPROVED";

        public string? Reason { get; set; }
    }

    public class AdminAuditLogDto
    {
        public Guid LogId { get; set; }
        public Guid AdminUserId { get; set; }
        public string AdminEmail { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string EntityName { get; set; } = string.Empty;
        public Guid? EntityId { get; set; }
        public string? Details { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class CreateCategoryDto
    {
        [Required(ErrorMessage = "Category name is required")]
        [StringLength(100, MinimumLength = 2)]
        public string CategoryName { get; set; } = string.Empty;

        public string? Description { get; set; }
        public string? IconUrl { get; set; }
    }
}
