using System.Collections.Generic;

namespace KajBazar.Core.Entities
{
    public class District
    {
        public int DistrictId { get; set; }
        public string DistrictName { get; set; } = string.Empty;

        public virtual ICollection<Upazila> Upazilas { get; set; } = new List<Upazila>();
        public virtual ICollection<ServiceProviderProfile> Profiles { get; set; } = new List<ServiceProviderProfile>();
    }

    public class Upazila
    {
        public int UpazilaId { get; set; }
        public int DistrictId { get; set; }
        public virtual District District { get; set; } = null!;
        public string UpazilaName { get; set; } = string.Empty;

        public virtual ICollection<ServiceProviderProfile> Profiles { get; set; } = new List<ServiceProviderProfile>();
    }
}
