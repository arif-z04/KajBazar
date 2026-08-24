using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using KajBazar.Core.Interfaces;

namespace KajBazar.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WorkersController : ControllerBase
    {
        private readonly IServiceProviderRepository _workerRepository;

        public WorkersController(IServiceProviderRepository workerRepository)
        {
            _workerRepository = workerRepository;
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchWorkers(
            [FromQuery] string? category, 
            [FromQuery] int? districtId, 
            [FromQuery] int? upazilaId, 
            [FromQuery] decimal? minRating, 
            [FromQuery] int page = 1)
        {
            // Skeleton endpoint: Multi-criteria worker search
            var workers = await _workerRepository.SearchWorkersAsync(category, districtId, upazilaId, minRating, page);
            return Ok(workers);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetWorkerById(Guid id)
        {
            var worker = await _workerRepository.GetByIdAsync(id);
            if (worker == null) return NotFound();
            return Ok(worker);
        }

        [HttpPost("profile")]
        public async Task<IActionResult> CreateProfile([FromBody] object profileDto)
        {
            // Skeleton endpoint: Worker profile creation (BR-02)
            return CreatedAtAction(nameof(GetWorkerById), new { id = Guid.NewGuid() }, new { status = "Pending Verification" });
        }
    }
}
