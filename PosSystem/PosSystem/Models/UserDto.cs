
using System;

namespace PosSystem.Models
{
    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public string Token { get; set; } = null!;
        public string Username { get; set; } = null!;
        public string Role { get; set; } = null!;
    }
    public class UserDto
    {
        public long Id { get; set; }
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Role { get; set; } = null!;
        public string Status { get; set; } = "Active";
        public DateTime CreatedAt { get; set; }
    }
    public class User
    {
        public long Id { get; set; }
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public string Role { get; set; } = null!;
        public string Status { get; set; } = "Active";
        public DateTime CreatedAt { get; set; }
    }

    public class CreateUserRequest
    {
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Role { get; set; } = "Cashier"; // default
    }

    public class UpdateUserRequest
    {
        public string? Email { get; set; }
        public string? Role { get; set; }
        public string? Status { get; set; }
        public string? NewPassword { get; set; } // optional reset
    }
}
