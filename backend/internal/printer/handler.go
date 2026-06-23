package printer

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

func (h *Handler) List(c *gin.Context) {
	printers, err := h.service.List()
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch printers")
		return
	}
	response.Success(c, http.StatusOK, printers)
}

func (h *Handler) GetByID(c *gin.Context) {
	p, err := h.service.GetByID(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusNotFound, "Printer not found")
		return
	}
	response.Success(c, http.StatusOK, p)
}

func (h *Handler) Create(c *gin.Context) {
	var req CreatePrinterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	p, err := h.service.Create(req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.SuccessWithMessage(c, http.StatusCreated, "Printer created", p)
}

func (h *Handler) Update(c *gin.Context) {
	var req CreatePrinterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	p, err := h.service.Update(c.Param("id"), req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, http.StatusOK, p)
}

func (h *Handler) Delete(c *gin.Context) {
	if err := h.service.Delete(c.Param("id")); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete printer")
		return
	}
	response.SuccessWithMessage(c, http.StatusOK, "Printer deleted", nil)
}

func (h *Handler) TestPrint(c *gin.Context) {
	if err := h.service.TestPrint(c.Param("id")); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.SuccessWithMessage(c, http.StatusOK, "Test print sent", nil)
}
