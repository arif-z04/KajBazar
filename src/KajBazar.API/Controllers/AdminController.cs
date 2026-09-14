using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KajBazar.Core.DTOs;
using KajBazar.Core.Entities;
using KajBazar.Core.Enums;
using KajBazar.Core.Interfaces;

namespace KajBazar.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IServiceProviderRepository _workerRepository;
        private readonly IRecommendationRepository _recommendationRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IAdminAuditLogRepository _auditLogRepository;

        public AdminController(
            IServiceProviderRepository workerRepository,
            IRecommendationRepository recommendationRepository,
            ICategoryRepository categoryRepository,
            IAdminAuditLogRepository auditLogRepository)
        {
            _workerRepository = workerRepository;
            _recommendationRepository = recommendationRepository;
            _categoryRepository = categoryRepository;
            _auditLogRepository = auditLogRepository;
        }

        private Guid GetCurrentAdminId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(idClaim, out var adminId) ? adminId : Guid.Empty;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var stats = await _auditLogRepository.GetDashboardStatsAsync();
            return Ok(stats);
        }

        [HttpGet("workers/pending")]
        public async Task<IActionResult> GetPendingWorkers()
        {
            var pending = await _workerRepository.GetPendingWorkersAsync();

            var result = pending.Select(w => new WorkerSummaryDto
            {
                ProfileId = w.ProfileId,
                UserId = w.UserId,
                WorkerName = w.User.FullName,
                PhoneNumber = w.User.PhoneNumber,
                Email = w.User.Email,
                DistrictId = w.DistrictId,
                DistrictName = w.District?.DistrictName ?? string.Empty,
                UpazilaId = w.UpazilaId,
                UpazilaName = w.Upazila?.UpazilaName ?? string.Empty,
                Bio = w.Bio,
                ExperienceYears = w.ExperienceYears,
                HourlyRate = w.HourlyRate,
                VerificationStatus = w.VerificationStatus.ToString().ToUpperInvariant(),
                AverageRating = w.AverageRating,
                TotalReviews = w.TotalReviews,
                Categories = w.WorkerCategories.Select(wc => wc.Category.CategoryName).ToList(),
                CreatedAt = w.CreatedAt
            }).ToList();

            return Ok(result);
        }

        [HttpPut("workers/{profileId:guid}/verify")]
        public async Task<IActionResult> ApproveWorker(Guid profileId)
        {
            var worker = await _workerRepository.GetByIdAsync(profileId);
            if (worker == null)
            {
                return NotFound(new { message = "Worker profile not found." });
            }

            await _workerRepository.UpdateStatusAsync(profileId, VerificationStatus.Verified);

            var adminId = GetCurrentAdminId();
            await _auditLogRepository.LogAsync(
                adminId,
                "VERIFY_WORKER_PROFILE",
                "service_provider_profiles",
                profileId,
                $"Admin approved verification for worker {worker.User.FullName}."
            );

            return Ok(new { message = "Worker profile verified successfully. Worker is now visible in the public directory." });
        }

        [HttpPut("workers/{profileId:guid}/reject")]
        public async Task<IActionResult> RejectWorker(Guid profileId, [FromBody] WorkerVerificationActionDto? dto)
        {
            var worker = await _workerRepository.GetByIdAsync(profileId);
            if (worker == null)
            {
                return NotFound(new { message = "Worker profile not found." });
            }

            await _workerRepository.UpdateStatusAsync(profileId, VerificationStatus.Rejected);

            var adminId = GetCurrentAdminId();
            await _auditLogRepository.LogAsync(
                adminId,
                "REJECT_WORKER_PROFILE",
                "service_provider_profiles",
                profileId,
                $"Admin rejected worker {worker.User.FullName}. Reason: {dto?.Reason ?? "Criteria not met"}."
            );

            return Ok(new { message = "Worker profile rejected." });
        }

        [HttpGet("recommendations/pending")]
        public async Task<IActionResult> GetPendingRecommendations()
        {
            var items = await _recommendationRepository.GetPendingAsync();

            var result = items.Select(r => new RecommendationDetailDto
            {
                RecommendationId = r.RecommendationId,
                RecommendedByUserId = r.RecommendedByUserId,
                RecommenderName = r.RecommendedByUser?.FullName ?? "Unknown",
                WorkerName = r.WorkerName,
                PhoneNumber = r.PhoneNumber,
                CategoryId = r.CategoryId,
                CategoryName = r.Category?.CategoryName ?? string.Empty,
                DistrictId = r.DistrictId,
                DistrictName = r.District?.DistrictName ?? string.Empty,
                UpazilaId = r.UpazilaId,
                UpazilaName = r.Upazila?.UpazilaName ?? string.Empty,
                Notes = r.Notes,
                Status = r.Status.ToString().ToUpperInvariant(),
                ReviewedByAdminId = r.ReviewedByAdminId,
                CreatedAt = r.CreatedAt
            }).ToList();

            return Ok(result);
        }

        [HttpPut("recommendations/{id:guid}/approve")]
        public async Task<IActionResult> ApproveRecommendation(Guid id)
        {
            var rec = await _recommendationRepository.GetByIdAsync(id);
            if (rec == null)
            {
                return NotFound(new { message = "Recommendation not found." });
            }

            var adminId = GetCurrentAdminId();
            await _recommendationRepository.UpdateStatusAsync(id, RecommendationStatus.Approved, adminId);

            await _auditLogRepository.LogAsync(
                adminId,
                "APPROVE_COMMUNITY_RECOMMENDATION",
                "community_recommendations",
                id,
                $"Admin approved offline worker recommendation for {rec.WorkerName}."
            );

            return Ok(new { message = "Recommendation approved successfully." });
        }

        [HttpPut("recommendations/{id:guid}/reject")]
        public async Task<IActionResult> RejectRecommendation(Guid id, [FromBody] RecommendationActionDto? dto)
        {
            var rec = await _recommendationRepository.GetByIdAsync(id);
            if (rec == null)
            {
                return NotFound(new { message = "Recommendation not found." });
            }

            var adminId = GetCurrentAdminId();
            await _recommendationRepository.UpdateStatusAsync(id, RecommendationStatus.Rejected, adminId);

            await _auditLogRepository.LogAsync(
                adminId,
                "REJECT_COMMUNITY_RECOMMENDATION",
                "community_recommendations",
                id,
                $"Admin rejected offline worker recommendation for {rec.WorkerName}. Reason: {dto?.Reason ?? "Declined"}."
            );

            return Ok(new { message = "Recommendation rejected." });
        }

        [HttpGet("audit-logs")]
        public async Task<IActionResult> GetAuditLogs([FromQuery] int count = 50)
        {
            var logs = await _auditLogRepository.GetRecentLogsAsync(count);

            var result = logs.Select(l => new AdminAuditLogDto
            {
                LogId = l.LogId,
                AdminUserId = l.AdminUserId,
                AdminEmail = l.AdminUser?.Email ?? string.Empty,
                Action = l.Action,
                EntityName = l.EntityName,
                EntityId = l.EntityId,
                Details = l.Details,
                Timestamp = l.Timestamp
            }).ToList();

            return Ok(result);
        }

        [HttpPost("categories")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existing = await _categoryRepository.GetByNameAsync(dto.CategoryName);
            if (existing != null)
            {
                return BadRequest(new { message = "A category with this name already exists." });
            }

            var category = new Category
            {
                CategoryName = dto.CategoryName.Trim(),
                Description = dto.Description?.Trim(),
                IconUrl = dto.IconUrl?.Trim() ?? "/icons/default.png",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _categoryRepository.AddAsync(category);

            var adminId = GetCurrentAdminId();
            await _auditLogRepository.LogAsync(
                adminId,
                "CREATE_SERVICE_CATEGORY",
                "categories",
                null,
                $"Admin added new service category: {category.CategoryName}."
            );

            return Ok(new { message = "Category created successfully.", categoryId = category.CategoryId });
        }
    }
}
