package handler

import (
	"crypto/sha1"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/labstack/echo"
	"github.com/naoina/toml"
)

// Response is what is returned to the client representing a folder
type Response struct {
	Waves        []string    `json:"waves"`
	WavesFiles   []string    `json:"wavesFiles"`
	Spectrograms []string    `json:"spectrograms"`
	Config       interface{} `json:"config"`
}

func getHash(s string) string {
	hasher := sha1.New()
	hasher.Write([]byte(s))
	return fmt.Sprintf("%x", hasher.Sum(nil))
}

func (h *Handler) getMetrics(path string) (interface{}, error) {
	res := &Response{}

	waves, err := filepath.Glob(filepath.Join(path, "*.wav"))
	if err != nil {
		return nil, err
	}

	res.Waves = make([]string, len(waves))
	res.WavesFiles = make([]string, len(waves))
	for idx, el := range waves {
		ha := getHash(el)
		h.Files[ha] = el
		res.Waves[idx] = ha
		res.WavesFiles[idx] = el
	}

	spectrograms, err := filepath.Glob(filepath.Join(path, "Spectrograms", "*.png"))
	if err != nil {
		return nil, err
	}
	res.Spectrograms = make([]string, len(spectrograms))
	for idx, el := range spectrograms {
		ha := getHash(el)
		h.Files[ha] = el
		res.Spectrograms[idx] = ha
	}

	config, err := filepath.Glob(filepath.Join(path, "Config", "*.toml"))
	if err != nil {
		return nil, err
	}
	if len(config) != 1 {
		return res, nil
	}

	cf, err := os.Open(config[0])
	if err != nil {
		return res, nil
	}
	var configFile interface{}
	if err := toml.NewDecoder(cf).Decode(&configFile); err != nil {
		return res, nil
	}
	res.Config = configFile
	return res, nil
}

// GetMetrics will take a path and return a struct with analysis data
func (h *Handler) GetMetrics(c echo.Context) error {
	path := c.FormValue("path")
	log.Println(path)

	res, err := h.getMetrics(path)
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
	return c.JSON(http.StatusOK, res)
}
