package main

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/lucasrodrigues062/opendecision/internal/store"
	"github.com/lucasrodrigues062/opendecision/pkg/decisionlib"
)

// CreatePipelineRequest is the request body for POST /pipelines.
type CreatePipelineRequest struct {
	Name        string             `json:"name"`
	Description string             `json:"description"`
	Steps       []decisionlib.Step `json:"steps"`
	Nodes       json.RawMessage    `json:"nodes,omitempty"`
	Edges       json.RawMessage    `json:"edges,omitempty"`
}

// handleHealth checks server health (liveness + readiness).
func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{
		"status": "healthy",
		"store":  s.config.StoreBackend,
		"cache":  s.config.CacheBackend,
	})
}

// handleCreatePipeline creates a new pipeline (POST /pipelines).
func (s *Server) handleCreatePipeline(w http.ResponseWriter, r *http.Request) {
	var req CreatePipelineRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Name == "" {
		writeError(w, http.StatusBadRequest, "name is required")
		return
	}

	pipeline := &store.Pipeline{
		Name:        req.Name,
		Description: req.Description,
		Steps:       req.Steps,
		Nodes:       req.Nodes,
		Edges:       req.Edges,
	}

	// Try to save the pipeline
	if err := s.store.Save(r.Context(), pipeline); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to save pipeline")
		return
	}

	writeJSON(w, http.StatusCreated, pipeline)
}

// handleListPipelines returns all pipelines (GET /pipelines).
func (s *Server) handleListPipelines(w http.ResponseWriter, r *http.Request) {
	pipelines, err := s.store.List(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list pipelines")
		return
	}

	if pipelines == nil {
		pipelines = []*store.Pipeline{}
	}

	writeJSON(w, http.StatusOK, pipelines)
}

// handleGetPipeline returns a single pipeline (GET /pipelines/{id}).
func (s *Server) handleGetPipeline(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	pipeline, err := s.store.Get(r.Context(), id)
	if err != nil {
		if err == store.ErrNotFound {
			writeError(w, http.StatusNotFound, "pipeline not found")
		} else {
			writeError(w, http.StatusInternalServerError, "failed to get pipeline")
		}
		return
	}

	writeJSON(w, http.StatusOK, pipeline)
}

// handleUpdatePipeline updates a pipeline (PUT /pipelines/{id}).
func (s *Server) handleUpdatePipeline(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var req CreatePipelineRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Get existing pipeline
	pipeline, err := s.store.Get(r.Context(), id)
	if err != nil {
		if err == store.ErrNotFound {
			writeError(w, http.StatusNotFound, "pipeline not found")
		} else {
			writeError(w, http.StatusInternalServerError, "failed to get pipeline")
		}
		return
	}

	// Update fields
	if req.Name != "" {
		pipeline.Name = req.Name
	}
	if req.Description != "" {
		pipeline.Description = req.Description
	}
	if req.Steps != nil {
		pipeline.Steps = req.Steps
	}
	if req.Nodes != nil {
		pipeline.Nodes = req.Nodes
	}
	if req.Edges != nil {
		pipeline.Edges = req.Edges
	}

	// Save updated pipeline
	if err := s.store.Update(r.Context(), pipeline); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update pipeline")
		return
	}

	writeJSON(w, http.StatusOK, pipeline)
}

// handleDeletePipeline deletes a pipeline (DELETE /pipelines/{id}).
func (s *Server) handleDeletePipeline(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	if err := s.store.Delete(r.Context(), id); err != nil {
		if err == store.ErrNotFound {
			writeError(w, http.StatusNotFound, "pipeline not found")
		} else {
			writeError(w, http.StatusInternalServerError, "failed to delete pipeline")
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
