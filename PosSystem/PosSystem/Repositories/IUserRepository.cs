using PosSystem.Models;

namespace PosSystem.Repositories;

public interface IUserRepository
{
    Task<User?> GetByUsernameAsync(string username);
    Task<UserDto?> GetByIdAsync(long id);
    Task<IEnumerable<UserDto>> GetAllAsync();
    Task<UserDto> CreateAsync(CreateUserRequest req);
    Task UpdateAsync(long id, UpdateUserRequest req);
    Task DisableAsync(long id);
}