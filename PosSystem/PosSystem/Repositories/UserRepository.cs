using Dapper;
using Microsoft.Data.SqlClient;
using PosSystem.Models;
using System.Data;

namespace PosSystem.Repositories;

public class UserRepository : IUserRepository
{
    private readonly string _connectionString;

    public UserRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("DefaultConnection")
            ?? throw new ArgumentNullException("DefaultConnection missing");
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    public async Task<User?> GetByUsernameAsync(string username)
    {
        using var db = CreateConnection();
        // We select everything (*) into the User model for password verification
        return await db.QuerySingleOrDefaultAsync<User>(
            "SELECT * FROM Users WHERE Username = @username AND Status = 'Active'",
            new { username });
    }

    public async Task<UserDto?> GetByIdAsync(long id)
    {
        using var db = CreateConnection();
        return await db.QuerySingleOrDefaultAsync<UserDto>(
            "SELECT Id, Username, Email, Role, Status, CreatedAt FROM Users WHERE Id = @id",
            new { id });
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        using var db = CreateConnection();
        return await db.QueryAsync<UserDto>("SELECT Id, Username, Email, Role, Status, CreatedAt FROM Users");
    }

    public async Task<UserDto> CreateAsync(CreateUserRequest req)
    {
        var hash = BCrypt.Net.BCrypt.HashPassword(req.Password);
        using var db = CreateConnection();
        var sql = @"INSERT INTO Users (Username, Email, PasswordHash, Role, Status, CreatedAt)
                    VALUES (@Username, @Email, @PasswordHash, @Role, 'Active', GETDATE());
                    SELECT CAST(SCOPE_IDENTITY() as bigint);";

        var id = await db.ExecuteScalarAsync<long>(sql, new
        {
            req.Username,
            req.Email,
            PasswordHash = hash,
            req.Role
        });

        return (await GetByIdAsync(id))!;
    }

    public async Task UpdateAsync(long id, UpdateUserRequest req)
    {
        using var db = CreateConnection();
        var sets = new List<string>();
        var parameters = new DynamicParameters();
        parameters.Add("id", id);

        if (!string.IsNullOrEmpty(req.Email)) { sets.Add("Email = @Email"); parameters.Add("Email", req.Email); }
        if (!string.IsNullOrEmpty(req.Role)) { sets.Add("Role = @Role"); parameters.Add("Role", req.Role); }
        if (!string.IsNullOrEmpty(req.Status)) { sets.Add("Status = @Status"); parameters.Add("Status", req.Status); }
        if (!string.IsNullOrEmpty(req.NewPassword))
        {
            sets.Add("PasswordHash = @Hash");
            parameters.Add("Hash", BCrypt.Net.BCrypt.HashPassword(req.NewPassword));
        }

        if (sets.Count == 0) return;

        var sql = $"UPDATE Users SET {string.Join(", ", sets)} WHERE Id = @id";
        await db.ExecuteAsync(sql, parameters);
    }

    public async Task DisableAsync(long id)
    {
        using var db = CreateConnection();
        await db.ExecuteAsync("UPDATE Users SET Status = 'Disabled' WHERE Id = @id", new { id });
    }
}