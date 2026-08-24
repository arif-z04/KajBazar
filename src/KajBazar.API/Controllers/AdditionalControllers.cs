using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using KajBazar.Core.Interfaces;

namespace KajBazar.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewRepository _reviewRepository;

        public ReviewsController(IReviewRepository reviewRepository)
        {
            _reviewRepository = reviewRepository;
        }

        [HttpPost]
        public async Task<IActionResult> AddReview([FromBody] object reviewDto)
        {
            // Skeleton endpoint: Review submission (BR-07, BR-08)
            return Ok(new { message = "Review submitted or updated successfully skeleton." });
        }

        [HttpGet("worker/{workerProfileId:guid}")]
        public async Task<IActionResult> GetWorkerReviews(Guid workerProfileId)
        {
            var reviews = await _reviewRepository.GetByWorkerProfileIdAsync(workerProfileId);
            return Ok(reviews);
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class RecommendationsController : ControllerBase
    {
        private readonly IRecommendationRepository _recommendationRepository;

        public RecommendationsController(IRecommendationRepository recommendationRepository)
        {
            _recommendationRepository = recommendationRepository;
        }

        [HttpPost]
        public async Task<IActionResult> SubmitRecommendation([FromBody] object recommendationDto)
        {
            // Skeleton endpoint: Offline worker recommendation (BR-09)
            return Ok(new { message = "Offline worker recommendation submitted for admin review." });
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IServiceProviderRepository _workerRepository;
        private readonly IRecommendationRepository _recommendationRepository;

        public AdminController(
            IServiceProviderRepository workerRepository, 
            IRecommendationRepository recommendationRepository)
        {
            _workerRepository = workerRepository;
            _recommendationRepository = recommendationRepository;
        }

        [HttpPut("workers/{profileId:guid}/approve")]
        public async Task<IActionResult> ApproveWorker(Guid profileId)
        {
            // Skeleton endpoint: Approve worker verification (BR-03, BR-10)
            await _workerRepository.UpdateStatusAsync(profileId, Core.Enums.VerificationStatus.Verified);
            return Ok(new { message = "Worker profile approved." });
        }

        [HttpGet("recommendations/pending")]
        public async Task<IActionResult> GetPendingRecommendations()
        {
            var pending = await _recommendationRepository.GetPendingAsync();
            return Ok(pending);
        }
    }
}
