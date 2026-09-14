using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace KajBazar.Core.DTOs
{
    public class WorkerSearchFilterDto
    {
        public string? Category { get; set; }
        public int? DistrictId { get; set; }
        public int? UpazilaId { get; set; }
        public decimal? MinRating { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 12;
    }

    public class WorkerSummaryDto
    {
        public Guid ProfileId { get; set; }
        public Guid UserId { get; set; }
        public string WorkerName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int DistrictId { get; set; }
        public string DistrictName { get; set; } = string.Empty;
        public int UpazilaId { get; set; }
        public string UpazilaName { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public int ExperienceYears { get; set; }
        public decimal? HourlyRate { get; set; }
        public string VerificationStatus { get; set; } = string.Empty;
        public decimal AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public List<string> Categories { get; set; } = new List<string>();
        public DateTime CreatedAt { get; set; }
    }

    public class WorkerDetailDto : WorkerSummaryDto
    {
        public List<ReviewDetailDto> Reviews { get; set; } = new List<ReviewDetailDto>();
    }

    public class CreateWorkerProfileDto
    {
        [Required]
        public int DistrictId { get; set; }

        [Required]
        public int UpazilaId { get; set; }

        [StringLength(1000)]
        public string? Bio { get; set; }

        [Range(0, 50, ErrorMessage = "Experience years must be between 0 and 50")]
        public int ExperienceYears { get; set; }

        [Range(0, 100000, ErrorMessage = "Hourly rate must be non-negative")]
        public decimal? HourlyRate { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "At least one service category must be selected")]
        public List<int> CategoryIds { get; set; } = new List<int>();
    }

    public class UpdateWorkerProfileDto
    {
        [Required]
        public int DistrictId { get; set; }

        [Required]
        public int UpazilaId { get; set; }

        [StringLength(1000)]
        public string? Bio { get; set; }

        [Range(0, 50, ErrorMessage = "Experience years must be between 0 and 50")]
        public int ExperienceYears { get; set; }

        [Range(0, 100000, ErrorMessage = "Hourly rate must be non-negative")]
        public decimal? HourlyRate { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "At least one service category must be selected")]
        public List<int> CategoryIds { get; set; } = new List<int>();
    }
}
