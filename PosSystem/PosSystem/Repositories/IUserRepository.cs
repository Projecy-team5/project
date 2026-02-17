namespace PosSystem.Repositories;

using Dapper;
using System.Data;

public interface IUserRepository
{
    Task<User?> GetByUsernameAsync(string username);
}

// UserRepository.cs

public class UserRepository : IUserRepository
{
    private readonly IDbConnection _db;

    public UserRepository(IConfiguration config)
    {
        _db = new Microsoft.Data.SqlClient.SqlConnection(config.GetConnectionString("DefaultConnection"));
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        var sql = "SELECT * FROM Users WHERE Username = @Username AND Status = 'Active'";
        return await _db.QuerySingleOrDefaultAsync<User>(sql, new { Username = username });
    }
}

// Simple POCO for User (create in Models/User.cs)
public class User
{
    public long Id { get; set; }
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string Role { get; set; } = null!;
    public string Status { get; set; } = null!;
}