using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using KajBazar.Core.Entities;
using KajBazar.Core.Interfaces;
using KajBazar.Infrastructure.Data;

namespace KajBazar.Infrastructure.Repositories
{
    public class GeographyRepository : IGeographyRepository
    {
        private readonly KajBazarDbContext _context;

        public GeographyRepository(KajBazarDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<District>> GetAllDistrictsAsync()
        {
            return await _context.Districts
                .Include(d => d.Upazilas)
                .OrderBy(d => d.DistrictName)
                .ToListAsync();
        }

        public async Task<IEnumerable<Upazila>> GetUpazilasByDistrictIdAsync(int districtId)
        {
            return await _context.Upazilas
                .Where(u => u.DistrictId == districtId)
                .OrderBy(u => u.UpazilaName)
                .ToListAsync();
        }

        public async Task<District?> GetDistrictByIdAsync(int districtId)
        {
            return await _context.Districts
                .Include(d => d.Upazilas)
                .FirstOrDefaultAsync(d => d.DistrictId == districtId);
        }

        public async Task<Upazila?> GetUpazilaByIdAsync(int upazilaId)
        {
            return await _context.Upazilas
                .Include(u => u.District)
                .FirstOrDefaultAsync(u => u.UpazilaId == upazilaId);
        }
    }
}
