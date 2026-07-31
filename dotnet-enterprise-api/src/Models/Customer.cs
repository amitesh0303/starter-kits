namespace DotnetEnterpriseApi.Models;

public class Customer
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Company { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
