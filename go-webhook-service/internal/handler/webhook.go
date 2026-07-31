package handler

import (
	"encoding/json"
	"net/http"

	"github.com/example/go-webhook-service/internal/domain"
	"github.com/go-chi/chi/v5"
)

var store = domain.NewInMemoryWebhookStore()

// CreateWebhook creates a new webhook subscription.
func CreateWebhook(w http.ResponseWriter, r *http.Request) {
	var req struct {
		URL    string   `json:"url"`
		Events []string `json:"events"`
		Secret string   `json:"secret"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	webhook := store.Create(req.URL, req.Events, req.Secret)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(webhook)
}

// ListWebhooks returns all registered webhooks.
func ListWebhooks(w http.ResponseWriter, r *http.Request) {
	webhooks := store.List()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(webhooks)
}

// GetWebhook returns a single webhook by ID.
func GetWebhook(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	webhook, ok := store.GetByID(id)
	if !ok {
		http.Error(w, `{"error":"webhook not found"}`, http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(webhook)
}

// DeliverWebhook simulates delivering a webhook event.
func DeliverWebhook(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	_, ok := store.GetByID(id)
	if !ok {
		http.Error(w, `{"error":"webhook not found"}`, http.StatusNotFound)
		return
	}

	delivery := store.RecordDelivery(id)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(delivery)
}
