using DotnetEnterpriseApi.Models;

namespace DotnetEnterpriseApi.Services;

public class InMemoryCustomerService : ICustomerService
{
    private readonly List<Customer> _customers = new();

    public List<Customer> List() => _customers.ToList();

    public Customer? GetById(string id) => _customers.FirstOrDefault(c => c.Id == id);

    public Customer Create(string name, string email, string? company)
    {
        var customer = new Customer
        {
            Name = name,
            Email = email,
            Company = company,
        };
        _customers.Add(customer);
        return customer;
    }
}
