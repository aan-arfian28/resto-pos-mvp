package activitylog

import (
	"net/http"
	"strconv"

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
	userID := c.Query("user_id")
	actionType := c.Query("action_type")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	logs, total, err := h.service.List(userID, actionType, page, limit)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch activity log")
		return
	}
	response.SuccessPaginated(c, logs, page, limit, total)
}
