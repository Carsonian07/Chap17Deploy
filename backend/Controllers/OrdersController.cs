using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api")]
public sealed class OrdersController : ControllerBase
{
    private readonly ShopRepository _repo;

    public OrdersController(ShopRepository repo)
    {
        _repo = repo;
    }

    [HttpGet("products")]
    public IActionResult Products()
    {
        try
        {
            return Ok(_repo.GetProducts());
        }
        catch (Exception ex)
        {
            return Problem(ex.Message, statusCode: 500, title: "Failed to fetch products");
        }
    }

    [HttpPost("orders")]
    public IActionResult CreateOrder([FromBody] CreateOrderRequest request)
    {
        if (!ShopRepository.TryGetCustomerId(HttpContext, out var customerId))
        {
            return BadRequest(new { error = "No customer selected." });
        }

        try
        {
            var response = _repo.PlaceOrder(customerId, request);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return Problem(ex.Message, statusCode: 500, title: "Failed to create order");
        }
    }

    [HttpGet("orders")]
    public IActionResult Orders()
    {
        if (!ShopRepository.TryGetCustomerId(HttpContext, out var customerId))
        {
            return BadRequest(new { error = "No customer selected." });
        }

        try
        {
            return Ok(_repo.GetOrders(customerId));
        }
        catch (Exception ex)
        {
            return Problem(ex.Message, statusCode: 500, title: "Failed to load orders");
        }
    }

    [HttpGet("admin/orders")]
    public IActionResult AdminOrders()
    {
        try
        {
            return Ok(_repo.GetAdminOrders());
        }
        catch (Exception ex)
        {
            return Problem(ex.Message, statusCode: 500, title: "Failed to load admin order history");
        }
    }

    [HttpGet("orders/{orderId:long}")]
    public IActionResult OrderDetails(long orderId)
    {
        if (!ShopRepository.TryGetCustomerId(HttpContext, out var customerId))
        {
            return BadRequest(new { error = "No customer selected." });
        }

        try
        {
            var details = _repo.GetOrderDetails(customerId, orderId);
            if (details is null)
            {
                return NotFound(new { error = "Order not found for selected customer." });
            }

            return Ok(details);
        }
        catch (Exception ex)
        {
            return Problem(ex.Message, statusCode: 500, title: "Failed to load order details");
        }
    }
}
