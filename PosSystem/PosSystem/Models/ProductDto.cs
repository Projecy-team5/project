namespace PosSystem.Models;

public class ProductDto
{
    public long Id { get; set; }
    public string Sku { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? Barcode { get; set; }
    public string CategoryName { get; set; } = null!;
    public decimal CurrentPrice { get; set; }
    public int StockQuantity { get; set; }
    public int MinQuantity { get; set; }
    public bool LowStock => StockQuantity <= MinQuantity;
}

public class ProductSearchRequest
{
    public string? Query { get; set; }  // search name, sku, barcode
}

// --- Add these two classes below to fix the Controller errors ---

public class CreateProductRequest
{
    public string Sku { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? Barcode { get; set; }
    public long CategoryId { get; set; }
    public decimal Price { get; set; }
    public int InitialStock { get; set; }
    public int MinQuantity { get; set; }
}

public class UpdateProductRequest
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? Barcode { get; set; }
    public long CategoryId { get; set; }
    public decimal Price { get; set; }
    public int MinQuantity { get; set; }
    public bool IsActive { get; set; } = true;
}