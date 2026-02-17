namespace PosSystem.Models;

public class CreateOrderRequest
{
    public long? CustomerId { get; set; }  // optional
    public List<CreateOrderItemRequest> Items { get; set; } = new();
    public decimal Discount { get; set; } = 0;  // percentage
    public string PaymentMethod { get; set; } = "Cash";
    public decimal PaidAmount { get; set; }
    public string? TransactionRef { get; set; }
}

public class CreateOrderItemRequest
{
    public long ProductId { get; set; }
    public int Quantity { get; set; }
}

public class CreateOrderResponse
{
    public string OrderNumber { get; set; } = null!;
    public decimal Total { get; set; }
    public decimal Change { get; set; }
}
public class OrderSummaryDto
{
    public long Id { get; set; }
    public string OrderNumber { get; set; } = null!;
    public decimal Total { get; set; }
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public string CustomerName { get; set; } = "Walk-in";
    public string PaymentMethod { get; set; } = null!;

    // These must exist to fix the "red" code in the repository
    public decimal Subtotal { get; set; }
    public decimal Tax { get; set; }
    public decimal Discount { get; set; }
    public decimal PaidAmount { get; set; }
}

public class OrderDetailDto
{
    public OrderSummaryDto Order { get; set; } = null!;
    public List<OrderItemDto> Items { get; set; } = new();
    public decimal Subtotal { get; set; }
    public decimal Tax { get; set; }
    public decimal Discount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal Change { get; set; }
}

public class OrderItemDto
{
    public long ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public decimal Total { get; set; }
}