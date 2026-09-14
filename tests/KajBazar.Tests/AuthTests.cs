using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;
using KajBazar.Core.Entities;
using KajBazar.Infrastructure.Services;

namespace KajBazar.Tests
{
    public class AuthTests
    {
        private readonly Mock<IConfiguration> _configMock;
        private readonly AuthService _authService;

        public AuthTests()
        {
            _configMock = new Mock<IConfiguration>();
            _configMock.Setup(c => c["JwtSettings:SecretKey"])
                .Returns("KajBazarSuperSecretKeyWhichIsAtLeast256BitsLongForSecurity#123");
            _configMock.Setup(c => c["JwtSettings:Issuer"]).Returns("KajBazarAPI");
            _configMock.Setup(c => c["JwtSettings:Audience"]).Returns("KajBazarApp");
            _configMock.Setup(c => c["JwtSettings:ExpiryInMinutes"]).Returns("1440");

            _authService = new AuthService(_configMock.Object);
        }

        [Fact]
        public void HashPassword_ProducesValidBCryptHash_AndVerifiesCorrectly()
        {
            // Arrange
            var rawPassword = "StrongPassword#2026";

            // Act
            var hash = _authService.HashPassword(rawPassword);
            var isMatch = _authService.VerifyPassword(rawPassword, hash);

            // Assert
            Assert.NotNull(hash);
            Assert.Equal(60, hash.Length);
            Assert.StartsWith("$2a$11$", hash);
            Assert.True(isMatch);
        }

        [Fact]
        public void VerifyPassword_WithWrongPassword_ReturnsFalse()
        {
            // Arrange
            var rawPassword = "CorrectPassword123#";
            var wrongPassword = "WrongPassword123#";
            var hash = _authService.HashPassword(rawPassword);

            // Act
            var isMatch = _authService.VerifyPassword(wrongPassword, hash);

            // Assert
            Assert.False(isMatch);
        }

        [Fact]
        public void GenerateJwtToken_ContainsExpectedClaimsAndValidSignature()
        {
            // Arrange
            var testUser = new User
            {
                UserId = Guid.NewGuid(),
                FullName = "Leon Islam",
                Email = "leon@gmail.com",
                PhoneNumber = "01711111111"
            };
            var role = "Consumer";

            // Act
            var tokenString = _authService.GenerateJwtToken(testUser, role);

            // Assert
            Assert.NotNull(tokenString);
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(tokenString);

            Assert.Equal("KajBazarAPI", jwtToken.Issuer);
            Assert.Contains(jwtToken.Audiences, a => a == "KajBazarApp");
            Assert.Equal(testUser.UserId.ToString(), jwtToken.Subject);

            var nameClaim = jwtToken.Claims.First(c => c.Type == ClaimTypes.Name).Value;
            var roleClaim = jwtToken.Claims.First(c => c.Type == ClaimTypes.Role).Value;
            var emailClaim = jwtToken.Claims.First(c => c.Type == ClaimTypes.Email).Value;

            Assert.Equal("Leon Islam", nameClaim);
            Assert.Equal("Consumer", roleClaim);
            Assert.Equal("leon@gmail.com", emailClaim);
        }
    }
}
