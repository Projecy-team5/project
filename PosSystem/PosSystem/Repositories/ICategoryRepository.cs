using PosSystem.Models;

namespace PosSystem.Repositories
{
    public interface ICategoryRepository
    {
        Task<IEnumerable<CategoryDto>> GetAllAsync();
        Task<CategoryDto?> GetByIdAsync(long id);
        Task<CategoryDto> CreateAsync(CreateCategoryRequest req);
        Task UpdateAsync(long id, UpdateCategoryRequest req);
        Task DeleteAsync(long id);  // soft delete: set Status = 'Inactive'
    }
}
