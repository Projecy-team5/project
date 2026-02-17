using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PosSystem.Models;
using System.Data;
using Dapper;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class DashboardController : ControllerBase
{
    private readonly IDbConnection _db;

    public DashboardController(IConfiguration config)
    {
        _db = new Microsoft.Data.SqlClient.SqlConnection(config.GetConnectionString("DefaultConnection"));
    }

    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStats>> GetStats()
    {
        var today = DateTime.Today;

        var salesSql = @"
            SELECT ISNULL(SUM(Total), 0) AS TodaySales,
                   COUNT(*) AS TodayOrders
            FROM Orders
            WHERE CAST(CreatedAt AS DATE) = @Today";

        var stats = await _db.QuerySingleAsync<DashboardStats>(salesSql, new { Today = today });

        var lowStockSql = @"
            SELECT p.Name, p.Sku, s.Quantity, s.MinQuantity
            FROM Products p
            JOIN Stock s ON p.Id = s.ProductId
            WHERE s.Quantity <= s.MinQuantity AND p.IsActive = 1
            ORDER BY s.Quantity ASC";

        stats.LowStockProducts = (await _db.QueryAsync<LowStockProduct>(lowStockSql)).ToList();

        return Ok(stats);
    }
}