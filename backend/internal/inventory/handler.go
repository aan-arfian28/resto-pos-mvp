package inventory

import (
	"net/http"
	"strconv"

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

func (h *Handler) ListRawMaterials(c *gin.Context) {
	materials, err := h.service.ListRawMaterials()
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch raw materials")
		return
	}
	response.Success(c, http.StatusOK, materials)
}

func (h *Handler) CreateRawMaterial(c *gin.Context) {
	var req CreateRawMaterialRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	m, err := h.service.CreateRawMaterial(req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.SuccessWithMessage(c, http.StatusCreated, "Raw material created", m)
}

func (h *Handler) UpdateRawMaterial(c *gin.Context) {
	var req CreateRawMaterialRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	m, err := h.service.UpdateRawMaterial(c.Param("id"), req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, http.StatusOK, m)
}

func (h *Handler) DeleteRawMaterial(c *gin.Context) {
	if err := h.service.DeleteRawMaterial(c.Param("id")); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.SuccessWithMessage(c, http.StatusOK, "Raw material deleted", nil)
}

func (h *Handler) StockIn(c *gin.Context) {
	userID := middleware.GetUserID(c)
	var req StockInRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if err := h.service.StockIn(userID, req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.SuccessWithMessage(c, http.StatusOK, "Stock in recorded", nil)
}

func (h *Handler) StockOut(c *gin.Context) {
	userID := middleware.GetUserID(c)
	var req StockOutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if err := h.service.StockOut(userID, req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.SuccessWithMessage(c, http.StatusOK, "Stock out recorded", nil)
}

func (h *Handler) GetLowStock(c *gin.Context) {
	items, err := h.service.GetLowStock()
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch low stock items")
		return
	}
	response.Success(c, http.StatusOK, items)
}

func (h *Handler) GetHistory(c *gin.Context) {
	materialID := c.Query("raw_material_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	history, total, err := h.service.GetHistory(materialID, page, limit)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch stock history")
		return
	}
	response.SuccessPaginated(c, history, page, limit, total)
}
