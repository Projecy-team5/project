using PosSystem.Models;
using System.Data;
using Dapper;

namespace PosSystem.Repositories
{

    // CategoryRepository.cs
    public class CategoryRepository : ICategoryRepository
    {
        private readonly IDbConnection _db;

        public CategoryRepository(IConfiguration config)
        {
            _db = new Microsoft.Data.SqlClient.SqlConnection(config.GetConnectionString("DefaultConnection"));
        }

        public async Task<IEnumerable<CategoryDto>> GetAllAsync()
        {
            var sql = @"
            SELECT c.Id, c.Name, c.ParentId, p.Name AS ParentName, c.Status
            FROM Categories c
            LEFT JOIN Categories p ON c.ParentId = p.Id
            ORDER BY c.Name";
            return await _db.QueryAsync<CategoryDto>(sql);
        }

        public async Task<CategoryDto?> GetByIdAsync(long id)
        {
            var sql = @"
            SELECT c.*, p.Name AS ParentName
            FROM Categories c
            LEFT JOIN Categories p ON c.ParentId = p.Id
            WHERE c.Id = @Id";
            return await _db.QuerySingleOrDefaultAsync<CategoryDto>(sql, new { Id = id });
        }

        public async Task<CategoryDto> CreateAsync(CreateCategoryRequest req)
        {
            var sql = @"
            INSERT INTO Categories (Name, ParentId)
            VALUES (@Name, @ParentId);
            SELECT SCOPE_IDENTITY() AS Id";
            var id = await _db.ExecuteScalarAsync<long>(sql, req);

            return await GetByIdAsync(id);
        }

        public async Task UpdateAsync(long id, UpdateCategoryRequest req)
        {
            var sql = "UPDATE Categories SET Name = @Name, ParentId = @ParentId WHERE Id = @Id";
            await _db.ExecuteAsync(sql, new { req.Name, req.ParentId, Id = id });
        }

        public async Task DeleteAsync(long id)
        {
            await _db.ExecuteAsync("UPDATE Categories SET Status = 'Inactive' WHERE Id = @Id", new { Id = id });
        }
    }
}
