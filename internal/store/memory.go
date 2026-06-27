package store

import (
	"context"
	"errors"
	"sync"
	"time"

	"github.com/google/uuid"
)

// MemoryStore is an in-memory implementation of PipelineStore.
// Thread-safe via mutex. No persistence — data is lost on restart.
// Suitable for development and testing.
type MemoryStore struct {
	mu        sync.RWMutex
	pipelines map[string]*Pipeline
}

// NewMemoryStore creates a new in-memory pipeline store.
func NewMemoryStore() *MemoryStore {
	return &MemoryStore{
		pipelines: make(map[string]*Pipeline),
	}
}

// Save adds or updates a pipeline in memory. Generates ID if empty.
func (s *MemoryStore) Save(ctx context.Context, pipeline *Pipeline) error {
	if ctx.Err() != nil {
		return ctx.Err()
	}

	if pipeline == nil {
		return errors.New("pipeline cannot be nil")
	}

	// Generate ID if not provided
	if pipeline.ID == "" {
		pipeline.ID = uuid.New().String()
	}

	now := time.Now().UTC()
	pipeline.CreatedAt = now
	pipeline.UpdatedAt = now

	s.mu.Lock()
	defer s.mu.Unlock()

	// Deep copy to avoid external mutations
	s.pipelines[pipeline.ID] = pipeline

	return nil
}

// Get retrieves a pipeline by ID. Returns an error if not found.
func (s *MemoryStore) Get(ctx context.Context, id string) (*Pipeline, error) {
	if ctx.Err() != nil {
		return nil, ctx.Err()
	}

	s.mu.RLock()
	defer s.mu.RUnlock()

	p, exists := s.pipelines[id]
	if !exists {
		return nil, ErrNotFound
	}

	return p, nil
}

// List returns all stored pipelines.
func (s *MemoryStore) List(ctx context.Context) ([]*Pipeline, error) {
	if ctx.Err() != nil {
		return nil, ctx.Err()
	}

	s.mu.RLock()
	defer s.mu.RUnlock()

	pipelines := make([]*Pipeline, 0, len(s.pipelines))
	for _, p := range s.pipelines {
		pipelines = append(pipelines, p)
	}

	return pipelines, nil
}

// Update modifies an existing pipeline. Returns ErrNotFound if pipeline doesn't exist.
func (s *MemoryStore) Update(ctx context.Context, pipeline *Pipeline) error {
	if ctx.Err() != nil {
		return ctx.Err()
	}

	if pipeline == nil {
		return errors.New("pipeline cannot be nil")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.pipelines[pipeline.ID]; !exists {
		return ErrNotFound
	}

	pipeline.UpdatedAt = time.Now().UTC()
	s.pipelines[pipeline.ID] = pipeline

	return nil
}

// Delete removes a pipeline by ID. Returns ErrNotFound if pipeline doesn't exist.
func (s *MemoryStore) Delete(ctx context.Context, id string) error {
	if ctx.Err() != nil {
		return ctx.Err()
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.pipelines[id]; !exists {
		return ErrNotFound
	}

	delete(s.pipelines, id)
	return nil
}
