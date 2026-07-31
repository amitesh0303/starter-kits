using DotnetEnterpriseApi.Models;

namespace DotnetEnterpriseApi.Services;

public interface ICustomerService
{
    List<Customer> List();
    Customer? GetById(string id);
    Customer Create(string name, string email, string? company);
}
