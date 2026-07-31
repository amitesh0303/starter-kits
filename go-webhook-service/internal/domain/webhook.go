package domain

import (
	"crypto/rand"
	"encoding/hex"
	"sync"
	"time"
)

// Webhook represents a webhook subscription.
type Webhook struct {
	ID        string   `json:"id"`
	URL       string   `json:"url"`
	Events    []string `json:"events"`
	Secret    string   `json:"secret"`
	Active    bool     `json:"active"`
	CreatedAt string   `json:"created_at"`
}

// Delivery represents a webhook delivery attempt.
type Delivery struct {
	ID         string `json:"id"`
	WebhookID  string `json:"webhook_id"`
	Status     string `json:"status"`
	StatusCode int    `json:"status_code"`
	Duration   int    `json:"duration_ms"`
	CreatedAt  string `json:"created_at"`
}

// WebhookStore is the interface for webhook persistence.
type WebhookStore interface {
	Create(url string, events []string, secret string) Webhook
	List() []Webhook
	GetByID(id string) (Webhook, bool)
	RecordDelivery(webhookID string) Delivery
}

// InMemoryWebhookStore is a thread-safe in-memory implementation.
type InMemoryWebhookStore struct {
	mu         sync.RWMutex
	webhooks   map[string]Webhook
	deliveries []Delivery
}

// NewInMemoryWebhookStore creates a new in-memory webhook store.
func NewInMemoryWebhookStore() *InMemoryWebhookStore {
	return &InMemoryWebhookStore{
		webhooks:   make(map[string]Webhook),
		deliveries: make([]Delivery, 0),
	}
}

func generateID() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func (s *InMemoryWebhookStore) Create(url string, events []string, secret string) Webhook {
	s.mu.Lock()
	defer s.mu.Unlock()

	w := Webhook{
		ID:        generateID(),
		URL:       url,
		Events:    events,
		Secret:    secret,
		Active:    true,
		CreatedAt: time.Now().UTC().Format(time.RFC3339),
	}
	s.webhooks[w.ID] = w
	return w
}

func (s *InMemoryWebhookStore) List() []Webhook {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]Webhook, 0, len(s.webhooks))
	for _, w := range s.webhooks {
		result = append(result, w)
	}
	return result
}

func (s *InMemoryWebhookStore) GetByID(id string) (Webhook, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	w, ok := s.webhooks[id]
	return w, ok
}

func (s *InMemoryWebhookStore) RecordDelivery(webhookID string) Delivery {
	s.mu.Lock()
	defer s.mu.Unlock()

	d := Delivery{
		ID:         generateID(),
		WebhookID:  webhookID,
		Status:     "delivered",
		StatusCode: 200,
		Duration:   42,
		CreatedAt:  time.Now().UTC().Format(time.RFC3339),
	}
	s.deliveries = append(s.deliveries, d)
	return d
}
