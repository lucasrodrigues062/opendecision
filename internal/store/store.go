// Package store defines the repository interface and data models for pipelines.
package store

import (
	"context"
	"time"

	"github.com/lucasrodrigues062/opendecision/pkg/decisionlib"
)

// Pipeline represents a saved decision pipeline.
type Pipeline struct {
	ID          string                  `json:"id" dynamodbav:"id"`
	Name        string                  `json:"name" dynamodbav:"name"`
	Description string                  `json:"description" dynamodbav:"description"`
	Steps       []decisionlib.Step      `json:"steps" dynamodbav:"steps"`
	CreatedAt   time.Time               `json:"created_at" dynamodbav:"created_at"`
	UpdatedAt   time.Time               `json:"updated_at" dynamodbav:"updated_at"`
}

// PipelineStore defines the interface for pipeline persistence.
// Implementations can use different backends: memory, DynamoDB, PostgreSQL, etc.
// This interface ensures that business logic never depends on a specific database.
type PipelineStore interface {
	// Save creates a new pipeline. ID should be generated if empty.
	Save(ctx context.Context, pipeline *Pipeline) error

	// Get retrieves a pipeline by ID.
	Get(ctx context.Context, id string) (*Pipeline, error)

	// List returns all pipelines. Empty slice if none exist.
	List(ctx context.Context) ([]*Pipeline, error)

	// Update modifies an existing pipeline.
	Update(ctx context.Context, pipeline *Pipeline) error

	// Delete removes a pipeline by ID.
	Delete(ctx context.Context, id string) error
}
