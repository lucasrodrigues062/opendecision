// Package config loads and validates OpenDecision configuration from environment variables.
package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

// Config holds all configuration for the OpenDecision server.
type Config struct {
	// Server
	Port     int
	LogLevel string

	// Storage
	StoreBackend string // "memory", "dynamo", "postgres"

	// DynamoDB configuration (when StoreBackend == "dynamo")
	DynamoEndpoint string // optional, for LocalStack
	DynamoTable    string
	AWSRegion      string

	// AWS credentials (optional, uses IAM role in production)
	AWSAccessKeyID     string
	AWSSecretAccessKey string

	// Cache
	CacheBackend string // "memory", "redis"
	CacheTTL     time.Duration

	// Redis configuration (when CacheBackend == "redis")
	RedisURL string
}

// Load reads configuration from environment variables with sensible defaults.
func Load() *Config {
	return &Config{
		Port:               getEnvInt("PORT", 8080),
		LogLevel:           getEnv("LOG_LEVEL", "info"),
		StoreBackend:       getEnv("STORE_BACKEND", "memory"),
		DynamoEndpoint:     getEnv("AWS_ENDPOINT_URL", ""),
		DynamoTable:        getEnv("DYNAMO_TABLE", "pipelines"),
		AWSRegion:          getEnv("AWS_REGION", "us-east-1"),
		AWSAccessKeyID:     getEnv("AWS_ACCESS_KEY_ID", ""),
		AWSSecretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY", ""),
		CacheBackend:       getEnv("CACHE_BACKEND", "memory"),
		CacheTTL:           time.Duration(getEnvInt("CACHE_TTL_SECONDS", 300)) * time.Second,
		RedisURL:           getEnv("REDIS_URL", "redis://localhost:6379/0"),
	}
}

// Validate checks that the configuration is valid.
func (c *Config) Validate() error {
	switch c.StoreBackend {
	case "memory", "dynamo", "postgres":
		// valid
	default:
		return fmt.Errorf("invalid STORE_BACKEND: %s (expected: memory, dynamo, postgres)", c.StoreBackend)
	}

	switch c.CacheBackend {
	case "memory", "redis":
		// valid
	default:
		return fmt.Errorf("invalid CACHE_BACKEND: %s (expected: memory, redis)", c.CacheBackend)
	}

	switch c.LogLevel {
	case "debug", "info", "warn", "error":
		// valid
	default:
		return fmt.Errorf("invalid LOG_LEVEL: %s (expected: debug, info, warn, error)", c.LogLevel)
	}

	if c.Port < 1 || c.Port > 65535 {
		return fmt.Errorf("invalid PORT: %d", c.Port)
	}

	// DynamoDB-specific validation
	if c.StoreBackend == "dynamo" && c.DynamoTable == "" {
		return fmt.Errorf("DYNAMO_TABLE is required when STORE_BACKEND=dynamo")
	}

	return nil
}

// String returns a censored representation of config for logging.
func (c *Config) String() string {
	return fmt.Sprintf(
		"Config{Port:%d, LogLevel:%s, StoreBackend:%s, CacheBackend:%s, Region:%s, CacheTTL:%v}",
		c.Port, c.LogLevel, c.StoreBackend, c.CacheBackend, c.AWSRegion, c.CacheTTL,
	)
}

// Helper functions

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}
