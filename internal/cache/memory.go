package cache

import (
	"context"
	"sync"
	"time"
)

// MemoryCache is an in-memory implementation of Cache.
// Thread-safe via mutex. No persistence — data is lost on restart.
// Suitable for development and testing.
type MemoryCache struct {
	mu    sync.RWMutex
	items map[string]*cacheItem
}

type cacheItem struct {
	value  []byte
	expiry time.Time
}

// NewMemoryCache creates a new in-memory cache.
func NewMemoryCache() *MemoryCache {
	return &MemoryCache{
		items: make(map[string]*cacheItem),
	}
}

// Get retrieves a cached value if it exists and hasn't expired.
func (c *MemoryCache) Get(ctx context.Context, key string) ([]byte, bool, error) {
	if ctx.Err() != nil {
		return nil, false, ctx.Err()
	}

	c.mu.RLock()
	defer c.mu.RUnlock()

	item, exists := c.items[key]
	if !exists {
		return nil, false, nil
	}

	// Check if item has expired
	if time.Now().After(item.expiry) {
		return nil, false, nil
	}

	return item.value, true, nil
}

// Set stores a value in cache with an expiry time.
func (c *MemoryCache) Set(ctx context.Context, key string, value []byte, ttl time.Duration) error {
	if ctx.Err() != nil {
		return ctx.Err()
	}

	c.mu.Lock()
	defer c.mu.Unlock()

	c.items[key] = &cacheItem{
		value:  value,
		expiry: time.Now().Add(ttl),
	}

	return nil
}

// Delete removes a cached value.
func (c *MemoryCache) Delete(ctx context.Context, key string) error {
	if ctx.Err() != nil {
		return ctx.Err()
	}

	c.mu.Lock()
	defer c.mu.Unlock()

	delete(c.items, key)
	return nil
}

// StartCleanup periodically removes expired items.
// Should be called once after creation: go cache.StartCleanup(ctx, 1*time.Minute)
func (c *MemoryCache) StartCleanup(ctx context.Context, interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			c.cleanup()
		}
	}
}

func (c *MemoryCache) cleanup() {
	c.mu.Lock()
	defer c.mu.Unlock()

	now := time.Now()
	for key, item := range c.items {
		if now.After(item.expiry) {
			delete(c.items, key)
		}
	}
}
