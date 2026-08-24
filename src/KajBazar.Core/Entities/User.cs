using System;
using System.Collections.Generic;

namespace KajBazar.Core.Entities
{
    /// <summary>
    /// User account domain entity representing Consumers, Workers, and Admins.
    /// </summary>
    public class User
    {
        public Guid UserId { get; set; } = Guid.NewGuid();
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
        public virtual ServiceProviderProfile? ServiceProviderProfile { get; set; }
        public virtual ICollection<Review> ReviewsWritten { get; set; } = new List<Review>();
        public virtual ICollection<CommunityRecommendation> SubmittedRecommendations { get; set; } = new List<CommunityRecommendation>();
    }
}
