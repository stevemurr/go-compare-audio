package handler

import (
	"io/ioutil"
	"log"
	"math"
	"net/http"
	"os"
	"strings"

	"github.com/go-audio/audio"
	"github.com/go-audio/wav"
	"github.com/labstack/echo"
)

func toFloatBuffer(buf *audio.IntBuffer, bitDepth float64) *audio.FloatBuffer {
	newB := &audio.FloatBuffer{}
	newB.Data = make([]float64, len(buf.Data))
	for i := 0; i < len(buf.Data); i++ {
		newB.Data[i] = float64(buf.Data[i]) / math.Pow(2, bitDepth)
	}
	newB.Format = &audio.Format{
		NumChannels: buf.Format.NumChannels,
		SampleRate:  buf.Format.SampleRate,
	}
	return newB
}

// GetFileAsFloat --
func (h *Handler) GetFileAsFloat(c echo.Context) error {
	hash := h.Files[c.Param("id")]
	f, err := os.Open(hash)
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
	w := wav.NewDecoder(f)
	w.ReadInfo()
	buf, err := w.FullPCMBuffer()
	if err != nil {
		log.Fatal(err)
	}
	ff := toFloatBuffer(buf, float64(w.BitDepth))
	return c.JSON(http.StatusOK, ff.AsFloat32Buffer().Data)
}

// GetFile takes a hash as a param and returns a blob of data
func (h *Handler) GetFile(c echo.Context) error {
	hash := c.Param("id")
	f := h.Files[hash]
	b, err := ioutil.ReadFile(f)
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
	contentType := ""
	if strings.Contains(f, ".png") {
		contentType = "application/png"
	} else if strings.Contains(f, ".wav") {
		contentType = "audio/wav"
	}
	return c.Blob(http.StatusOK, contentType, b)
}
