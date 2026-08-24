using System;
using System.Collections.Generic;

namespace KajBazar.Core.Entities
{
    public class Category
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? IconUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<WorkerCategory> WorkerCategories { get; set; } = new List<WorkerCategory>();
    }

    public class WorkerCategory
    {
        public Guid ProfileId { get; set; }
        public virtual ServiceProviderProfile Profile { get; set; } = null!;

        public int CategoryId { get; set; }
        public virtual Category Category { get; set; } = null!;
    }
}
