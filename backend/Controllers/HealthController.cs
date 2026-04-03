using backend.Data;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/health")]
public sealed class HealthController : ControllerBase
{
    private readonly ShopRepository _repo;

    public HealthController(ShopRepository repo)
    {
        _repo = repo;
    }

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "ok",
            provider = _repo.IsUsingPostgres ? "postgres" : "sqlite",
            dbPath = _repo.DbPath
        });
    }
}
