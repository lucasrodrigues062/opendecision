// Package cache defines a caching interface for executor results.
package cache

import (
	"context"
	"time"
)

// Cache defines the interface for caching execution results.
// Implementations can use different backends: memory, Redis, etc.
type Cache interface {
	// Get retrieves a cached value by key.
	// Returns the value, true if found, false if not found, and any error.
	Get(ctx context.Context, key string) ([]byte, bool, error)

	// Set stores a value in cache with a TTL.
	Set(ctx context.Context, key string, value []byte, ttl time.Duration) error

	// Delete removes a cached value.
	Delete(ctx context.Context, key string) error
}
