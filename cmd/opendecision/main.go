// OpenDecision Server - Fase 2
// HTTP server that exposes the decision pipeline library (decisionlib) via REST API.
// Supports multiple storage backends: in-memory, DynamoDB, PostgreSQL.
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/lucasrodrigues062/opendecision/internal/cache"
	"github.com/lucasrodrigues062/opendecision/internal/config"
	"github.com/lucasrodrigues062/opendecision/internal/store"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Validate configuration
	if err := cfg.Validate(); err != nil {
		log.Fatalf("❌ Configuration error: %v", err)
	}

	log.Printf("✅ Configuration loaded: %v", cfg)

	// Create background context for cleanup
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Initialize storage backend
	var pipelineStore store.PipelineStore
	var err error

	switch cfg.StoreBackend {
	case "dynamo":
		log.Printf("📦 Initializing DynamoDB store (table: %s)...", cfg.DynamoTable)
		pipelineStore, err = store.NewDynamoStore(ctx, cfg.DynamoTable, cfg.AWSRegion, cfg.DynamoEndpoint)
		if err != nil {
			log.Fatalf("❌ Failed to initialize DynamoDB: %v", err)
		}
		log.Println("✅ DynamoDB store initialized")

	case "memory":
		log.Println("📦 Using in-memory store (data will be lost on restart)")
		pipelineStore = store.NewMemoryStore()

	case "postgres":
		log.Fatalf("❌ PostgreSQL backend not yet implemented")

	default:
		log.Fatalf("❌ Unknown store backend: %s", cfg.StoreBackend)
	}

	// Initialize cache backend
	var cacheBackend cache.Cache

	switch cfg.CacheBackend {
	case "memory":
		log.Println("💾 Using in-memory cache")
		memCache := cache.NewMemoryCache()
		// Start cleanup goroutine
		go memCache.StartCleanup(ctx, 1*time.Minute)
		cacheBackend = memCache

	case "redis":
		log.Fatalf("❌ Redis backend not yet implemented")

	default:
		log.Fatalf("❌ Unknown cache backend: %s", cfg.CacheBackend)
	}

	// Create HTTP server
	srv := NewServer(cfg, pipelineStore, cacheBackend)

	// Start server in a goroutine
	serverErrs := make(chan error, 1)
	go func() {
		log.Printf("🚀 Starting server on port %d...", cfg.Port)
		addr := fmt.Sprintf(":%d", cfg.Port)
		serverErrs <- srv.Start(addr)
	}()

	// Wait for interrupt signal or server error
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	select {
	case err := <-serverErrs:
		if err != nil {
			log.Fatalf("❌ Server error: %v", err)
		}
	case sig := <-sigChan:
		log.Printf("📛 Received signal: %v", sig)
		cancel()
		log.Println("✅ Server stopped gracefully")
	}
}
