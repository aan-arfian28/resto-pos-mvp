package pos

import (
	"fmt"
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

func (h *Handler) CreateOrder(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var req CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid order data")
		return
	}

	resp, err := h.service.CreateOrder(userID, req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.SuccessWithMessage(c, http.StatusCreated, "Order created successfully", resp)
}

func (h *Handler) BatchSync(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var reqs []CreateOrderRequest
	if err := c.ShouldBindJSON(&reqs); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid batch data")
		return
	}

	if len(reqs) > 100 {
		response.Error(c, http.StatusBadRequest, "Batch size exceeds maximum of 100 orders")
		return
	}

	batchReqs := make([]CreateOrderRequestWithUser, len(reqs))
	for i, req := range reqs {
		batchReqs[i] = CreateOrderRequestWithUser{
			UserID:  userID,
			Request: req,
		}
	}

	results, err := h.service.ProcessBatchOrders(batchReqs)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Batch processing failed")
		return
	}

	successCount := 0
	for _, r := range results {
		if r.Success {
			successCount++
		}
	}

	response.SuccessWithMessage(c, http.StatusOK,
		fmt.Sprintf("Batch processed: %d/%d succeeded", successCount, len(results)),
		results,
	)
}
