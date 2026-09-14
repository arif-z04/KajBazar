using System.Collections.Generic;

namespace KajBazar.Core.DTOs
{
    public class DistrictDto
    {
        public int DistrictId { get; set; }
        public string DistrictName { get; set; } = string.Empty;
        public List<UpazilaDto> Upazilas { get; set; } = new List<UpazilaDto>();
    }

    public class UpazilaDto
    {
        public int UpazilaId { get; set; }
        public int DistrictId { get; set; }
        public string UpazilaName { get; set; } = string.Empty;
    }

    public class CategoryDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? IconUrl { get; set; }
        public bool IsActive { get; set; }
    }
}
