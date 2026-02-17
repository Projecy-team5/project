using PosSystem.Models;

public interface IProductRepository
{
    Task<IEnumerable<ProductDto>> GetAllAsync();
    Task<IEnumerable<ProductDto>> SearchAsync(string query);
    Task<ProductDto?> GetByIdAsync(long id);
    Task<ProductDto?> GetByBarcodeAsync(string barcode);

    // These are probably the new ones causing the error
    Task<ProductDto> CreateAsync(CreateProductRequest request);
    Task UpdateAsync(long id, UpdateProductRequest request);
    Task SoftDeleteAsync(long id);
}   