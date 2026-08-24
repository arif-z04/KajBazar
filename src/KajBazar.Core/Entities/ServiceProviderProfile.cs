using System;
using System.Collections.Generic;
using KajBazar.Core.Enums;

namespace KajBazar.Core.Entities
{
    /// <summary>
    /// Professional profile for a skilled worker service provider.
    /// </summary>
    public class ServiceProviderProfile
    {
        public Guid ProfileId { get; set; } = Guid.NewGuid();

        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;

        public int DistrictId { get; set; }
        public virtual District District { get; set; } = null!;

        public int UpazilaId { get; set; }
        public virtual Upazila Upazila { get; set; } = null!;

        public string? Bio { get; set; }
        public int ExperienceYears { get; set; } = 0;
        public decimal? HourlyRate { get; set; }
        
        public VerificationStatus VerificationStatus { get; set; } = VerificationStatus.Pending;
        public DateTime? VerifiedAt { get; set; }

        public decimal AverageRating { get; set; } = 0.00m;
        public int TotalReviews { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public virtual ICollection<WorkerCategory> WorkerCategories { get; set; } = new List<WorkerCategory>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}
