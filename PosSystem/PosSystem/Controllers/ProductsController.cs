namespace PosSystem.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PosSystem.Models;
using PosSystem.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapper;
[Authorize]
[Route("api/[controller]")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly IProductRepository _productRepo;

    public ProductsController(IProductRepository productRepo)
    {
        _productRepo = productRepo;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetAll()
    {
        var products = await _productRepo.GetAllAsync();
        return Ok(products);
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> Search([FromQuery] string q = "")
    {
        var products = string.IsNullOrWhiteSpace(q)
            ? await _productRepo.GetAllAsync()
            : await _productRepo.SearchAsync(q);
        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetById(long id)
    {
        var product = await _productRepo.GetByIdAsync(id);
        return product == null ? NotFound() : Ok(product);
    }

    [HttpGet("barcode/{barcode}")]
    public async Task<ActionResult<ProductDto>> GetByBarcode(string barcode)
    {
        var product = await _productRepo.GetByBarcodeAsync(barcode);
        return product == null ? NotFound() : Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create(CreateProductRequest req)
    {
        // 1. Check for existing SKU or Barcode to prevent duplicates
        var existing = await _productRepo.GetByBarcodeAsync(req.Barcode);
        if (existing != null)
            return Conflict(new { message = "A product with this barcode already exists." });

        // 2. Delegate complex insertion (Products + Prices + Stock) to Repo
        var newProduct = await _productRepo.CreateAsync(req);

        return CreatedAtAction(nameof(GetById), new { id = newProduct.Id }, newProduct);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(long id, UpdateProductRequest req)
    {
        var existing = await _productRepo.GetByIdAsync(id);
        if (existing == null) return NotFound();

        // Update logic (handling price history and stock) is encapsulated in the repo
        await _productRepo.UpdateAsync(id, req);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(long id)
    {
        var existing = await _productRepo.GetByIdAsync(id);
        if (existing == null) return NotFound();

        // Fixed: Moved the DB logic out of the controller and into the repo
        await _productRepo.SoftDeleteAsync(id);

        return NoContent();
    }
}