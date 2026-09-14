using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using KajBazar.Core.Entities;
using KajBazar.Core.Interfaces;
using KajBazar.Infrastructure.Data;

namespace KajBazar.Infrastructure.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly KajBazarDbContext _context;

        public CategoryRepository(KajBazarDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Category>> GetAllActiveAsync()
        {
            return await _context.Categories
                .Where(c => c.IsActive)
                .OrderBy(c => c.CategoryName)
                .ToListAsync();
        }

        public async Task<Category?> GetByIdAsync(int categoryId)
        {
            return await _context.Categories
                .FirstOrDefaultAsync(c => c.CategoryId == categoryId);
        }

        public async Task<Category?> GetByNameAsync(string categoryName)
        {
            var norm = categoryName.Trim().ToLowerInvariant();
            return await _context.Categories
                .FirstOrDefaultAsync(c => c.CategoryName.ToLower() == norm);
        }

        public async Task AddAsync(Category category)
        {
            await _context.Categories.AddAsync(category);
            await _context.SaveChangesAsync();
        }
    }
}
