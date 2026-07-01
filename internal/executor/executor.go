// Package executor provides the core business logic for executing decision pipelines.
// It is transport-agnostic: can be called from HTTP, SQS, Kafka, RabbitMQ, etc.
package executor

import (
	"context"
	"fmt"
	"time"

	"github.com/lucasrodrigues062/opendecision/pkg/decisionlib"
)

// ExecuteRequest is the transport-agnostic contract for pipeline execution.
// Can be populated from HTTP JSON, SQS message, Kafka topic, etc.
// Either Steps or Graph must be provided.
type ExecuteRequest struct {
	Data  []map[string]any   `json:"data"`
	Steps []decisionlib.Step `json:"steps,omitempty"`
	Graph *decisionlib.Graph `json:"graph,omitempty"`
}

// ExecuteResponse is the result of pipeline execution.
type ExecuteResponse struct {
	Result    []map[string]any `json:"result"`
	ElapsedMs float64          `json:"elapsed_ms"`
}

// Execute runs a decision pipeline or graph against data.
// This is the only function that adapters need to call.
// It knows nothing about HTTP, SQS, Kafka, etc. — purely business logic.
func Execute(ctx context.Context, req ExecuteRequest) (ExecuteResponse, error) {
	if ctx.Err() != nil {
		return ExecuteResponse{}, ctx.Err()
	}

	if req.Data == nil {
		return ExecuteResponse{}, fmt.Errorf("data cannot be nil")
	}

	if len(req.Steps) == 0 && req.Graph == nil {
		return ExecuteResponse{}, fmt.Errorf("steps or graph are required")
	}

	start := time.Now()

	var result []map[string]any
	var err error

	if req.Graph != nil {
		result, err = decisionlib.RunGraph(req.Data, *req.Graph)
	} else {
		pipeline := decisionlib.PipelineAST{Steps: req.Steps}
		result, err = decisionlib.Run(req.Data, pipeline)
	}

	if err != nil {
		return ExecuteResponse{}, err
	}

	elapsed := time.Since(start)
	elapsedMs := float64(elapsed.Microseconds()) / 1000.0

	return ExecuteResponse{
		Result:    result,
		ElapsedMs: elapsedMs,
	}, nil
}
