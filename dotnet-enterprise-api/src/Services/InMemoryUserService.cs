using System.Security.Cryptography;
using System.Text;
using DotnetEnterpriseApi.Models;

namespace DotnetEnterpriseApi.Services;

public class InMemoryUserService : IUserService
{
    private readonly List<User> _users = new();

    public User? Register(string email, string password)
    {
        if (_users.Any(u => u.Email == email))
            return null;

        var user = new User
        {
            Email = email,
            PasswordHash = HashPassword(password),
        };
        _users.Add(user);
        return user;
    }

    public User? Authenticate(string email, string password)
    {
        var hash = HashPassword(password);
        return _users.FirstOrDefault(u => u.Email == email && u.PasswordHash == hash);
    }

    private static string HashPassword(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return Convert.ToHexStringLower(bytes);
    }
}
