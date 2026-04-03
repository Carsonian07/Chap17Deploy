using backend.Data;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/debug")]
public sealed class DebugController : ControllerBase
{
    private readonly ShopRepository _repo;

    public DebugController(ShopRepository repo)
    {
        _repo = repo;
    }

    [HttpGet("schema")]
    public IActionResult Schema()
    {
        try
        {
            return Ok(_repo.GetSchema());
        }
        catch (Exception ex)
        {
            return Problem(ex.Message, statusCode: 500, title: "Schema inspection failed");
        }
    }
}
