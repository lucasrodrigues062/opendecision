package main

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/lucasrodrigues062/opendecision/internal/executor"
	"github.com/lucasrodrigues062/opendecision/internal/store"
)

// handleExecuteAdHoc executes a pipeline with inline steps (POST /execute).
// This is a convenience endpoint for one-off executions without saving the pipeline.
func (s *Server) handleExecuteAdHoc(w http.ResponseWriter, r *http.Request) {
	var req executor.ExecuteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if len(req.Data) == 0 {
		writeError(w, http.StatusBadRequest, "data is required")
		return
	}

	if len(req.Steps) == 0 {
		writeError(w, http.StatusBadRequest, "steps are required")
		return
	}

	resp, err := executor.Execute(r.Context(), req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, resp)
}

// handleExecutePipelineByID executes a saved pipeline (POST /pipelines/{id}/execute).
func (s *Server) handleExecutePipelineByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	// Get the saved pipeline
	pipeline, err := s.store.Get(r.Context(), id)
	if err != nil {
		if err == store.ErrNotFound {
			writeError(w, http.StatusNotFound, "pipeline not found")
		} else {
			writeError(w, http.StatusInternalServerError, "failed to get pipeline")
		}
		return
	}

	// Parse request body (only data is required)
	var req struct {
		Data []map[string]any `json:"data"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if len(req.Data) == 0 {
		writeError(w, http.StatusBadRequest, "data is required")
		return
	}

	// Execute with saved pipeline's steps
	execReq := executor.ExecuteRequest{
		Data:  req.Data,
		Steps: pipeline.Steps,
	}

	resp, err := executor.Execute(r.Context(), execReq)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, resp)
}
