using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DotnetEnterpriseApi.Services;

namespace DotnetEnterpriseApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomersController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    [HttpGet]
    public IActionResult List()
    {
        return Ok(_customerService.List());
    }

    [HttpGet("{id}")]
    public IActionResult Get(string id)
    {
        var customer = _customerService.GetById(id);
        if (customer == null)
            return NotFound(new { error = "Customer not found" });
        return Ok(customer);
    }

    [HttpPost]
    public IActionResult Create([FromBody] CreateCustomerRequest request)
    {
        var customer = _customerService.Create(request.Name, request.Email, request.Company);
        return Created($"/api/customers/{customer.Id}", customer);
    }
}

public record CreateCustomerRequest(string Name, string Email, string? Company);
