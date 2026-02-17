using Dapper;
using PosSystem.Models;
using PosSystem.Repositories;
using System.Data;
using Microsoft.Data.SqlClient;

namespace PosSystem.Services;

public class OrderService
{
    private readonly IDbConnection _db;
    private readonly IProductRepository _productRepo;
    private readonly IStockRepository _stockRepo;
    private readonly IShiftRepository _shiftRepo;

    public OrderService(
        IConfiguration config,
        IProductRepository productRepo,
        IStockRepository stockRepo,
        IShiftRepository shiftRepo) // Added ShiftRepo to constructor
    {
        _db = new SqlConnection(config.GetConnectionString("DefaultConnection"));
        _productRepo = productRepo;
        _stockRepo = stockRepo;
        _shiftRepo = shiftRepo;
    }

    public async Task<CreateOrderResponse?> CreateOrderAsync(CreateOrderRequest request, long userId)
    {
        // 1. Validate Shift Status BEFORE opening a transaction
        var currentShift = await _shiftRepo.GetCurrentShiftAsync(userId);
        if (currentShift == null)
        {
            throw new Exception("Cannot process order: You do not have an open shift. Please open a shift first.");
        }

        if (_db.State == ConnectionState.Closed) _db.Open();
        using var transaction = _db.BeginTransaction();

        try
        {
            // Generate order number
            var orderNumber = "ORD-" + DateTime.Now.ToString("yyyyMMddHHmmss");

            // Calculate totals and validate stock
            decimal subtotal = 0;
            var itemsToProcess = new List<dynamic>();

            foreach (var itemReq in request.Items)
            {
                var product = await _productRepo.GetByIdAsync(itemReq.ProductId);
                if (product == null || product.StockQuantity < itemReq.Quantity)
                    throw new Exception($"Insufficient stock for {product?.Name ?? "product"}");

                var itemTotal = product.CurrentPrice * itemReq.Quantity;
                subtotal += itemTotal;

                itemsToProcess.Add(new
                {
                    ProductId = itemReq.ProductId,
                    Price = product.CurrentPrice,
                    Quantity = itemReq.Quantity,
                    Total = itemTotal,
                    NewStockLevel = product.StockQuantity - itemReq.Quantity
                });
            }

            var discountAmount = subtotal * (request.Discount / 100);
            var tax = subtotal * 0.10m;  // 10% tax
            var total = subtotal - discountAmount + tax;

            if (request.PaidAmount < total)
                throw new Exception("Insufficient payment");

            var change = request.PaidAmount - total;

            // 2. Create Order (Including ShiftId)
            var orderSql = @"
                INSERT INTO Orders (OrderNumber, UserId, ShiftId, CustomerId, Subtotal, Tax, Discount, Total, CreatedAt)
                VALUES (@OrderNumber, @UserId, @ShiftId, @CustomerId, @Subtotal, @Tax, @DiscountAmount, @Total, GETDATE());
                SELECT CAST(SCOPE_IDENTITY() AS BIGINT);";

            var orderId = await _db.QuerySingleAsync<long>(orderSql, new
            {
                OrderNumber = orderNumber,
                UserId = userId,
                ShiftId = currentShift.Id, // Linking the order to the shift
                CustomerId = request.CustomerId,
                Subtotal = subtotal,
                Tax = tax,
                DiscountAmount = discountAmount,
                Total = total
            }, transaction);

            // 3. Create OrderItems & Update Stock
            foreach (var item in itemsToProcess)
            {
                await _db.ExecuteAsync(@"
                    INSERT INTO OrderItems (OrderId, ProductId, Price, Quantity, Total)
                    VALUES (@OrderId, @ProductId, @Price, @Quantity, @Total)",
                    new { OrderId = orderId, item.ProductId, item.Price, item.Quantity, item.Total }, transaction);

                // Deduct stock using the calculated new stock level
                await _stockRepo.UpdateQuantityAsync(item.ProductId, (int)item.NewStockLevel);
            }

            // 4. Create Payment
            await _db.ExecuteAsync(@"
                INSERT INTO Payments (OrderId, PaymentMethod, Amount, TransactionRef, CreatedAt)
                VALUES (@OrderId, @PaymentMethod, @Amount, @TransactionRef, GETDATE())",
                new
                {
                    OrderId = orderId,
                    request.PaymentMethod,
                    Amount = request.PaidAmount,
                    request.TransactionRef
                }, transaction);

            transaction.Commit();

            return new CreateOrderResponse
            {
                OrderNumber = orderNumber,
                Total = total,
                Change = change
            };
        }
        catch (Exception ex)
        {
            transaction.Rollback();
            // Log the error (ex) here if you have a logger
            throw; // Re-throw to let the controller handle the error message
        }
        finally
        {
            _db.Close();
        }
    }
}