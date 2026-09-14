using System;
using System.ComponentModel.DataAnnotations;

namespace KajBazar.Core.DTOs
{
    public class CreateReviewDto
    {
        [Required]
        public Guid WorkerProfileId { get; set; }

        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5 stars")]
        public int Rating { get; set; }

        [StringLength(1000, ErrorMessage = "Comment must not exceed 1000 characters")]
        public string? Comment { get; set; }
    }

    public class ReviewDetailDto
    {
        public Guid ReviewId { get; set; }
        public Guid ConsumerId { get; set; }
        public string ConsumerName { get; set; } = string.Empty;
        public Guid WorkerProfileId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
