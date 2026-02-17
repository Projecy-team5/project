using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using PosSystem.Models;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace PosSystem.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly string _connectionString;

    public ProductRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
    }

    // Helper to create a connection (Better for Dapper's async lifecycle)
    private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    private const string BaseQuery = @"
        SELECT p.Id, p.Sku, p.Name, p.Description, p.Barcode,
               c.Name AS CategoryName,
               pr.Price AS CurrentPrice,
               s.Quantity AS StockQuantity, s.MinQuantity
        FROM Products p
        LEFT JOIN Categories c ON p.CategoryId = c.Id
        LEFT JOIN Prices pr ON p.Id = pr.ProductId AND pr.IsCurrent = 1
        LEFT JOIN Stock s ON p.Id = s.ProductId
        WHERE p.IsActive = 1";

    public async Task<IEnumerable<ProductDto>> GetAllAsync()
    {
        using var db = CreateConnection();
        return await db.QueryAsync<ProductDto>(BaseQuery);
    }

    public async Task<IEnumerable<ProductDto>> SearchAsync(string query)
    {
        using var db = CreateConnection();
        var sql = $"{BaseQuery} AND (p.Name LIKE @Query OR p.Sku LIKE @Query OR p.Barcode LIKE @Query)";
        return await db.QueryAsync<ProductDto>(sql, new { Query = $"%{query}%" });
    }

    public async Task<ProductDto?> GetByIdAsync(long id)
    {
        using var db = CreateConnection();
        var sql = $"{BaseQuery} AND p.Id = @Id";
        return await db.QuerySingleOrDefaultAsync<ProductDto>(sql, new { Id = id });
    }

    public async Task<ProductDto?> GetByBarcodeAsync(string barcode)
    {
        using var db = CreateConnection();
        var sql = $"{BaseQuery} AND p.Barcode = @Barcode";
        return await db.QuerySingleOrDefaultAsync<ProductDto>(sql, new { Barcode = barcode });
    }

    public async Task<ProductDto> CreateAsync(CreateProductRequest request)
    {
        using var db = CreateConnection();
        db.Open();
        using var trans = db.BeginTransaction();
        try
        {
            var sqlProduct = @"
                INSERT INTO Products (CategoryId, Sku, Name, Description, Barcode, IsActive)
                OUTPUT INSERTED.Id
                VALUES (@CategoryId, @Sku, @Name, @Description, @Barcode, 1);";

            var productId = await db.ExecuteScalarAsync<long>(sqlProduct, request, trans);

            await db.ExecuteAsync(@"
                INSERT INTO Prices (ProductId, Price, Currency, IsCurrent)
                VALUES (@ProductId, @Price, 'USD', 1);",
                new { ProductId = productId, request.Price }, trans);

            await db.ExecuteAsync(@"
                INSERT INTO Stock (ProductId, Quantity, MinQuantity)
                VALUES (@ProductId, @InitialStock, @MinQuantity);",
                new { ProductId = productId, request.InitialStock, request.MinQuantity }, trans);

            trans.Commit();
            return (await GetByIdAsync(productId))!;
        }
        catch
        {
            trans.Rollback();
            throw;
        }
    }

    public async Task UpdateAsync(long id, UpdateProductRequest request)
    {
        using var db = CreateConnection();
        db.Open();
        using var trans = db.BeginTransaction();
        try
        {
            // 1. Update Product details
            await db.ExecuteAsync(@"
                UPDATE Products SET CategoryId = @CategoryId, Name = @Name, 
                                    Description = @Description, Barcode = @Barcode, 
                                    UpdatedAt = GETDATE()
                WHERE Id = @Id", new { id, request.CategoryId, request.Name, request.Description, request.Barcode }, trans);

            // 2. Update Price (if provided)
            await db.ExecuteAsync("UPDATE Prices SET IsCurrent = 0 WHERE ProductId = @id", new { id }, trans);
            await db.ExecuteAsync(@"
                INSERT INTO Prices (ProductId, Price, Currency, IsCurrent)
                VALUES (@id, @Price, 'USD', 1)", new { id, request.Price }, trans);

            // 3. Update Stock thresholds
            await db.ExecuteAsync(@"
                UPDATE Stock SET MinQuantity = @MinQuantity, UpdatedAt = GETDATE()
                WHERE ProductId = @id", new { id, request.MinQuantity }, trans);

            trans.Commit();
        }
        catch
        {
            trans.Rollback();
            throw;
        }
    }


    public async Task SoftDeleteAsync(long id)
    {

        using var db = CreateConnection();
        await db.ExecuteAsync("UPDATE Products SET IsActive = 0, UpdatedAt = GETDATE() WHERE Id = @Id", new { Id = id });

    }
}