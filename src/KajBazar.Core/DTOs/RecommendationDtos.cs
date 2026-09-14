using System;
using System.ComponentModel.DataAnnotations;

namespace KajBazar.Core.DTOs
{
    public class CreateRecommendationDto
    {
        [Required(ErrorMessage = "Worker name is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Worker name must be between 2 and 100 characters")]
        public string WorkerName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Phone number is required")]
        [RegularExpression(@"^(?:\+8801|01)[3-9]\d{8}$", ErrorMessage = "Invalid Bangladeshi phone number (e.g., 01712345678)")]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Service category is required")]
        public int CategoryId { get; set; }

        [Required(ErrorMessage = "District is required")]
        public int DistrictId { get; set; }

        [Required(ErrorMessage = "Upazila is required")]
        public int UpazilaId { get; set; }

        [StringLength(1000, ErrorMessage = "Notes must not exceed 1000 characters")]
        public string? Notes { get; set; }
    }

    public class RecommendationDetailDto
    {
        public Guid RecommendationId { get; set; }
        public Guid RecommendedByUserId { get; set; }
        public string RecommenderName { get; set; } = string.Empty;
        public string WorkerName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int DistrictId { get; set; }
        public string DistrictName { get; set; } = string.Empty;
        public int UpazilaId { get; set; }
        public string UpazilaName { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string Status { get; set; } = string.Empty;
        public Guid? ReviewedByAdminId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
