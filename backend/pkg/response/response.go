package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type APIResponse struct {
	Status  string      `json:"status"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Meta    *Meta       `json:"meta,omitempty"`
	Errors  []string    `json:"errors,omitempty"`
}

type Meta struct {
	Page  int   `json:"page"`
	Limit int   `json:"limit"`
	Total int64 `json:"total"`
}

func Success(c *gin.Context, status int, data interface{}) {
	c.JSON(status, APIResponse{
		Status: "success",
		Data:   data,
	})
}

func SuccessWithMessage(c *gin.Context, status int, message string, data interface{}) {
	c.JSON(status, APIResponse{
		Status:  "success",
		Message: message,
		Data:    data,
	})
}

func SuccessPaginated(c *gin.Context, data interface{}, page, limit int, total int64) {
	c.JSON(http.StatusOK, APIResponse{
		Status: "success",
		Data:   data,
		Meta: &Meta{
			Page:  page,
			Limit: limit,
			Total: total,
		},
	})
}

func Error(c *gin.Context, status int, message string, errs ...string) {
	c.AbortWithStatusJSON(status, APIResponse{
		Status:  "error",
		Message: message,
		Errors:  errs,
	})
}
