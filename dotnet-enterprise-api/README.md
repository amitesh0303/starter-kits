# .NET Enterprise API

Enterprise CRM and line-of-business API built with ASP.NET Core, ASP.NET Identity/JWT authentication, PostgreSQL/EF Core, and Stripe billing.

## Features

- ASP.NET Identity with JWT authentication
- Customer management (CRUD)
- Stripe subscription billing
- PostgreSQL with Entity Framework Core
- In-memory service implementations for testing
- xUnit test suite with WebApplicationFactory

## Quick Start

```bash
# Restore dependencies
dotnet restore

# Run development server
dotnet run --project src/

# Run tests
dotnet test

# Build for production
dotnet publish src/ -c Release
```

## Project Structure

```
src/
  Controllers/  - API endpoints (Health, Auth, Customers)
  Models/       - Domain entities (User, Customer)
  Services/     - Business logic interfaces and implementations
  Data/         - EF Core DbContext and migrations
Tests/          - xUnit integration tests
```

## Environment Variables

See `.env.example` for all required configuration values.
