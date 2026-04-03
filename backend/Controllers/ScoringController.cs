using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/scoring")]
public sealed class ScoringController : ControllerBase
{
    private readonly ScoringService _scoring;

    public ScoringController(ScoringService scoring)
    {
        _scoring = scoring;
    }

    [HttpPost("run")]
    public async Task<IActionResult> Run()
    {
        var result = await _scoring.RunAsync();
        return Ok(result);
    }

    [HttpPost("retrain")]
    public async Task<IActionResult> Retrain()
    {
        var result = await _scoring.RetrainAsync();
        return Ok(result);
    }
}
