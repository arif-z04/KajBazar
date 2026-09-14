using System;
using System.Collections.Generic;
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
    public class WorkersController : ControllerBase
    {
        private readonly IServiceProviderRepository _workerRepository;
        private readonly IUserRepository _userRepository;

        public WorkersController(
            IServiceProviderRepository workerRepository,
            IUserRepository userRepository)
        {
            _workerRepository = workerRepository;
            _userRepository = userRepository;
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchWorkers([FromQuery] WorkerSearchFilterDto filter)
        {
            var (workers, totalCount) = await _workerRepository.SearchWorkersAsync(
                filter.Category,
                filter.DistrictId,
                filter.UpazilaId,
                filter.MinRating,
                filter.Page,
                filter.PageSize
            );

            var workerDtos = workers.Select(w => new WorkerSummaryDto
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

            var totalPages = (int)Math.Ceiling((double)totalCount / filter.PageSize);

            return Ok(new
            {
                totalCount,
                totalPages,
                currentPage = filter.Page,
                pageSize = filter.PageSize,
                workers = workerDtos
            });
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetWorkerById(Guid id)
        {
            var worker = await _workerRepository.GetByIdAsync(id);
            if (worker == null)
            {
                return NotFound(new { message = "Service provider profile not found." });
            }

            var detailDto = new WorkerDetailDto
            {
                ProfileId = worker.ProfileId,
                UserId = worker.UserId,
                WorkerName = worker.User.FullName,
                PhoneNumber = worker.User.PhoneNumber, // Direct contact available without intermediary (BR-06)
                Email = worker.User.Email,
                DistrictId = worker.DistrictId,
                DistrictName = worker.District?.DistrictName ?? string.Empty,
                UpazilaId = worker.UpazilaId,
                UpazilaName = worker.Upazila?.UpazilaName ?? string.Empty,
                Bio = worker.Bio,
                ExperienceYears = worker.ExperienceYears,
                HourlyRate = worker.HourlyRate,
                VerificationStatus = worker.VerificationStatus.ToString().ToUpperInvariant(),
                AverageRating = worker.AverageRating,
                TotalReviews = worker.TotalReviews,
                Categories = worker.WorkerCategories.Select(wc => wc.Category.CategoryName).ToList(),
                CreatedAt = worker.CreatedAt,
                Reviews = worker.Reviews.Select(r => new ReviewDetailDto
                {
                    ReviewId = r.ReviewId,
                    ConsumerId = r.ConsumerId,
                    ConsumerName = r.Consumer.FullName,
                    WorkerProfileId = r.WorkerProfileId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                }).OrderByDescending(r => r.CreatedAt).ToList()
            };

            return Ok(detailDto);
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var worker = await _workerRepository.GetByUserIdAsync(userId);
            if (worker == null)
            {
                return NotFound(new { message = "You have not set up a service provider profile yet." });
            }

            return Ok(new WorkerDetailDto
            {
                ProfileId = worker.ProfileId,
                UserId = worker.UserId,
                WorkerName = worker.User.FullName,
                PhoneNumber = worker.User.PhoneNumber,
                Email = worker.User.Email,
                DistrictId = worker.DistrictId,
                DistrictName = worker.District?.DistrictName ?? string.Empty,
                UpazilaId = worker.UpazilaId,
                UpazilaName = worker.Upazila?.UpazilaName ?? string.Empty,
                Bio = worker.Bio,
                ExperienceYears = worker.ExperienceYears,
                HourlyRate = worker.HourlyRate,
                VerificationStatus = worker.VerificationStatus.ToString().ToUpperInvariant(),
                AverageRating = worker.AverageRating,
                TotalReviews = worker.TotalReviews,
                Categories = worker.WorkerCategories.Select(wc => wc.Category.CategoryName).ToList(),
                CreatedAt = worker.CreatedAt,
                Reviews = worker.Reviews.Select(r => new ReviewDetailDto
                {
                    ReviewId = r.ReviewId,
                    ConsumerId = r.ConsumerId,
                    ConsumerName = r.Consumer.FullName,
                    WorkerProfileId = r.WorkerProfileId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                }).ToList()
            });
        }

        [Authorize]
        [HttpPost("profile")]
        public async Task<IActionResult> CreateOrUpdateProfile([FromBody] CreateWorkerProfileDto dto)
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

            var existingProfile = await _workerRepository.GetByUserIdAsync(userId);

            if (existingProfile == null)
            {
                // Create new worker profile (BR-02: requires admin verification before public appearance)
                var profile = new ServiceProviderProfile
                {
                    ProfileId = Guid.NewGuid(),
                    UserId = userId,
                    DistrictId = dto.DistrictId,
                    UpazilaId = dto.UpazilaId,
                    Bio = dto.Bio,
                    ExperienceYears = dto.ExperienceYears,
                    HourlyRate = dto.HourlyRate,
                    VerificationStatus = VerificationStatus.Pending,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _workerRepository.AddAsync(profile);
                await _workerRepository.SetCategoriesAsync(profile.ProfileId, dto.CategoryIds);

                return CreatedAtAction(nameof(GetWorkerById), new { id = profile.ProfileId }, new
                {
                    message = "Worker profile created successfully. It is currently pending administrative verification.",
                    profileId = profile.ProfileId,
                    status = "PENDING"
                });
            }
            else
            {
                // Update existing profile
                existingProfile.DistrictId = dto.DistrictId;
                existingProfile.UpazilaId = dto.UpazilaId;
                existingProfile.Bio = dto.Bio;
                existingProfile.ExperienceYears = dto.ExperienceYears;
                existingProfile.HourlyRate = dto.HourlyRate;
                existingProfile.UpdatedAt = DateTime.UtcNow;

                await _workerRepository.UpdateAsync(existingProfile);
                await _workerRepository.SetCategoriesAsync(existingProfile.ProfileId, dto.CategoryIds);

                return Ok(new
                {
                    message = "Worker profile updated successfully.",
                    profileId = existingProfile.ProfileId,
                    status = existingProfile.VerificationStatus.ToString().ToUpperInvariant()
                });
            }
        }
    }
}
