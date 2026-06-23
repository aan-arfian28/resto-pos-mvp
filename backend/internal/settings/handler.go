package settings

import (
	"net/http"

	"github.com/bistroflow/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) GetActive(c *gin.Context) {
	settings, err := h.service.GetActive()
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch settings")
		return
	}
	response.Success(c, http.StatusOK, settings)
}

func (h *Handler) List(c *gin.Context) {
	settings, err := h.service.List()
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch settings")
		return
	}
	response.Success(c, http.StatusOK, settings)
}

func (h *Handler) Update(c *gin.Context) {
	var req UpdateSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := h.service.Update(req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.SuccessWithMessage(c, http.StatusOK, "Settings updated successfully", nil)
}
