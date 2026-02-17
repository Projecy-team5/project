using Dapper;
using Microsoft.Data.SqlClient;
using PosSystem.Models;
using System.Data;

namespace PosSystem.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly string _connectionString;

    public OrderRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("DefaultConnection")
            ?? throw new ArgumentNullException("Connection string not found");
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    // 1. Implementing the missing CreateOrderAsync method
    public async Task<long> CreateOrderAsync(CreateOrderRequest request, long shiftId, string orderNumber, decimal total, decimal tax, decimal subtotal)
    {
        using var db = CreateConnection();
        db.Open();
        using var transaction = db.BeginTransaction();

        try
        {
            // Insert Order Header
            var orderSql = @"
                    INSERT INTO Orders (OrderNumber, ShiftId, CustomerId, Subtotal, Tax, Discount, Total, PaidAmount, PaymentMethod, Status) -- 1. Removed CreatedAt from here
                    VALUES (@orderNumber, @shiftId, @CustomerId, @subtotal, @tax, @Discount, @total, @PaidAmount, @PaymentMethod, 'Completed'); -- 2. Removed GETDATE() from here
                    SELECT CAST(SCOPE_IDENTITY() as bigint);";
            var orderId = await db.ExecuteScalarAsync<long>(orderSql, new
            {
                orderNumber,
                shiftId,
                request.CustomerId,
                subtotal,
                tax,
                request.Discount,
                total,
                request.PaidAmount,
                request.PaymentMethod
            }, transaction);

            // Insert Order Items
            var itemSql = @"
                INSERT INTO OrderItems (OrderId, ProductId, Quantity, UnitPrice)
                SELECT @orderId, @ProductId, @Quantity, Price 
                FROM Products WHERE Id = @ProductId";

            foreach (var item in request.Items)
            {
                await db.ExecuteAsync(itemSql, new
                {
                    orderId,
                    item.ProductId,
                    item.Quantity
                }, transaction);

                // Update Stock
                await db.ExecuteAsync(
                    "UPDATE Products SET Stock = Stock - @Quantity WHERE Id = @ProductId",
                    new { item.Quantity, item.ProductId },
                    transaction);
            }

            transaction.Commit();
            return orderId;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    // 2. GetAll Implementation
    public async Task<IEnumerable<OrderSummaryDto>> GetAllAsync()
    {
        using var db = CreateConnection();
        var sql = @"
        SELECT o.Id, o.OrderNumber, o.Total, o.Status,
               -- Removed PaymentMethod and PaidAmount because they don't exist yet
               ISNULL(c.Name, 'Walk-in') AS CustomerName
        FROM Orders o
        LEFT JOIN Customers c ON o.CustomerId = c.Id
        ORDER BY o.Id DESC"; // Changed sorting if CreatedAt doesn't exist

        return await db.QueryAsync<OrderSummaryDto>(sql);
    }

    // 3. GetById Implementation
    public async Task<OrderDetailDto?> GetByIdAsync(long id)
    {
        using var db = CreateConnection();

        var orderSql = @"
            SELECT o.Id, o.OrderNumber, o.Total, o.Status, o.CreatedAt,
                   o.Subtotal, o.Tax, o.Discount, o.PaidAmount, o.PaymentMethod,
                   ISNULL(c.Name, 'Walk-in') AS CustomerName
            FROM Orders o
            LEFT JOIN Customers c ON o.CustomerId = c.Id
            WHERE o.Id = @Id";

        var order = await db.QuerySingleOrDefaultAsync<OrderSummaryDto>(orderSql, new { Id = id });
        if (order == null) return null;

        var itemsSql = @"
            SELECT oi.ProductId, p.Name AS ProductName, oi.UnitPrice AS Price, 
                   oi.Quantity, (oi.UnitPrice * oi.Quantity) AS Total
            FROM OrderItems oi
            JOIN Products p ON oi.ProductId = p.Id
            WHERE oi.OrderId = @Id";

        var items = await db.QueryAsync<OrderItemDto>(itemsSql, new { Id = id });

        return new OrderDetailDto
        {
            Order = order,
            Items = items.ToList(),
            Subtotal = order.Subtotal,
            Tax = order.Tax,
            Discount = order.Discount,
            PaidAmount = order.PaidAmount,
            Change = order.PaidAmount - order.Total
        };
    }
}