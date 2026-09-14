using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KajBazar.Core.DTOs;
using KajBazar.Core.Entities;
using KajBazar.Core.Interfaces;

namespace KajBazar.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly IServiceProviderRepository _workerRepository;

        public ReviewsController(
            IReviewRepository reviewRepository,
            IServiceProviderRepository workerRepository)
        {
            _reviewRepository = reviewRepository;
            _workerRepository = workerRepository;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> AddReview([FromBody] CreateReviewDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var consumerId))
            {
                return Unauthorized();
            }

            var worker = await _workerRepository.GetByIdAsync(dto.WorkerProfileId);
            if (worker == null)
            {
                return NotFound(new { message = "Service provider profile not found." });
            }

            // A user cannot review their own worker profile
            if (worker.UserId == consumerId)
            {
                return BadRequest(new { message = "You cannot submit a review for your own profile." });
            }

            var review = new Review
            {
                ReviewId = Guid.NewGuid(),
                ConsumerId = consumerId,
                WorkerProfileId = dto.WorkerProfileId,
                Rating = dto.Rating,
                Comment = dto.Comment?.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _reviewRepository.AddOrUpdateReviewAsync(review);

            // Fetch updated stats
            var updatedWorker = await _workerRepository.GetByIdAsync(dto.WorkerProfileId);

            return Ok(new
            {
                message = "Review submitted successfully.",
                review = new
                {
                    review.ReviewId,
                    review.Rating,
                    review.Comment,
                    review.CreatedAt
                },
                workerStats = new
                {
                    averageRating = updatedWorker?.AverageRating ?? 0.00m,
                    totalReviews = updatedWorker?.TotalReviews ?? 0
                }
            });
        }

        [HttpGet("worker/{workerProfileId:guid}")]
        public async Task<IActionResult> GetWorkerReviews(Guid workerProfileId)
        {
            var reviews = await _reviewRepository.GetByWorkerProfileIdAsync(workerProfileId);

            var result = reviews.Select(r => new ReviewDetailDto
            {
                ReviewId = r.ReviewId,
                ConsumerId = r.ConsumerId,
                ConsumerName = r.Consumer?.FullName ?? "Anonymous",
                WorkerProfileId = r.WorkerProfileId,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            }).ToList();

            return Ok(result);
        }
    }
}
