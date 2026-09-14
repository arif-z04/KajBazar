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
    public class RecommendationsController : ControllerBase
    {
        private readonly IRecommendationRepository _recommendationRepository;

        public RecommendationsController(IRecommendationRepository recommendationRepository)
        {
            _recommendationRepository = recommendationRepository;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> SubmitRecommendation([FromBody] CreateRecommendationDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var recommendation = new CommunityRecommendation
            {
                RecommendationId = Guid.NewGuid(),
                RecommendedByUserId = userId,
                WorkerName = dto.WorkerName.Trim(),
                PhoneNumber = dto.PhoneNumber.Trim(),
                CategoryId = dto.CategoryId,
                DistrictId = dto.DistrictId,
                UpazilaId = dto.UpazilaId,
                Notes = dto.Notes?.Trim(),
                Status = RecommendationStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            await _recommendationRepository.AddAsync(recommendation);

            return Ok(new
            {
                message = "Thank you! Your recommendation has been submitted and is pending administrative review.",
                recommendationId = recommendation.RecommendationId
            });
        }

        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyRecommendations()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var items = await _recommendationRepository.GetByUserIdAsync(userId);

            var result = items.Select(r => new RecommendationDetailDto
            {
                RecommendationId = r.RecommendationId,
                RecommendedByUserId = r.RecommendedByUserId,
                RecommenderName = r.RecommendedByUser?.FullName ?? "Me",
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
    }
}
