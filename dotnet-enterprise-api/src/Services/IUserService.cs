using DotnetEnterpriseApi.Models;

namespace DotnetEnterpriseApi.Services;

public interface IUserService
{
    User? Register(string email, string password);
    User? Authenticate(string email, string password);
}
