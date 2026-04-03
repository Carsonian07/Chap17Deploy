using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api")]
public sealed class CustomersController : ControllerBase
{
    private readonly ShopRepository _repo;

    public CustomersController(ShopRepository repo)
    {
        _repo = repo;
    }

    [HttpGet("customers")]
    public IActionResult Customers()
    {
        try
        {
            return Ok(_repo.GetCustomers());
        }
        catch (Exception ex)
        {
            return Problem(ex.Message, statusCode: 500, title: "Failed to fetch customers");
        }
    }

    [HttpPost("select-customer")]
    public IActionResult SelectCustomer([FromBody] SelectCustomerRequest request)
    {
        if (request.CustomerId <= 0)
        {
            return BadRequest(new { error = "customerId must be greater than zero." });
        }

        try
        {
            var customer = _repo.GetCustomer(request.CustomerId);
            if (customer is null)
            {
                return NotFound(new { error = "Customer not found." });
            }

            Response.Cookies.Append("customer_id", request.CustomerId.ToString(), new CookieOptions
            {
                HttpOnly = false,
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddDays(7)
            });

            return Ok(customer);
        }
        catch (Exception ex)
        {
            return Problem(ex.Message, statusCode: 500, title: "Failed to select customer");
        }
    }

    [HttpGet("customer/current")]
    public IActionResult Current()
    {
        if (!ShopRepository.TryGetCustomerId(HttpContext, out var customerId))
        {
            return NotFound(new { error = "No customer selected." });
        }

        try
        {
            var customer = _repo.GetCustomer(customerId);
            if (customer is null)
            {
                return NotFound(new { error = "Selected customer does not exist." });
            }

            return Ok(customer);
        }
        catch (Exception ex)
        {
            return Problem(ex.Message, statusCode: 500, title: "Failed to load selected customer");
        }
    }

    [HttpPost("customer/clear")]
    public IActionResult ClearCurrent()
    {
        Response.Cookies.Delete("customer_id");
        return Ok(new { success = true });
    }
}
