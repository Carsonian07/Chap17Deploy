using System.Diagnostics;
using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services;

public sealed class ScoringService
{
    private readonly string _repoRoot;

    public ScoringService(IHostEnvironment env)
    {
        _repoRoot = Path.GetFullPath(Path.Combine(env.ContentRootPath, ".."));
    }

    public Task<ScoringResultDto> RunAsync()
    {
        return RunScriptAsync("run_inference.py");
    }

    public Task<ScoringResultDto> RetrainAsync()
    {
        return RunScriptAsync("retrain_model.py");
    }

    private async Task<ScoringResultDto> RunScriptAsync(string scriptName)
    {
        var scriptPath = Path.Combine(_repoRoot, "jobs", scriptName);
        if (!File.Exists(scriptPath))
        {
            return new ScoringResultDto(false, DateTime.UtcNow, Message: $"Script not found at {scriptPath}");
        }

        try
        {
            using var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = "python",
                    Arguments = $"\"{scriptPath}\"",
                    WorkingDirectory = _repoRoot,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                }
            };

            process.Start();

            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(60));
            var stdoutTask = process.StandardOutput.ReadToEndAsync(cts.Token);
            var stderrTask = process.StandardError.ReadToEndAsync(cts.Token);
            await process.WaitForExitAsync(cts.Token);

            var stdout = await stdoutTask;
            var stderr = await stderrTask;
            var scored = ParseScoredCount(stdout);
            var ok = process.ExitCode == 0;

            return new ScoringResultDto(ok, DateTime.UtcNow, process.ExitCode, scored, stdout, stderr);
        }
        catch (OperationCanceledException)
        {
            return new ScoringResultDto(false, DateTime.UtcNow, Message: "Scoring timed out after 60 seconds.");
        }
        catch (Exception ex)
        {
            return new ScoringResultDto(false, DateTime.UtcNow, Message: ex.Message);
        }
    }

    private static int? ParseScoredCount(string stdout)
    {
        if (string.IsNullOrWhiteSpace(stdout))
        {
            return null;
        }

        var descriptive = Regex.Match(stdout, @"(?<count>\d+)\s+(orders?|rows?)\s+(scored|predicted)", RegexOptions.IgnoreCase);
        if (descriptive.Success && int.TryParse(descriptive.Groups["count"].Value, out var count))
        {
            return count;
        }

        var generic = Regex.Match(stdout, @"\b(?<count>\d+)\b");
        return generic.Success && int.TryParse(generic.Groups["count"].Value, out var fallback) ? fallback : null;
    }
}
