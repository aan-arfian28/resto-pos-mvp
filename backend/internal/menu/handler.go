package menu

import (
	"net/http"

	"github.com/bistroflow/backend/internal/models"
	"github.com/bistroflow/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// Category handlers
func (h *Handler) ListCategories(c *gin.Context) {
	cats, err := h.service.ListCategories()
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch categories")
		return
	}
	if cats == nil {
		cats = []models.Category{}
	}
	response.Success(c, http.StatusOK, cats)
}

func (h *Handler) GetCategory(c *gin.Context) {
	cat, err := h.service.GetCategory(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusNotFound, "Category not found")
		return
	}
	response.Success(c, http.StatusOK, cat)
}

func (h *Handler) CreateCategory(c *gin.Context) {
	var req CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	cat, err := h.service.CreateCategory(req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.SuccessWithMessage(c, http.StatusCreated, "Category created", cat)
}

func (h *Handler) UpdateCategory(c *gin.Context) {
	var req UpdateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	cat, err := h.service.UpdateCategory(c.Param("id"), req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, http.StatusOK, cat)
}

func (h *Handler) DeleteCategory(c *gin.Context) {
	if err := h.service.DeleteCategory(c.Param("id")); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete category")
		return
	}
	response.SuccessWithMessage(c, http.StatusOK, "Category deleted", nil)
}

// Menu item handlers
func (h *Handler) ListMenuItems(c *gin.Context) {
	items, err := h.service.ListMenuItems()
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch menu items")
		return
	}
	if items == nil {
		items = []models.MenuItem{}
	}
	response.Success(c, http.StatusOK, items)
}

func (h *Handler) GetMenuItem(c *gin.Context) {
	item, err := h.service.GetMenuItem(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusNotFound, "Menu item not found")
		return
	}
	response.Success(c, http.StatusOK, item)
}

func (h *Handler) CreateMenuItem(c *gin.Context) {
	var req CreateMenuItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	item, err := h.service.CreateMenuItem(req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.SuccessWithMessage(c, http.StatusCreated, "Menu item created", item)
}

func (h *Handler) UpdateMenuItem(c *gin.Context) {
	var req UpdateMenuItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	item, err := h.service.UpdateMenuItem(c.Param("id"), req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, http.StatusOK, item)
}

func (h *Handler) DeleteMenuItem(c *gin.Context) {
	if err := h.service.DeleteMenuItem(c.Param("id")); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete menu item")
		return
	}
	response.SuccessWithMessage(c, http.StatusOK, "Menu item deleted", nil)
}

func (h *Handler) ListAvailableMenu(c *gin.Context) {
	items, err := h.service.ListAvailableMenuItems()
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch menu")
		return
	}
	if items == nil {
		items = []models.MenuItem{}
	}
	response.Success(c, http.StatusOK, items)
}
