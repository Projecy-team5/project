using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PosSystem.Models;
using PosSystem.Repositories;
using PosSystem.Services;

namespace PosSystem.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class OrdersController : ControllerBase
{
    private readonly OrderService _orderService;
    private readonly IOrderRepository _orderRepo;

    public OrdersController(OrderService orderService, IOrderRepository orderRepo)
    {
        _orderService = orderService;
        _orderRepo = orderRepo;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderSummaryDto>>> GetAll()
    {
        var orders = await _orderRepo.GetAllAsync();
        return Ok(orders);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDetailDto>> GetById(long id)
    {
        var order = await _orderRepo.GetByIdAsync(id);
        if (order == null) return NotFound();
        return Ok(order);
    }

    [HttpPost]
    public async Task<ActionResult<CreateOrderResponse>> Create(CreateOrderRequest request)
    {
        var userIdStr = User.FindFirst("userId")?.Value;
        if (!long.TryParse(userIdStr, out long userId))
            return Unauthorized("Invalid session. Please login again.");

        var result = await _orderService.CreateOrderAsync(request, userId);
        return result == null ? BadRequest("Failed to create order. Check shift status.") : Ok(result);
    }
}