using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using KajBazar.Core.Interfaces;

namespace KajBazar.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public AuthController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] object registerDto)
        {
            // Skeleton endpoint: User registration logic with password hashing & JWT issue
            return Ok(new { message = "User registered successfully skeleton." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] object loginDto)
        {
            // Skeleton endpoint: Authentication verification & JWT bearer token issue
            return Ok(new { token = "skeleton_jwt_bearer_token" });
        }
    }
}
