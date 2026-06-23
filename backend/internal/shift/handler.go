package shift

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

func (h *Handler) GetActiveShift(c *gin.Context) {
	userID := middleware.GetUserID(c)
	shift, err := h.service.GetActiveShift(userID)
	if err != nil {
		response.Success(c, http.StatusOK, gin.H{"shift": nil})
		return
	}
	response.Success(c, http.StatusOK, shift)
}

func (h *Handler) OpenShift(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var req OpenShiftRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Modal awal is required")
		return
	}

	shift, err := h.service.OpenShift(userID, req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.SuccessWithMessage(c, http.StatusCreated, "Shift opened successfully", shift)
}

func (h *Handler) EndShift(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var req EndShiftRequest
	c.ShouldBindJSON(&req)

	report, err := h.service.EndShift(userID, req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.SuccessWithMessage(c, http.StatusOK, "Shift closed successfully", report)
}

func (h *Handler) GetHistory(c *gin.Context) {
	userID := c.Query("user_id")
	shifts, err := h.service.GetHistory(userID, 50)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch shift history")
		return
	}
	response.Success(c, http.StatusOK, shifts)
}
