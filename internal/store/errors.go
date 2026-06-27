package store

import "errors"

// ErrNotFound is returned when a pipeline is not found in the store.
var ErrNotFound = errors.New("pipeline not found")
