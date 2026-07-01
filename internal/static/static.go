// Package static serves the built React frontend embedded in the Go binary.
package static

import (
	"embed"
	"io/fs"
	"net/http"
	"path"
)

// content holds the static web assets produced by Vite.
// During the release build the web/dist folder is copied here so it can be
// embedded into the Go binary.
//
//go:embed all:dist
var content embed.FS

// FS returns the filesystem rooted at dist.
func FS() (fs.FS, error) {
	return fs.Sub(content, "dist")
}

// Handler serves static files and falls back to index.html for unknown
// paths, allowing the React SPA to handle client-side routing.
func Handler() (http.Handler, error) {
	root, err := FS()
	if err != nil {
		return nil, err
	}

	fileServer := http.FileServer(http.FS(root))

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cleanPath := path.Clean(r.URL.Path)

		file, err := root.Open(cleanPath)
		if err != nil {
			r.URL.Path = "/"
			fileServer.ServeHTTP(w, r)
			return
		}
		defer file.Close()

		stat, err := file.Stat()
		if err != nil || stat.IsDir() {
			r.URL.Path = "/"
			fileServer.ServeHTTP(w, r)
			return
		}

		fileServer.ServeHTTP(w, r)
	}), nil
}
