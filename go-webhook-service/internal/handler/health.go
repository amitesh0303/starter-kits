package handler

import (
	"encoding/json"
	"net/http"
)

// HealthCheck returns the service health status.
func HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "healthy",
		"service": "go-webhook-service",
	})
}
