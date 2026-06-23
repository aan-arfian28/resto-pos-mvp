package report

import (
	"fmt"
	"net/http"
	"time"

	"github.com/bistroflow/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) GetSummary(c *gin.Context) {
	from, to := getDateRange(c)
	summary, err := h.service.GetSummary(from, to)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to generate report")
		return
	}
	response.Success(c, http.StatusOK, summary)
}

func (h *Handler) GetTopItems(c *gin.Context) {
	from, to := getDateRange(c)
	items, err := h.service.GetTopItems(from, to, 10)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch top items")
		return
	}
	response.Success(c, http.StatusOK, items)
}

func (h *Handler) GetSalesChart(c *gin.Context) {
	from, to := getDateRange(c)
	sales, err := h.service.GetDailySales(from, to)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch sales data")
		return
	}
	response.Success(c, http.StatusOK, sales)
}

func (h *Handler) ExportCSV(c *gin.Context) {
	from, to := getDateRange(c)
	data, err := h.service.GetCSVData(from, to)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to generate CSV")
		return
	}

	filename := fmt.Sprintf("laporan_%s_%s.csv", from, to)
	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Header("Content-Type", "text/csv; charset=utf-8")
	c.Data(http.StatusOK, "text/csv; charset=utf-8", data)
}

func (h *Handler) ExportPDF(c *gin.Context) {
	from, to := getDateRange(c)
	summary, err := h.service.GetSummary(from, to)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to generate report")
		return
	}

	topItems, _ := h.service.GetTopItems(from, to, 10)
	sales, _ := h.service.GetDailySales(from, to)

	c.JSON(http.StatusOK, gin.H{
		"period":    gin.H{"from": from, "to": to},
		"summary":   summary,
		"top_items": topItems,
		"sales":     sales,
	})
}

func getDateRange(c *gin.Context) (string, string) {
	from := c.DefaultQuery("from", "")
	to := c.DefaultQuery("to", "")

	if from == "" {
		from = time.Now().Format("2006-01-02") + " 00:00:00"
	}
	if to == "" {
		to = time.Now().Format("2006-01-02") + " 23:59:59"
	}

	if len(from) == 10 {
		from += " 00:00:00"
	}
	if len(to) == 10 {
		to += " 23:59:59"
	}

	return from, to
}
