package main

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/lucasrodrigues062/opendecision/internal/cache"
	"github.com/lucasrodrigues062/opendecision/internal/config"
	"github.com/lucasrodrigues062/opendecision/internal/static"
	"github.com/lucasrodrigues062/opendecision/internal/store"
)

// Server holds the HTTP server state and dependencies.
type Server struct {
	router chi.Router
	config *config.Config
	store  store.PipelineStore
	cache  cache.Cache
}

// NewServer creates a new HTTP server instance with all routes registered.
func NewServer(cfg *config.Config, pipelineStore store.PipelineStore, cacheBackend cache.Cache) *Server {
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	s := &Server{
		router: r,
		config: cfg,
		store:  pipelineStore,
		cache:  cacheBackend,
	}

	// Register API routes first so they take precedence over the SPA fallback.
	r.Get("/health", s.handleHealth)

	// Pipeline CRUD endpoints
	r.Post("/pipelines", s.handleCreatePipeline)
	r.Get("/pipelines", s.handleListPipelines)
	r.Get("/pipelines/{id}", s.handleGetPipeline)
	r.Put("/pipelines/{id}", s.handleUpdatePipeline)
	r.Delete("/pipelines/{id}", s.handleDeletePipeline)

	// Execute endpoints
	r.Post("/pipelines/{id}/execute", s.handleExecutePipelineByID)
	r.Post("/execute", s.handleExecuteAdHoc)

	// Static SPA fallback (must be registered after API routes).
	r.Get("/*", s.handleStatic)

	return s
}

// Start begins listening on the given address.
func (s *Server) Start(addr string) error {
	return http.ListenAndServe(addr, s.router)
}

// handleStatic serves the embedded React SPA.
func (s *Server) handleStatic(w http.ResponseWriter, r *http.Request) {
	handler, err := static.Handler()
	if err != nil {
		http.Error(w, "static assets not available", http.StatusInternalServerError)
		return
	}
	handler.ServeHTTP(w, r)
}
