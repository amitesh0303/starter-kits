package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/example/go-webhook-service/internal/handler"
	"github.com/example/go-webhook-service/internal/middleware"
	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
)

func main() {
	r := chi.NewRouter()
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)

	// Public routes
	r.Get("/api/health", handler.HealthCheck)

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(middleware.JWTAuth)
		r.Post("/api/webhooks", handler.CreateWebhook)
		r.Get("/api/webhooks", handler.ListWebhooks)
		r.Get("/api/webhooks/{id}", handler.GetWebhook)
		r.Post("/api/webhooks/{id}/deliver", handler.DeliverWebhook)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server running on port %s\n", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		fmt.Fprintf(os.Stderr, "Server error: %v\n", err)
		os.Exit(1)
	}
}
