using Microsoft.AspNetCore.Mvc;

namespace DotnetEnterpriseApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Check()
    {
        return Ok(new { status = "healthy", service = "dotnet-enterprise-api" });
    }
}
