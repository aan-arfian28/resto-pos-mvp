package employee

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
	users, err := h.service.List()
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch employees")
		return
	}
	response.Success(c, http.StatusOK, users)
}

func (h *Handler) GetByID(c *gin.Context) {
	user, err := h.service.GetByID(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusNotFound, "Employee not found")
		return
	}
	response.Success(c, http.StatusOK, user)
}

func (h *Handler) Create(c *gin.Context) {
	var req CreateEmployeeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	user, err := h.service.Create(req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.SuccessWithMessage(c, http.StatusCreated, "Employee created successfully", user)
}

func (h *Handler) Update(c *gin.Context) {
	var req UpdateEmployeeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	user, err := h.service.Update(c.Param("id"), req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.SuccessWithMessage(c, http.StatusOK, "Employee updated successfully", user)
}

func (h *Handler) Delete(c *gin.Context) {
	currentUserID := middleware.GetUserID(c)
	if err := h.service.Delete(c.Param("id"), currentUserID); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.SuccessWithMessage(c, http.StatusOK, "Employee deactivated successfully", nil)
}
