using PosSystem.Models;

namespace PosSystem.Repositories;

public interface IOrderRepository
{
    Task<long> CreateOrderAsync(CreateOrderRequest request, long shiftId, string orderNumber, decimal total, decimal tax, decimal subtotal);
    Task<IEnumerable<OrderSummaryDto>> GetAllAsync();
    Task<OrderDetailDto?> GetByIdAsync(long id);
}