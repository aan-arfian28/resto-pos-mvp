package opex

import (
	"net/http"

	"github.com/bistroflow/backend/internal/middleware"
	"github.com/bistroflow/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) List(c *gin.Context) {
	expenses, err := h.service.List()
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch opex")
		return
	}
	response.Success(c, http.StatusOK, expenses)
}

func (h *Handler) Create(c *gin.Context) {
	userID := middleware.GetUserID(c)
	var req CreateOpexRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	o, err := h.service.Create(userID, req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.SuccessWithMessage(c, http.StatusCreated, "Opex recorded", o)
}

func (h *Handler) Update(c *gin.Context) {
	var req CreateOpexRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	o, err := h.service.Update(c.Param("id"), req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, http.StatusOK, o)
}

func (h *Handler) Delete(c *gin.Context) {
	if err := h.service.Delete(c.Param("id")); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete opex")
		return
	}
	response.SuccessWithMessage(c, http.StatusOK, "Opex deleted", nil)
}
