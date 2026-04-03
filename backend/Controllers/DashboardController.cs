using backend.Data;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/dashboard")]
public sealed class DashboardController : ControllerBase
{
    private readonly ShopRepository _repo;

    public DashboardController(ShopRepository repo)
    {
        _repo = repo;
    }

    [HttpGet]
    public IActionResult Get()
    {
        if (!ShopRepository.TryGetCustomerId(HttpContext, out var customerId))
        {
            return BadRequest(new { error = "No customer selected." });
        }

        try
        {
            var dashboard = _repo.GetDashboard(customerId);
            if (dashboard is null)
            {
                return NotFound(new { error = "Customer not found." });
            }

            return Ok(dashboard);
        }
        catch (Exception ex)
        {
            return Problem(ex.Message, statusCode: 500, title: "Failed to load dashboard");
        }
    }
}
