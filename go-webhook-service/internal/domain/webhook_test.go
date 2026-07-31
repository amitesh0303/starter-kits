package domain_test

import (
	"testing"

	"github.com/example/go-webhook-service/internal/domain"
)

func TestCreateWebhook(t *testing.T) {
	store := domain.NewInMemoryWebhookStore()
	w := store.Create("https://example.com/hook", []string{"order.created"}, "secret123")

	if w.ID == "" {
		t.Error("expected non-empty ID")
	}
	if w.URL != "https://example.com/hook" {
		t.Errorf("expected URL 'https://example.com/hook', got '%s'", w.URL)
	}
	if len(w.Events) != 1 || w.Events[0] != "order.created" {
		t.Errorf("unexpected events: %v", w.Events)
	}
	if !w.Active {
		t.Error("expected webhook to be active")
	}
}

func TestListWebhooks(t *testing.T) {
	store := domain.NewInMemoryWebhookStore()
	store.Create("https://example.com/hook1", []string{"event1"}, "s1")
	store.Create("https://example.com/hook2", []string{"event2"}, "s2")

	webhooks := store.List()
	if len(webhooks) != 2 {
		t.Errorf("expected 2 webhooks, got %d", len(webhooks))
	}
}

func TestGetByID(t *testing.T) {
	store := domain.NewInMemoryWebhookStore()
	created := store.Create("https://example.com/hook", []string{"event"}, "s")

	found, ok := store.GetByID(created.ID)
	if !ok {
		t.Fatal("expected to find webhook")
	}
	if found.URL != created.URL {
		t.Errorf("expected URL '%s', got '%s'", created.URL, found.URL)
	}

	_, ok = store.GetByID("nonexistent")
	if ok {
		t.Error("expected not found for invalid ID")
	}
}

func TestRecordDelivery(t *testing.T) {
	store := domain.NewInMemoryWebhookStore()
	w := store.Create("https://example.com/hook", []string{"event"}, "s")

	delivery := store.RecordDelivery(w.ID)
	if delivery.WebhookID != w.ID {
		t.Errorf("expected webhook ID '%s', got '%s'", w.ID, delivery.WebhookID)
	}
	if delivery.Status != "delivered" {
		t.Errorf("expected status 'delivered', got '%s'", delivery.Status)
	}
	if delivery.StatusCode != 200 {
		t.Errorf("expected status code 200, got %d", delivery.StatusCode)
	}
}
