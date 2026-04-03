using backend.Data;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/warehouse")]
public sealed class WarehouseController : ControllerBase
{
    private readonly ShopRepository _repo;

    public WarehouseController(ShopRepository repo)
    {
        _repo = repo;
    }

    [HttpGet("priority")]
    public IActionResult Priority()
    {
        try
        {
            return Ok(_repo.GetPriorityQueue());
        }
        catch (Exception ex)
        {
            return Problem(ex.Message, statusCode: 500, title: "Failed to load priority queue");
        }
    }
}
