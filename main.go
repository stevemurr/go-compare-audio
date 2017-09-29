package main

import (
	"compare/api/handler"

	"github.com/labstack/echo"

	"github.com/labstack/echo/middleware"
)

func main() {
	e := echo.New()
	h := &handler.Handler{
		Files: map[string]string{},
	}
	e.Use(middleware.CORS())
	e.POST("/api", h.GetMetrics)
	e.GET("/api/files/floats/:id", h.GetFileAsFloat)
	e.GET("/api/files/:id", h.GetFile)
	e.Start(":1323")
}
