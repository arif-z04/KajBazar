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
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IAuthService _authService;
        private readonly IServiceProviderRepository _workerRepository;

        public AuthController(
            IUserRepository userRepository, 
            IAuthService authService,
            IServiceProviderRepository workerRepository)
        {
            _userRepository = userRepository;
            _authService = authService;
            _workerRepository = workerRepository;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingEmail = await _userRepository.GetByEmailAsync(dto.Email);
            if (existingEmail != null)
            {
                return BadRequest(new { message = "An account with this email address already exists." });
            }

            var existingPhone = await _userRepository.GetByPhoneAsync(dto.PhoneNumber);
            if (existingPhone != null)
            {
                return BadRequest(new { message = "An account with this phone number already exists." });
            }

            var validRoles = new[] { "Consumer", "ServiceProvider", "Admin" };
            var selectedRole = validRoles.FirstOrDefault(r => r.Equals(dto.Role, StringComparison.OrdinalIgnoreCase)) ?? "Consumer";

            var user = new User
            {
                UserId = Guid.NewGuid(),
                FullName = dto.FullName.Trim(),
                Email = dto.Email.Trim().ToLowerInvariant(),
                PhoneNumber = dto.PhoneNumber.Trim(),
                PasswordHash = _authService.HashPassword(dto.Password),
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _userRepository.AddAsync(user);
            await _userRepository.AssignRoleAsync(user.UserId, selectedRole);

            var token = _authService.GenerateJwtToken(user, selectedRole);

            return Ok(new AuthResponseDto
            {
                Token = token,
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = selectedRole,
                ProfileId = null
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userRepository.GetWithRolesByEmailAsync(dto.Email);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            if (!user.IsActive)
            {
                return StatusCode(403, new { message = "Your account has been deactivated. Please contact support." });
            }

            if (!_authService.VerifyPassword(dto.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            var roleName = user.UserRoles.FirstOrDefault()?.Role?.RoleName ?? "Consumer";
            var token = _authService.GenerateJwtToken(user, roleName);

            Guid? profileId = user.ServiceProviderProfile?.ProfileId;

            return Ok(new AuthResponseDto
            {
                Token = token,
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = roleName,
                ProfileId = profileId
            });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var user = await _userRepository.GetWithRolesByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var roleName = user.UserRoles.FirstOrDefault()?.Role?.RoleName ?? "Consumer";

            return Ok(new UserProfileDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = roleName,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            });
        }
    }
}
